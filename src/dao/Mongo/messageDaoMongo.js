import messageModel from './models/messages.model.js';

class MessageDaoMongo {
	constructor() {
		this.messageModel = messageModel;
	}

	async get() {
		return await this.messageModel.find({});
	}

	async getByUser(email) {
		return await this.messageModel.findOne({ user: email });
	}

	async createMessage(email, message) {
		const newMessage = new this.messageModel({
			user: email,
			messages: [message],
		});
		return await newMessage.save();
	}

	async findMessageById(id) {
		return await this.messageModel.findById(id);
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
}

export default MessageDaoMongo;
