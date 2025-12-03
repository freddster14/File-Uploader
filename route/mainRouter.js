const { Router } = require('express');
const mainController = require('../controller/mainController');
const folderController = require('../controller/folderController');
const fileController = require('../controller/fileController');
const linkController = require('../controller/linkContoller')
const requireAuth = require('../middleware/auth');

const main = Router();

main.get('/', mainController.intro)
main.get('/home', mainController.home);
main.get('/login', mainController.login);
main.get('/sign-up', mainController.signUp);
main.get('/log-out', mainController.logout);
main.get('/recent', requireAuth, mainController.recent);
main.get('/profile', requireAuth, mainController.profile)
main.post('/sign-up', mainController.createUser);
main.post('/login', mainController.loginUser);

main.get('/folder/:id', requireAuth, folderController.getFolder);
main.post('/create-folder/:id', requireAuth, folderController.createSubfolder);
main.post('/edit/folder/:id', requireAuth, folderController.edit);
main.post('/delete/folder/:id', requireAuth, folderController.delete);

main.get('/download/:id', fileController.download);
main.post('/upload/:id', requireAuth, fileController.upload);
main.post('/edit/file/:id', requireAuth, fileController.edit);
main.post('/delete/file/:id', requireAuth, fileController.delete);

main.get('/share/:token', linkController.shareLink);
main.get('/shared', requireAuth, linkController.shared);
main.get('/shared-with-me', requireAuth, linkController.sharedWithMe);
main.post('/share/:id', requireAuth, linkController.generateLink);
main.post('/activate/:id', requireAuth, linkController.activate)
main.post('/extend/:id', requireAuth, linkController.extend);
main.post('/revoke/:id', requireAuth, linkController.revoke);
main.post('/delete/:id', requireAuth, linkController.delete)

module.exports = main;