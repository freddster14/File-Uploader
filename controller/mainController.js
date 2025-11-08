require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const passport = require('passport');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const breadcrumbing = require('../public/breadCrumbs');

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

exports.getFolder = async (req, res, next) => {
  if (!req.user) return res.redirect('/')
  const { id } = req.params;
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        subfolders:true,
        files: true,
      }
    })
    if (req.user.id !== folder.authorId) return res.status(403).send('Not authorized');
    const breadcrumbs = await breadcrumbing(id);
    res.render('home', { folder, content: [...folder.subfolders, ...folder.files], breadcrumbs })
  } catch (error) {
    next(error)
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

exports.createFolder = async (req, res, next) => {
  const { name } = req.body;
  try {
    await prisma.folder.create({
      data: {
        name,
        authorId: req.user.id,
      }
    })
    res.redirect('/')
  } catch (error) {
    next(error)
  }
 
}

exports.createSubfolder = async (req, res, next) => {
  const { name } = req.body;
  const parentId = parseInt(req.params.id, 10);

  try {
    await prisma.folder.create({
      data: {
        name,
        authorId: req.user.id,
        parentId,
      },
    });
    res.redirect(`/folder/${parentId}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
  
}

exports.upload = [upload.single('uploadedFile'), (req, res) => {
  const file = req.file;
  console.log(file);
}]