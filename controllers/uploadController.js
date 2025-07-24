import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import {
    generateImageId,
} from "../utils/service/uploadService.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});


export const uploadFile = asyncHandler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files found" });
    }

    try {
        const uploadPromises = req.files.map(async (file) => {
            const fileExtension = file.originalname.split(".").pop();
            const fileName = `${generateImageId()}.${fileExtension}`;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `static-img/${fileName}`,
                // Key: `media/${fileName}`,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            await s3.send(new PutObjectCommand(params));
            return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/media/${fileName}`;
        });

        const imgUrls = await Promise.all(uploadPromises);
        return give_response(res, 200, true, "File uploaded successfully", {
            imgUrls,
        });
    } catch (error) {
        next(error);
    }
});
