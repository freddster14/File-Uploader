const { Router } = require('express');
const mainController = require('../controller/mainController');
const folderController = require('../controller/folderController');
const fileController = require('../controller/fileController');



const main = Router();


main.get('/login', mainController.logIn);
main.get('/sign-up', mainController.signUp);
main.get('/log-out', mainController.logOut);
main.get('/folder/:id', folderController.getFolder);
main.get('/', mainController.home);

main.post('/sign-up', mainController.createUser);
main.post('/login', mainController.loginUser);
main.post('/create-folder/:id', folderController.createSubfolder);
main.post('/create-folder', folderController.createFolder);
main.post('/upload', fileController.upload);
main.post('/delete/:id', folderController.delete)

module.exports = main;