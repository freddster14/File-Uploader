const { Router } = require('express');
const mainController = require('../controller/mainController')

const main = Router();

main.get('/', mainController.home);
main.get('/log-in', mainController.logIn);
main.get('/sign-up', mainController.signUp);


module.exports = main;