import { Server } from "socket.io";
import messagesModel from "../dao/Mongo/models/messages.model.js";
import { productService, userService } from "../repositories/index.js";

export function initializeSocket(httpServer) {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {

    // Enviar la lista de productos al cliente cuando se conecta
    socket.on("requestProductsList", async () => {
      try {
        const productList = await productService.getProducts({});
        socket.emit("productsList", productList);
      } catch (error) {
        console.error("Error al obtener la lista de productos:", error);
        socket.emit("errorMessage", "Error al obtener la lista de productos");
      }
    });

    // Manejo de productos
    socket.on("addProduct", async (productData) => {
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
          userEmail
        } = productData;
    
        // Determinar si el usuario es premium
        const user = await userService.getUser(userEmail);
        let owner
        if (user.role === "premium") {
           owner = user.email
        } else {
           owner = "admin"
        }
    
        // Crear el producto con el propietario asignado
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
    
        // Emitir el evento para informar a todos los clientes sobre el nuevo producto
        const productList = await productService.getProducts({});
        io.emit("productAdded", { product, productList });
      } catch (error) {
        console.error("Error al agregar producto:", error);
        socket.emit("errorMessage", "Error al agregar producto");
      }
    });

    // Manejo de eliminación de productos
    socket.on("deleteProduct", async ({ pid, userRole, userEmail }) => {
      try {
        const user = await userService.getUser(userEmail);
        console.log("user", user);
        // let userRole = user.role;
        
       const product = await productService.getById(pid);
        if (!product) {
          socket.emit("errorMessage", "Producto no encontrado");
          return;
        }
        if (userRole === "admin" || (userRole === "premium" && product.owner === userEmail)) {
          await productService.deleteProduct({ _id: pid });
          const productList = await productService.getProducts({});
          io.emit("productsList", productList); // Actualizar la lista de productos después de eliminar
        } else {
          socket.emit("errorMessage", "No tienes permiso para eliminar este producto");
        }
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        socket.emit("errorMessage", "Error al eliminar producto");
      }
    });

    // Manejo de mensajes
    socket.on("message", async (data) => {
      try {
        const { email, message } = data;
        let userMessages = await messagesModel.findOne({ user: email });

        if (!userMessages) {
          userMessages = new messagesModel({
            user: email,
            messages: [message],
          });
        } else {
          userMessages.messages.push(message);
        }

        await userMessages.save();
        const mensajes = await messagesModel.find();
        io.emit("messageLogs", mensajes);
      } catch (error) {
        console.error("Error al manejar mensaje:", error);
      }
    });
  });
}
