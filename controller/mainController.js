require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const passport = require('passport');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

exports.home = async (req, res, next) => {
  if (!req.user) return res.render('home', { folders: [] })

  try {
    const folders = await prisma.folder.findMany({
      where: { 
        authorId: req.user.id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      }
    });
    res.render('home', { folders })
  } catch (error) {
    console.error(error)
    next()
  }
};

exports.getFolder = async (req, res, next) => {
  if (!req.user) return res.redirect('/')

  const { id } = req.params;
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        authorId: req.user.id,
        id: parseInt(id, 10),
      }
    })
    res.render('/', { folders: [folder] })
  } catch (error) {
    
  }
}



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

exports.createFolder = async (req, res) => {
  const { name } = req.body;
  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        authorId: req.user.id
      }
    })
    res.redirect('/')
  } catch (error) {
    next(error)
  }
 
}

exports.upload = [upload.single('uploadedFile'), (req, res) => {
  const file = req.file;
  console.log(file);
}]