import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateImageId = () => {
    try {
        const bytes = crypto.randomBytes(6); // 6 bytes = 12 hex digits ~ 18 decimal digits
        const number = BigInt("0x" + bytes.toString("hex"))
            .toString()
            .slice(0, 12);
        return number.padStart(12, "0");
    } catch (error) {
        throw error;
    }
};
