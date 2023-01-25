const User = require('../models/user');

module.exports = {
  verifyUser: (req, res, next) => {
    if (req.session.user) {
      if (req.session.user.userType === 'Block') {
        next();
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
    }
  },
  verifyAdmin: (req, res, next) => {
    if (req.session.adminLogged) {
      next();
    } else {
      res.redirect('/admin');
    }
  },
};
