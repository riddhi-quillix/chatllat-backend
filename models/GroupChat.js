import mongoose from "mongoose";

const ChatGroupSchema = new mongoose.Schema(
    {
		groupId: {
			type: String,
			default: null
		},
		disputeId: {
			type: String,
			default: null
		},
		agreementId: {
			type: String,
		},
		groupName: {
			type: String
		},
		groupMember: {
			type: [String],
			default: []
		}
    },
    { timestamps: true, versionKey: false }
);

const GroupChat = mongoose.model("GroupChat", ChatGroupSchema);
export default GroupChat
