const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    position: { 
        type: String, 
        required: true, 
        max: 255, 
        default: "Сотрудник" 
    }, 
    access: { 
        type: Number, 
        required: true, 
        default: 3 
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;