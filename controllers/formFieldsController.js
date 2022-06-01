const { Forms } = require("../models/Form");
const { FormFields } = require("../models/FormFields");

exports.addFormFieldsInfo = async (req, res) => {
  let form_id;
  try {
    let {
      field_type,
      field_name,
      field_label,
      character_limit,
      rows,
      minimum_value,
      maximum_value,
      placeholder,
      choices,
      default_value,
      required,
      order,
      form_name,
      read_only,
      status,
    } = req.body;

    console.log("Body---->", req.body);
    let formDetails = await Forms.findOne({ where: { form_name: form_name } });
    if (formDetails) form_id = formDetails?.dataValues?.id;
    let createForm;
    if (!formDetails) {
      createForm = await Forms.create({ form_name: form_name });
      if (createForm) form_id = createForm?.dataValues?.id;
    }
    let update_field_status = false;
    let field_id;
    let FormFieldDetails = await FormFields.findOne({
      where: {
        form_id: form_id,
        field_name: field_name,
        field_label: field_label,
      },
    });
    if (FormFieldDetails) {
      field_id = FormFieldDetails?.dataValues?.id;
      update_field_status = true;
    }

    let data = {
      field_type,
      field_name,
      field_label,
      character_limit: character_limit
        ? field_type === "text"
          ? character_limit
          : null
        : null,
      rows: rows ? (field_type === "textarea" ? rows : null) : null,
      minimum_value: minimum_value
        ? field_type === "number"
          ? minimum_value
          : null
        : null,
      maximum_value: maximum_value
        ? field_type === "number"
          ? maximum_value
          : null
        : null,
      placeholder: !placeholder ? "" : placeholder,
      choices: choices
        ? field_type === "radio" ||
          field_type === "checkbox" ||
          field_type === "select"
          ? choices
          : ""
        : "",
      default_value: !default_value ? "" : default_value,
      required: required === "false" ? false : true,
      order: order,
      form_id: form_id,
      read_only: read_only === "false" ? false : true,
      status: !status ? true : false,
    };
    if (!update_field_status) {
      let createFormField = await FormFields.create(data);
      if (createFormField)
        res.send({ success: true, message: "Input field added successfully." });
    } else {
      let updateFormField = await FormFields.update(data, {
        where: { id: field_id },
      });
      if (updateFormField)
        res.send({ success: true, message: "Input field updated successfully." });
    }
  } catch (error) {
    res.status(400).send({ 
      success: false,
      message: "Something went wrong!!",
    });
  }
};
