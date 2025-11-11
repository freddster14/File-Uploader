function requireAuth (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    return res.render('home', { folder: {}, content: [], breadcrumbs: [] })
  }
}


module.exports = requireAuth;