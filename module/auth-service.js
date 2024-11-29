require('dotenv').config();
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    loginHistory: [
        {
            dateTime: { type: Date, required: true },
            userAgent: { type: String, required: true },
        },
    ],
});

let User;

function initialize() {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGO_URI);
        db.on('error', (err) => reject(err));
        db.once('open', () => {
            User = db.model('users', userSchema);
            resolve();
        });
    });
}

function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.confirm_password) {
            return reject('Passwords do not match');
        }

        bcrypt.hash(userData.password, 10)
            .then((hash) => {
                let newUser = new User({
                    userName: userData.userName,
                    password: hash,
                    email: userData.email,
                    loginHistory: [],
                });

                newUser.save()
                    .then(() => resolve())
                    .catch((err) => {
                        if (err.code === 11000) {
                            reject('User Name already taken');
                        } else {
                            reject(`There was an error creating the user: ${err}`);
                        }
                    });
            }).catch((err) => {
                if (err.code === 11000) {
                    reject('User Name already taken');
                } else {
                    reject(`There was an error creating the user: ${err}`);
                }
            });
    });
}

function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    return reject(`Unable to find user: ${userData.userName}`);
                }

                bcrypt.compare(userData.password, user.password)
                    .then((isMatch) => {
                        if (!isMatch) {
                            return reject(`Incorrect Password for user: ${userData.userName}`);
                        }

                        // Manage login history
                        if (user.loginHistory.length >= 8) {
                            user.loginHistory.pop();
                        }
                        user.loginHistory.unshift({
                            dateTime: new Date().toString(),
                            userAgent: userData.userAgent,
                        });

                        // Update the user's login history
                        User.updateOne(
                            { userName: user.userName },
                            { $set: { loginHistory: user.loginHistory } }
                        )
                            .then(() => resolve({
                                userName: user.userName,
                                email: user.email,
                                loginHistory: user.loginHistory,
                            }))
                            .catch((err) =>
                                reject(`There was an error verifying the user: ${err}`)
                            );
                    })
                    .catch((err) => {
                        console.error('Error comparing passwords:', err);
                        reject('An error occurred while verifying the password');
                    });
            })
            .catch(() =>
                reject(`Unable to find user: ${userData.userName}`)
            );
    });
}

// Export the functions
module.exports = {
    initialize,
    registerUser,
    checkUser,
};
