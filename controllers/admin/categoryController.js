const Category = require('../../models/category');



const getCategories = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const filter ={
            name: {$regex: search, $options: 'i'}
        };
    
        const categories = await Category.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1 ) * limit )
            .limit(limit);

        const count = await Category.countDocuments(filter);
               
        res.render('admin/categories', {
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



const loadAddCategoryPage = (req, res) => {
    try {
        const messages = req.flash();
        res.render('admin/add-categories', {
            messages
        });
    } catch (error) {
        console.error('Error loading add category page:', error);
        res.status(500).send('Something went wrong while loading add category page.');
    }
};


const addCategoryValidation = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (
            !name || !description) {
            return res.status(400).send('All fields are required');
        }

        if (!req.file) {
            return res.status(400).send('At least one image is required');
        }

        if (
            typeof name !== 'string' || typeof description !== 'string')  {
            return res.status(400).send('Invalid data');
        }

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();


        const image = {
            url: req.file.path,
            public_id: req.file.filename
        };


        const newCategory = new Category({
            name: trimmedName,
            description: trimmedDescription,
            image  
        });

        await newCategory.save();

        req.flash('success', 'Category added successfully');
        res.redirect('/admin/categories/add?success=1');

    } catch (err) {
        console.error('Error in addCategoryValidation:', err);
        return res.status(500).send('Something went wrong');
    }
}


const loadEditCategoryPage = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.render('admin/edit-category', {category});

    } catch(error) {
        console.error('Error loading edit category page:', error);
        res.status(500).send('Something went wrong while loading edit category page.');
    }
};


const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const updateData = {};

        if(req.body.name) updateData.name = req.body.name;
        if(req.body.description) updateData.description = req.body.description;
        if(req.body.status) updateData.status = req.body.status;

        if(req.file) {
            updateData.image = {
                url: req.file.path,
                public_id: req.file.filename,
            };
        }

        await Category.findByIdAndUpdate(categoryId, { $set: updateData});

    
        res.redirect('/admin/categories?success=1');

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Something went wrong while updating category.');
    }
};



const softDeleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        
        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/categories?success=2');

    } catch (error) {
        console.error('Error soft deleting category:', error);
        res.status(500).send('Something went wrong while soft deleting category.');
    }
        
};


const restoreCategory = async (req, res) => {
    try{
        const { id } = req.params;

        const category = await Category.findByIdAndUpdate(
            id,
            { isDeleted: false },
            { new: true}
        );
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.redirect('/admin/categories?success=3');

    } catch (error) {
        console.error('Error restoring category:', error);
        res.status(500).send('Something went wrong while restoring category.');
    }
}


module.exports = {
    getCategories,
    loadAddCategoryPage,
    addCategoryValidation,
    loadEditCategoryPage,
    updateCategory,
    softDeleteCategory,
    restoreCategory
};





