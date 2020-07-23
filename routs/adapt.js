const router = require('express').Router();
const Plan = require('../model/plan');
const User = require('../model/user');
const Task = require('../model/task');


//create plan
router.post('/create', async (req,res) => {
    const nameExists = await User.findOne({name: req.body.name});
    if (!nameExists) return res.status('400').send('Ошибка ввода сотрудника');
    const positionExists = await User.findOne({position: req.body.position});
    if (!positionExists) return res.status('400').send('Ошибка ввода должности');
    const headExists = await User.findOne({name: req.body.head, access: 2});
    if (!headExists) return res.status('400').send('Ошибка ввода руководителя');
    
    const plan = new Plan({
        name: req.body.name,
        position: req.body.position,
        head: req.body.head,
        hr: req.body.hr,
        period: req.body.period
    });
    try{
        const savedPlan = await plan.save();
        res.send(savedPlan);
    }catch(err){
        res.status('400').send(err);
    }
});

//show plans 
router.get('/', async (req,res) => {
    try{
        const allPlans = await Plan.find({});
        res.json(allPlans);
    }catch(err){
        res.status('400').send(err);
    }
});


//task creation by plan id
router.post('/tasks/:planID', async (req,res) => {
   const plan = await Plan.findById(req.params.planID);
    if (plan){ 
        const tasks_arr = new Task({
            task_name: req.body.task_name,
            task_description: req.body.task_description,
            task_period: req.body.task_period
        }) 
        try{
            const savedTask = await tasks_arr.save();
            plan.tasks_arr = plan.tasks_arr.concat(savedTask._id);
            await plan.save();
            res.json(savedTask);
        }catch(err){
            res.status('400').send(err);
        }
    }
    

});



module.exports = router;