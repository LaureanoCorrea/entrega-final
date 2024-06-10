import ordersModel from './models/orders.models.js';

class OrdersDaoMongo {
	constructor() {
		this.ordersModel = ordersModel;
	}

	async get() {
		return await this.ordersModel.find({ isActive: true });
	}

	async getById(oid) {
		return await this.ordersModel
			.findOne({ _id: oid, isActive: true })
			.populate('products.product');
	}

	async create(ticketData) {
		ticketData.isActive = true;
		return await this.ordersModel.create(ticketData);
	}

	async update(oid, order) {
		return await this.ordersModel.updateOne(
			{ _id: oid, isActive: true },
			order
		);
	}

	async delete(oid) {
		return await this.ordersModel.findByIdAndUpdate(
			oid,
			{ $set: { isActive: false } },
			{ new: true }
		);
	}
}

export default OrdersDaoMongo;
