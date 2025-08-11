const dotenv = require("dotenv");
const Task = require("../models/Task");
dotenv.config();

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
}


module.exports = {

};