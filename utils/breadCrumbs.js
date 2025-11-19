const prisma = require('../prisma/client');

async function breadcrumbing(id) {
  let current = await prisma.folder.findUnique({
    where: { id: parseInt(id, 10) },
  });
  const res = []
  // go up the tree
  while(current.parentId !== null) {
    res.push({ name: current.name, link: `/folder/${current.id}` });
    current = await prisma.folder.findUnique({
      where: {
        id: current.parentId,
      }
    })
  }
  return res;
}

module.exports = breadcrumbing;