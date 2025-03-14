import * as Yup from "yup";
import { registerUser } from "../services/auth/register.js";
import { sendEmail } from "../services/auth/verify.js";
import { loginUser } from "../services/auth/login.js";

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

            const { user, verificationLink } = await registerUser({ name, email, password });
            
            if( user === "email already registered"){
                return res.status(400).json({
                    message: "email already registered",
                    data: null,
                });
            };
            
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

            if(userData === "email or password failed"){
                return res.status(400).json({
                    message: "email or password failed",
                    data: null,
                });
            };
            
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
};
