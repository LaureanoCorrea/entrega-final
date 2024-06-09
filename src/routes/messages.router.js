import { Router } from 'express';
import { passportCall } from '../middleware/passportCall.js';
import MessageController from '../controllers/messages.controler.js';
import authorization from '../middleware/authentication.middleware.js';

const messagesRouter = Router();
const messageController = new MessageController();

messagesRouter.get(
	'/',
	passportCall(['jwt']),
	authorization(['user']),
	messageController.getAllMessages
);

messagesRouter.post(
	'/',
	passportCall(['jwt']),
	authorization(['user']),
	messageController.createMessage
);

messagesRouter.put(
	'/:mid',
	passportCall(['jwt']),
	authorization(['user']),
	messageController.appendToMessage
);

export default messagesRouter;
