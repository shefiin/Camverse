const User = require('../../models/user');
const bcrypt = require('bcryptjs');


const renderUserManagementPage= (req, res) => {
    res.render('admin/users', {title: 'User List', pageClass: 'user-list'});
}


const USERS_PER_PAGE = 5;

const renderUserlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const totalUsers = await User.countDocuments();
        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * USERS_PER_PAGE)
            .limit(USERS_PER_PAGE);
        
        const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);    

        res.render('admin/users', {
            users,
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching user list:', error);
        res.status(500).send('Something went wrong while fetching users.');
    } 

};


const blockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndUpdate(userId, { isBlocked: true});
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).send('Something went wrong while blocking a user.');
    }
    
};



const unblockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndUpdate(userId, { isBlocked: false });
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).send('Something went wrong while unblocking a user');
    }
    
};

module.exports = {
    renderUserManagementPage,
    renderUserlist,
    blockUser,
    unblockUser
};





