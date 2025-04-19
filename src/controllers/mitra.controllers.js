export default {
    async addSeatAvailability(req, res) {
        /**
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/ForgotPasswordRequest"}
        }
        */
        const mitraId = res.locals.payload.id;
        const {
            airlineId,
            planeId,
            seatCategoryId,
            seatNames //sebuah list / array
        } = req.body;

        try {
            const result = await addSeatAvailabilityService(
                mitraId,
                airlineId,
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