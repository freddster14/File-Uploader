require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const passport = require('passport');

exports.home = async (req, res, next) => {
  if (!req.user) return res.render('home', { folder: {},  content: [], breadcrumbs: [] })

  try {
    const folders = await prisma.folder.findMany({
      where: { 
        authorId: req.user.id,
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      }
    });
    res.render('home', { folder: {}, content: folders, breadcrumbs: [] })
  } catch (error) {
    console.error(error)
    next()
  }
};




exports.logIn = (req, res) => {
  res.render('log-in');
}

exports.signUp = (req, res) => {
  res.render('sign-up');
}

exports.createUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/')
    })
  } catch (error) {
    console.error(error);
    next(error);
  }
}

exports.loginUser = async (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })(req, res, next);
}

exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
}


