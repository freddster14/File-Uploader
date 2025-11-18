const { Router } = require('express');
const mainController = require('../controller/mainController');
const folderController = require('../controller/folderController');
const fileController = require('../controller/fileController');
const requireAuth = require('../middleware/auth');

const main = Router();

main.get('/', requireAuth, mainController.home);
main.get('/login', mainController.login);
main.get('/sign-up', mainController.signUp);
main.get('/log-out', mainController.logout);
main.post('/sign-up', mainController.createUser);
main.post('/login', mainController.loginUser);

main.get('/folder/:id', requireAuth, folderController.getFolder);
main.get('/share/:id', folderController.shareLink);
main.post('/create-folder/:id', requireAuth, folderController.createSubfolder);
main.post('/edit/folder/:id', requireAuth, folderController.edit);
main.post('/delete/folder/:id', requireAuth, folderController.delete)

main.get('/download/:id', fileController.download);
main.post('/upload/:id', requireAuth, fileController.upload);
main.post('/edit/file/:id', requireAuth, fileController.edit)
main.post('/delete/file/:id', requireAuth, fileController.delete)

module.exports = main;