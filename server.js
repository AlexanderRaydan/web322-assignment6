/*********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Alexander Raydan Student ID: 124348236 Date: Nov 16 2024

* Vercel Deploy: https://web322-assignment5-red.vercel.app/
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

app.use(express.urlencoded({ extended: true })); // For form data

require('pg'); // explicitly require the "pg" module

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


app.get('/lego/editSet/:set_num', (req, res) => {
    const setNum = req.params.set_num;
    Promise.all([legoSets.getSetByNum(setNum), legoSets.getAllThemes()])
        .then(([setData, themeData]) => {
            res.render('editSet', { set: setData, themes: themeData });
        })
        .catch((err) => {
            res.status(404).render('404', { message: `Error loading data: ${err.message}` });
        });
});


app.get('/lego/addSet', (req, res) => {
    legoSets.getAllThemes()
        .then((themes) => {
            res.render('addSet', { themes });
        })
        .catch((err) => {
            res.status(500).send(`Error loading themes: ${err.message}`);
        });
});

app.post('/lego/addSet', (req, res) => {

    const { set_num, name, year, num_parts, img_url, theme_id } = req.body;

    legoSets.createSet({ set_num, name, year, num_parts, img_url, theme_id })
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following: ${err.message}` });
        });
});


app.post('/lego/editSet', (req, res) => {
    const setNum = req.body.set_num;
    const updatedData = req.body;

    legoSets.editSet(setNum, updatedData)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following: ${err.message}` });
        });
});


app.get('/lego/deleteSet/:num', (req, res) => {
    const setNum = req.params.num;

    legoSets.deleteSet(setNum)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following: ${err.message}` });
        });
});


app.use((req, res) => {
    res.render('404');
});