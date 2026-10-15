import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendWelcomeEmail = async (name, email) => {
    await transporter.sendMail({
        from: `"Authify" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Authify!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #4f46e5;">Welcome to Authify, ${name}!</h2>
                <p>We're excited to have you join our community.</p>
                <p>Your account has been created successfully.</p>
                <p>You can now log in and explore everything Authify has to offer.</p>
                <br />
                <p>Best regards,</p>
                <strong>The Authify Team</strong>
            </div>
        `,
    });
};