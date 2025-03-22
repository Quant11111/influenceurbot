# Bot Influenceur TikTok

Ce projet est un bot automatisé conçu pour créer et publier du contenu sur TikTok afin d'augmenter le nombre d'abonnés. Le bot utilise l'API OpenAI pour générer du texte et l'API Midjourney pour créer des visuels.

## Fonctionnalités

- Génération automatique d'idées de contenu sur des sujets variés
- Création de contenu multimédia (images via Midjourney, audio via TTS)
- Génération de vidéos TikTok avec images et audio
- Planification automatique des publications
- API REST pour contrôler le bot manuellement
- Simulateur de publication pour le développement

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Clés API pour:
  - OpenAI
  - Midjourney (ou service équivalent)
  - TikTok (ou service tiers pour l'accès à TikTok)
- Optionnel: ffmpeg (pour la création de vidéos)

## Installation

1. Cloner le projet:

```bash
git clone https://github.com/votre-utilisateur/influenceurbot.git
cd influenceurbot
```

2. Installer les dépendances:

```bash
npm install
```

3. Configurer les variables d'environnement:
   Copiez le fichier `.env.example` vers `.env` et remplissez les informations requises:

```bash
cp .env.example .env
# Éditer le fichier .env avec vos clés API
```

## Configuration

Le bot peut être configuré via le fichier `config/index.js`. Vous pouvez modifier:

- Les sujets du contenu généré
- La fréquence de publication
- Les heures de publication
- Les paramètres de génération d'images et de vidéos

## Utilisation

### Démarrer le bot

```bash
npm start
```

Le bot démarrera un serveur web sur le port configuré (par défaut: 3000) et commencera à planifier des publications selon la configuration.

### API REST

Le bot expose plusieurs endpoints API:

- `GET /api/status` - Obtenir le statut du bot et le planning des publications
- `POST /api/content/generate` - Générer du contenu manuellement
- `POST /api/content/publish/:contentId` - Publier du contenu existant
- `POST /api/content/create-and-publish` - Créer et publier du contenu en une étape
- `GET /api/history` - Obtenir l'historique des publications

### Utilisation en développement

En mode développement (`NODE_ENV=development`), les publications TikTok sont simulées sans réellement publier de contenu.

## Déploiement

Pour déployer le bot sur un VPS:

1. Cloner le projet sur votre VPS
2. Installer les dépendances
3. Configurer les variables d'environnement
4. Utiliser PM2 ou un service similaire pour maintenir le bot en fonctionnement:

```bash
npm install -g pm2
pm2 start src/index.js --name influenceur-bot
```

## Avertissement

Ce projet est conçu comme un outil d'automatisation pour aider à la création de contenu. Assurez-vous de respecter les conditions d'utilisation de TikTok et des autres services utilisés.

Les API de TikTok peuvent changer ou être limitées. Ce bot utilise des méthodes qui pourraient ne pas être officiellement supportées par TikTok.

## Licence

MIT
