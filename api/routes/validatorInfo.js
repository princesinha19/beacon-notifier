const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

require("colors");

const {
    addValidator,
    getAllValidators,
    getValidator,
    deleteValidator,
} = require("../controllers/validatorInfo");

// @route   GET api/v1/validator
// @desc    Get All validators
// @access  Public
router.get("/", getAllValidators);

// @route   GET api/v1/validator/:index
// @desc    Get Validator using index
// @access  Public
router.get("/:index", getValidator);

// @route   POST api/v1/validator/
// @desc    Add New Validator
// @access  Private
router.post("/",
    [
        check("index").not().isEmpty(),
        check("email").not().isEmpty(),
    ],
    addValidator,
);

// @route   DELETE api/v1/validator/
// @desc    DELETE Validator
// @access  Private
router.delete("/",
    [
        check("index").not().isEmpty(),
    ],
    deleteValidator,
);

module.exports = router;
