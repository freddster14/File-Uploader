require('dotenv').config();
require('./passport');
const express = require('express');
const path = require('node:path');
const passport = require('passport');
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('./generated/prisma');
const mainRouter = require('./route/mainRouter')


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
  store: new PrismaSessionStore(
    new PrismaClient(),
    {
      checkPeriod: 1000 * 60 * 2,
      dbRecordIdSessionId: true,
      dvRecordIdFunction: undefined,
    },
  ),
}));
app.use(passport.session());

app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  next();
})
app.use('/', mainRouter);

app.listen(PORT);
