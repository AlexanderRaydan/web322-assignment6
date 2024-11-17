/*********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Alexander Raydan Student ID: 124348236 Date: Nov 16 2024

********************************************************************************/

const sequelize = require('../sequelizeInstance');
const Set = require('../models/set');
const Theme = require('../models/theme');
const Sequelize = require('sequelize');

function initialize() {
    return sequelize
        .sync()
        .then(() => {
            console.log("Database synced successfully.");
        })
        .catch((err) => {
            console.log("Error syncing the database:", err);
            throw err;
        });
}

function getAllSets() {
    return Set.findAll({ include: [Theme] })
        .then((sets) => {
            if (sets.length === 0) throw new Error("No sets found.");
            return sets;
        })
        .catch((err) => {
            throw new Error(`Error: ${err.message}`);
        });
}

function getSetByNum(setNum) {
    return Set.findAll({
        include: [Theme],
        where: { set_num: setNum },
    })
        .then((sets) => {
            if (sets.length === 0) throw new Error("Set not found.");
            return sets[0];
        })
        .catch((err) => {
            throw new Error(`Error: ${err.message}`);
        });
}
function getSetsByTheme(theme) {
    return Set.findAll({
        include: [Theme],
        where: {
            '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%`,
            },
        },
    })
        .then((sets) => {
            if (sets.length === 0) throw new Error("Sets not founds sets.");
            return sets;
        })
        .catch((err) => {
            throw new Error(`Error: ${err.message}`);
        });
}


function createSet(setData) {
    return Set.create(setData)
        .then((createdSet) => {
            return createdSet;
        })
        .catch((err) => {
            throw new Error(err.errors[0].message);
        });
}



function getAllThemes() {
    return Theme.findAll()
        .then((themes) => {
            if (themes.length === 0) throw new Error("No themes found.");
            return themes;
        })
        .catch((err) => {
            throw new Error(`Unable to fetch themes: ${err.message}`);
        });
}


function editSet(set_num, setData) {
    return Set.update(setData, {
        where: { set_num: set_num },
    })
        .then((updatedRows) => {
            if (updatedRows[0] === 0) {
                throw new Error(`Set with set_num ${set_num} not found.`);
            }
            return;
        })
        .catch((err) => {
            throw new Error(err.errors ? err.errors[0].message : err.message);
        });
}


function deleteSet(set_num) {
    return Set.destroy({
        where: { set_num: set_num },
    })
        .then((deletedRows) => {
            if (deletedRows === 0) {
                throw new Error(`Set with set_num ${set_num} not found.`);
            }
            return;
        })
        .catch((err) => {
            throw new Error(err.errors ? err.errors[0].message : err.message);
        });
}


module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    createSet,
    editSet,
    deleteSet
}