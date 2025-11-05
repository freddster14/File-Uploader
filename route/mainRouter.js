const { Router } = require('express');
const mainController = require('../controller/mainController')

const main = Router();

main.get('/', mainController.home);
main.get('/login', mainController.logIn);
main.get('/sign-up', mainController.signUp);
main.get('/log-out', mainController.logOut);

main.post('/sign-up', mainController.createUser);
main.post('/login', mainController.loginUser);

module.exports = main;