/*********************************************************************************
* WEB322 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Alexander Raydan Student ID: 124348236 Date: Nov 28 2024

* Vercel Deploy: https://web322-assignment5-red.vercel.app/
********************************************************************************/

const express = require('express'); // "require" the Express module
const clientSessions = require('client-sessions'); // Require the client-sessions module
const authData = require("./module/auth-service");

const app = express(); // obtain the "app" object

app.set('view engine', 'ejs');

const HTTP_PORT = process.env.PORT || 8080; // assign a port
const path = require('path');

app.use(
    clientSessions({
        cookieName: 'session',
        secret: 'Manaos',
        duration: 24 * 60 * 60 * 2000,
        activeDuration: 24 * 60 * 60 * 2000,
    })
);

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Middleware
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

const legoSets = require("./module/legoSets");

legoSets.initialize()
    .then(authData.initialize)
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log(`app listening on: ${HTTP_PORT}`);
        });
    }).catch(function (err) {
        console.log(`unable to start server: ${err}`);
    });


app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: true }));

require('pg');

// Home page
app.get('/', (req, res) => {
    res.render('home');
});


// Routes

// Render login view
app.get('/login', (req, res) => {
    res.render('login', {
        errorMessage: ""
    });
});

// Render register view
app.get('/register', (req, res) => {
    res.render('register', {
        errorMessage: ""
    });
});

//registration
app.post('/register', (req, res) => {
    authData
        .registerUser(req.body)
        .then(() => {
            res.render('home');
        })
        .catch((err) => {
            res.render('register', { errorMessage: err, userName: req.body.userName });
        });
});


//login
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent'); // Add User-Agent to the request body
    authData
        .checkUser(req.body)
        .then((user) => {
            // Save user data to the session
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory,
            };
            res.render('home');
        })
        .catch((err) => {
            console.log(err);
            res.render('login', { errorMessage: err, userName: req.body.userName });
        });
});

//logout
app.get('/logout', (req, res) => {
    req.session.reset(); // Clear the session
    res.redirect('/'); // Redirect to the home page
});

// Render user history view (protected route)
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory'); // Ensure a userHistory.ejs view exists
});

// About page
app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/lego/sets', ensureLogin, (req, res) => {
    const theme = req.query.theme;

    if (theme) {

        legoSets.getSetsByTheme(theme)
            .then(
                (sets) => res.render("sets", { sets: sets })
            )
            .catch(
                (err) => res.status(404).send({ error: err.message })
            );
    } else {

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


app.get('/lego/addSet', ensureLogin, (req, res) => {
    legoSets.getAllThemes()
        .then((themes) => {
            res.render('addSet', { themes });
        })
        .catch((err) => {
            res.status(500).send(`Error loading themes: ${err.message}`);
        });
});

app.post('/lego/addSet', ensureLogin, (req, res) => {

    const { set_num, name, year, num_parts, img_url, theme_id } = req.body;

    legoSets.createSet({ set_num, name, year, num_parts, img_url, theme_id })
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following: ${err.message}` });
        });
});


app.post('/lego/editSet', ensureLogin, (req, res) => {
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


app.get('/lego/deleteSet/:num', ensureLogin, (req, res) => {
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