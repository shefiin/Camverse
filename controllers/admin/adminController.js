const Admin = require('../../models/admin');
const bcrypt = require('bcryptjs');


const renderLoginPage = (req, res) => {
    res.render('admin/login');
}


const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({email});

        if(!admin) {
            return res.status(404).json({message: 'Admin not found'});
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if(!isMatch) {
            return res.render('admin/login', { error: 'Invalid email or password' });
        }

        req.session.adminId = admin._id;
        res.redirect('/admin/dashboard');

    }   catch (error){
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
}


const logoutAdmin = (req, res) => {
    req.session.destroy(err => {
        if(err) return res.status(500).json({message: 'Server error'});
        res.redirect('/admin/login');   
    });
};



module.exports = {
    loginAdmin,
    renderLoginPage,
    logoutAdmin
};































































