function toggleModal(id) {
  const modal = document.getElementById(id);
  if(modal.open) {
    modal.close()
  } else {
    modal.show()
  }
}

// close modal when clicking outside
document.addEventListener('click', (e) => {
  const modals = document.querySelectorAll('dialog');
  modals.forEach(modal => {
    if (modal.open && e.target.id !== modal.id && !modal.contains(e.target)) modal.close()
  })
})
