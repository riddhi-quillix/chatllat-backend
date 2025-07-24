import express from 'express'
import multer from 'multer'
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
});

router.post('/file', upload.array('files'), uploadFile);

export default router;
