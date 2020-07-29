const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
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
    task_start: {
        type: Date,
        default: Date.now
    },
    task_end:{
        type: Date,
        required: true
    },
    task_result:{
        type: String,
        default: "Не выполнена"
    }
});

module.exports = mongoose.model('task', taskSchema);