const Category = require('../../models/category');
const Brand = require('../../models/brand');


const renderHomePage = async (req, res) => { 
    try {

        const customOrder = ['Mirrorless', 'DSLR', 'Action', 'Compact', 'Instant'];

        let categories = await Category.find({ isDeleted: { $ne: true }});
        categories.sort((a, b) => {
            return customOrder.indexOf(a.name) - customOrder.indexOf(b.name);
        });
                
        const brands = await Brand.find();

        res.render('user/homePage', {
            categories,
            brands
        });
    } catch (error) {
        console.error('Error rendering home page:', error);
        res.status(500).send('Something went wrong while rendering home page.');
    }
};

module.exports = {
    renderHomePage
}