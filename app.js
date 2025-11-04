const express = require('express');
const path = require('node:path');
const passport = require('passport');
const session = require('express-session');

const PORT = 3000;

const app = express();


app.use('/', (req,res) => res.render('index'));

app.listen(PORT)