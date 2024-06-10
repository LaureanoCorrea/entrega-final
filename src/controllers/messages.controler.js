import { messageService } from "../repositories/index.js";
import { logger } from "../utils/logger.js";

class MessageController {
    constructor(){
        this.messageService = messageService
    }

    async getAllMessages(req, res) {
        try {
            const messages = await this.messageService.getAllMessages();
            res.status(200).json({
                status: 'success',
                message: 'Mensajes encontradas',
                messages
            });
        } catch (error) {
            logger.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
            });
        }
    }

    async getMessagesByUser(req, res) {
        try {
            const { email } = req.params;
            const messages = await this.messageService.getMessagesByUser(email);
            res.status(200).json({
                status: 'success',
                message: 'Mensajes encontradas',
                messages
            });
        } catch (error) {
            logger.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
            });
        }
    }

    async createMessage(req, res) {
        try {
            const { user, message } = req.body;
            const newMessage = {
                user,
                message
            };
            const createdMessage = await this.messageService.createMessage(newMessage);
            res.status(201).json({
                status: 'success',
                message: 'Mensasje creada exitosamente',
                createdMessage
            });
        } catch (error) {
            logger.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
            });
        }
    }

    async appendToMessage(req, res) {
        try {
            const { mid } = req.params;
            const { user, message } = req.body;
            const updatedMessage = await this.messageService.appendToMessage(mid, user, message);
            res.status(200).json({
                status: 'success',
                message: 'Mensasje actualizado exitosamente',
                updatedMessage
            });
        } catch (error) {
            logger.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
            });
        }
    }

}

export default MessageController