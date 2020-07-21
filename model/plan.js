const mongoose = require('mongoose');
const planSchema = new mongoose.Schema({
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
    creation: {
        type: Date,
        default: Date.now
    },
    head: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    hr: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    stage:  {
        type: String,
        required: true,
        default: "Создание плана"
    }, 
    period: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    results: {
        type: String
    },
    mark: {
        type: String
    },
    tasks_arr: {
        task_name:{
            type: String,
            required: true
        },
        task_creation: {
            type: Date,
            default: Date.now
        },
        task_description: {
            type: String,
            required: true,
            min: 10
        },
        task_period: {
            type: String,
            required: true,
            min: 4,
            max: 255
        },
        task_rasult:{
            type: String
        }

    }
})

module.exports = mongoose.model('plan', planSchema);