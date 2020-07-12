const { validationResult } = require("express-validator");
const ValidatorInfo = require("../models/ValidatorInfo");

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

// @route   GET api/v1/validator/:index
// @desc    Get Validator using index
// @access  Public
const getValidator = async (req, res) => {
    ValidatorInfo.find({ index: req.params.index })
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
        console.log(errors)
        res.status(422)
            .json({
                success: false,
                error: "Index and email should not be empty.",
            });
    }

    const {
        email,
        index,
    } = req.body;

    const newVerifiedAddress = new ValidatorInfo({
        email,
        index,
    });

    newVerifiedAddress.save()
        .then(() => {
            res.json({
                success: true,
                msg: "Validator added successfully !!",
                data: newVerifiedAddress,
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
                error: "Index should not be empty.",
            });
    }

    ValidatorInfo.deleteOne
        ({
            index: req.body.index,
        })
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
