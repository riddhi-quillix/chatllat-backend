const changePasswordMail = (username, email, newPassword) => {
    return {
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Password Changed</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; -webkit-text-size-adjust: 100% }
            .email-container { max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); padding: 30px; color: #333 }
            .header { text-align: center; margin-bottom: 30px }
            .header img { max-width: 250px; margin-bottom: 15px }
            h1 { font-size: 24px; margin-bottom: 24px; color: #222 }
            p { font-size: 16px; line-height: 1.5; margin-bottom: 16px }
            .info-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2a9d8f; margin-bottom: 24px; border-radius: 6px }
            .footer { font-size: 14px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px }
        </style>
        </head><body>
        <div class="email-container" role="main">
            <div class="header">
                <img src="https://res.cloudinary.com/doojdskc0/image/upload/v1750391008/mdwtqwkbtvje2lzzc5hq.png" alt="Your Company Logo">
            </div>
            <h1>Hello ${username},</h1>
            <p>Your account password has been successfully updated. Below are your new login details:</p>
            <div class="info-box">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>New Password:</strong> ${newPassword}</p>
            </div>
            <p>🔐 Please keep your new credentials safe.</p>
            <div class="footer">&copy; 2025 TaskManager. All rights reserved.</div>
        </div>
        </body></html>`,
    };
};

export default changePasswordMail;
