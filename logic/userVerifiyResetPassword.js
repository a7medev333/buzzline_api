
var nodemailer = require("nodemailer");
const UserOTPVerification = require("../models/userOTPVerification");
const bcrypt = require('bcryptjs');
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "ahmedmhmedkhllil@gmail.com",
      pass: "Pass0129646083Dev@#",
    },
  });

module.exports = async (uuid,email,username,res) => {
    try{
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;


        const SENDER_EMAIL = "ahmedmhmedkhllil@gmail.com";
        const RECIPIENT_EMAIL = email;

        var mailOptions = {
            from: '"Maddison Foo Koch 👻" <ahmedmhmedkhllil@gmail.com>', // sender address
            to: RECIPIENT_EMAIL, // list of receiversw
            subject: "OTP Verification", // Subject line
            html: `
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 50px auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #dddddd;
                    }
                    .header h1 {
                        margin: 0;
                        color: #333333;
                    }
                    .content {
                        margin: 20px 0;
                    }
                    .content p {
                        font-size: 16px;
                        color: #555555;
                        line-height: 1.6;
                    }
                    .otp-code {
                        display: block;
                        font-size: 24px;
                        color: #333333;
                        text-align: center;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        padding-top: 20px;
                        border-top: 1px solid #dddddd;
                        font-size: 12px;
                        color: #aaaaaa;
                    }
                </style>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>OTP Verification</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${username},</p>
                        <p>Thank you for choosing our service. To proceed with your request, please use the following One-Time Password (OTP) to verify your identity:</p>
                        <div class="otp-code">${otp}</div>
                        <p>Please note that this OTP is valid for the next 10 minutes. Do not share this code with anyone. If you did not request this verification, please contact our support team immediately.</p>
                        <p>Thank you for your cooperation.</p>
                        <p>Best regards,<br>TheBaron<br>Chat App</p>
                    </div>
                    <div class="footer">
                        This is an automated message, please do not reply.
                    </div>
                </div>
            </body>
            `, 
          };
      

    //   const info = await transporter.sendMail();

      const saltRounds = 10;
      const hashedOTP = await bcrypt.hash(otp,saltRounds);

      var userOtpVerify = new UserOTPVerification({
        userId:uuid,
        otp:hashedOTP,
        createAt:Date.now(),
        expiresAt:Date.now() + 3600000
      });
      await userOtpVerify.save();
      await transporter.sendMail(mailOptions);
      res.json({
        status: 200,
        message:"Verification otp email sent",
        data:{
            userId:uuid,
            email: email,
        }
      });

    }catch(ex){
        res.json({
            status:202,
            "error" : ex
        });
    }

}

