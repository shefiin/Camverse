

function blockGoBack(){
    if (!req.session.emailOtp) {
        return res.redirect('/user/profile'); 
    }
    next()
}

module.exports = blockGoBack