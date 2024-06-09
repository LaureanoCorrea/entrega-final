document.addEventListener('DOMContentLoaded', function () {
	const socket = io(); // Configuración para usar Socket.io del lado del cliente
	const messagesContainer = document.getElementById('messagesContainer');

	socket.emit('message1', 'Conectado con websocket');
	socket.emit('requestProductsList');
	// Variable para almacenar el email del usuario
	let userEmail = '';
	let userRole = '';
	let userColors = {};
	socket.emit('setUserEmail', userEmail);

	// Modal para ingresar el correo electrónico
	Swal.fire({
		title: 'Ingresa tu e-mail para poder continuar',
		input: 'email',
		text: 'Ingresa e-mail',
		inputValidator: (value) => {
			return !value && 'Datos requeridos';
		},
		allowOutsideClick: false,
		allowEscapeKey: false,
	}).then((result) => {
		if (result.isConfirmed) {
			userEmail = result.value;
			const inputField = document.querySelector('.swal2-input');
			if (inputField) {
				inputField.focus();
			}
			socket.emit('setUserEmail', userEmail);
		}
	});

	// Verificación de la URL para ejecutar código específico para cada página
	const currentUrl = window.location.pathname;

	if (currentUrl.includes('realtimeproducts')) {
		// Código específico para la página realtimeproducts

		// Función para agregar productos
		function addProduct(event) {
			event.preventDefault(); // Evitar la recarga de la página

			let title = document.getElementById('title').value;
			let description = document.getElementById('description').value;
			let price = document.getElementById('price').value;
			let thumbnail = document.getElementById('thumbnail').value;
			let code = document.getElementById('code').value;
			let stock = document.getElementById('stock').value;
			let status = document.getElementById('status').value;
			let category = document.getElementById('category').value;

			if (
				!title ||
				!price ||
				!thumbnail ||
				!code ||
				!stock ||
				!category ||
				!status
			) {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Todos los campos son obligatorios',
				});
				return false;
			}

			const product = {
				title,
				description,
				price,
				thumbnail,
				code,
				stock,
				status,
				category,
				userEmail,
			};

			socket.emit('addProduct', product);
			document.getElementById('form_add').reset();
			Swal.fire({
				icon: 'success',
				title: 'Éxito',
				text: 'Producto agregado con éxito',
			});
		}

		// Solo agregar el event listener si el formulario existe
		const formAdd = document.getElementById('form_add');
		if (formAdd) {
			formAdd.addEventListener('submit', addProduct);
		}

		// Función para renderizar la lista de productos
		function renderProductList(products) {
			const tbody = document.querySelector('#product_table tbody');
			if (!tbody) {
				console.error('El elemento tbody no se encontró en el DOM');
				return;
			}
			if (!Array.isArray(products.docs)) {
				console.error('El formato de products no es el esperado:', products);
				return;
			}

			tbody.innerHTML = '';

			products.docs.forEach((product) => {
				const row = document.createElement('tr');
				row.id = `product_${product._id}`;
				row.innerHTML = `
					<td>${product.title}</td>
					<td>${product.description}</td>
					<td>$${product.price}</td>
					<td>${product.code}</td>
					<td><button type="button" class="delete_button" onclick="deleteProduct('${product._id}')">X</button></td>
				`;
				tbody.appendChild(row);
			});
		}

		// Recibir la lista de productos actualizada
		socket.on('productsList', (productList) => {
			renderProductList(productList);
		});

		// Recibir el nuevo producto y la lista de productos actualizada
		socket.on('productAdded', ({ product, productList }) => {
			renderProductList(productList);
		});

		// Recibir la eliminación de un producto y actualizar la lista de productos
		socket.on('productDeleted', ({ productList }) => {
			renderProductList(productList);
		});

		socket.on('deleteProductSuccess', () => {
			Swal.fire({
				icon: 'success',
				title: 'Producto eliminado',
				text: 'El producto ha sido eliminado correctamente.',
			});
		});

		socket.on('deleteProductError', () => {
			Swal.fire({
				icon: 'error',
				title: 'Permiso denegado',
				text: 'No tienes permiso para eliminar este producto.',
			});
		});

		// Manejo de la eliminación de productos
		window.deleteProduct = (id) => {
			socket.emit('deleteProduct', { pid: id, userEmail });
		};

		//Manejo del chat
	} else if (currentUrl.includes('chat')) {
		const chatbox = document.querySelector('#chatbox');
		if (chatbox) {
			chatbox.addEventListener('keyup', function (evt) {
				if (evt.key === 'Enter') {
					if (chatbox.value.trim().length > 0) {
						socket.emit('message', {
							email: userEmail,
							message: chatbox.value,
						});
						chatbox.value = '';
					}
				}
			});
		}

		// manejo de chat
		socket.on('messageLogs', (messages) => {
			if (messagesContainer) {
				messagesContainer.innerHTML = '';
				messages.forEach((msg) => {
					const messageElement = document.createElement('p');
					const user = msg.user;
					const usernameColor = getUserColor(user); // Obtener el color del nombre de usuario
					messageElement.innerHTML = `<strong class="username" style="color: ${usernameColor}">${user}:</strong><br>${msg.messages.join(
						'<br>'
					)}`;
					messagesContainer.appendChild(messageElement);
				});
			} else {
				console.error('messagesContainer is null');
			}
		});

		// Función para obtener el color del nombre de usuario
		function getUserColor(username) {
			// Si el usuario ya tiene un color asignado, devolverlo
			if (userColors[username]) {
				return userColors[username];
			} else {
				// Generar un color aleatorio si no hay uno asignado
				const color = getRandomColor();
				userColors[username] = color;
				return color;
			}
		}

		// Función para generar un color aleatorio
		function getRandomColor() {
			const letters = '0123456789ABCDEF';
			let color = '#';
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		}

		const vaciarCarritoBtn = document.getElementById('vaciar_carrito_btn');
		if (vaciarCarritoBtn) {
			vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
		}

		const comprarBtn = document.getElementById('comprar_btn');
		if (comprarBtn) {
			comprarBtn.addEventListener('click', terminarCompra);
		}

		const quantityInputs = document.querySelectorAll('.product_quantity');
		quantityInputs.forEach((input) => {
			input.addEventListener('input', function () {
				if (typeof actualizarCantidadProducto === 'function') {
					actualizarCantidadProducto(
						input.dataset.productId,
						input.textContent
					);
				}
				if (typeof calcularSubtotal === 'function') {
					calcularSubtotal();
				}
			});
		});
	}
});
