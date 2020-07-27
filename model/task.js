const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    task_name:{
        type: String,
    },
    task_creation: {
        type: Date,
        default: Date.now
    },
    task_description: {
        type: String,
        min: 10
    },
    task_period: {
        type: String,
        min: 4,
        max: 255
    },
    task_result:{
        type: String,
        default: "Не выполнена"
    }
});

module.exports = mongoose.model('task', taskSchema);