const Admin = require('../../models/admin');
const bcrypt = require('bcryptjs');


const renderLoginPage = (req, res) => {
    res.render('admin/login', { error: null });
}


const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPassword = String(password || '');
        const invalidCredsMessage = 'Invalid email or password';

        const admin = await Admin.findOne({ email: normalizedEmail });

        if(!admin) {
            return res.status(401).render('admin/login', { error: invalidCredsMessage });
        }

        const isMatch = await bcrypt.compare(normalizedPassword, admin.password);

        if(!isMatch) {
            return res.status(401).render('admin/login', { error: invalidCredsMessage });
        }

        req.session.adminId = admin._id;
        res.redirect('/admin/dashboard');

    }   catch (error){
        console.error(error);
        res.status(500).render('admin/login', { error: 'Something went wrong. Please try again.' });
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






























































