/*********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Alexander Raydan Student ID: 124348236 Date: Oct 20 2024

VERCEL DEPLOY: https://web322-assignment4-one.vercel.app/
********************************************************************************/

const express = require('express'); // "require" the Express module

const app = express(); // obtain the "app" object
app.set('view engine', 'ejs');

const HTTP_PORT = process.env.PORT || 8080; // assign a port
const path = require('path');

const legoSets = require("./module/legoSets");
legoSets.initialize()

// start the server on the port and output a confirmation to the console
app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));

//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

require('pg'); // explicitly require the "pg" module
const Sequelize = require('sequelize');

// Home page
app.get('/', (req, res) => {
    res.render('home');
});


// About page
app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme; // Check for the 'theme' query parameter

    if (theme) {
        // If 'theme' parameter exists, fetch sets by theme
        legoSets.getSetsByTheme(theme)
            .then(
                (sets) => res.render("sets", { sets: sets })
            )
            .catch(
                (err) => res.status(404).send({ error: err.message })
            );
    } else {
        // If 'theme' parameter doesn't exist, return all sets
        legoSets.getAllSets()
            .then(
                (sets) => res.render("sets", { sets: sets })
            )
            .catch(
                (err) => res.status(404).send({ error: err.message })
            );
    }
});

app.get('/lego/sets/:set_num', (req, res) => {
    const setNum = req.params.set_num;
    legoSets.getSetByNum(setNum)
        .then(
            (e) => res.render("set", { set: e })
        )
        .catch(
            (err) => res.status(404).send({ error: err.message })
        );
});


app.get('/lego/sets/bad-num-demo', (req, res) => {
    legoSets.getSetByNum('bad_id')
        .then(
            (e) => res.send(e)
        )
        .catch(
            (err) => res.send(err)
        )
});


app.get('/lego/sets/bad-theme-demo', (req, res) => {
    legoSets.getSetsByTheme('bad_id')
        .then(
            (e) => res.send(e)
        )
        .catch(
            (err) => res.send(err)
        )
});


app.use((req, res) => {
    res.render('404');
});