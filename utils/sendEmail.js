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
            subject: 'Camverse OTP Verification',
            text: `Your OTP is: ${otp}`,
            html: `<h2> Your new OTP for email verification is: <b>${otp}</b></h2>
                   <p>This OTP is valid for 5 minutes.</p>`
        });
        console.log('OTP sent successfully', info.response);
    }   catch (err) {
        console.error('Error sending OTP:', err.message);
    }
};

module.exports = sendOTP;