import * as Yup from "yup";
import { registerUser } from "../services/auth/register.js";

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
        const { name, email, password, confirmation_password } = req.body;
    
        try {
            await registerValidation.validate({
                name, email, password, confirmation_password,
            });
    
            const user = await registerUser({name, email, password});
            
            if( user === "email already registered"){
                return res.status(400).json({
                    message: "email already registered",
                    data: null,
                });
            };

            res.status(200).json({
                message: "Success Registration",
                data: user,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },
}
