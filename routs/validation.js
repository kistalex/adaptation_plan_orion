const Joy = require('@hapi/joi');
const Joi = require('@hapi/joi');

const registerValidation = (data) => {
    const schema = {
        name: Joi.string().min(4).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    };
    const validation = schema.validate(data);
    return validation;
};

const stuffValidation = (data) => {
    const schema = {
        name: Joi.string().min(4).required(),
        position: Joi.string().required(),
        access: Joi.number().valid(1,2,3).required()
    };
    const validation = schema.validate(data);
    return validation;
};

module.exports.registerValidation = registerValidation;