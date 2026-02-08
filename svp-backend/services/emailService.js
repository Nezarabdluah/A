const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
    // Check if SMTP credentials are configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Fallback: Use Ethereal for testing (creates a test account)
    console.log('⚠️  No SMTP configured. Using console logging for emails.');
    return null;
};

const transporter = createTransporter();

// Send OTP Email
const sendOTPEmail = async (email, otpCode) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || '"SVP International" <noreply@svp.com>',
        to: email,
        subject: 'Your Verification Code - SVP International',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0f766e; margin: 0;">الاعتماد المهني</h1>
                    <p style="color: #666; margin: 5px 0;">Professional Accreditation</p>
                </div>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
                    <h2 style="color: #1e293b; margin: 0 0 10px;">Verification Code</h2>
                    <p style="color: #64748b; margin: 0 0 20px;">Use this code to verify your email address:</p>
                    
                    <div style="background: #0f766e; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 40px; border-radius: 8px; display: inline-block;">
                        ${otpCode}
                    </div>
                    
                    <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
                        This code expires in 10 minutes.
                    </p>
                </div>
                
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
        `
    };

    if (transporter) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${email}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Failed to send email to ${email}:`, error.message);
            throw error;
        }
    } else {
        // Console fallback for testing
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 EMAIL TO: ${email}`);
        console.log(`📋 SUBJECT: Your Verification Code - SVP International`);
        console.log(`🔑 OTP CODE: ${otpCode}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return { success: true, mode: 'console' };
    }
};

// Send Approval Email
const sendApprovalEmail = async (email, applicantName, certificateSerial) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || '"SVP International" <noreply@svp.com>',
        to: email,
        subject: 'Application Approved! - SVP International',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0f766e; margin: 0;">الاعتماد المهني</h1>
                    <p style="color: #666; margin: 5px 0;">Professional Accreditation</p>
                </div>
                
                <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 30px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 48px;">✅</span>
                    </div>
                    
                    <h2 style="color: #166534; text-align: center; margin: 0 0 20px;">Congratulations!</h2>
                    
                    <p style="color: #1e293b;">Dear <strong>${applicantName}</strong>,</p>
                    
                    <p style="color: #64748b;">
                        Your application has been <strong style="color: #22c55e;">approved</strong>. 
                        Your professional accreditation certificate is now active.
                    </p>
                    
                    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                        <p style="color: #64748b; margin: 0 0 5px; font-size: 14px;">Certificate Serial Number:</p>
                        <p style="color: #0f766e; font-size: 24px; font-weight: bold; margin: 0;">${certificateSerial}</p>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px;">
                        You can verify your certificate at any time on our website.
                    </p>
                </div>
                
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
                    © 2026 SVP International PACC. All rights reserved.
                </p>
            </div>
        `
    };

    if (transporter) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Approval email sent to ${email}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Failed to send approval email to ${email}:`, error.message);
            throw error;
        }
    } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 APPROVAL EMAIL TO: ${email}`);
        console.log(`👤 APPLICANT: ${applicantName}`);
        console.log(`📜 CERTIFICATE: ${certificateSerial}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return { success: true, mode: 'console' };
    }
};

module.exports = {
    sendOTPEmail,
    sendApprovalEmail
};
