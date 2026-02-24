const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const otpTemplatePath = path.join(__dirname, 'templates', 'otp-verification.html');
let otpTemplate = '';

try {
    otpTemplate = fs.readFileSync(otpTemplatePath, 'utf8');
} catch (err) {
    console.error('Error loading OTP template:', err.message);
}

const buildOtpEmailHtml = (otp) => {
    const fallbackTemplate = '<p>Your Camverse OTP is: {{OTP}}</p>';
    return (otpTemplate || fallbackTemplate).replace(/{{OTP}}/g, String(otp));
};

const sendOTP = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Camverse OTP Verification',
            text: `Your Camverse OTP is: ${otp}. This OTP is valid for 5 minutes.`,
            html: buildOtpEmailHtml(otp)
        });
        console.log('OTP sent successfully', info.response);
    }   catch (err) {
        console.error('Error sending OTP:', err.message);
    }
};

module.exports = sendOTP;
