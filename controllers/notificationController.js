import asyncHandler from "../helper/async.js";
import Notification from "../models/Notification.js";
import give_response from "../helper/help.js";

export const getNotification = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params
        // const notification = await Notification.find({ walletId: id }).sort({createdAt: -1})

        const notification = await Notification.aggregate([
            {
                $match: {
                    walletId: id
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: "agreements",
                    localField: "agreementId",
                    foreignField: "agreementId",
                    pipeline: [
                        {
                            $project: {
                                amountDetails: 1,
                                _id: 0
                            }
                        }
                    ],
                    as: "agreement"
                }
            },
            {
                $unwind: {
                    path: "$agreement",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    walletId: 1,
                    agreementId: 1,
                    message: 1,
                    type: 1,
                    read: 1,
                    importantNotificationIsRead: 1,
                    createdAt: 1,
                    amount: "$agreement.amountDetails.amount"
                }
            }
        ])

        await Notification.updateMany({ walletId: id }, {$set: {read: true}})
        return give_response(res, 200, true, "Notification get successfully", { notification });

    } catch (error) {
        next(error);
    }
})


// export const getNotification = asyncHandler(async (req, res, next) => {
//     try {
//         const { id } = req.params
//         const notification = await Notification.find({ walletId: id })
//         await Notification.updateMany({ walletId: id, type: {$ne: "Deposit Funds"} }, {$set: {read: true}})
//         return give_response(res, 200, true, "Notification get successfully", { notification });

//     } catch (error) {
//         return give_response(res, 500, false, error.message);
//     }
// })



