import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true
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
        role: {
            type: String,
            required: true,
            enum: ["SuperAdmin", "SubAdmin"]
        },
        type: {
            type: String,
            enum: ["ManageMember", "AddMember", "All"]
        }
    },
    { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
