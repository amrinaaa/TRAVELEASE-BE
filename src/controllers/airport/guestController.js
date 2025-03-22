import { getDaerahService } from '../../services/airport/guestService.js';

export const getDaerah = async (req, res) => {
    try {
        const daerah = await getDaerahService();
        res.status(200).json({
            message: "Success",
            data: daerah,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            data: null,
        });
    }
}

export const getDaerahKota = async (req, res) => {
    try {
        const { city } = req.params;
        const daerah = await getDaerahService(city);
        if (!daerah || daerah.length === 0) {
            return res.status(404).json({
                message: "Daerah tidak ditemukan",
                data: null,
            });
        }

        res.status(200).json({
            message: "Success",
            data: daerah,
        });
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            data: null,
        });
    }
};
