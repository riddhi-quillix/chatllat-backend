import mongoose from "mongoose";

const supportTeamSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        profileImage: {
            type: String,
            default:
                "https://res.cloudinary.com/doojdskc0/image/upload/v1748344691/e5js3xkuomoztoysrtaf.png",
        },
        fname: {
            type: String,
            default: "",
        },
        lname: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            select: false
        },
        isOnline: { 
            type: Boolean, 
            default: 0     // 0 = offline, 1 = online
        },
        assignedDispute: {
            type: [String],
            default: []
        },
        type: {
            type: String,
            enum: ["Admin", "Member"],
            required: true,
        }
    },
    { timestamps: true }
);

const Support = mongoose.model("SupportTeam", supportTeamSchema);

export default Support;
