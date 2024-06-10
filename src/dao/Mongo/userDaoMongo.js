import usersModel from "./models/users.model.js";

class UserDaoMongo {
  constructor() {
    this.usersModel = usersModel;
  }

  async get() {
    return await this.usersModel.find({ isActive: true });
  }

  async getBy(filter) {
    filter.isActive = true;  
    return await this.usersModel.findOne(filter);
  }

  async create(newUser) {
    newUser.isActive = true;  
    return await this.usersModel.create(newUser);
  }

  async update(uid, userToUpdate) {
    return await this.usersModel.updateOne({ _id: uid, isActive: true }, userToUpdate, {
      new: true,
    });
  }

  async delete(uid) {
    return await this.usersModel.findByIdAndUpdate(
      uid,
      { $set: { isActive: false } },
      { new: true }
    );
  }

  async updateUserCart(userId, cid) {
    return await this.usersModel.findByIdAndUpdate(
      userId,
      { cart: cid, isActive: true },
      { new: true }
    );
  }
}

export default UserDaoMongo;
