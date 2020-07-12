const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const validatorInfoSchema = new Schema({
    index: { type: String, required: true },
    email: { type: String, required: true },
});

module.exports = mongoose.model("ValidatorInfo", validatorInfoSchema);