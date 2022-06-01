exports.getHomepage = (req, res) => {
  // res.render('homepage', { title: "Home" });
  res.redirect('login');
};

exports.getDashboard = (req, res) => {
  res.render('dashboard', { title: 'Dashboard', user: req.user });
};