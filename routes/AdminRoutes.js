import express from "express";
import {
    addHash,
    addMember,
    // changeMemberPassword,
    createAdmin,
    getAllMember,
    getAllTickets,
    getPaymentDetails,
    login,
    reAssignedDispute,
    removeMember,
    updateMember,
} from "../controllers/adminController.js";
import {adminAuth} from "../middleware/auth.js"
const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", login);
router.post("/dispute/reAssign", adminAuth, reAssignedDispute);
router.post("/add/hash", adminAuth, addHash);
router.get("/all/tickets", adminAuth, getAllTickets);
router.get("/payment/details", adminAuth, getPaymentDetails);
router.post("/add/support/user", adminAuth, addMember); 
// router.post("/change/password", adminAuth, changeMemberPassword); 
router.delete("/delete/member", adminAuth, removeMember); 
router.get("/all/member", adminAuth, getAllMember); 
router.patch("/update/member", adminAuth, updateMember); 

export default router;
