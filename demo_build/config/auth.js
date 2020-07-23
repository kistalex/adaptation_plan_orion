module.exports ={
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Пожалуйста, войдите в систему, чтобы увидеть содержимое страницы');
        res.redirect('/users/login');
    }
}