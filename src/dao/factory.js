import { configObject, connectDB } from "../config/connectDB.js";

let UserDao;
let ProductDao;
let CartsDao;
let OdersDao;
let MessagesDao

switch (configObject.persistence) {
  case "FILE":
    // const UserDaoFile = import("./File/userDaoFile").default;
    // UserDao = UserDaoFile;
    break;

  case "MEMORY":
    break;

  default:
    connectDB();

    const UserDaoMongo = (await import("./Mongo/userDaoMongo.js")).default;
    UserDao = UserDaoMongo;

    const ProductDaoMongo = (await import("./Mongo/productsDaoMongo.js"))
      .default;
    ProductDao = ProductDaoMongo;

    const CartDaoMongo = (await import("./Mongo/cartsDaoMongo.js")).default;
    CartsDao = CartDaoMongo;
    
    const OrdersDaoMongo = (await import("./Mongo/ordersDaoMongo.js")).default;
    OdersDao = OrdersDaoMongo;  
    
    const MessageDaoMongo = (await import("./Mongo/messageDaoMongo.js")).default;
    MessagesDao = MessageDaoMongo;
    break;



}

export { UserDao, ProductDao, CartsDao, OdersDao, MessagesDao };
