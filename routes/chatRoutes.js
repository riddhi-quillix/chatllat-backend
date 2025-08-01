import express from "express";
import { getChatList, getChatMessages, getPersonalChatMessages } from "../controllers/chatController.js";

const router = express.Router();

router.get("/all/chatList", getChatList);
router.get("/personalChat/allMsg", getPersonalChatMessages);
router.get("/allMsg", getChatMessages);

export default router;