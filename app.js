require('dotenv').config();
const express = require('express');
const path = require('node:path');
const passport = require('passport');
const session = require('express-session');
const { PrismaSesstionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

const PORT = 3000;
const app = express();
const assestsPath = path.join(__dirname, 'public');

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

app.use(express.static(assestsPath));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
  },
  store: new PrismaSesstionStore(
    new PrismaClient(),
    {
      checkPeriod: 1000 * 60 * 2,
      dbRecordIdSessionId: true,
      dvRecordIdFunction: undefined,
    },
  ),
}));

app.use(passport.session());
app.use('/', (req, res) => res.render('index'));

app.listen(PORT);
