exports.home = (req, res) => {
  res.render('home')
};

exports.logIn = (req, res) => {
  res.render('log-in');
}

exports.signUp = (req, res) => {
  res.render('sign-up');
}