document.addEventListener('DOMContentLoaded', function () {
	const socket = io(); // Configuración para usar Socket.io del lado del cliente

	socket.emit('message1', 'Conectado con websocket');
	socket.emit('requestProductsList');

	// Variable para almacenar el email del usuario
	let userEmail = '';
	let userRole = '';

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

	document.getElementById('form_add').addEventListener('submit', addProduct);

	// Función para renderizar la lista de productos
	function renderProductList(products) {
		if (!Array.isArray(products.docs)) {
			console.error('El formato de products no es el esperado:', products);
			return;
		}

		const tbody = document.querySelector('#product_table tbody');
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

	// Manejador para el chat
	const chatbox = document.getElementById('chatbox');
	if (chatbox) {
		chatbox.addEventListener('keyup', function (evt) {
			if (evt.key === 'Enter') {
				if (chatbox.value.trim().length > 0) {
					socket.emit('message', { email: userEmail, message: chatbox.value });
					chatbox.value = '';
				}
			}
		});
	}

	// Recibir mensajes del chat
	socket.on('messageLogs', (data) => {
		let messageLogs = document.querySelector('#messageLogs');
		let mensajes = '';
		data.forEach((mensaje) => {
			if (mensaje.email === userEmail) {
				mensajes += `<p class="self-message"><strong>You:</strong> ${mensaje.message}</p>`;
			} else {
				mensajes += `<p class="other-message"><strong>${mensaje.email}:</strong> ${mensaje.message}</p>`;
			}
		});

		messageLogs.innerHTML = mensajes;
		messageLogs.scrollTop = messageLogs.scrollHeight;
	});

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
		}
	});
});
