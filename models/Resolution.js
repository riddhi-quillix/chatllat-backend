import mongoose from "mongoose";

const ResolutionSchema = new mongoose.Schema(
    {
        payerWallet: {
            type: String,
        },
        receiverWallet: {
            type: String,
        },
        payerAmount: {
            type: String,
            default: "N/A"
        },
        receiverAmount: {
            type: String,
            default: "N/A"
        },
        payerHash: {
            type: String,
            default: "N/A"
        },
        receiverHash: {
            type: String,
            default: "N/A"
        },
        agentName: {
            type: String
        },
    },
    { timestamps: true, versionKey: false }
);

const Resolution = mongoose.model("Resolution", ResolutionSchema);
export default Resolution
