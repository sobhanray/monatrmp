const Child = require('../models/Child');

exports.createChild = async (req, res, next) => {
  const { child_name, given_name, family_name, usually_called, dob, sex, country: country_of_birth, home_address, language, country, child_medicare_no, child_crn, parent_crn_1, parent_crn_2 } = req.body;

  try {
    const child = await Child.create({
      child_name,
      given_name, 
      family_name,
      usually_called,
      dob,
      sex,
      country_of_birth,
      home_address,
      language,
      country_of_birth,
      child_medicare_no,
      child_crn,
      parent_crn_1,
      parent_crn_2
    });

    if(!child)
      throw new Error('Child can\'t be created!');
    
    res.status(201).json({
      status: "success", 
    });

  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: `<${err}>`
    });
  }
};