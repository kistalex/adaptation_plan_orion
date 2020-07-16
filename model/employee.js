const mongoose = require('mongoose');
const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    position: {
        type: String,
        required: true,
        max: 255
    },
    access: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('employee', employeeSchema);