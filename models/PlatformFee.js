import mongoose from "mongoose";

const PlatformFeeSchema = new mongoose.Schema(
    {
        platformFeeInPercent: {
            type: Number
        },
        disputeChargeInPercent: {
            type: Number
        }
    },
    { timestamps: true, versionKey: false }
);

const PlatformFee = mongoose.model("PlatformFee", PlatformFeeSchema);
export default PlatformFee