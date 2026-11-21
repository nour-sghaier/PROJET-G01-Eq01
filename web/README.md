# CampusSave - Application Web (React)

Plateforme de lutte contre le gaspillage alimentaire pour les étudiants de l'ESSECT.
Cette partie est l'application Web, développée avec React.

## Technologies

- React + Vite
- Tailwind CSS
- React Router
- Recharts (graphiques)
- qrcode.react et html5-qrcode (QR code)

## Installation

1. Installer Node.js (version 18 ou plus).
2. Dans le dossier du projet, installer les dépendances :

```
npm install
```

3. Lancer le site :

```
npm run dev
```

4. Ouvrir http://localhost:5173 dans le navigateur.

## Fonctionnalités réalisées

- Connexion et inscription avec validation des formulaires
- Trois rôles : étudiant, commerçant, administrateur
- Protection des pages selon le rôle
- Étudiant : liste des offres, recherche (produit, commerce, catégorie, prix), détail, choix de la quantité, commandes avec QR code, tableau de bord
- Commerçant : publier, modifier et supprimer des offres, scanner un QR code, tableau de bord
- Administrateur : valider les commerçants, gérer les utilisateurs, tableau de bord

## État actuel

Les données sont pour le moment fictives (fichiers dans `src/data`).
La connexion à Firebase, au backend Node.js et au paiement sera ajoutée avec l'équipe.

## Configuration

Les clés et identifiants privés ne sont jamais envoyés sur GitHub.
Les variables à renseigner dans un fichier `.env` local sont décrites dans `.env.example`.

## Équipe

Binôme B : partie Web (React).