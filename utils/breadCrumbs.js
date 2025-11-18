const prisma = require('../prisma/client');

async function breadcrumbing(id) {
  console.log(id)
  let current = await prisma.folder.findUnique({
    where: { id: parseInt(id, 10) },
  });
  const res = [{ name: current.name, link: `/folder/${current.id}` }]
  // go up the tree
  while(current.parentId !== null) {
    current = await prisma.folder.findUnique({
      where: {
        id: current.parentId,
      }
    })
    res.push({ name: current.name, link: `/folder/${current.id}` });
  }
  return res;
}

module.exports = breadcrumbing;