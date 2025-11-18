const prisma = require('../prisma/client');
const breadcrumbing = require('../utils/breadCrumbs');

exports.getFolder = async (req, res, next) => {
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
    });
    // auth
    if (req.user.id !== folder.authorId) return res.status(403).send('Not authorized');
    const breadcrumbs = await breadcrumbing(id);
    res.render('home', { folder, content: [...folder.subfolders, ...folder.files], breadcrumbs })
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

exports.edit = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const folder = await prisma.folder.update({
      where: { id: parseInt(id, 10)},
      data: {
        name: name
      }
    });
    if (folder.parentId) return res.redirect(`/folder/${folder.parentId}`);

    res.redirect('/')
  } catch (error) {
    console.error(error);
    next(error);
  };
}

exports.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const folder = await prisma.folder.delete({ where: { id: parseInt(id, 10) } });
    console.log(folder)
    if (folder.parentId) return res.redirect(`/folder/${folder.parentId}`);
    res.redirect('/')
  } catch (error) {
    console.error(error)
    next(error)
  };
}
