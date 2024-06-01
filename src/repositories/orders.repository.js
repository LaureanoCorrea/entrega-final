class OrderRepository {
  constructor(orderDao) {
    this.dao = orderDao;
  }

  getOrders = async () => {
    try {
      const result = await this.dao.get();
      return result;
    } catch (error) {
      throw new Error(`Error encontrando Orders: ${error.message}`);
    }
  };

  getOrderById = async (oid) => {
    try {
      return await this.dao.getById(oid);
    } catch (error) {
      throw new Error(`Error encontrando Order: ${error.message}`);
    }
  };

  async createOrder(orderData) {
    try {
      const order = await this.dao.create(orderData);
      return order;
    } catch (error) {
      throw new Error(`Error al crear la orden: ${error.message}`);
    }
  }

  updateOrder = async (oid, order) => {
    try {
      return await this.dao.update(oid, order);
    } catch (error) {
      throw new Error(`Error actualizando Order: ${error.message}`);
    }
  };

  deleteOrder = async (oid) => {
    try {
      return await this.dao.delete(oid);
    } catch (error) {
      throw new Error(`Error eliminando Order: ${error.message}`);
    }
  };
}

export default OrderRepository;
