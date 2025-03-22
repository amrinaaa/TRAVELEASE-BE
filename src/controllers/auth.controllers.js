import { 
    registerValidation,
    resetPasswordValidation, 
} from "../utils/request.validation.js";

import { registerUser } from "../services/auth/register.js";
import { loginUser } from "../services/auth/login.js";
import { forgotPasswordService } from "../services/auth/forgot.password.js";
import { resetPasswordService } from "../services/auth/reset.password.js";

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

            if (password !== confirmation_password) {
                return res.status(400).json({
                    message: "Password not match",
                    data: null,
                });
            }

            const { user } = await registerUser({ name, email, password});

            if (!user) {
                return res.status(500).json({
                    message: "Failed to register user",
                    data: null,
                });
            }

            res.status(201).json({
                message: "Success registration",
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
            const result = await forgotPasswordService(email);
            return res.status(200).json({
                message: result,
            });
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
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
        const { oobCode, newPassword, confirmation_password } = req.body;
        try {
            await resetPasswordValidation.validate({
                newPassword, confirmation_password,
            })

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