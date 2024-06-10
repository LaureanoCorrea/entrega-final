import { Schema, model } from 'mongoose';

const messagesCollection = 'messages';

const messageSchema = new Schema({
	user: {
		type: String,
		unique: true,
		required: true,
		index: true,
	},
	messages: {
		type: [String],
		required: true,
		default: [],
	},
	isActive: { type: Boolean, default: true },
});

const messageModel = model(messagesCollection, messageSchema);

export default messageModel;
