import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import bcryptjs from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import Admin from "../models/Admin.js";
import SupportTeam from "../models/SupportTeam.js";
import {
    addHashSchema,
    addMemberSchema,
    adminLoginSchema,
    changePasswordSchema,
    getPaymentDetailSchema,
    reAssignedDisputeSchema,
} from "../utils/validation/admin_validation.js";
import Dispute from "../models/Dispute.js";
import Agreement from "../models/Agreement.js";
import {
    addHashLink,
    createMember,
    fetchPaymentDetails,
} from "../utils/service/admin.js";
import { allTickets } from "../utils/service/support.js";
import { allTicketSchema } from "../utils/validation/supportTeam_validation.js";
import supportUserCredentialMail from "../utils/email_template/supportUserCredential.js";
import { sendEmail } from "../utils/service/sendEmail.js";
import { generatesupportId } from "../utils/service/agreement.js";
import changePasswordMail from "../utils/email_template/change_password.js";

export const createAdmin = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const isExist = await Admin.findOne({ email });
        if (isExist)
            return give_response(res, 400, false, "Admin already exist");

        const hashPass = await bcryptjs.hash(password, 8);
        const randomId = await generatesupportId();
        const id = `adm${randomId}`;

        const admin = await Admin.create({
            email,
            password: hashPass,
            role: "SuperAdmin",
            id,
        });

        delete admin._doc.password;
        return give_response(res, 200, true, "Profile created successfully", {
            admin,
        });
    } catch (error) {
        next(error);
    }
});

export const login = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await adminLoginSchema.validateAsync(reqData);
        const { email, password } = validatedData;

        const user = await Admin.findOne({ email }).select("+password");
        if (!user)
            return give_response(
                res,
                404,
                false,
                "Admin not exist with this email"
            );

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) return give_response(res, 400, false, "Wrong password");

        const token = generateToken({ userId: user._id, email: user.email });

        delete user._doc.password;
        give_response(res, 200, true, "Login successfully", {
            user,
            token,
        });
    } catch (error) {
        next(error);
    }
});

export const reAssignedDispute = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await reAssignedDisputeSchema.validateAsync(
            reqData
        );
        const { disputeId, reAssignedReason } = validatedData;

        const dispute = await Dispute.findOneAndUpdate(
            { disputeId },
            { $set: { assignStatus: "ReAssigned", status: "InProcess", reAssignedReason } },
            { new: true }
        );
        // await Agreement.updateOne({agreementId: dispute.agreementId}, {$set: {split: {}}})

        give_response(
            res,
            200,
            true,
            "Dispute reAssigned successfully",
            dispute
        );
    } catch (error) {
        next(error);
    }
});

// export const addHash = asyncHandler(async (req, res, next) => {
//     try {
//         const reqData = req.body;
//         const validatedData = await addHashSchema.validateAsync(reqData);
//         const { hash, type, agreementId } = validatedData;

//         const agreement = await Agreement.findOne({ agreementId });
//         if (!agreement)
//             return give_response(res, 404, false, "Agreement not found");

//         const hashField = type === "Payer" ? "payerHash" : "receiverHash";
//         if (agreement.hashLink[hashField]) {
//             return give_response(res, 409, false, `${type}Hash already added`);
//         }

//         const updatedAgreement = await addHashLink(hash, hashField, agreement);

//         return give_response(
//             res,
//             200,
//             true,
//             "Hash added successfully",
//             updatedAgreement
//         );
//     } catch (error) {
//         next(error);
//     }
// });

export const addHash = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await addHashSchema.validateAsync(reqData);
        const { agreementId } = validatedData;

        const agreement = await Agreement.findOne({ agreementId });
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const updatedAgreement = await addHashLink(validatedData);

        return give_response(
            res,
            200,
            true,
            "Hash added successfully",
            updatedAgreement
        );
    } catch (error) {
        next(error);
    }
});

export const getAllTickets = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.query;
        const validatedData = await allTicketSchema.validateAsync(reqData);

        const tickets = await allTickets(validatedData);

        give_response(res, 200, true, "Dispute get successfully", {
            tickets,
        });
    } catch (error) {
        next(error);
    }
});

export const getPaymentDetails = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.query;
        const validatedData = await getPaymentDetailSchema.validateAsync(
            reqData
        );
        const { disputeId } = validatedData;

        const dispute = await fetchPaymentDetails(disputeId);

        give_response(res, 200, true, "Payment details get successfully", {
            dispute,
        });
    } catch (error) {
        next(error);
    }
});

// export const addMember = asyncHandler(async (req, res, next) => {
//     try {
//         const reqData = req.body;
//         const userId = req.userId
//         const validatedData = await addMemberSchema.validateAsync(reqData);
//         const { email, password, fname, lname, role, type } = validatedData;

//         const admin = await Admin.findOne({userId})
//         if(admin.role === "SubAdmin" && type === 'ManageMember' )
//             return give_response(res, 400, false, "You are not able to add data")

//         if (role === "Member") {
//             const isExist = await SupportTeam.findOne({ email });
//             if (isExist)
//                 return give_response(res, 400, false, "User already exist");
//             const hashPass = await bcryptjs.hash(password, 8);
//             const randomId = await generatesupportId();
//             const id = `stm${randomId}`;
//             const user = await SupportTeam.create({
//                 email,
//                 password: hashPass,
//                 fname,
//                 lname,
//                 id,
//             });
//             const username = fname + " " + lname;
//             const { html } = supportUserCredentialMail(
//                 username,
//                 email,
//                 password
//             );
//             await sendEmail(html, email, "Login Credential");
//             delete user._doc.password;
//         } else {
//             const isExist = await Admin.findOne({ email });
//             if (isExist)
//                 return give_response(res, 400, false, "User already exist");
//             const hashPass = await bcryptjs.hash(password, 8);
//             const randomId = await generatesupportId();
//             const id = `adm${randomId}`;
//             const user = await Admin.create({
//                 email,
//                 password: hashPass,
//                 fname,
//                 lname,
//                 type,
//                 role,
//                 id,
//             });
//             const username = fname + " " + lname;
//             const { html } = supportUserCredentialMail(
//                 username,
//                 email,
//                 password
//             );
//             await sendEmail(html, email, "Login Credential");
//             delete user._doc.password;
//         }

//         give_response(res, 200, true, "Member add successfully", {
//             user,
//         });
//     } catch (error) {
//         next(error);
//     }
// });

export const addMember = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.userId;
        const validatedData = await addMemberSchema.validateAsync(req.body);
        const { email, password, fname, lname, role, type } = validatedData;

        const admin = await Admin.findOne({ _id: userId });
        if (admin.role === "SubAdmin" && admin.type === "ManageMember")
            return give_response(
                res,
                400,
                false,
                "You are not able to add data"
            );

        const isExist = await (role === "Member" ? SupportTeam : Admin).findOne(
            { email }
        );
        if (isExist)
            return give_response(res, 400, false, "User already exist");

        const user = await createMember(validatedData);
        give_response(res, 200, true, "Member added successfully", { user });
    } catch (error) {
        next(error);
    }
});

// export const changeMemberPassword = asyncHandler(async (req, res, next) => {
//     try {
//         const userId = req.userId;
//         const reqData = req.body;
//         const validatedData = await changePasswordSchema.validateAsync(reqData);
//         const { email, newPassword } = validatedData;

//         const admin = await Admin.findOne({ _id: userId });
//         if (admin.role !== "SuperAdmin")
//             return give_response(
//                 res,
//                 400,
//                 false,
//                 "You are not able to change password"
//             );

//         let user;
//         user = await Admin.findOne({ email }).select("+password");
//         if (!user) {
//             user = await SupportTeam.findOne({ email }).select("+password");
//         }

//         if (!user)
//             return give_response(
//                 res,
//                 404,
//                 false,
//                 "User not found with this email"
//             );

//         const hashPass = await bcryptjs.hash(newPassword, 8);
//         user.password = hashPass;
//         user.save();

//         const username = user.fname + " " + user.lname;
//         const { html } = changePasswordMail(username, email, newPassword);
//         await sendEmail(html, email, "New Password");

//         give_response(res, 200, true, "Password changed successfully!");
//     } catch (error) {
//         next(error);
//     }
// });

export const removeMember = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.userId;
        const { memberId } = req.query;

        const admin = await Admin.findOne({ _id: userId });
        if (admin.role === "SubAdmin" && admin.type === "AddMember")
            return give_response(
                res,
                400,
                false,
                "You are not able to remove member"
            );

        let user;
        let type = "admin";
        user = await Admin.findOne({ id: memberId, role: "SubAdmin" });
        if (!user) {
            type = "support";
            user = await SupportTeam.findOne({ id: memberId });
        }

        if (!user)
            return give_response(
                res,
                404,
                false,
                "User not found with this email"
            );

        await (type === "support" ? SupportTeam : Admin).deleteOne({
            id: memberId,
        });

        give_response(res, 200, true, "Member deleted successfully!");
    } catch (error) {
        next(error);
    }
});

// export const getAllMember = asyncHandler(async (req, res, next) => {
//     try {
//         // const {search} = req.query
//         const subAdmin = await Admin.find({ role: "SubAdmin" });
//         // const support = await SupportTeam.find({});
//         const support = await SupportTeam.aggregate([
//             {
//                 $addFields: {
//                     role: "Member",
//                 },
//             },
//         ]);

//         const allUsers = [...subAdmin, ...support];
//         const users = allUsers.sort(
//             (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//         );
//         give_response(res, 200, true, "All member get successfully!", {
//             users,
//         });
//     } catch (error) {
//         next(error);
//     }
// });

export const getAllMember = asyncHandler(async (req, res, next) => {
    try {
        const { search, sort } = req.query;
        const subAdminQuery = search
            ? [
                {
                    $match: {
                        role: "SubAdmin",
                    }
                },
                {
                    $addFields: {
                        fullName: { $concat: ["$fname", " ", "$lname"] }
                    }
                },
                {
                    $match: {
                        fullName: { $regex: search, $options: "i" }
                    }
                }
            ]
            : [
                { $match: { role: "SubAdmin" } }
            ];

        const subAdmin = await Admin.aggregate(subAdminQuery);

        const supportQuery = search
            ? [
                {
                    $addFields: {
                        fullName: { $concat: ["$fname", " ", "$lname"] }
                    }
                },
                {
                    $match: {
                        fullName: { $regex: search, $options: "i" }
                    }
                }
            ]
            : [];

        const support = await SupportTeam.aggregate([
            ...supportQuery,
            { $addFields: { role: "Member" } }
        ]);

        const allUsers = [...subAdmin, ...support];

        let sortedUsers;
        if (sort === "ascending") {
            sortedUsers = allUsers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            sortedUsers = allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        give_response(res, 200, true, "All members retrieved successfully!", { users: sortedUsers });
    } catch (error) {
        next(error);
    }
});

export const updateMember = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.userId;
        const reqData = req.body;
        const { fname, lname, email, password, memberId } = reqData;

        const admin = await Admin.findOne({ _id: userId });
        if (admin.role === "SubAdmin" && admin.type === "AddMember")
            return give_response(
                res,
                400,
                false,
                "You are not able to remove member"
            );

        let user;
        let type = "admin";
        user = await Admin.findOne({ id: memberId, role: "SubAdmin" });
        if (!user) {
            type = "support";
            user = await SupportTeam.findOne({ id: memberId });
            if (!user)
                return give_response(
                    res,
                    404,
                    false,
                    "User not found with this email"
                );
        }

        const hashPass = await bcryptjs.hash(password, 8);

        const updatedUser = await (type === "support"
            ? SupportTeam
            : Admin
        ).findOneAndUpdate(
            {
                id: memberId,
            },
            { fname, lname, email, password: hashPass },
            { new: true }
        );

        give_response(res, 200, true, "Member update successfully!", {
            updatedUser,
        });
    } catch (error) {
        next(error);
    }
});

export const getAllAgentName = asyncHandler(async(req, res, next) => {
    try {
        const agent = await SupportTeam.find({}).select("fname lname -_id")
        give_response(res, 200, true, "Agent name get successfully", agent)
    } catch (error) {
        next(error);
    }
})