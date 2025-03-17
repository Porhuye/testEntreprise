const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Utilisateur = sequelize.define("Utilisateur", {
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date_naissance: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: "user",
    timestamps: false
});

module.exports = Utilisateur;
