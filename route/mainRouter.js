const { Router } = require('express');
const mainController = require('../controller/mainController')

const main = Router();


main.get('/login', mainController.logIn);
main.get('/sign-up', mainController.signUp);
main.get('/log-out', mainController.logOut);
main.get('/:id', mainController.home)
main.get('/', mainController.home);

main.post('/sign-up', mainController.createUser);
main.post('/login', mainController.loginUser);
main.post('/create-folder', mainController.createFolder);
main.post('/upload', mainController.upload);

module.exports = main;