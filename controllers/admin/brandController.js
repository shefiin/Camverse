const Brand = require('../../models/brand');


const getBrands = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const filter ={
            name: {$regex: search, $options: 'i'}
        };
    
        const brands = await Brand.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1 ) * limit )
            .limit(limit);

        const count = await Brand.countDocuments(filter);
               
        res.render('admin/brands', {
            brands,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            search
        });


    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Something went wrong while fetching categories.');
    }
};


const loadAddBrandPage = (req, res) => {
    try {
        const messages = req.flash();
        res.render('admin/add-brands', {
            messages
        });
    } catch (error) {
        console.error('Error loading add category page:', error);
        res.status(500).send('Something went wrong while loading add category page.');
    }
};



const addBrandValidation = async (req, res) => {
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

        const newBrand = new Brand({
            name: trimmedName,
            description: trimmedDescription,
            image
        });

        await newBrand.save();

        req.flash('success', 'Category added successfully');
        res.redirect('/admin/brands/add?success=1');

    } catch (err) {
        console.error('Error in addCategoryValidation:', err);
        return res.status(500).send('Something went wrong');
    }
}

const loadEditBrandPage = async (req, res) => {
    try {
        const brandId = req.params.id;
        const brand = await Brand.findById(brandId);

        if (!brand) {
            return res.status(404).send('Category not found');
        }

        res.render('admin/edit-brand', {brand});

    } catch(error) {
        console.error('Error loading edit category page:', error);
        res.status(500).send('Something went wrong while loading edit category page.');
    }
};


const updateBrand = async (req, res) => {
    try {
        const brandId = req.params.id;
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

        await Brand.findByIdAndUpdate(brandId, { $set: updateData});

    
        res.redirect('/admin/brands?success=1');

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Something went wrong while updating category.');
    }
};


const softDeleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        
        if (!brand) {
            return res.status(404).send('Brand not found');
        }

        res.redirect('/admin/brands?success=2');

    } catch (error) {
        console.error('Error soft deleting brand:', error);
        res.status(500).send('Something went wrong while soft deleting brand.');
    }
        
};


const restoreBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findByIdAndUpdate(
            id,
            { isDeleted: false },
            {new: true}
        );

        if(!brand) {
            return res.status(404).send('Brand not found');
        }

        res.redirect('/admin/brands?success=3');

    } catch (error) {
        console.error('Error restoring brand:', error);
        res.status(500).send('Something went wrong while restoring brand.');
    }
};
    



module.exports = {
    loadAddBrandPage,
    addBrandValidation,
    getBrands,
    loadEditBrandPage,
    updateBrand,
    softDeleteBrand,
    restoreBrand
}


