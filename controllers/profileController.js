const path = require('path');
const multer = require('multer');
const { User } = require('../models/User');

/* MULTER INITIALIZATION HERE */

// setting storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// init upload
const upload = multer({
  storage
}).single('profilepic');

/* MULTER INITIALIZATION ENDS */

exports.getProfilePage = (req, res) => {
  res.render('profile', { title: 'Profile' });
};

exports.getProfile = (req, res) => {

};

exports.createProfile = async (req, res) => {
  let firstname, lastname, address, phone, profile_photo;

  upload(req, res, async (err) => {
    if(err) {
      res.render('profile', {
        msg: err,
        title: 'Profile'
      });
    } else {
      profile_photo = req.file.path;
      username = `${req.body.firstname} ${req.body.lastname}`;
      address = req.body.address;
      phone = req.body.phone;
      gender = req.body.gender;

      try {
        const user = await User.update({ username, profile_photo, address, phone, gender }, {
          where: {
            id: req.user.id
          }
        });
        if(!user)
          throw new Error('Profile cannot be created!');
        return res.status(201).redirect("/login");
      } catch (err) {
        return res.status(400).json({
          status: "fail",
          msg: `<${err}>`
        });
      }
    }
  });
};

exports.updateProfile = (req, res) => {

};