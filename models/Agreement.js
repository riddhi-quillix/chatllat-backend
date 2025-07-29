import mongoose from "mongoose";
import { generateAgreementId } from "../utils/service/agreement.js";

const agreementSchema = new mongoose.Schema(
    {
        agreementId: {
            type: String,
            unique: true,
            required: true,
        },
        category: {
            type: String,
            default: "Agreement",
            enum: ["Agreement", "Freelancer"]
        },
        role: {
            type: String,
            enum: ["Payer", "Receiver"],
            required: true,
        },
        payerWallet: {
            type: String,
            default: "",
        },
        receiverWallet: {
            type: String,
            default: "",
        },
        payerDetails: {
            name: { type: String, default: "" },
            email: { type: String, default: "" },
            contact: { type: String, default: "" },
            // isOnline: { type: Boolean, default: 0 }, // 0 = offline, 1 = online
        },
        receiverDetails: {
            name: { type: String, default: "" },
            email: { type: String, default: "" },
            contact: { type: String, default: "" },
            // isOnline: { type: Boolean, default: 0 },  // 0 = offline, 1 = online
        },
        projectTitle: {
            type: String,
            required: true,
        },
        projectDescription: {
            type: String,
            required: true,
        },
        deadline: {
            type: Date,
            required: true,
        },
        attachments: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: [
                "Created",
                "Accepted",
                "Negotiated",
                "AgreementUpdated",
                "Rejected",
                "ReturnFunds",  // when fundreleased and agreement candel by receiver 
                "RequestedDeposit",
                "EscrowFunded",
                "WorkSubmitted",
                "FundsReleased",
                "Disputed",
                "InProcess",
                "DisputeResolved",
                "RequestedWithdrawal",
                "Completed",
            ],
            default: "Created",
        },
        cancellationReason: {
            type: String,
            default: "", // required if status Rejected
        },
        agreementAcceptedDate: {
            type: Date,
            default: null,
        },
        WorkSubmittedDate: {
            type: Date,
            default: null,
        },
        lastAcceptedNotificationSentAt: {
            type: Date,
            default: null,
        },
        dipositHash: {
            type: String,
            default: "",
        },
        withdrwalHash: {
            type: String,
            default: "",
        },
        amountDetails: {
            amount: { type: String, required: true },
            withdrawalAmount: { type: String, required: true },
            chain: { type: String, default: "Ethereum" },
            image: { type: String, default: "https://chatllat.s3.ap-south-1.amazonaws.com/142521649532.png" }
        },
        withdrawal: {
            receiverWithdrawn: { type: Boolean, default: false },
            payerWithdrawn: { type: Boolean, default: false },
        },
        split: {
            receiverAmount: { type: Number, default: 0 },
            payerAmount: { type: Number, default: 0 },
            payerPercentage: { type: Number, default: 0 },
            receiverPercentage: { type: Number, default: 0 },
        },
        hashLink: {
            payer: {
                hash: { type: String, default: null },
                image: { type: String, default: null },
            },
            receiver: {
                hash: { type: String, default: null },
                image: { type: String, default: null },
            }
        },
        withdrawalUser: {
            type: String,
            default: null
        },
        timeline: {
            created: {
                type: Date,
                default: null
            },
            responded: {
                type: Date,
                default: null
            },
            escrowFunded: {
                type: Date,
                default: null
            },
            returnFunds: {
                type: Date,
                default: null
            },
            workSubmitted: {
                type: Date,
                default: null
            },
            fundsReleased: {
                type: Date,
                default: null
            },
            disputed: {
                type: Date,
                default: null
            },
            disputeResolved: {
                type: Date,
                default: null
            },
            completed: {
                type: Date,
                default: null
            },
        },
        requestedDepositDate: {
            type: Date,
            default: null
        },
        requestedWithdrawalDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

// Generate unique agreement ID before saving
agreementSchema.pre("save", async function (next) {
    if (!this.agreementId) {
        this.agreementId = await generateAgreementId();
    }
    next();
});

const Agreement = mongoose.model("Agreement", agreementSchema);
export default Agreement;
