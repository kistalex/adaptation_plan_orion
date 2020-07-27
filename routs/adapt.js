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
        period: req.body.period,
        stage: req.body.stage || "Добавление задачи"
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

//plan update
router.patch('/:planId', async (req,res) => {
    try{
        const oldPlan = await Plan.findById(req.params.planId);
        await Plan.updateOne({_id: req.params.planId}, {$set: {
            period: req.body.period || oldPlan.period,
            stage: req.body.stage || oldPlan.stage,
            results : req.body.results || oldPlan.results,
            mark: req.body.mark|| oldPlan.mark
        }});
        const updatedPlan = await Plan.findById(req.params.planId);
        res.json(updatedPlan);
    }catch(err){
        res.status('400').send(err);
    }
});

//task creation by plan id
router.post('/tasks/:planID', async (req,res) => {
   const plan = await Plan.findById(req.params.planID);
    if (plan){ 
        const tasks_arr = new Task({
            plan : plan._id,
            task_name: req.body.task_name,
            task_description: req.body.task_description,
            task_period: req.body.task_period
        }) 
        try{
            const savedTask = await tasks_arr.save();
            plan.tasks_arr = plan.tasks_arr.concat(savedTask._id);
            plan.stage = "Добавление задач";
            await plan.save();
            res.json(savedTask);
        }catch(err){
            res.status('400').send(err);
        }
    }
    

});
//get all tasks by plan id
router.get('/:planId/tasks', async (req,res) => {
    try{
        const allTasks = await Task.find({'plan':req.params.planId});
        res.json(allTasks);
    }catch(err){
        res.status('400').send(err);
    }
});

//update task by task id
router.patch('/tasks/:taskId', async (req,res) => {
    try{
        const oldTask = await Task.findById(req.params.taskId);
        await Task.updateOne({_id: req.params.taskId}, {$set: {
            task_name: req.body.task_name ||oldTask.task_name,
            task_description: req.body.task_description || oldTask.task_description,
            task_period: req.body.task_period || oldTask.task_period,
            task_result: req.body.task_result || oldTask.task_result
        }});
        const updatedTask = await Task.findById(req.params.taskId);
        res.send(updatedTask);
    }catch(err){
        res.status('400').send(err);
    }
});


//delete task
router.delete('/tasks/:taskId', async (req,res) => {
    const task = await Task.findById(req.params.taskId);
    const plan = await Plan.findOne({tasks_arr: req.params.taskId});
    if (plan){
        await plan.tasks_arr.pull({_id:task._id});
     }
    try{
        await Task.findByIdAndDelete(req.params.taskId);
        const newPlan = await plan.save();
        res.json(newPlan);
    }catch(err){
        res.status('400').send(err);
    }
    
});

module.exports = router;