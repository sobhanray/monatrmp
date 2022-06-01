const { Forms } = require("../models/Form");
// const { FormData } = require("../models/FormData");
const { FormFields } = require("../models/FormFields");

// exports.addFormData = async (req, res) => {
//   let { form_id, user_id, data } = req.body;
//   try {
//     let form_data = {
//       form_id,
//       user_id,
//       fields: JSON.stringify(data),
//     };
//     let form = await FormData.create(form_data);
//     if (form)
//       res.send({ success: true, message: "form data added successfully." });
//   } catch (error) {
//     console.log("error--->", error);
//     res.status(400).send({
//       success: false,
//       message: "Something went wrong!!",
//     });
//   }
// };

exports.addForm = async (req, res) => {
  try {
    let {
      form_name,
      form_type,
      form_description,
      form_template_select,
      previous_form,
    } = req.body;
    let data = {
      form_name,
      form_type,
      form_description,
      form_template_select,
      previous_form: form_template_select === "Yes" ? previous_form : "",
    };
    const formDetails = await Forms.create(data);
    if (formDetails)
      res.send({
        success: true,
        message: "form data added successfully.",
        result: formDetails,
      });
  } catch (error) {
    console.log("error--->", error);
    res.status(400).send({
      success: false,
      message: "Something went wrong!!",
    });
  }
};
exports.getAllForm = async (req, res) => {
  try {
    let formDetails;
    const { Sequelize } = require("sequelize");
    const Op = Sequelize.Op;
    if (!(req.query.search === "")) {
      formDetails = await Forms.findAll({
        where: Sequelize.and(Sequelize.where(
          Sequelize.fn("lower", Sequelize.col("form_name")),
          { [Op.like]: `%${req.query.search.toLowerCase()}%` }
        ),{status:true}),
      });
    } else {
      formDetails = await Forms.findAll({
        where: { status: true },
      });
    }
    if (formDetails)
      res.send({
        success: true,
        message: "form get successfully.",
        result: formDetails,
      });
  } catch (error) {
    console.log("error--->", error);
    res.status(400).send({
      success: false,
      message: "Something went wrong!!",
    });
  }
};
exports.getForm = async (req, res) => {
  FormFields.belongsTo(Forms, { foreignKey: "form_id" });
  try {
    const formDetails = await FormFields.findAll({
      order: [["order", "ASC"]],
      include: [{ model: Forms, where: { form_name: req.query.form_name } }],
    });
    if (formDetails)
      res.send({
        success: true,
        message: "form get successfully.",
        result: formDetails,
      });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong!!",
    });
  }
};
