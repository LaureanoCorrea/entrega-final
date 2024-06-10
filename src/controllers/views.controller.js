import CurrentDTO from '../dto/currentDTO.js';
import { logger } from '../utils/logger.js';
import {
	cartService,
	productService,
	userService,
	orderService,
} from '../repositories/index.js';

class ViewController {
	constructor() {
		this.userService = userService;
		this.cartService = cartService;
		this.productService = productService;
		this.orderService = orderService;
	}

	login = (req, res) => {
		res.render('login', {
			hideHeader: true,
			style: 'index.css',
		});
	};

	register = (req, res) => {
		res.render('register', {
			hideHeader: true,
			style: 'index.css',
		});
	};

	cart = async (req, res) => {
		try {
			const cid = req.user.cart;
			const cart = await cartService.getById(cid, true);
			const username = req.user.first_name;
			const role = req.user.role;
			res.render('cart', {
				cid,
				cart,
				username,
				role,
				style: 'index.css',
			});
		} catch (error) {
			logger.error(error);
			res.status(500).send('Error interno del servidor');
		}
	};

	products = async (req, res) => {
		const { limit = 5, page = 1, sort = '', query = '' } = req.query;

		try {
			const options = {
				limit: parseInt(limit, 10),
				page: parseInt(page, 10),
				sort: sort ? { [sort]: 1 } : {},
				lean: true,
			};

			const filter = {};
			if (query) {
				filter.$text = { $search: query };
			}
			filter.isActive = true;

			const cid = req.user.cart;
			const cart = await this.cartService.getById(cid, true);

			const {
				docs,
				hasPrevPage,
				hasNextPage,
				prevPage,
				nextPage,
				page: currentPage,
			} = await this.productService.getProducts(filter, options);

			const user = req.user;
			const username = req.user.first_name;
			const role = user ? user.role : '';

			const products = docs.map((doc) => ({
				_id: doc._id,
				title: doc.title,
				description: doc.description,
				price: doc.price,
				code: doc.code,
			}));

			res.render('products', {
				username,
				role,
				cid,
				products,
				hasPrevPage,
				hasNextPage,
				prevPage,
				nextPage,
				page: currentPage,
				userId: req.user._id,
				style: 'index.css',
			});
		} catch (error) {
			logger.error(error);
			res.status(500).send('Error interno del servidor');
		}
	};

	chat = (req, res) => {
		const username = req.user.first_name;
		const role = req.user.role;
		res.render('chat', {
			username,
			role,
			style: 'index.css',
		});
	};

	realtimeproducts = async (req, res) => {
		try {
			const productsData = await productService.getProducts({});
			const user = req.user;
			const username = req.user.first_name;
			const role = user ? user.role : '';

			const products = productsData.docs.map((product) => ({
				title: product.title,
				description: product.description,
				price: product.price,
				thumbnail: product.thumbnail,
				code: product.code,
				stock: product.stock,
				status: product.status,
				category: product.category,
			}));
			res.render('realtimeproducts', {
				username,
				role,
				products,
				style: 'index.css',
			});
		} catch (error) {
			res.json('Error al intentar obtener la lista de productos!');
			return;
		}
	};

	productDetails = async (req, res) => {
		const { pid } = req.params;
		try {
			const product = await productService.getById(pid);

			const user = req.user;
			const username = req.user.first_name;
			const role = user ? user.role : '';
			const cid = req.user.cart;

			res.render('productDetails', {
				username,
				role,
				cid,
				userId: req.user.id,
				product,
				style: 'index.css',
			});
		} catch (error) {
			logger.error(error);
			res.json('Error al intentar obtener el producto!');
			return;
		}
	};

	current = async (req, res) => {
		try {
			const { first_name, last_name } = req.user;
			const currentDTO = new CurrentDTO({ first_name, last_name });
			res.send(currentDTO);
		} catch (error) {
			logger.error(error);
			res.status(500).send('Error interno del servidor');
		}
	};

	ticket = async (req, res) => {
		try {
			const oid = req.params.oid;
			const username = req.user.first_name;
			const role = req.user.role;
			const order = await orderService.getOrderById(oid);

			if (!order) {
				return res.status(404).send('Orden no encontrada');
			}

			const productsWithTitles = await Promise.all(
				order.products.map(async (product) => {
					const productInfo = await productService.getById(product.product);
					return {
						title: productInfo.title,
						quantity: product.quantity,
					};
				})
			);

			res.render('ticket', {
				username,
				role,
				order: {
					_id: order._id,
					createdAt: order.createdAt,
					total: order.total,
					products: productsWithTitles,
				},
				style: 'index.css',
			});
		} catch (error) {
			logger.error(error);
			res.status(500).send('Error interno del servidor');
		}
	};

	forgotPassword = (req, res) => {
		res.render('forgotPassword', {
			style: 'index.css',
		});
	};

	expiredResetLink = (req, res) => {
		res.render('expiredResetLink');
	};

	changeRole = async (req, res) => {
		try {
			const users = await this.userService.getUsers();
			const usersPlain = users.map((user) =>
				user.toObject ? user.toObject() : user
			); // Convertir a objetos planos si es necesario
			const username = req.user.first_name;
			const role = req.user.role;
			res.render('changeRole', {
				users: usersPlain,
				username,
				role,
				style: 'index.css',
			});
		} catch (error) {
			logger.error(error);
			res.status(500).send('Error interno del servidor');
		}
	};

	loggerTest = (req, res) => {
		req.logger.debug('Este es un mensaje de debug');
		req.logger.http('Este es un mensaje http');
		req.logger.info('Este es un mensaje de info');
		req.logger.warning('Este es un mensaje de warning');
		req.logger.error('Este es un mensaje de error');
		req.logger.fatal('Este es un mensaje de fatal');

		res.send('Prueba de logger completada');
	};
}
export default ViewController;
