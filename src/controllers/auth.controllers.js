import * as Yup from "yup";
import { registerUser } from "../services/auth/register.js";
import { loginUser } from "../services/auth/login.js";
import { forgotPasswordService } from "../services/auth/forgot.password.js";
import { resetPasswordService } from "../services/auth/reset.password.js";
import { sendEmail } from "../utils/email.js";

const registerValidation = Yup.object({
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string()
                .required()
                .min(6, "Password at least 6 characters")
                .test(
                    "at-least-one-uppercase-letter", 
                    "Contains at least one uppercase letter", 
                    (value)=> {
                        if(!value) return false;
                        const regex = /^(?=.*[A-Z])/;
                        return regex.test(value);
                    }
                )
                .test(
                    "at-least-one-number", 
                    "Contains at least one number", 
                    (value)=> {
                        if(!value) return false;
                        const regex = /^(?=.*\d)/;
                        return regex.test(value);
                    }
                ),
    confirmation_password: Yup.string()
                            .required()
                            .oneOf( [Yup.ref("password"), " "], "Password not match"),
    
});

export default {
    async register (req, res) {
        /**
         #swagger.tags = ['Auth']
         #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/RegisterRequest"
            }
         }
         */
        const { name, email, password, confirmation_password } = req.body;
    
        try {
            await registerValidation.validate({
                name, email, password, confirmation_password,
            });

            const { user, verificationLink } = await registerUser({ name, email, password});
            
            const emailContent = `
                <p>Halo ${name},</p>
                <p>Terima kasih telah mendaftar. Silakan klik link berikut untuk verifikasi email Anda:</p>
                <a href="${verificationLink}">${verificationLink}</a>
            `;

            await sendEmail(email, "Verifikasi Email Anda", emailContent);

            res.status(200).json({
                message: "Success registration, please check your email to verify",
                data: user,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },

    async login (req, res) {
        /**
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/LoginRequest"}
        }

        */
        const { email, password } = req.body;

        try {
            const userData = await loginUser({email, password});
    
            res.cookie(
                "token",
                userData,
                {
                    maxAge: 3_600 * 1000
                },
            );

            res.status(200).json({
                message: "Login success",
                data: userData,
            })
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },

    async logout(_req, res) {
        /**
         #swagger.tags = ['Auth']
         */
        res.cookie(
            "token",
            " ",
            {
              maxAge: 0
            }
          );
        
        res.status(200).json({
            message: "Logout Berhasil"
        });
    },

    async forgotPassword (req, res) {
        /**
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/ForgotPasswordRequest"}
        }
        */
        const { email } = req.body;
        try {
            const resetPasswordLink  = await forgotPasswordService(email);
            const emailContent = `
                <p>Silakan klik link berikut untuk mendapatkan kode:</p>
                <a href="${resetPasswordLink}">${resetPasswordLink}</a>
            `;
            
            await sendEmail(email, "Reset Password", emailContent);

            res.status(200).json({
                message: "Please check your email for reset your password"
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            })
        }
    },

    async resetPassword (req, res) {
        /**
         #swagger.tags = ['Auth']
         #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/ResetPasswordRequest"}
        }
         */
        const { oobCode, newPassword } = req.body;
        try {
            const result = await resetPasswordService(oobCode, newPassword);
            res.status(200).json({
                message: result,
            })
        } catch (error) {
            res.status(400).json({
                message: error.message,
            })
        }
    }
};
