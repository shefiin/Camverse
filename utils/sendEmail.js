const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
            html: `<p>Your OTP is <strong>${otp}</strong></p>`
        });
        console.log('OTP sent successfully');
    }   catch (err) {
        console.error('Error sending OTP:', err);
    }
};

module.exports = sendOTP;