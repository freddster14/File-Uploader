const prisma = require('../prisma/client');
const breadcrumbing = require('../public/js/breadCrumbs');

exports.getFolder = async (req, res, next) => {
  if (!req.user) return res.redirect('/')
  const { id } = req.params;
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        subfolders: true,
        files: true,
      }
    })
    if (req.user.id !== folder.authorId) return res.status(403).send('Not authorized');
    const breadcrumbs = await breadcrumbing(id);
    res.render('home', { folder, content: [...folder.subfolders, ...folder.files], breadcrumbs })
  } catch (error) {
    next(error)
  }
};

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

};

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
};

