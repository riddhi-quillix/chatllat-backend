import Agreement from "../../models/Agreement.js";
import Dispute from "../../models/Dispute.js";
import bcryptjs from "bcryptjs";
import { generatesupportId } from "./agreement.js";
import Admin from "../../models/Admin.js";
import SupportTeam from "../../models/SupportTeam.js";
import supportUserCredentialMail from "../email_template/supportUserCredential.js";
import { sendEmail } from "./sendEmail.js";

export const addHashLink = async (hash, hashField, agreement) => {
    try {
        const updatedHashLink = {
            hashLink: { ...agreement.hashLink, [hashField]: hash },
        };
        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId: agreement.agreementId },
            updatedHashLink,
            { new: true }
        ).select("agreementId hashLink");

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
        const prefix = role === "Member" ? "stm" : "adm";
        const id = `${prefix}${await generatesupportId()}`;
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
