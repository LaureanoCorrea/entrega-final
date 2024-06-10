import messageModel from './models/messages.model.js';

class MessageDaoMongo {
	constructor() {
		this.messageModel = messageModel;
	}

	async get() {
		return await this.messageModel.find({ isActive: true });
	}

	async getByUser(email) {
		return await this.messageModel.findOne({ user: email, isActive: true });
	}

	async createMessage(email, message) {
		const newMessage = new this.messageModel({
			user: email,
			messages: [message],
			isActive: true,
		});
		return await newMessage.save();
	}

	async findMessageById(id) {
		return await this.messageModel.findOne({ _id: id, isActive: true });
	}

	async updateMessage(id, message) {
		return await this.messageModel.findByIdAndUpdate(
			id,
			{
				$push: { messages: message },
			},
			{ new: true }
		);
	}

	async deleteMessage(id) {
		return await this.messageModel.findByIdAndUpdate(
			id,
			{ $set: { isActive: false } },
			{ new: true }
		);
	}
}

export default MessageDaoMongo;
