const { User } = require('../models/User');

// GET A SINGLE USER
exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ where: { id: userId } });
    if(!user)
      throw new Error(`User with the given ID wasn't found!`);
    res.status(200).json({
      data: user
    });
  } catch(err) {
    res.status(400).json({
      status: "fail",
      msg: `<${err}>`
    });
  }
}

// GET MULTIPLE USERS
exports.getUsers = async (req, res, next) => {
  const users = await User.findAll({});
  res.status(200).json({
    data: users
  });
};

// UPDATE USER
exports.updateUser = async (req, res, next) => {
  try {
    const update = req.body;
    const userId = req.params.id;
    await User.update(update, {
      where: {
        id: userId
      }
    });

    const user = await User.findOne({ where: { id: userId } });
    res.status(200).json({
      data: user,
      message: `<User has been updated!>`
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: `<${err}>`
    });
  }
};


// DELETE USER
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.destroy({
      where: {
        id: userId
      }
    });
    res.status(204).json({
      data: null,
      message: `<User has been deleted!>`
    });
  } catch(err) {
    res.status(400).json({
      status: "fail",
      msg: `<${err}>`
    });
  }
};