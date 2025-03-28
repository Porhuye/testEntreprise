/*
Pourquoi ORM ?
→ Un ORM (Object Relational Mapping) permet de manipuler une base de données avec des objets plutôt qu’en écrivant directement du SQL. Il automatise les requêtes, gère les relations entre les tables et améliore la lisibilité et la maintenabilité du code.

Pourquoi Sequelize ?
→ Sequelize est un ORM pour Node.js qui supporte plusieurs bases de données SQL (PostgreSQL, MySQL, SQLite, MSSQL). Il offre une API simple, des migrations, des validations, et une bonne intégration avec Express.
*/

const Utilisateur = require("../models/Utilisateur");

/// ADD ///
//http://localhost:3000/user
async function addUser(req, res) {
    try {
        const { nom, prenom, dateNaissance, motDePasse } = req.body;

        if (!nom || !prenom || !dateNaissance || !motDePasse) {
            return res.status(400).json({ message: "Tous les champs sont requis !" });
        }

        const user = await Utilisateur.create({ nom, prenom, dateNaissance,motDePasse });
        console.log("ID généré :", user.id);

        res.status(201).json({ message: "Utilisateur ajouté avec succès !" });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

/// PUT ///
//http://localhost:3000/user
async function putUser(req, res) {
    try {
        const { id, nom, prenom, dateNaissance } = req.body;

        const user = await Utilisateur.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifie si les données sont identiques
        if (//fait ça car j'ai eu une erreur est c'était pcq c'était les meme données mais m'afficher que l'user n'exister pas
            user.nom === nom &&
            user.prenom === prenom &&
            user.dateNaissance === dateNaissance
        ) {
            return res.status(400).json({ message: "Les données sont les mêmes !" });
        }

        // Mise à jour si données différentes
        await Utilisateur.update(
            { nom, prenom, dateNaissance },
            { where: { id } }
        );

        res.status(200).json({ message: "Utilisateur modifié avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la modification de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

/// GET - Un utilisateur ///
//http://localhost:3000/user/1
async function getUser(req, res) {
    try {
        const { userId } = req.params;
        const user = await Utilisateur.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

/// GET - Tous les utilisateurs ///
//http://localhost:3000/users
async function getUsers(req, res) {
    try {
        const users = await Utilisateur.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

/// DELETE ///
/*
    "value": 1
*/
async function deleteUser(req, res) {
    try {
        const value = req.body.value;
        let condition = {};

        if (typeof value === 'number') {
            condition = { id: value };
        } else if (typeof value === 'string') {
            condition = { prenom: value };
        } else {
            return res.status(400).json({ message: "Valeur invalide pour la suppression" });
        }

        const deleted = await Utilisateur.destroy({ where: condition });

        if (deleted === 0) {
            return res.status(404).json({ message: "Aucun utilisateur trouvé à supprimer" });
        }

        res.status(200).json({ message: "Utilisateur supprimé avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

module.exports = { addUser, putUser, getUser, getUsers, deleteUser };
