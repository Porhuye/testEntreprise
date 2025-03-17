require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const routes = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const { addUser } = require("./controllers/userController");

/*
//////////////
GIT HUB:
Créer une branche master|main(main)/develop(secondaire)/feature_branch(tertiaire 
à chaque fois que je veux add une feature ou corriger un bug) 

NodeJS :
COnnecter DB à NOdeJS avec bonne pratique (achercher)
+ faire une com entre API et NOdeJS (get,post, put ,delete(CRUD))
//////////////


// Route de base
app.get("/", (req, res) => {
    res.send("Bienvenue sur mon API !");
});*/



app.use(express.json());

// Utilisation des routes
app.use("/", routes);


app.use(errorHandler);
/*
try { // test sequelize
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
*/
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);

    app.route('/user')
      .post((req, res) => {
        addUser(req,res)
        //res.send({"message":"hello world"})
  })

});

