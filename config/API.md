# Contrat d'API – ce que l'application mobile attend du backend

Base URL : `http://<hote>:3000/api` (configurable côté mobile avec `--dart-define=API_URL=...`)

**Authentification** : chaque requête envoie `Authorization: Bearer <Firebase ID token>`.
Le backend vérifie le token (`firebase-admin`), récupère le profil dans Firestore (`users/{uid}`) et contrôle le **rôle** sur chaque route.

**Format** : JSON, noms de champs en français comme ci-dessous. Dates en ISO 8601 (ou Timestamp Firestore sérialisé : le mobile accepte les deux).
**Erreurs** : statut HTTP 4xx/5xx avec `{ "message": "texte lisible" }` : le mobile affiche ce message tel quel.

> ⚠ Les photos sont envoyées en base64 (`"photo": "data:image/jpeg;base64,..."`, ~100 Ko).
> Dans Express : `app.use(express.json({ limit: '2mb' }))`, sinon l'erreur 413 apparaît à la publication d'une offre.

## Utilisateurs
| Méthode | Route | Rôle | Corps → Réponse |
|---|---|---|---|
| POST | `/users` | token valide, profil inexistant | `{prenom, nom, telephone, role: "etudiant"\|"commercant"}` → utilisateur. **Refuser `admin`** (rôle `admin` créé à la main dans Firestore). |
| GET | `/users/me` | tous | → `{id, nom, prenom, email, telephone, role}` (404 si profil absent) |
| PUT | `/users/me` | tous | `{prenom, nom, telephone}` → utilisateur mis à jour |
| POST | `/users/me/fcm-token` | tous | `{fcmToken}` → 204/200 (à stocker pour envoyer les notifications) |

## Commerces
| Méthode | Route | Rôle | Détail |
|---|---|---|---|
| GET | `/commerces/me` | commerçant | → commerce du commerçant, **404 s'il n'en a pas encore** |
| POST | `/commerces` | commerçant | `{nom, type: "RESTAURANT"\|"CAFETERIA", adresse, telephone, description}` → commerce créé avec `statutValidation: "EN_ATTENTE"` |
| PUT | `/commerces/me` | commerçant | mêmes champs → commerce mis à jour |

Commerce : `{id, nom, type, adresse, telephone, description, statutValidation: "EN_ATTENTE"|"VALIDE"|"REFUSE"}`.
La validation (`EN_ATTENTE → VALIDE/REFUSE`) se fait depuis le **web (admin)**. Seuls les commerces `VALIDE` apparaissent dans les offres étudiantes ; un commerçant au statut non validé ne peut pas publier d'offre.

## Offres
| Méthode | Route | Rôle | Détail |
|---|---|---|---|
| GET | `/offers?q=&categorie=&prixMax=` | étudiant | Offres `ACTIVE`, quantité > 0, commerces validés. `q` = recherche dans le titre **ou** le nom du commerce. Tous les filtres sont optionnels. → tableau d'offres |
| GET | `/offers/mine` | commerçant | → offres de son commerce (tous statuts) |
| POST | `/offers` | commerçant | corps ci-dessous → offre créée |
| PUT | `/offers/:id` | commerçant propriétaire | mêmes champs |
| DELETE | `/offers/:id` | commerçant propriétaire | → 204 |

Corps d'une offre envoyé par le mobile :
```json
{ "titre": "", "description": "", "categorie": "Plat chaud", "prixInitial": 8.5, "prixReduit": 3.0,
  "quantiteDisponible": 5, "heureDebutRecuperation": "2026-11-24T16:00:00.000Z",
  "heureFinRecuperation": "2026-11-24T18:00:00.000Z", "photo": "data:image/jpeg;base64,..." }
```
Offre renvoyée : les champs ci-dessus + `id, commerceId, commerceNom, statut: "ACTIVE"|"EPUISEE"|"EXPIREE"`.
Validations côté backend aussi : prixReduit < prixInitial, quantité > 0, fin > début.

## Commandes
| Méthode | Route | Rôle | Détail |
|---|---|---|---|
| POST | `/orders` | étudiant | `{commerceId, lignes: [{offreId, quantite}]}` → commande `EN_ATTENTE_PAIEMENT`. **Vérifier et décrémenter le stock dans une transaction Firestore** ; erreur 400 « Stock insuffisant » sinon. Le prix et le titre des lignes sont recopiés depuis l'offre (ne jamais faire confiance au prix envoyé par le client). |
| GET | `/orders/mine` | étudiant | → ses commandes (plus récentes d'abord) |
| GET | `/orders/received` | commerçant | → commandes de son commerce (avec `etudiantNom`) |
| GET | `/orders/:id` | propriétaire (étudiant ou commerçant) | → commande |
| POST | `/orders/:id/cancel` | étudiant propriétaire | seulement si `EN_ATTENTE_PAIEMENT` → remet le stock, statut `ANNULEE` |
| POST | `/orders/:id/pay` | étudiant propriétaire | initialise un paiement **Konnect (sandbox)** → `{ "payUrl": "https://..." }` |
| POST | `/orders/validate-qr` | commerçant | `{qrCode}` → commande passée à `RECUPEREE` ; erreurs : QR inconnu, commande d'un autre commerce, déjà récupérée, non payée |

Commande : `{id, commerceId, commerceNom, etudiantNom, dateCommande, montantTotal, statut: "EN_ATTENTE_PAIEMENT"|"PAYEE"|"RECUPEREE"|"ANNULEE", lignes: [{offreId, titre, quantite, prixUnitaire}], qrCode}`

### Paiement et QR code
1. Le mobile appelle `/orders/:id/pay` et ouvre `payUrl` dans le navigateur.
2. Konnect appelle le **webhook** du backend (ou le backend interroge `GET payment` de Konnect avec le `paymentRef`) ; **seul le backend, après confirmation Konnect**, passe la commande à `PAYEE`.
3. À ce moment seulement, le backend génère `qrCode` (chaîne aléatoire non devinable, ex. `crypto.randomUUID()`) et envoie une notification FCM « Commande payée ».
4. Le mobile affiche `qrCode` en QR au retour dans l'application (il rafraîchit `/orders/:id` à la reprise de l'app).
5. Le commerçant scanne → `/orders/validate-qr`.

## Statistiques (`GET /stats/me`, selon le rôle du token)
- Étudiant : `{nbCommandes, nbRecuperees, totalDepense, totalEconomise}` (économie = Σ (prixInitial − prixUnitaire) × quantité, sur les commandes payées/récupérées)
- Commerçant : `{nbCommandes, nbRecuperees, chiffreAffaires, offresActives}`

## Notifications FCM (suggestion minimale)
Envoyer avec `admin.messaging().send({token, notification: {title, body}})` :
- à l'étudiant : commande payée / commande récupérée ;
- au commerçant : nouvelle commande payée ; commerce validé/refusé.
