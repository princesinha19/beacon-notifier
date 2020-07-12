const { validationResult } = require("express-validator");
const ValidatorInfo = require("../models/ValidatorInfo");
const { response } = require("../../app");

// @route   GET api/v1/validator
// @desc    Get All validators
// @access  Public
const getAllValidators = async (req, res) => {
    ValidatorInfo.find()
        .then((validators) => {
            res.status(200)
                .json({
                    success: true,
                    result: validators,
                });
        })
        .catch((error) => {
            res.status(500)
                .json({
                    success: false,
                    error: error.message,
                });
        });
};

// @route   GET api/v1/validator/index/:index/email/:email
// @desc    Get Validator using index
// @access  Public
const getValidator = async (req, res) => {
    ValidatorInfo.find
        (
            {
                $and: [
                    { email: req.params.email },
                    { index: req.params.index },
                ]
            }
        )
        .then((validator) => {
            res.status(200)
                .json({
                    success: true,
                    result: validator,
                });
        })
        .catch((error) => {
            res.status(500)
                .json({
                    success: false,
                    error: error.message,
                });
        });
};

// @route   POST api/v1/validator/
// @desc    Add New Validator
// @access  Private
const addValidator = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422)
            .json({
                success: false,
                error: "Both index and email are required !!",
            });
    }

    const {
        email,
        index,
    } = req.body;

    const newValidator = new ValidatorInfo({
        email,
        index,
    });

    newValidator.save()
        .then(() => {
            res.json({
                success: true,
                msg: "Validator added successfully !!",
                data: newValidator,
            })
        })
        .catch((error) => {
            res.status(500)
                .json({
                    success: false,
                    error: error.message,
                });
        });
};

// @route   DELETE api/v1/validator/
// @desc    DELETE Validator
// @access  Private
const deleteValidator = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422)
            .json({
                success: false,
                error: "Both index and email are required !!",
            });
    }

    ValidatorInfo.deleteOne
        (
            {
                $and: [
                    { email: req.body.email },
                    { index: req.body.index },
                ]
            }
        )
        .then((result) => {
            res.json({
                success: true,
                msg: "Validator removed successfully !!",
                data: result,
            })
        })
        .catch((error) => {
            res.status(500)
                .json({
                    success: false,
                    error: error.message,
                });
        });
};

module.exports = {
    addValidator,
    getAllValidators,
    getValidator,
    deleteValidator,
};
