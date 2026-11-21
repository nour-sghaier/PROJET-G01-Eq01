# CampusSave

**Plateforme intelligente de lutte contre le gaspillage alimentaire**

Projet pédagogique intégrateur – 3ème année Business Computing (E-Business), ESSECT
Modules : Intégration Web (React.js) et Développement Mobile (Flutter)

> Date limite de dépôt : **25 novembre 2026 à minuit**

---

## 1. Présentation

CampusSave met en relation les étudiants avec les restaurants et cafétérias proches de l'ESSECT.
Les commerçants publient leurs invendus à prix réduit ; les étudiants consultent les offres, réservent, paient en ligne, puis récupèrent leur commande en présentant un **QR code**.

Le projet comporte deux applications qui partagent le **même backend** et les **mêmes données** :

| Application | Utilisateurs | Technologie |
|---|---|---|
| Application Web | Étudiant, Commerçant, **Administrateur** | React.js |
| Application Mobile | Étudiant, Commerçant | Flutter |

### Acteurs

- **Étudiant** : consulte les offres, réserve, paie, récupère sa commande avec le QR code.
- **Commerçant** : inscrit son commerce, publie ses offres, traite les commandes, scanne les QR codes.
- **Administrateur** : valide les commerçants, gère les utilisateurs, supervise la plateforme.

---

## 2. Architecture

```
┌──────────────┐        ┌──────────────┐
│  Web (React) │        │ Mobile       │
│  port 3001   │        │ (Flutter)    │
└──────┬───────┘        └──────┬───────┘
       │   API REST (JSON) + token Firebase
       └───────────┬───────────┘
            ┌──────▼───────┐        ┌─────────────┐
            │ Backend      │───────▶│  Konnect    │ (paiement, mode test)
            │ Node/Express │        └─────────────┘
            │ port 3000    │
            └──────┬───────┘
                   │ Firebase Admin SDK
       ┌───────────▼───────────────────────────┐
       │ Firebase : Authentication · Firestore │
       │            Cloud Messaging (FCM)      │
       └───────────────────────────────────────┘
```

- Les deux applications **n'accèdent jamais directement à Firestore** : elles passent par l'API du backend.
- Le backend vérifie le token Firebase de chaque requête et contrôle le **rôle** (étudiant / commerçant / admin).
- Le QR code est généré **uniquement après confirmation du paiement** par Konnect.
- Un commerce n'est visible par les étudiants **qu'après validation par l'administrateur**.

### Structure du dépôt

```
PROJET-G01-Eq01/
├── backend/          API Node.js / Express (configuration + serveur de base ; routes à écrire)
├── web/              Application React.js (architecture en place, pages à implémenter)
├── mobile/           Application Flutter (étudiant + commerçant)
├── config/
│   ├── API.md            Routes de l'API (référence commune)
│   ├── maquettes/        Maquettes des interfaces
│   ├── uml/              Diagrammes UML (dc.puml : classes, dcu.puml : cas d'utilisation)
│   └── rapport.pdf       Rapport du projet
├── firebase.json         Configuration Firebase (règles Firestore)
├── firestore.rules       Règles Firestore : accès direct interdit, tout passe par le backend
└── README.md
```

### Données Firestore (collections)

| Collection | Contenu |
|---|---|
| `users` | profil et rôle (`etudiant`, `commercant`, `admin`), token FCM |
| `commerces` | informations du commerce, `statutValidation` (`EN_ATTENTE`, `VALIDE`, `REFUSE`) |
| `offers` | offres : prix initial/réduit, quantité, photo, horaires de récupération, statut |
| `orders` | commandes : lignes, montant, statut, `qrCode` |

Statuts d'une commande : `EN_ATTENTE_PAIEMENT` → `PAYEE` → `RECUPEREE` (ou `ANNULEE`).

---

## 3. Prérequis

| Outil | Version conseillée | Usage |
|---|---|---|
| [Node.js](https://nodejs.org) | 18 ou plus | backend et web |
| [Flutter](https://docs.flutter.dev/get-started/install) | version stable récente | mobile |
| Android Studio + émulateur Android (ou un téléphone) | – | exécuter l'app mobile |
| Git | – | gestion du code |
| Un compte Google | – | projet Firebase |
| Un compte [Konnect](https://konnect.network) (sandbox) | – | paiement en mode test |

---

## 4. Configuration

> ⚠ **Ne jamais pousser sur GitHub** : fichiers `.env`, clé de compte de service Firebase (`serviceAccountKey.json`), clés Konnect. Ils sont listés dans `.gitignore`. Chaque partie fournit un `.env.example` à copier.

### 4.1 Projet Firebase

1. Créer un projet sur la [console Firebase](https://console.firebase.google.com).
2. **Authentication** → *Sign-in method* → activer **Email/Mot de passe**.
3. **Firestore Database** → créer la base (mode production).
   Règles de sécurité : toutes les lectures/écritures passent par le backend (Admin SDK, qui ignore les règles), donc on interdit l'accès direct :
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} { allow read, write: if false; }
     }
   }
   ```
4. **Cloud Messaging** : activé par défaut (notifications).
5. **Application Android** : *Paramètres du projet* → *Ajouter une application* → Android, identifiant de package `com.example.mobile`.
   Télécharger `google-services.json` et le placer dans `mobile/android/app/`.
6. **Application Web** : ajouter une application Web et copier sa configuration dans `web/.env` (voir 4.3).
7. **Compte de service (backend)** : *Paramètres du projet* → *Comptes de service* → *Générer une nouvelle clé privée*.
   Enregistrer le fichier sous `backend/serviceAccountKey.json` (**jamais commité**).
8. Les règles Firestore du dépôt (`firestore.rules`) sont identiques à celles de l'étape 3.

### 4.2 Backend – `backend/.env`

```bash
cd backend
cp .env.example .env     # Windows : copy .env.example .env
```

```env
PORT=3000
# Chemin du fichier de clé du compte de service Firebase
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
# Origine autorisée (CORS) : l'application web
WEB_ORIGIN=http://localhost:3001

# Konnect (mode test / sandbox)
KONNECT_API_URL=<URL de l'API sandbox Konnect>
KONNECT_API_KEY=<clé API sandbox>
KONNECT_WALLET_ID=<identifiant du wallet récepteur>
# URL publique appelée par Konnect après paiement (voir 6.4)
KONNECT_WEBHOOK_URL=<ex. https://xxxx.ngrok.app/api/payments/webhook>
```

### 4.3 Web – `web/.env`

```bash
cd web
cp .env.example .env     # Windows : copy .env.example .env
```

```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api

REACT_APP_FIREBASE_API_KEY=<valeur>
REACT_APP_FIREBASE_AUTH_DOMAIN=<valeur>
REACT_APP_FIREBASE_PROJECT_ID=<valeur>
REACT_APP_FIREBASE_STORAGE_BUCKET=<valeur>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<valeur>
REACT_APP_FIREBASE_APP_ID=<valeur>
```

### 4.4 Mobile

Aucun fichier `.env` : la configuration Firebase vient de `mobile/android/app/google-services.json` (étape 4.1.5).
L'adresse du backend se règle au lancement (voir 6.3).

### 4.5 Compte administrateur

L'inscription ne permet de créer que des étudiants et des commerçants. Pour créer l'administrateur :

1. Console Firebase → *Authentication* → *Ajouter un utilisateur* (email + mot de passe).
2. Copier l'**UID** de cet utilisateur.
3. *Firestore* → collection `users` → créer un document dont l'**ID est cet UID**, avec :
   ```json
   { "nom": "Admin", "prenom": "Campus", "email": "admin@campussave.tn", "role": "admin" }
   ```

---

## 5. Installation

```bash
git clone <URL_DU_DEPOT>
cd campussave

cd backend && npm install && cd ..
cd web     && npm install && cd ..
cd mobile  && flutter pub get && cd ..
```

---

## 6. Lancer le projet

Ordre à respecter : **backend d'abord**, puis web et/ou mobile.

### 6.1 Backend (port 3000)

```bash
cd backend
npm start
```

Vérification : `http://localhost:3000/api` doit répondre (route de santé ou message de l'API).

### 6.2 Web (port 3001)

```bash
cd web
npm start
```

Ouvrir `http://localhost:3001`.

### 6.3 Mobile

```bash
cd mobile

# Émulateur Android (le PC est vu comme 10.0.2.2) – valeur par défaut
flutter run

# Téléphone réel connecté au même Wi-Fi que le PC
flutter run --dart-define=API_URL=http://<IP_DU_PC>:3000/api
```

Pour trouver l'IP du PC sous Windows : `ipconfig` (adresse IPv4).
Le trafic HTTP en clair est autorisé dans `AndroidManifest.xml` (`usesCleartextTraffic`) pour le développement ; à retirer avec un backend en HTTPS.
Le pare-feu Windows doit autoriser le port 3000.

### 6.4 Paiement Konnect (mode test)

1. L'étudiant appuie sur **Payer en ligne** : le backend initialise un paiement Konnect (sandbox) et renvoie un lien.
2. L'étudiant règle sur la page de test Konnect.
3. Konnect notifie le backend (webhook) ; **seul le backend** passe alors la commande à `PAYEE` et génère le QR code.

En local, Konnect ne peut pas joindre `localhost` : utiliser un tunnel (par exemple [ngrok](https://ngrok.com) : `ngrok http 3000`) et renseigner l'URL publique dans `KONNECT_WEBHOOK_URL`.

---

## 7. Comptes de test

| Rôle | Email | Mot de passe | Remarque |
|---|---|---|---|
| Administrateur | _à compléter_ | _à compléter_ | créé à la main (4.5) |
| Commerçant | _à compléter_ | _à compléter_ | commerce validé par l'admin |
| Étudiant | _à compléter_ | _à compléter_ | |

> Ne mettre ici que des comptes de démonstration, jamais de vrais identifiants.

---

## 8. Scénario de démonstration

1. **Commerçant** (mobile ou web) : s'inscrit, inscrit son commerce → écran « en attente de validation ».
2. **Administrateur** (web) : valide le commerce.
3. **Commerçant** : publie une offre (photo, prix initial/réduit, quantité, horaires).
4. **Étudiant** : recherche l'offre (produit, commerce, catégorie, prix), choisit la quantité, réserve.
5. **Étudiant** : paie via Konnect (test) → le **QR code** apparaît, une notification est reçue.
6. **Commerçant** : scanne le QR code → la commande passe à *Récupérée*.
7. Les **tableaux de bord** des trois rôles se mettent à jour.

---

## 9. Fonctionnalités

> À cocher au fur et à mesure de l'avancement de l'équipe. Mobile : implémenté (à tester avec le backend) ; Web : architecture seulement ; Backend : routes à écrire d'après `config/API.md`.

| Fonctionnalité | Backend | Web | Mobile |
|---|:-:|:-:|:-:|
| Authentification (inscription, connexion, déconnexion, profil, rôles) | ☐ | ☐ | ☑ |
| Gestion des commerces (inscription, infos, validation admin) | ☐ | ☐ | ☑ |
| Gestion des offres (publier, modifier, supprimer, photo, horaires) | ☐ | ☐ | ☑ |
| Recherche (produit, commerce, catégorie, prix) | ☐ | ☐ | ☑ |
| Réservation (quantités, gestion des commandes, annulation) | ☐ | ☐ | ☑ |
| Paiement électronique (Konnect, mode test) | ☐ | ☐ | ☑ |
| QR code (génération après paiement, validation au retrait) | ☐ | ☐ | ☑ |
| Tableaux de bord (étudiant, commerçant, administrateur) | ☐ | ☐ | ☑ |
| Notifications (Firebase Cloud Messaging) | ☐ | ☐ | ☑ |

L'espace **administrateur** est disponible uniquement sur l'application web.

Les routes de l'API sont décrites dans [`config/API.md`](config/API.md).

---

## 10. Sécurité

- Authentification Firebase ; token vérifié par le backend à chaque requête.
- Contrôle d'accès par rôle côté backend (un étudiant ne peut pas publier d'offre, un commerçant ne peut pas valider un commerce, etc.).
- Le prix et le stock sont toujours recalculés côté serveur (le client n'est jamais cru sur ces valeurs).
- Un QR code n'existe que pour une commande payée et ne peut être validé qu'une fois, par le commerçant concerné.
- Aucun secret dans le dépôt (`.env`, clés Firebase Admin, clés Konnect exclus par `.gitignore`).

---

## 11. Problèmes fréquents

| Problème | Solution |
|---|---|
| « Serveur injoignable » dans l'app mobile | Backend lancé ? Émulateur : `10.0.2.2`. Téléphone réel : `--dart-define=API_URL=http://IP_DU_PC:3000/api` et port 3000 autorisé dans le pare-feu |
| Erreur 413 à la publication d'une offre | Dans Express : `express.json({ limit: '2mb' })` (les photos sont envoyées en base64) |
| Erreur CORS sur le web | `WEB_ORIGIN` du backend = `http://localhost:3001` |
| Connexion OK mais « Impossible de charger le profil » | Le document `users/{uid}` n'existe pas dans Firestore (voir 4.5 pour l'admin) |
| Le QR code n'apparaît pas après paiement | Webhook Konnect non reçu : vérifier le tunnel ngrok et `KONNECT_WEBHOOK_URL` |
| `flutter pub get` échoue | Lancer `flutter pub upgrade` puis `flutter clean` |

---

## 12. Livrables

- [ ] Maquettes des interfaces (`config/maquettes/`)
- [ ] Diagrammes UML principaux (`config/uml/`)
- [ ] Code source Web (`web/`)
- [x] Code source Mobile (`mobile/`)
- [ ] Code source Backend (`backend/`)
- [x] Configuration Firebase (section 4, `firebase.json`, `firestore.rules`)
- [ ] Rapport (`config/rapport.pdf`)
- [ ] Démonstration fonctionnelle
