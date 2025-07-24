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
                "https://chatllat.s3.ap-south-1.amazonaws.com/static-img/273242097529.png",
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
        // isOnline: { 
        //     type: Boolean, 
        //     default: 0     // 0 = offline, 1 = online
        // },
        assignedDispute: {
            type: [String],
            default: []
        },
    },
    { timestamps: true }
);

const Support = mongoose.model("SupportTeam", supportTeamSchema);

export default Support;
