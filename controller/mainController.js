require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const passport = require('passport');
const { validationResult } = require('express-validator');
const { validateSignUp, validateLogin } = require('../middleware/validation');
const formatErrors = require('../utils/errorFormatter');


exports.intro = (req, res) => {
  if (req.user) return res.rediect('/home')
  res.render('intro');
}


exports.home = async (req, res, next) => {
  if (!req.user) return res.rediect('/');
  try {
    const root = await prisma.folder.findFirst({
      where: { 
        authorId: req.user.id,
        parentId: null,
      },
      include: {
        subfolders: true,
        files: true,
      },
    });
    res.render('home', { folder: root, content: [...root.subfolders, ...root.files], breadcrumbs: [] })
  } catch (error) {
    console.error(error)
    next(error)
  }
};

exports.login = (req, res) => { res.render('login', { formData: {}, errors: {} }); }

exports.signUp = (req, res) => { res.render('sign-up', { formData: {}, errors: {} }); }

exports.createUser = [ validateSignUp, async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = formatErrors(result.array())
    return res.status(400).render('sign-up', { formData: { name, email }, errors })
  }
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });
    await prisma.folder.create({
      data: {
        name: 'Home',
        authorId: user.id,
      }
    })
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/')
    })
  } catch (error) {
    console.error(error);
    next(error);
  }
}]

exports.loginUser = [ validateLogin, async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = formatErrors(result.array());
    return res.status(400).render('login', { formData: { email: req.body.email }, errors })
  }
  passport.authenticate('local', async (error, user, info) => {
    if (error) return next(error);
    if (!user) {
      return res.status(400).render('login', {
      formData: { email: req.body.email },
      errors: { general: info.msg || 'Email and Password do not match' }
    });}
    return req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/')
    });
  })(req, res, next);
}]

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
}


