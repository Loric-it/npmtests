// Importation du module express
const express = require('express');
const session = require('express-session');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const userRoute = require('./routes/userRoute')
const postRoute = require('./routes/postRoute')

const path = require('path');
const bodyParser = require('body-parser');
// Création d'une instance d'express
const app = express();
// Middleware pour récupérer req.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session(({
  secret: 'ceci_est_un_secret',
  resave: false,
  saveUnitialized : true,
})));

async function main(){
    await mongoose.connect("mongodb://localhost/exemple-mongoose");
    console.log("connexion ok");
//     const user1 = new User({//Créer un vrai utilisateur user1 à partir du modèle User
//         email: "jean@exemple.org",
//         firstname:"Jean",
//         Lastname:"Dupont",
//         age:"38"
//     });
//     await user1.save();
}

main()

app.set('view engine', 'ejs')
app.use('/static', express.static('public'));

// Définition d'une route GET simple
app.get('/', async (req, res) => {
    const userFind = await User.findOne({ firstname: "Jean" });
    if (!userFind) {
      return res.status(404).send({ error: 'Utilisateur non trouvé' });
    }
    const article1 = new Post({
        title: "Nouvelle version Node.js",
        content: "Lorem ipsum",
        status: "PUBLISHED",
        author: userFind._id
    });
    await article1.save();
    res.send('Article1 crée avec succès!');

    
});

app.use('/', userRoute);
app.use('/form',postRoute);

app.post('/form', async (req, res) => {
    const userFind = await User.findOne({ firstname: req.body.author });
    if (!userFind) {
      return res.status(404).send({ error: 'Utilisateur non trouvé' });
    }
    const article2 = new Post({
        title: req.body.title,
        content: req.body.content,
        status: req.body.status,
        author: userFind._id
    });
    await article2.save();
    res.send('Article2 crée avec succès!');
});

// Création de deux articles
app.get('/', (req, res) => {
    res.send('Bienvenue sur la page d\'accueil !');
  });

app.get('/ejs/:name', (req, res) => {
  res.render('pages/condition', req.params.name);
});

app.get('/home', (req,res) => {

  if(!req.session.views){//si jamais visité

    req.session.views = 0; //valeur par défaut
  }

  req.session.views++;
  res.send(`Hello word ! vous avez consulté cette page : ${req.session.views} fois`); 
})

// Définir le port sur lequel le serveur va écouter
const PORT = process.env.PORT || 3000;
// Middleware pour capturer les erreurs 404
app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});
// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});