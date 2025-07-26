const Category = require('../../models/category');


const getCategories = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const query ={
            isDeleted: false,
            name: {$regex: search, $options: 'i'}
        };
    

        const categories = await Category.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1 ) * limit )
            .limit(limit);

        const count = await Category.countDocuments(query);
        
        
        res.render('admin/category', {
            categories,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            search
        });


    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Something went wrong while fetching categories.');
    }
};



const addCategory = async (req, res) => {
    try {
        const { name, description, offer, discount, validUntil } = req.body;
        const category = new Category({
            name: name.trim(),
            description: description?.trim(),
            offer: offer?.trim(),
            discount: parseFloat(discount),
            validUntil
        });

        await category.save();

        res.redirect('/admin/category');
    }   catch (error) {
        console.error('Error adding category:', error);
        res.status(500).send('Something went wrong while adding a category.');
    }

};


const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndUpdate(id, {isDeleted: true});
        res.redirect('/admin/categories');
    } catch(error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Something went wrong while deleting a category.');
    }
};


module.exports = {
    getCategories,
    addCategory,
    deleteCategory
};