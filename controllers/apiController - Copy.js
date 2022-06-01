const CountryData = require("../models/CountryData");
const Language = require("../models/Language");
const Role = require("../models/Role");
const City = require("../models/City");

// FETCHES THE LIST OF ALL LANGUAGES FROM DATABASE
exports.getLanguages = async (req, res, next) => {
    try {
        const languageList = await Language.findAll();

        return res.status(200).send({
            status: "<success>",
            languageList
        });
    } catch (err) {
        return res.status(404).send({
            status: "<fail>",
            message: "unable to fetch languages!"
        });
    }
};

// FETCHES THE LIST OF COUNTRY DATA FROM THE DATABASE
exports.getCountryData = async (req, res, next) => {
    try {
        const countryDataList = await CountryData.findAll();

        return res.status(200).send({
            status: "<success>",
            countryDataList
        });
    } catch (err) {
        return res.status(404).send({
            status: "<fail>",
            message: "unable to fetch country codes!"
        });
    }
};

// FETCHES THE LIST OF ALL USER ROLES
exports.getUserRoleData = async (req, res, next) => {
    try {
        const userRoleList = await Role.findAll();

        return res.status(200).send({
            status: "<success>",
            userRoleList
        });
    } catch (err) {
        return res.status(404).send({
            status: "<fail>",
            message: "unable to fetch user roles!"
        });
    }
};

// FETCHES THE LIST OF ALL AUSTRALIAN CITIES
exports.getCities = async (req, res, next) => {
    try {
        const cityList = await City.findAll();

        return res.status(200).send({
            status: "<success>",
            cityList
        });
    } catch (err) {
        return res.status(404).send({
            status: "<fail>",
            message: "unable to fetch cities!"
        });
    }
};
