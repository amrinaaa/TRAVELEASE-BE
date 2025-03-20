import * as Yup from "yup";

export const registerValidation = Yup.object({
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

export const resetPasswordValidation = Yup.object({
    newPassword: Yup.string()
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
                                .oneOf( [Yup.ref("newPassword"), " "], "Password not match"),
})