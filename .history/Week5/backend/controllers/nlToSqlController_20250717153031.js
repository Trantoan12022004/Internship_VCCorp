const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,
};
