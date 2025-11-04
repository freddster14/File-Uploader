const { Router } = require('express');
const mainController = require('../controller/')

const main = Router();

main.get('/', mainController.home);

exports.module = { main };