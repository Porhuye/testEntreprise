const Utilisateur = require("./models/utilisateur");
const sequelize = require("./config/db");

async function fetchUsers() {
    try {
        await sequelize.authenticate();
        console.log(" Connexion à la base de données réussie !");
        
        const utilisateurs = await Utilisateur.findAll({
            attributes: ["nom", "prenom", "date_naissance"] // pas de '_'/snake case utiliser camel case (ex:  dateNaissance) mettre en anglais
        });

        console.log(" Liste des utilisateurs :");
        utilisateurs.forEach(user => {
            console.log(` ${user.nom} ${user.prenom} - Né(e) le ${user.date_naissance}`);
        });

    } catch (error) {
        console.error(" Erreur lors de la récupération des utilisateurs :", error);
    } finally {
        await sequelize.close(); // Ferme la connexion proprement
    }
}

fetchUsers();
