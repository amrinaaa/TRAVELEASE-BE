import { createUser } from "../services/admin/create.user.js";
import { getUsersService } from "../services/admin/users.js";
import { searchUserService } from "../services/admin/search.user.js";
import { deleteUserService } from "../services/admin/delete.user.js";
// import { editUserService } from "../services/admin/edit.user.js";
import { topupService } from "../services/admin/topup.js";


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
        const { name, email, password, role } = req.body;
        try {
            const mitra = await createUser({name, email, password, role});
            
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

    async getAllMitra (req, res) {
        /**
        #swagger.tags = ['Admin']
        #swagger.parameters['role'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/GetMitraRequest"
            }
        }
        */
        const role = req.query.role;
        try {
            const result = await getUsersService({role});
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
         #swagger.parameters['identifier','role'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/SearchMitraRequest"
            }
        }
        */
        const {identifier, role} = req.query;
        try {
            const result = await searchUserService({identifier, role});
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

    // async editMitra (req, res) {
    //     const {uid} = req.body;
    //     try {
    //         const result = await editUserService({uid, role: "MITRA"});
    //         res.status(200).json({
    //             message: "Successfuly edit partner",
    //             data: result,
    //         })
    //     } catch (error) {
    //         res.status(400).json({
    //             message: error.message,
    //             data: null,
    //         });
    //     };
    // },

    async addUser (req, res) {
        /**
         #swagger.tags = ['Admin']
         #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/AddUsersRequest"
            }
         }
         */
         const { name, email, password } = req.body;
         try {
             const mitra = await createUser({name, email, password, role: "USER"});
             
             res.status(200).json({
                 message: "User added successfully",
                 data: mitra,
             });
         } catch (error) {
             res.status(400).json({
                 message: error.message,
                 data: null,
             });
         };
    },

    async getUsers (req, res) {
        /**
        #swagger.tags = ['Admin']
        */
        try {
            const result = await getUsersService({role: "USER"});
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

    async searchUser (req, res) {
        /**
         #swagger.tags = ['Admin']
         #swagger.parameters['identifier'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/SearchUsersRequest"
            }
        }
         */
        const identifier = req.query.identifier;
        try {
            const result = await searchUserService({identifier, role: "USER"});
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

    async deleteUser (req, res) {
        /**
         #swagger.tags = ['Admin']
         #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/DeleteUsersRequest"
            }
         }
         */
         const uid = req.body;
         try {
             const result = await deleteUserService(uid);
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

    async topup (req, res) {
        /**
         #swagger.tags = ['Admin']
         #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/TopupRequest"
            }
         }
         */
        const {uid, amount, type} = req.body;
        try {
            const result = await topupService(uid, amount, type)
            res.status(200).json({
                message: result,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

};