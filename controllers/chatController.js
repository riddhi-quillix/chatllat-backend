import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import Chat from "../models/Chat.js";

export const getChatList = asyncHandler(async (req, res, next) => {
    const userId = req.query.connectedWalletId;

    try {
        const chatList = await Chat.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { receiver: userId },
                        { groupMember: userId },
                    ],
                },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$isGroup", true] }, // If it's a group chat, group by groupId
                            then: "$groupId", // Group by groupId for group chats
                            else: "$agreementId",
                        },
                    },
                    lastMessage: { $last: "$$ROOT" }, // Get the last message in the conversation
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $eq: ["$isGroup", true] }, // If it's a group chat
                                {
                                    $cond: {
                                        if: {
                                            $and: [
                                                { $ne: ["$sender", userId] }, // 🛑 Don't count if sender is the current user
                                                {
                                                    $not: {
                                                        $in: [
                                                            userId,
                                                            "$groupMsgReadBy",
                                                        ],
                                                    },
                                                }, // User has NOT read it
                                            ],
                                        },
                                        then: 1,
                                        else: 0,
                                    },
                                },
                                {
                                    $cond: {
                                        if: {
                                            $and: [
                                                { $eq: ["$read", false] },
                                                { $ne: ["$sender", userId] }, // Only count messages not sent by this user
                                            ],
                                        },
                                        then: 1,
                                        else: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    // userId: "$_id",
                    userId: {
                        $cond: {
                            if: { $eq: ["$lastMessage.isGroup", true] },
                            then: "$lastMessage.groupId", // For group chat, keep it as current user
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ["$lastMessage.sender", userId],
                                    },
                                    then: "$lastMessage.receiver",
                                    else: "$lastMessage.sender",
                                },
                            },
                        },
                    },
                    agreementId: "$lastMessage.agreementId",
                    message: "$lastMessage.msg",
                    image: "$lastMessage.image",
                    document: "$lastMessage.document",
                    isGroup: "$lastMessage.isGroup",
                    groupName: "$lastMessage.groupName",
                    groupId: "$lastMessage.groupId",
                    disputeId: "$lastMessage.disputeId",
                    createdAt: "$lastMessage.createdAt",
                    unreadCount: 1, // Include unread message count in the result
                },
            },
        ]);

        res.json({
            success: true,
            chatList: chatList,
        });
    } catch (error) {
        next(error);
    }
});

// export const getChatList = asyncHandler(async (req, res, next) => {
//     const userId = req.query.connectedWalletId;

//     try {
//         const chatList = await Chat.aggregate([
//             {
//                 $match: {
//                     $or: [
//                         { sender: userId },
//                         { receiver: userId },
//                         { groupMember: userId },
//                     ],
//                 },
//             },
//             {
//                 $group: {
//                     _id: {
//                         $cond: {
//                             if: { $eq: ["$isGroup", true] }, // If it's a group chat, group by groupId
//                             then: "$groupId", // Group by groupId for group chats
//                             else: "$agreementId",
//                         },
//                     },
//                     lastMessage: { $last: "$$ROOT" }, // Get the last message in the conversation
//                     unreadCount: {
//                         $sum: {
//                             $cond: [
//                                 { $eq: ["$isGroup", true] }, // If it's a group chat
//                                 {
//                                     $cond: {
//                                         if: {
//                                             $and: [
//                                                 { $ne: ["$sender", userId] }, // 🛑 Don't count if sender is the current user
//                                                 {
//                                                     $not: {
//                                                         $in: [
//                                                             userId,
//                                                             "$groupMsgReadBy",
//                                                         ],
//                                                     },
//                                                 }, // User has NOT read it
//                                             ],
//                                         },
//                                         then: 1,
//                                         else: 0,
//                                     },
//                                 },
//                                 {
//                                     $cond: {
//                                         if: {
//                                             $and: [
//                                                 { $eq: ["$read", false] },
//                                                 { $ne: ["$sender", userId] }, // Only count messages not sent by this user
//                                             ],
//                                         },
//                                         then: 1,
//                                         else: 0,
//                                     },
//                                 },
//                             ],
//                         },
//                     },
//                 },
//             },
//             {
//                 $project: {
//                     userId: "$_id",
//                     agreementId: "$lastMessage.agreementId",
//                     message: "$lastMessage.msg",
//                     image: "$lastMessage.image",
//                     document: "$lastMessage.document",
//                     isGroup: "$lastMessage.isGroup",
//                     groupName: "$lastMessage.groupName",
//                     groupId: "$lastMessage.groupId",
//                     createdAt: "$lastMessage.createdAt",
//                     unreadCount: 1, // Include unread message count in the result
//                 },
//             },
//         ]);

//         res.json({
//             success: true,
//             chatList: chatList,
//         });
//     } catch (error) {
//         next(error);
//     }
// });

export const getPersonalChatMessages = asyncHandler(async (req, res, next) => {
    try {
        const { sender, receiver, agreementId } = req.query;
        await Chat.updateMany(
            { sender: receiver, receiver: sender, agreementId, isGroup: false },
            { read: true }
        );

        const messages = await Chat.find({ agreementId, isGroup: false });
        return give_response(res, 200, true, "Messages get successfully", {
            messages,
        });
    } catch (error) {
        next(error);
    }
});

export const getChatMessages = asyncHandler(async (req, res, next) => {
    try {
        const { sender, receiver, isGroup, agreementId } = req.query; // sender id = connected wallet id

        let messages;
        if (isGroup == "true") {
            await Chat.updateMany(
                {
                    isGroup: true,
                    groupMsgReadBy: { $ne: sender },
                },
                {
                    $push: { groupMsgReadBy: sender }, // Push userId to the readBy array
                }
            );

            messages = await Chat.aggregate([
                {
                    $match: {
                        isGroup: true,
                        agreementId,
                    },
                },
                {
                    $addFields: {
                        read: {
                            $cond: {
                                if: {
                                    $in: [sender, "$groupMsgReadBy"], // Check if sender is in groupMsgReadBy
                                },
                                then: true,
                                else: false,
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        msg: 1,
                        image: 1,
                        document: 1,
                        sender: 1,
                        read: 1,
                        isGroup: 1,
                        groupId: 1,
                        disputeId: 1,
                        agreementId: 1,
                        groupName: 1,
                        groupMember: 1,
                        groupMsgReadBy: 1,
                        createdAt: 1,
                        payerWallet: 1,
                        receiverWallet: 1
                    },
                },
            ]);
        } else {
            await Chat.updateMany(
                {
                    sender: receiver,
                    receiver: sender,
                    agreementId,
                    isGroup: false,
                },
                { read: true }
            );

            messages = await Chat.find({ agreementId, isGroup: false }).select(
                "sender receiver msg image document read createdAt agreementId"
            );
        }

        return give_response(res, 200, true, "Messages get successfully", {
            messages,
        });
    } catch (error) {
        next(error);
    }
});
