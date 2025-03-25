import * as yup from "yup";
import { parse, isValid } from "date-fns";

// 🔹 Fungsi untuk parsing tanggal Format exp 23 Maret 2025
const parseDateString = (value, originalValue) => {
    if (!originalValue) return null;
    const parsedDate = parse(originalValue, "d MMMM yyyy", new Date());
    return isValid(parsedDate) ? parsedDate : new Date(originalValue);
};

// Validasi tanggal tidak boleh sebelum hari ini
const minToday = (value) => {
    if (!value) return true;
    const today = new Date().setHours(0, 0, 0, 0);
    const inputDate = new Date(value).setHours(0, 0, 0, 0);
    return inputDate >= today;
};

// Validasi kota keberangkatan & tujuan
const searchFlightCitySchema = yup.object().shape({
    departureCity: yup
        .string()
        .matches(/^[a-zA-Z\s]+$/, "Departure city can only contain letters")
        .required("Departure city is required"),

    arrivalCity: yup
        .string()
        .matches(/^[a-zA-Z\s]+$/, "Arrival city can only contain letters")
        .required("Arrival city is required"),
});

// Validasi kategori kursi
const searchFlightSeatSchema = yup.object().shape({
    seatCategory: yup
        .string()
        .matches(/^[a-zA-Z\s]+$/, "Seat category can only contain letters")
        .required("Seat category is required"),
});

// Validasi tanggal keberangkatan & kepulangan
const searchFlightDateSchema = yup.object().shape({
    departureDate: yup
        .date()
        .transform(parseDateString)
        .required("Departure date is required")
        .test("min-today", "Departure date cannot be before today", minToday),

    returnDate: yup
        .date()
        .nullable()
        .transform(parseDateString)
        .test("min-today", "Return date cannot be before today", minToday),
});

// Validasi kota keberangkatan & tujuan
const validateSearchFlightCity = async (req, res, next) => {
    try {
        await searchFlightCitySchema.validate(req.query, { abortEarly: false });
        next();
    } catch (error) {
        return res.status(400).json({
            message: "Validation Error",
            errors: error.errors,
        });
    }
};

// Validasi kategori kursi
const validateSearchFlightSeat = async (req, res, next) => {
    try {
        await searchFlightSeatSchema.validate(req.query, { abortEarly: false });
        next();
    } catch (error) {
        return res.status(400).json({
            message: "Validation Error",
            errors: error.errors,
        });
    }
};

// Validasi tanggal
const validateSearchFlightDate = async (req, res, next) => {
    try {
        await searchFlightDateSchema.validate(req.query, { abortEarly: false });
        next();
    } catch (error) {
        return res.status(400).json({
            message: "Validation Error",
            errors: error.errors,
        });
    }
};

export { validateSearchFlightCity, validateSearchFlightSeat, validateSearchFlightDate };