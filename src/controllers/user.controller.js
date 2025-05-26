import bookingServices from '../services/user/booking.room.js';
import searchService from '../services/user/searchService.js';
import bookingFlight from '../services/user/booking.flight.js';
import transactionService from '../services/user/transaction.js';
import userService from '../services/user/user.service.js';

export default {
    async editProfile(req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/EditProfileRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const userId = res.locals.payload.id; // Mengambil ID pengguna dari token JWT
        const { newName } = req.body;

        try {
            if (!newName) {
                return res.status(400).json({ message: "New name (name) is required in the request body." });
            }

            const updatedUser = await userService.updateUserNameService(userId, newName);
            res.status(200).json({
                message: "User name updated successfully",
                data: updatedUser,
            });
        } catch (error) {
            console.error("Error in UserController.updateMyName:", error);
            if (error.message.includes('New name is required') || error.message.includes('cannot be empty')) {
                return res.status(400).json({ message: error.message, data: null });
            }
            if (error.message === 'User not found.') { // Meskipun seharusnya tidak terjadi
                return res.status(404).json({ message: error.message, data: null });
            }
            return res.status(500).json({
                message: error.message || "Internal Server Error",
                data: null,
            });
        }
    },

    async searchFlights(req, res) {
        /**
        #swagger.tags = ['User-Guest']
        */
        try {
            const flights = await searchService.filterFlights(req.query);
            if (flights.length === 0) {
                return res.status(404).json({
                    message: 'No flights found'
                });
            }

            res.status(200).json({
                message: "Success",
                data: flights,
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Internal server error',
                data: null,
            });
        }
    },

    async bookingFlight(req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/BookingFlightRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const userId = res.locals.payload.id;
        const {flightId, passengers} = req.body;
        try {
            const bookingResult = await bookingFlight.bookingFlightService(userId, flightId, passengers);
            
            return res.status(201).json({
                message: "success",
                data: bookingResult
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },

    async paymentFlight(req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/PaymentFlightRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const userId = res.locals.payload.id;
        const {transactionId} = req.body;
        try {
            const result = await bookingFlight.paymentFlightService(userId, transactionId);
            res.status(200).json({
                message: "success",
                data: result,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        }
    },

    async transactionHistory(_req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const userId = res.locals.payload.id;
        try {
            const result = await transactionService.transactionHistoryService(userId);
            res.status(200).json({
                message: "Transaction history retrieved successfully",
                data: result,
            });
        } catch (error) {
            if (error.message === 'Transaction not found' || error.message === 'Unauthorized to view this transaction') {
                return res.status(404).json({
                    message: error.message,
                    data: null,
                });
            }
            
            return res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    },

    async cancelFlight(req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/CancelFlightRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { transactionId } = req.body;
        const userId = res.locals.payload.id;

        if (!transactionId) {
            return res.status(400).json({ message: "Transaction ID is required" });
        }

        try {
            const result = await bookingFlight.cancelFlightService(userId, transactionId);
            res.status(200).json({
                message: "Flight order successfully cancelled",
                data: result,
            });
        } catch (error) {
            console.error("Error in FlightCancellationController.cancelFlightOrder:", error);
            if (error.message === 'Transaction not found' || error.message === 'User not found for transaction') {
                return res.status(404).json({ message: error.message, data: null });
            }
            if (error.message === 'User does not own this transaction') {
                return res.status(403).json({ message: error.message, data: null });
            }
            if (error.message.includes('Cancellation window has passed') ||
                error.message.includes('Order already cancelled') ||
                error.message.includes('No flights found in this transaction') ||
                error.message.includes('Invalid transaction status for cancellation') ||
                error.message.includes('Airline partner not found for refund debiting') ||
                error.message.includes('Primary airline for debiting not found') ) {
                return res.status(400).json({ message: error.message, data: null });
            }
            return res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    },

    async bookingRoom(req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/BookingRoomRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        try {
            const { roomId, startDate, endDate } = req.body;
            const userId = res.locals.payload.id;

            const result = await bookingServices.bookingRoomServices({
            userId,
            roomId,
            startDate,
            endDate,
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async paymentBookingRoom(req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const userId = res.locals.payload.id;
        const { transactionId } = req.params;

        try {
            const result = await bookingServices.paymentBookingRoomServices({userId, transactionId});
            res.status(200).json({message: "success", data: result});
        } catch (error) {
            res.status(400).json({ message: error.message, data: null });
        }
    }, 

    async cancelRoom(req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/CancelRoomRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { transactionId } = req.body;
        const userId = res.locals.payload.id; // Mengambil ID pengguna dari token JWT

        if (!transactionId) {
            return res.status(400).json({ message: "Transaction ID is required" });
        }

        try {
            const result = await bookingServices.cancelRoomService(userId, transactionId);
            res.status(200).json({
                message: "Hotel reservation successfully cancelled",
                data: result,
            });
        } catch (error) {
            console.error("Error in HotelCancellationController.cancelHotelReservation:", error);
            if (error.message === 'Transaction not found' || error.message === 'User not found for transaction') {
                return res.status(404).json({ message: error.message, data: null });
            }
            if (error.message === 'User does not own this transaction') {
                return res.status(403).json({ message: error.message, data: null });
            }
            if (error.message.includes('Cancellation window has passed') ||
                error.message.includes('Order already cancelled') ||
                error.message.includes('No reservations found in this transaction') ||
                error.message.includes('Invalid transaction status for cancellation') ||
                error.message.includes('Hotel partner not found for refund debiting') ||
                error.message.includes('Primary hotel for debiting not found') ||
                error.message.includes('Could not determine check-in date')) {
                return res.status(400).json({ message: error.message, data: null });
            }
            return res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        };
    },
};