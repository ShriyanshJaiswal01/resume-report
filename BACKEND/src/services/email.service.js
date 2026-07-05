const nodemailer = require("nodemailer");
const dns = require("dns");

// Force Node to prefer IPv4 over IPv6, resolving ENETUNREACH issues on cloud hosts like Render
if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

let transporterPromise = (async () => {
    // 1. If SMTP environment variables are defined, use them.
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            lookup: (hostname, options, callback) => {
                dns.lookup(hostname, { family: 4 }, callback);
            }
        });
    }

    // 2. If SMTP_USER and SMTP_PASS are set, auto-configure Gmail/others based on domain
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const isGmail = process.env.SMTP_USER.endsWith("@gmail.com");
        return nodemailer.createTransport({
            service: isGmail ? 'gmail' : undefined,
            host: isGmail ? undefined : 'smtp.gmail.com', // fallback
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            lookup: (hostname, options, callback) => {
                dns.lookup(hostname, { family: 4 }, callback);
            }
        });
    }

    // Otherwise, generate a free test SMTP service on Ethereal Email
    console.log("No SMTP credentials found in environment. Generating a test SMTP account via Ethereal Email...");
    const testAccount = await nodemailer.createTestAccount();
    console.log(`Generated Ethereal Email test account: ${testAccount.user}`);
    
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
        lookup: (hostname, options, callback) => {
            dns.lookup(hostname, { family: 4 }, callback);
        }
    });
})();

async function sendOtpEmail(toEmail, otp) {
    try {
        const transporter = await transporterPromise;
        const fromAddress = process.env.SMTP_USER ? `"AI Interview Strategist" <${process.env.SMTP_USER}>` : '"AI Interview Strategist" <noreply@ai-interview-strategist.com>';

        const mailOptions = {
            from: fromAddress,
            to: toEmail,
            subject: "Your Email Verification OTP Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #ff2d78; margin: 0;">AI Interview Strategist</h2>
                        <p style="color: #777777; font-size: 14px; margin-top: 5px;">Verify Your Identity</p>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                    <p style="color: #333333; font-size: 16px; line-height: 1.5;">Hello,</p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.5;">Thank you for using our platform. To proceed with your authentication, please use the One-Time Password (OTP) code below. This code is valid for <strong>5 minutes</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #ff2d78; letter-spacing: 5px; background-color: #f7f7f9; padding: 10px 25px; border-radius: 5px; border: 1px dashed #cccccc;">${otp}</span>
                    </div>
                    <p style="color: #777777; font-size: 14px; line-height: 1.5;">If you did not request this OTP, please ignore this email or contact support if you have security concerns.</p>
                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                    <div style="text-align: center; color: #999999; font-size: 12px;">
                        <p>&copy; 2026 AI Interview Strategist. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Message sent successfully. Message ID: ${info.messageId}`);
        
        // If Ethereal Email, log the preview URL!
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`\n======================================================`);
            console.log(`[TESTING] OTP sent to: ${toEmail}`);
            console.log(`[TESTING] OTP Code: ${otp}`);
            console.log(`[TESTING] Preview Email at Ethereal: ${previewUrl}`);
            console.log(`======================================================\n`);
        } else {
            console.log(`\n======================================================`);
            console.log(`[PROD/SMTP] OTP sent to: ${toEmail}`);
            console.log(`[PROD/SMTP] OTP Code: ${otp}`);
            console.log(`======================================================\n`);
        }
        return { success: true, messageId: info.messageId, previewUrl, otp };
    } catch (error) {
        console.error("[Email Service] Error sending email:", error);
        throw error;
    }
}

module.exports = {
    sendOtpEmail
};
