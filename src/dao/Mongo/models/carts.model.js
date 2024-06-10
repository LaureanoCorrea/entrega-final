import { Schema, model } from 'mongoose';

const collection = 'carts';

const CartsSchema = new Schema({
	userEmail: {
		type: String,
		required: true,
		unique: true,
	},
	products: {
		type: [
			{
				product: {
					type: Schema.Types.ObjectId,
					ref: 'products',
				},
				quantity: {
					type: Number,
				},
			},
		],
	},
	isActive: { type: Boolean, default: true },
});

CartsSchema.pre('findOne', function () {
	this.populate('products.product');
});

const cartsModel = model(collection, CartsSchema);

export default cartsModel;
