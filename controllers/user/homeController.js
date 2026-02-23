const Category = require('../../models/category');
const Brand = require('../../models/brand');
const nodemailer = require('nodemailer');

const validateContactPayload = ({ name, email, subject, message }) => {
    const safeName = (name || '').trim();
    const safeEmail = (email || '').trim();
    const safeSubject = (subject || '').trim();
    const safeMessage = (message || '').trim();

    if (!safeName || !safeEmail || !safeSubject || !safeMessage) {
        return { valid: false, error: 'All fields are required' };
    }

    if (safeName.length < 2 || safeName.length > 50) {
        return { valid: false, error: 'Name must be between 2 and 50 characters' };
    }

    if (!/^[A-Za-z .'-]+$/.test(safeName)) {
        return { valid: false, error: 'Name can only contain letters and spaces' };
    }

    if (safeEmail.length > 100) {
        return { valid: false, error: 'Email is too long' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeEmail)) {
        return { valid: false, error: 'Please enter a valid email' };
    }

    if (safeSubject.length < 5 || safeSubject.length > 120) {
        return { valid: false, error: 'Subject must be between 5 and 120 characters' };
    }

    if (safeMessage.length < 10 || safeMessage.length > 1000) {
        return { valid: false, error: 'Message must be between 10 and 1000 characters' };
    }

    return {
        valid: true,
        data: {
            safeName,
            safeEmail,
            safeSubject,
            safeMessage
        }
    };
};


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
            brands,
            contactStatus: req.query.status || null,
            contactError: req.query.error || null
        });
    } catch (error) {
        console.error('Error rendering contact page:', error);
        res.status(500).send('Something went wrong while rendering contact page.');
    }
};

const submitContactForm = async (req, res) => {
    try {
        const validation = validateContactPayload(req.body);
        if (!validation.valid) {
            return res.redirect(`/contact?status=error&error=${encodeURIComponent(validation.error)}`);
        }
        const { safeName, safeEmail, safeSubject, safeMessage } = validation.data;

        if (!process.env.EMAIL || !process.env.PASSWORD) {
            console.error('EMAIL/PASSWORD missing in environment');
            return res.redirect('/contact?status=error&error=Email%20service%20is%20not%20configured');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailTo = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL;

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: mailTo,
            replyTo: safeEmail,
            subject: `[Camverse Contact] ${safeSubject}`,
            text:
`New contact message from Camverse website

Name: ${safeName}
Email: ${safeEmail}
Subject: ${safeSubject}

Message:
${safeMessage}`,
            html: `
                <h2>New Contact Message</h2>
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Subject:</strong> ${safeSubject}</p>
                <p><strong>Message:</strong></p>
                <p>${safeMessage.replace(/\n/g, '<br>')}</p>
            `
        });

        return res.redirect('/contact?status=success');
    } catch (error) {
        console.error('Error sending contact email:', error);
        return res.redirect('/contact?status=error&error=Failed%20to%20send%20message');
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
    submitContactForm,
    renderTermsPage,
    renderReturnsInfoPage
}
