import productsModel from "./models/products.model.js";

class ProductDaoMongo {
	constructor() {
	  this.productsModel = productsModel;
	}
  
	async get(filter = {}, options = {}) {
	  filter.isActive = true;  
	  return await this.productsModel.paginate(filter, options);
	}
	
	async getById(pid) {
	  return await this.productsModel.findOne({ _id: pid, isActive: true }).lean();
	}
  
	async create(newProduct) {
	  newProduct.isActive = true; 
	  return await this.productsModel.create(newProduct);
	}
  
	async update(pid, updateData) { 
	  return await this.productsModel.updateOne({ _id: pid, isActive: true }, updateData);
	}
  
	async updateStock(pid, newStock) {
	  return await this.productsModel.updateOne({ _id: pid, isActive: true }, { stock: newStock });
	}
  
	async delete(pid) {
	  return await this.productsModel.findByIdAndUpdate(
		pid,
		{ $set: { isActive: false } },
		{ new: true }
	  );
	}
  }
  export default ProductDaoMongo;
  