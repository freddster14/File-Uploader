const { Router } = require('express');
const mainController = require('../controller/mainController');
const folderController = require('../controller/folderController');
const fileController = require('../controller/fileController');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload')

const main = Router();

main.get('/', requireAuth, mainController.home);
main.get('/login', mainController.login);
main.get('/sign-up', mainController.signUp);
main.get('/log-out', mainController.logout);
main.post('/sign-up', mainController.createUser);
main.post('/login', mainController.loginUser);


main.get('/folder/:id', requireAuth, folderController.getFolder);
main.post('/create-folder/:id', requireAuth, folderController.createSubfolder);
main.post('/create-folder', requireAuth, folderController.createFolder);
main.post('/edit/:id', requireAuth, folderController.edit);
main.post('/delete/folder/:id', requireAuth, folderController.delete)


main.post('/upload/:id', requireAuth, fileController.upload);
main.post('/delete/file/:id', requireAuth, fileController.delete)

module.exports = main;