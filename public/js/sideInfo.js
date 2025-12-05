function showSideInfo(file) {
  const body = document.querySelector('.body');
  const sideInfo = document.querySelector('.side-info');
  const name = document.querySelector('.name-info')
  const owner = document.querySelector('.owner');
  const createdAt = document.querySelector('.created-at');
  const firstAccessedAt = document.querySelector('.first-accessed-at');
  const expiresAt = document.querySelector('.expires-at');

  
  name.textContent = file.name;
  owner.textContent = file.author.email;
  createdAt.textContent = new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  firstAccessedAt.textContent = new Date(file.firstAccessedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  expiresAt.textContent = new Date(file.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  
  body.classList.add('with-sidebar');
  sideInfo.style.display = 'flex';
}

function closeSideInfo() {
  document.querySelector('.side-info').style.display = 'none';
  document.querySelector('.body').classList.remove('with-sidebar');
}