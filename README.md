# UTasks - Application de Gestion de Projets

UTasks est une application web moderne construite avec **React** (frontend) et un backend exposé via une API REST.  
Elle vous accompagne dans la gestion de vos projets au quotidien.

---

## Lancer l'application

### Prérequis

- [Node.js](https://nodejs.org/) (version **18** ou supérieure)
- [npm](https://www.npmjs.com/)  
OU
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)

---

### Lancement avec Node.js

1. **Installer les dépendances :**

   ```bash
   cd frontend/
   npm install
   ```

2. **Configurer les variables d'environnement :**

   Créez un fichier `.env.local` à la racine du dossier **frontend** avec le contenu suivant :

   ```env
   VITE_API_URL=https://utasks-026af75f15a3.herokuapp.com/api
   ```

3. **Lancer le serveur de développement :**

   ```bash
   npm run dev
   ```

4. **Ouvrir l'application :**  
   [http://localhost:4172](http://localhost:4172)

---

### Lancement avec Docker

À la racine du projet, exécutez simplement :

```bash
docker-compose up -d
```

Puis ouvrez l’application sur : [http://localhost:4172](http://localhost:4172)

---

### Hébergement
Le site est hébergé sur mon serveur personnel, il est donc possible d'y accéeder directement [ici](http://168.231.87.179:4172/)

## 🧭 Navigation dans l'application

### Page de connexion - `/login`
**URL :** [http://localhost:4172/login](http://localhost:4172/login)

### Page de création de compte - `/signup`
**URL :** [http://localhost:4172/signup](http://localhost:4172/signup)

### Page d'accueil - `/`
**URL :** [http://localhost:4172/](http://localhost:4172/)  
⚠️ Vous devez être connecté pour accéder à cette page.

### Page d'un board - `/?b={BoardID}`
**URL :** Exemple : `http://localhost:4172/?b=XXXXXX`

Les boards appartenant à l'utilisateur apparaissent dans le **menu latéral**.

---

## Structure du projet

```
UTasks/
│── frontend/         # Application React (Vite)
│   ├── src/          # Composants, pages, ...
│   ├── public/       # Fichiers statiques
│   └── package.json  # Dépendances frontend
│
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Technologies utilisées

- **Frontend** : React + Vite + TypeScript  
- **Gestion d’état** : React Hooks  
- **Drag & Drop** : @hello-pangea/dnd  
- **Icônes** : Remix Icon  
- **Backend** : API REST