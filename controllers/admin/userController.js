const User = require('../../models/user');
const bcrypt = require('bcryptjs');


const USERS_PER_PAGE = 5;


const getUsers = async (req, res) => {
    try {
      const rawSearch = req.query.search || '';
      const search = rawSearch.trim();
      const searchNoSpaces = search.replace(/\s+/g, ''); 
  
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;
  
      const filter = {
        $or: [
          
          { name: { $regex: search, $options: 'i' } },
  
          
          {
            $expr: {
              $regexMatch: {
                input: { $replaceAll: { input: "$name", find: " ", replacement: "" } },
                regex: searchNoSpaces,
                options: "i"
              }
            }
          },
  
          
          { email: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      };
  
      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      const count = await User.countDocuments(filter);
  
      res.render('admin/users', {
        users,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        search,
        skip
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Something went wrong while fetching users.');
    }
};

  


const blockUser = async (req, res) => {
    try {
      const userId = req.params.id;
      await User.findByIdAndUpdate(
        userId,
        { isBlocked: true, status: 'Blocked' }, 
        { new: true } 
      );
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Error blocking user:', error);
      res.status(500).send('Something went wrong while blocking a user.');
    }
};
  


const unblockUser = async (req, res) => {
    try {
      const userId = req.params.id;
      await User.findByIdAndUpdate(
        userId,
        { isBlocked: false, status: 'Active' }, 
        { new: true }
      );
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Error unblocking user:', error);
      res.status(500).send('Something went wrong while unblocking a user.');
    }
  };



  const softDeleteUser = async (req, res) => {
      try {
          const { id } = req.params;
  
          const user = await User.findByIdAndUpdate(
              id,
              { isDeleted: true, status: 'Deleted' },
              { new: true }
          );
          
          if (!user) {
              return res.status(404).send('User not found');
          }
  
          res.redirect('/admin/users?success=2');
  
      } catch (error) {
          console.error('Error soft deleting user:', error);
          res.status(500).send('Something went wrong while soft deleting user.');
      }
          
  };
  
  
  const restoreUser = async (req, res) => {
      try {
          const { id } = req.params;
  
          const user = await User.findByIdAndUpdate(
              id,
              { isDeleted: false },
              {new: true}
          );
  
          if(!user) {
              return res.status(404).send('User not found');
          }
  
          res.redirect('/admin/users?success=3');
  
      } catch (error) {
          console.error('Error restoring user:', error);
          res.status(500).send('Something went wrong while restoring user.');
      }
  };
  

module.exports = {
    getUsers,
    blockUser,
    unblockUser,
    softDeleteUser,
    restoreUser
};





