import { registerService } from "../services/auth/register.js";
import { getUsersService } from "../services/admin/users.js";
import { searchUserService } from "../services/admin/search.user.js";
import { deleteUserService } from "../services/admin/delete.user.js";

export default {
    async addMitra (req, res) {
        /**
         #swagger.tags = ['Admin']
         #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/AddMitraRequest"
            }
         }
         */
        const { name, email, password } = req.body;
        try {
            const mitra = await registerService({name, email, password, role: "MITRA"});
            
            res.status(200).json({
                message: "Partner added successfully",
                data: mitra,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async getAllMitra (_req, res) {
         /**
         #swagger.tags = ['Admin']
         */
        try {
            const result = await getUsersService({role: "MITRA"});
            res.status(200).json({
                data: result,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },

    async searchMitra (req, res) {
        /**
         #swagger.tags = ['Admin']
         #swagger.parameters['email'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/SearchMitraRequest"
            }
        }
         */
        const email = req.query.email;
        try {
            const result = await searchUserService({email, role: "MITRA"});
            res.status(200).json({
                data: result,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async deleteMitra (req, res) {
        /**
         #swagger.tags = ['Admin']
         #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/DeleteMitraRequest"
            }
         }
         */
        const {email} = req.body;
        try {
            const result = await deleteUserService({email, role: "MITRA"});
            res.status(200).json({
                result,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },
};