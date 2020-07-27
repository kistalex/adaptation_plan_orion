const router = require('express').Router();
const User = require('../model/user');
const bcrypt = require('bcryptjs');
//const {registerValidation} = require('../routs/validation');

router.post('/register', async (req,res) => {
    //const {error} = registerValidation(req.body);
    //if (error) return res.status('400').send(error.details[0].message);
    const emailExists = await User.findOne({email: req.body.email});
    if (emailExists) return res.status('400').send('Данный email уже существует');

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        position: req.body.position,
        access: req.body.access
    });
    try{
        const savedUser = await user.save();
        res.send(savedUser);
    }catch(err){
        res.status('400').send(err);
    }
});

//get all users
router.get('/users', async (req,res) => {
    try{
        const allUsers = await User.find();
        res.json(allUsers);
    }catch(err){
        res.status('400').send(err);
    }
});

//get a single user by id
router.get('/usersbyid/:userID', async (req,res) => {
    try{
        const oneUser = await User.findById(req.params.userID);
        res.json(oneUser);
    }catch(err){
        res.status('400').send(err);
    }
});

//get all heads
router.get('/users/heads', async (req, res) => {
    User.find({access: 2}).exec(function(err, heads){
        if(err) throw err;

        res.json(heads);
    })
});


//update an user
router.patch('/users/:userID', async (req,res) => {
    try{
        const oldUser = await User.findById(req.params.userID);
        const updatedUser = await User.updateOne({_id: req.params.userID}, {$set: {
            name: req.body.name || oldUser.name,
            email: req.body.email || oldUser.email,
            password: req.body.password || oldUser.password,
            position: req.body.position || oldUser.position,
            access: req.body.access || oldUser.access
        }});
        res.json(updatedUser);
    }catch(err){
        res.status('400').send(err);
    }
});


module.exports = router;