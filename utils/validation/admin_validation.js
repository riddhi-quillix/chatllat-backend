import joi from "joi";

export const adminLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});

export const changePasswordSchema = joi.object({
    email: joi.string().email().required(),
    newPassword: joi.string().required(),
});

export const reAssignedDisputeSchema = joi.object({
    disputeId: joi.string().required(),
    reAssignedReason: joi.string().required(),
});

export const addHashSchema = joi.object({
    payerHash: joi.string().required(),
    receiverHash: joi.string().required(),
    payerEvidence: joi.string().required(),
    receiverEvidence: joi.string().required(),
    agreementId: joi.string().required(),
});

export const getPaymentDetailSchema = joi.object({
    disputeId: joi.string().required(),
});

export const addMemberSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    fname: joi.string().required(),
    lname: joi.string().required(),
    role: joi.string().required().valid("SubAdmin", "Member"),
    type: joi
        .array()
        .items(
            joi
                .string()
                .valid(
                    "ManageMember",
                    "AddMember",
                    "All",
                    "ViewReports",
                    "ManageDisputes"
                )
        )
        .when("role", {
            is: "SubAdmin",
            then: joi.required(),
            otherwise: joi.forbidden(),
        }),
});
