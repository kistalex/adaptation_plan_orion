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
        type: String,
        default: "Нет результата"
    },
    mark: {
        type: String,
        default: "Не оценено"
    },
    tasks_arr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
})

module.exports = mongoose.model('plan', planSchema);
