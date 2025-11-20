require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const passport = require('passport');
const { validationResult } = require('express-validator');
const { validateSignUp, validateLogin } = require('../middleware/validation');

exports.home = async (req, res, next) => {
  if (!req.user) return res.render('sign-up', { formData: {} })
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

exports.login = (req, res) => { res.render('login', { formData: {} }); }

exports.signUp = (req, res) => { res.render('sign-up', { formData: {} }); }

exports.createUser = [ validateSignUp, async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    return res.status(400).render('sign-up', { formData: { name, email }, errors: errors.array() })
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('login', { formData: { email: req.body.email }, errors: errors.array() })
  }
  passport.authenticate('local', async (error, user) => {
    if (error) return next(error);
    if (!user) return res.status(400).render('login', { formData: { email: req.body.email }, errors: [{ msg: 'Username and Password do not match' }] });
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


