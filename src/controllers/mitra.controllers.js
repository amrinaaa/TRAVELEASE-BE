import mitraPenerbangan from "../services/mitra/mitra.penerbangan.js";

export default {
    async getPlanes(req, res) {
        /**
        #swagger.tags = ['Penerbangan']
        #swagger.parameters['mitraId'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/GetPlanesRequest"
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const mitraId = req.query.mitraId; //sementara pake body buat test aja, nnti pake payload;
        try {
            const result = await mitraPenerbangan.getPlanesService(mitraId);
            res.status(200).json({
                message: "Success",
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    },

    //sudah berhasil, tinggal di sempurnakan 
    async addSeatAvailability(req, res) {
        /**
        #swagger.tags = ['Penerbangan']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/AddSeatAvailabilityRequest"}
        }
        */

        // const mitraId = res.locals.payload.id;
        const {
            mitraId, //sementara saja karena pake data seeder

            // airlineId, //ini bisa didapatkan berdasarkan mitraId
            planeId,   //dari enpoint melihat pesawat (sebelum menambahkan lihat daftar pesawat yang dimiliki)
            seatCategoryId, //arternatif menggunakan markdown dengan nilai (first class, bisnis, ekonomi) bukan id & untuk sementara tidak bisa menambah katergori baru
            seatNames //sebuah list / array
        } = req.body;

        try {
            const result = await mitraPenerbangan.addSeatAvailabilityService(
                mitraId,
                // airlineId,
                planeId,
                seatCategoryId,
                seatNames,
            );

            res.status(200).json({
                message: "Add Seat Successful",
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    },
};