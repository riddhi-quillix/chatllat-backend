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
