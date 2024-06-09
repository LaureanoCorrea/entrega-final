import { Server, Socket } from 'socket.io';
import {
	messageService,
	productService,
	userService,
} from '../repositories/index.js';

export function initializeSocket(httpServer) {
	const io = new Server(httpServer);

	let mensajes = [];
	io.on('connection', (socket) => {
		let userEmail;

		// Recibir el email del usuario cuando se conecta
		socket.on('setUserEmail', (email) => {
			userEmail = email;
		});

		// Enviar la lista de productos al cliente cuando se conecta
		socket.on('requestProductsList', async () => {
			try {
				const productList = await productService.getProducts({});
				socket.emit('productsList', productList);
			} catch (error) {
				socket.emit('errorMessage', 'Error al obtener la lista de productos');
			}
		});

		// Manejo de productos
		socket.on('addProduct', async (productData) => {
			try {
				const {
					title,
					description,
					price,
					thumbnail,
					code,
					stock,
					status,
					category,
					userEmail,
				} = productData;

				const user = await userService.getUser({ email: userEmail });
				const owner = user.role === 'premium' ? user.email : 'admin';

				const product = await productService.createProduct({
					title,
					description,
					price: parseInt(price),
					thumbnail,
					code,
					stock: parseInt(stock),
					status,
					category,
					owner,
				});

				const productList = await productService.getProducts({});
				io.emit('productAdded', { product, productList });
			} catch (error) {
				console.error('Error al agregar producto:', error);
				socket.emit('errorMessage', 'Error al agregar producto');
			}
		});

		// Manejo de eliminación de productos
		socket.on('deleteProduct', async ({ pid }) => {
			try {
				const user = await userService.getUser({ email: userEmail });
				const product = await productService.getById(pid);

				if (!product) {
					socket.emit('errorMessage', 'Producto no encontrado');
					return;
				}

				if (
					user.role === 'admin' ||
					(user.role === 'premium' && product.owner === userEmail)
				) {
					await productService.deleteProduct({ _id: pid });
					const productList = await productService.getProducts({});
					io.emit('productsList', productList);
					socket.emit('deleteProductSuccess');
				} else {
					socket.emit('deleteProductError');
				}
			} catch (error) {
				console.error('Error al eliminar producto:', error);
				socket.emit('errorMessage', 'Error al eliminar producto');
			}
		});

		// Manejo de mensajes
		socket.on('message', async (data) => {
			try {
				const { email, message } = data;
				let userMessages = await messageService.getByUser(email);

				if (!userMessages) {
					userMessages = await messageService.createMessage(email, message);
				} else {
					userMessages = await messageService.updateMessage(userMessages._id, message);
				}

				const mensajes = await messageService.getAllMessages();
				io.emit('messageLogs', mensajes);
			} catch (error) {
				console.error('Error al manejar mensaje:', error);
				socket.emit('errorMessage', 'Error al manejar mensaje');
			}
		});
	});
}
