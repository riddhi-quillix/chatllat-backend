import express from "express";
import { addPersonalDetails, addWalletAddress, createNewAgreement, getAgreementById, getAllAgreement, updateAgreementDetails, requestDeposit, setWorkSubmittedStatus, setFundsReleasedStatus, getDisputedStatusAgreement, getWithdrawalAgreement, cancelAgreement, updateStatusWhenDepositFailed, updateStatusWhenWithdrawalFailed, setStatusCompleted } from "../controllers/agreementController.js";
import { getPlatformFee } from "../controllers/adminController.js";

const router = express.Router();

router.post("/", createNewAgreement);
router.get("/disputed",  getDisputedStatusAgreement);
router.get("/withdrawal",  getWithdrawalAgreement);
router.get("/:id", getAgreementById);
router.get("/wallet/:walletAddress", getAllAgreement);
router.patch("/wallet/addAddress",  addWalletAddress);
router.patch("/wallet/updateAgreement",  updateAgreementDetails);
router.patch("/details/personal",  addPersonalDetails);
router.patch("/request/deposit",  requestDeposit);
// router.patch("/request/withdrawal",  requestWithdrawal);
router.patch("/work/submitted",  setWorkSubmittedStatus);
router.patch("/fund/released",  setFundsReleasedStatus);
router.patch("/cancel",  cancelAgreement);
router.get("/platform/fee", getPlatformFee); 
router.patch("/deposit/failed/status", updateStatusWhenDepositFailed); 
router.patch("/withdraw/failed/status", updateStatusWhenWithdrawalFailed); 
router.patch("/deposit/completed", setStatusCompleted); 

export default router;