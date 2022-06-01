const { OperatingManual } = require("../models/OperatingManual");
const {
  OperatingManualCategory,
} = require("../models/OperatingManualCategory");

exports.getOperatingManual = async (req, res) => {
  OperatingManual.belongsTo(OperatingManualCategory, {
    foreignKey: "category_id",
  });
  try {
    const operatingManualDetails = await OperatingManual.findAll({
      include: [
        {
          model: OperatingManualCategory,
          where: { category_name: req.query.category_name },
        },
      ],
    });
    if (operatingManualDetails)
      res.send({
        success: true,
        message: "operating manual get successfully.",
        result: operatingManualDetails,
      });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong!!",
    });
  }
};
exports.getOperatingManualCategory = async (req, res) => {
  try {
    const operatingManualCategory = await OperatingManualCategory.findAll();
    if (operatingManualCategory)
      res.send({
        success: true,
        message: "operating manual category get successfully.",
        result: operatingManualCategory,
      });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong!!",
    });
  }
};

exports.getOperatingManual = async (req, res) => {
  OperatingManual.belongsTo(OperatingManualCategory, {
    foreignKey: "category_id",
  });
  try {
    const { Sequelize } = require("sequelize");
    const Op = Sequelize.Op;
    let { category_name, search } = req.query;
    let operatingManualDetails;
    if (search) {
      operatingManualDetails = await OperatingManual.findAll({
        where: Sequelize.where(
          Sequelize.fn("lower", Sequelize.col("question")),
          { [Op.like]: `%${search.toLowerCase()}%` }
        ),
          include: [
            {
              model: OperatingManualCategory,
            },
          ],
      });
    } else if (category_name) {
      operatingManualDetails = await OperatingManual.findAll({
        where: { status: true },
        include: [
          {
            model: OperatingManualCategory,
            where: { category_name: category_name, status: true },
          },
        ],
      });
    } else {
      operatingManualDetails = await OperatingManual.findAll({
        where: { status: true },
      });
    }
    if (operatingManualDetails)
      res.send({
        success: true,
        message: "operating manual get successfully.",
        result: operatingManualDetails,
      });
  } catch (error) {
    console.log("error-->", error);
    res.status(400).send({
      success: false,
      message: "Something went wrong!!",
    });
  }
};

exports.addOperatingManual = async (req, res) => {
  try {
    let { question, answer, category, media } = req.body;
    let data = {
      question,
      answer,
      category_id: category,
      media,
    };

    const operatingManualCategory = await OperatingManual.create(data);
    if (operatingManualCategory)
      res.send({
        success: true,
        message: "operating manual added successfully.",
        result: operatingManualCategory,
      });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong!!",
    });
  }
};
exports.addOperatingManualCategory = async (req, res) => {
  try {
    let { category_name } = req.body;
    const operatingManualCategory = await OperatingManualCategory.create({
      category_name,
    });
    if (operatingManualCategory)
      res.send({
        success: true,
        message: "operating manual category added successfully.",
        result: operatingManualCategory,
      });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong!!",
    });
  }
};
