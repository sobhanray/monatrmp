require('../config/connection').sync();
const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const { TrainingFiles } = require('../models/TrainingFiles');
// // Loads the LOGIN page
// exports.getLoginPage = (req, res) => {
//   res.render('login', { title: "Login" });
// };

// // Loads the SIGNUP page
// exports.getSignupPage = (req, res) => {
//   res.render('signup',  { title: "Sign Up" });
// }

// Enables the user to sign-up for new account
exports.createUser = async (req, res, next) => {
  let { fullname, email, address, role, city, phone, telcode, file } =
      req.body;
  phone = `${telcode}-${phone}`;
  let profile_photo = `${__dirname}/public/uploads/${file}`;
  try {
    if (await User.findOne({ where: { email } }))
        throw new Error(
            `An account with this email already exists!`
        );
    const user = await User.create({
        fullname,
        email,
        address,
        role,
        city,
        phone,
        telcode,
        profile_photo
    });

    if (!user) throw new Error("User can't be created!");

    const token = user.sendToken();
    return res
        .status(201)
        .setHeader("Set-Cookie", `x-auth-token=${token}`)
        .send({
            status: "<success>",
            user: {
                id: user.id,
                email: user.email
            },
            accessToken: token
        });
    } catch (err) {
      res.status(400).json({
          status: "fail",
          msg: `<${err}>`
      });
    }
};

// Enables the user to log-in to his account
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try { 



    if(!email || !password) 
      throw new Error('email or password missing!');

    const user = await User.findOne({ where: { email } });

    if(!user) 
      throw new Error('Invalid \"Username\" or \"Password\"');
    
    const validPassword = await bcrypt.compare(password, user.password);
  
    if(!validPassword) 
      throw new Error('Invalid \"Username\" or \"Password\"');

    const token = user.sendToken();
    return res.status(200).setHeader('Set-Cookie', `x-auth-token=${token}`).send({
      status: "<success>",
      user: {
        id: user.id,
        email: user.email
      },
      accessToken: token
    });

  } catch(err) {
    res.status(400).json({
      status: "fail",
      msg: `<${err}>`
    });
  }
};

// Enables the user to log-in to his account
exports.menuList = async (req, res) => {
  const { email, password } = req.body;

  try { 



    if(!email || !password) 
      throw new Error('email or password missing!');

    const user = await User.findOne({ where: { email } });

    if(!user) 
      throw new Error('Invalid \"Username\" or \"Password\"');
    
    const validPassword = await bcrypt.compare(password, user.password);
  
    if(!validPassword) 
      throw new Error('Invalid \"Username\" or \"Password\"');

    const token = user.sendToken();
    return res.status(200).setHeader('Set-Cookie', `x-auth-token=${token}`).send({
      status: "<success>",
      user: {
        id: user.id,
        email: user.email
      },
      accessToken: token
    });

  } catch(err) {
    res.status(400).json({
      status: "fail",
      msg: `<${err}>`
    });
  }
};




// Enables the user to logout of his account
exports.logoutUser = (req, res) => {
  res.cookie('x-auth-token', '', { maxAge: 1 });
  return res.status(200).redirect('/');
};