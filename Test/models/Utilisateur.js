const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Utilisateur = sequelize.define("Utilisateur", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateNaissance: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    motDePasse: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "users",
    timestamps: false
});

module.exports = Utilisateur;
