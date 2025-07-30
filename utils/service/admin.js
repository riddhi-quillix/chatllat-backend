import Agreement from "../../models/Agreement.js";
import Dispute from "../../models/Dispute.js";
import bcryptjs from "bcryptjs";
import { generatesupportId, generateadminId } from "./agreement.js";
import Admin from "../../models/Admin.js";
import SupportTeam from "../../models/SupportTeam.js";
import supportUserCredentialMail from "../email_template/supportUserCredential.js";
import { sendEmail } from "./sendEmail.js";
import Resolution from "../../models/Resolution.js";

export const addHashLink = async (validatedData, agreement) => {
    try {
        const {
            payerHash,
            receiverHash,
            payerEvidence,
            receiverEvidence,
        } = validatedData;

        let payerhash;
        let receiverhash;
        const chain = agreement.amountDetails.chain;

        switch (chain) {
            case "bsc":
                payerhash = `https://bscscan.com/tx/${payerHash}`;
                receiverhash = `https://bscscan.com/tx/${receiverHash}`;
                break;
            case "polygon":
                payerhash = `https://polygonscan.com/tx/${payerHash}`;
                receiverhash = `https://polygonscan.com/tx/${receiverHash}`;
                break;
            case "avalanche":
                payerhash = `https://snowtrace.io/tx/${payerHash}`;
                receiverhash = `https://snowtrace.io/tx/${receiverHash}`;
                break;
            case "arbitrum":
                payerhash = `https://arbiscan.io/tx/${payerHash}`;
                receiverhash = `https://arbiscan.io/tx/${receiverHash}`;
                break;
            case "clat":
                payerhash = `https://bscscan.com/tx/${payerHash}`;
                receiverhash = `https://bscscan.com/tx/${receiverHash}`;
                break;
        }

        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId: agreement.agreementId },
            {
                $set: {
                    "hashLink.payer.hash": payerhash,
                    "hashLink.receiver.hash": receiverhash,
                    "hashLink.receiver.image": receiverEvidence,
                    "hashLink.payer.image": payerEvidence,
                    "timeline.disputeResolved": new Date(),
                },
            },
            { new: true }
        ).select("agreementId hashLink");

        const dispute = await Dispute.findOneAndUpdate(
            { agreementId: agreement.agreementId },
            {
                $set: {
                    assignStatus: "Completed",
                    "date.completed": new Date(),
                },
            },
            {new: true}
        );

        await Resolution.create({
            payerHash: payerhash,
            receiverHash: receiverhash,
            payerWallet: agreement.payerWallet,
            receiverWallet: agreement.receiverWallet,
            payerAmount: agreement.split.payerAmount,
            receiverAmount: agreement.split.receiverAmount,
            agentName: dispute.AssignedAgent.fname + " " + dispute.AssignedAgent.lname
        });

        return updatedAgreement;
    } catch (error) {
        throw error;
    }
};

export const fetchPaymentDetails = async (disputeId) => {
    try {
        const dispute = await Dispute.aggregate([
            {
                $match: { disputeId },
            },
            {
                $lookup: {
                    from: "agreements",
                    localField: "agreementId",
                    foreignField: "agreementId",
                    pipeline: [
                        {
                            $project: {
                                split: 1,
                                createdAt: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: "agreement",
                },
            },
            {
                $unwind: {
                    path: "$agreement",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    agreementId: 1,
                    disputeId: 1,
                    status: 1,
                    assignStatus: 1,
                    projectTitle: 1,
                    payerWalletAddress: 1,
                    receiverWalletAddress: 1,
                    disputeCategory: 1,
                    evidence: 1,
                    reasons: 1,
                    disputeCreator: 1,
                    AssignedAgent: 1,
                    supportDecision: 1,
                    agreement: 1,
                    disputeCreatedAt: "$createdAt",
                },
            },
        ]);

        return dispute[0];
    } catch (error) {
        throw error;
    }
};

export const createMember = async (validatedData) => {
    try {
        const { email, password, fname, lname, role, type } = validatedData;

        const hashPass = await bcryptjs.hash(password, 8);
        // const prefix = role === "Member" ? "stm" : "adm";
        // const id = `${prefix}${ generatesupportId()}`;
        const id = role === "Member" ? generatesupportId() : generateadminId();
        const model = role === "Member" ? SupportTeam : Admin;

        const newUserData = {
            email,
            password: hashPass,
            fname,
            lname,
            id,
            ...(role === "SubAdmin" && { type, role }),
        };

        const user = await model.create(newUserData);
        const username = `${fname} ${lname}`;

        const { html } = supportUserCredentialMail(username, email, password);
        await sendEmail(html, email, "Login Credential");

        delete user._doc.password;
        return user;
    } catch (error) {
        throw error;
    }
};
