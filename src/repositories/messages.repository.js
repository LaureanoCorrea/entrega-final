class MessageRepository {
	constructor(messagesDao) {
		this.dao = messagesDao;
	}
	async getAllMessages() {
		return await this.dao.get();
	}
	async getByUser(email) {
		return await this.dao.getByUser(email);
	}
	async createMessage(email, message) {
		return this.dao.createMessage(email, message);
	}

	async updateMessage(id, message) {
		return this.dao.updateMessage(id, message);
	}
}

export default MessageRepository;
