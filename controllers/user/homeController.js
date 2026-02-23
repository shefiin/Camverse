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

const renderAboutPage = async (req, res) => {
    try {
        const customOrder = ['Mirrorless', 'DSLR', 'Action', 'Compact', 'Instant'];

        let categories = await Category.find({ isDeleted: { $ne: true }});
        categories.sort((a, b) => {
            return customOrder.indexOf(a.name) - customOrder.indexOf(b.name);
        });

        const brands = await Brand.find();

        res.render('user/about', {
            categories,
            brands
        });
    } catch (error) {
        console.error('Error rendering about page:', error);
        res.status(500).send('Something went wrong while rendering about page.');
    }
};

const renderRefundPolicyPage = async (req, res) => {
    try {
        const customOrder = ['Mirrorless', 'DSLR', 'Action', 'Compact', 'Instant'];

        let categories = await Category.find({ isDeleted: { $ne: true }});
        categories.sort((a, b) => {
            return customOrder.indexOf(a.name) - customOrder.indexOf(b.name);
        });

        const brands = await Brand.find();

        res.render('user/refund-policy', {
            categories,
            brands
        });
    } catch (error) {
        console.error('Error rendering refund policy page:', error);
        res.status(500).send('Something went wrong while rendering refund policy page.');
    }
};

const renderShippingInfoPage = async (req, res) => {
    try {
        const customOrder = ['Mirrorless', 'DSLR', 'Action', 'Compact', 'Instant'];

        let categories = await Category.find({ isDeleted: { $ne: true }});
        categories.sort((a, b) => {
            return customOrder.indexOf(a.name) - customOrder.indexOf(b.name);
        });

        const brands = await Brand.find();

        res.render('user/shipping-info', {
            categories,
            brands
        });
    } catch (error) {
        console.error('Error rendering shipping info page:', error);
        res.status(500).send('Something went wrong while rendering shipping info page.');
    }
};

const renderContactPage = async (req, res) => {
    try {
        const customOrder = ['Mirrorless', 'DSLR', 'Action', 'Compact', 'Instant'];

        let categories = await Category.find({ isDeleted: { $ne: true }});
        categories.sort((a, b) => {
            return customOrder.indexOf(a.name) - customOrder.indexOf(b.name);
        });

        const brands = await Brand.find();

        res.render('user/contact', {
            categories,
            brands
        });
    } catch (error) {
        console.error('Error rendering contact page:', error);
        res.status(500).send('Something went wrong while rendering contact page.');
    }
};

const renderTermsPage = async (req, res) => {
    try {
        const customOrder = ['Mirrorless', 'DSLR', 'Action', 'Compact', 'Instant'];

        let categories = await Category.find({ isDeleted: { $ne: true }});
        categories.sort((a, b) => {
            return customOrder.indexOf(a.name) - customOrder.indexOf(b.name);
        });

        const brands = await Brand.find();

        res.render('user/terms-and-conditions', {
            categories,
            brands
        });
    } catch (error) {
        console.error('Error rendering terms page:', error);
        res.status(500).send('Something went wrong while rendering terms page.');
    }
};

const renderReturnsInfoPage = async (req, res) => {
    try {
        const customOrder = ['Mirrorless', 'DSLR', 'Action', 'Compact', 'Instant'];

        let categories = await Category.find({ isDeleted: { $ne: true }});
        categories.sort((a, b) => {
            return customOrder.indexOf(a.name) - customOrder.indexOf(b.name);
        });

        const brands = await Brand.find();

        res.render('user/returns-info', {
            categories,
            brands
        });
    } catch (error) {
        console.error('Error rendering returns info page:', error);
        res.status(500).send('Something went wrong while rendering returns info page.');
    }
};

module.exports = {
    renderHomePage,
    renderAboutPage,
    renderRefundPolicyPage,
    renderShippingInfoPage,
    renderContactPage,
    renderTermsPage,
    renderReturnsInfoPage
}
