import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import TransectionHistory from "../models/TransectionHistory.js";

export const getEscrowTransection = asyncHandler(async (req, res, next) => {
    try {
        const { walletId } = req.query;

        const transection = await TransectionHistory.aggregate([
            {
                $match: {
                    type: "Deposit",
                    fromAddress: walletId,
                },
            },
            {
                $lookup: {
                    from: "agreements",
                    localField: "agreementId",
                    foreignField: "agreementId",
                    as: "agreement",
                },
            },
            {
                $unwind: {
                    path: "$agreement",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    createdAt: 1,
                    transactionHash: 1,
                    agreementId: 1,
                    projectTitle: "$agreement.projectTitle",
                    amountDetails: "$agreement.amountDetails",
                    hashLink: {
                        $concat: [
                            {
                                $switch: {
                                    branches: [
                                        {
                                            case: {
                                                $eq: ["$agreement.amountDetails.chain", "bsc"],
                                            },
                                            then: "https://bscscan.com/tx/",
                                        },
                                        {
                                            case: {
                                                $eq: ["$agreement.amountDetails.chain", "polygon"],
                                            },
                                            then: "https://polygonscan.com/tx/",
                                        },
                                        {
                                            case: {
                                                $eq: ["$agreement.amountDetails.chain", "avalanche"],
                                            },
                                            then: "https://snowtrace.io/tx/",
                                        },
                                        {
                                            case: {
                                                $eq: ["$agreement.amountDetails.chain", "arbitrum"],
                                            },
                                            then: "https://arbiscan.io/tx/",
                                        },
                                        {
                                            case: {
                                                $eq: ["$agreement.amountDetails.chain", "clat"],
                                            },
                                            then: "https://bscscan.com/tx/",
                                        },
                                    ],
                                    default: "",
                                },
                            },
                            { $toString: "$transactionHash" }
                        ],
                    },
                },
            },
        ]);

        return give_response(
            res,
            200,
            true,
            "Escrow transaction retrieved successfully",
            { transection }
        );
    } catch (error) {
        next(error);
    }
});
