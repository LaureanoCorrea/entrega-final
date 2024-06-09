import { CartsDao, ProductDao, UserDao, OdersDao, MessagesDao} from "../dao/factory.js";
import UserRepository from "./users.repository.js";
import CartRepository from "./cart.repository.js";
import ProductRepository from "./products.repository.js";
import OrderRepository from "./orders.repository.js";
import MessageRepository from "./messages.repository.js";

const userService = new UserRepository(new UserDao());
const cartService = new CartRepository(new CartsDao());
const productService = new ProductRepository(new ProductDao());
const orderService = new OrderRepository(new OdersDao());
const messageService = new MessageRepository(new MessagesDao)

export { userService, cartService, productService, orderService, messageService }