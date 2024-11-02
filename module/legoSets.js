/*********************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Alexander Raydan Student ID: 124348236 Date: Sep 4 2024
********************************************************************************/

const setData = require("../data/setData");
const themeData = require("../data/themeData");
let sets = [];

function initialize() {
    return new Promise((resolve, reject) => {
        let theme;
        setData.forEach(lego => {
            theme = themeData.find(e => e.id === lego.theme_id)
            lego.theme = theme.name;
            sets.push(lego);
        });
        sets.length !== 0 ? resolve('Data initialized successfully') : reject('No data')
    });
}

function getAllSets() {

    return new Promise((resolve, reject) => {
        initialize().then(
            sets.length !== 0 ? resolve(sets) : reject('No data')
        )
    });
}

function getSetByNum(setNum) {
    let set = sets.find(e => e.set_num === setNum)
    return new Promise((resolve, reject) => {
        initialize().then(
            set !== undefined ? resolve(set) : reject(`Set number ${setNum} not found`)
        )
    });
}


function getSetsByTheme(theme) {
    let set = sets.filter(e => e.theme.toUpperCase().includes(theme.toUpperCase()))
    return new Promise((resolve, reject) => {
        initialize().then(
            set.length !== 0 ? resolve(set) : reject(`Set theme ${theme} not found`)
        )
    });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme }