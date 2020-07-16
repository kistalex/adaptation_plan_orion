const router = require('express').Router();
const Employee = require('../model/employee');
//const {registerValidation} = require('../routs/validation');

router.post('/addstuff', async (req,res) => {
    //const {error} = registerValidation(req.body);
    //if (error) return res.status('400').send(error.details[0].message);
    const employee = new Employee({
        name: req.body.name,
        position: req.body.position,
        access: req.body.access
    });
    try{
        const savedEmployee = await employee.save();
        res.send(savedEmployee);
    }catch(err){
        res.status('400').send(err);
    }
});


module.exports = router;