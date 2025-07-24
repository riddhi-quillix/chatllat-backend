import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    walletId: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: "https://chatllat.s3.ap-south-1.amazonaws.com/static-img/273242097529.png"
    },
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    contact: {
        type: String,
        default: ""
    },
    ratings: {
        type: [Number],
        default: []
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;