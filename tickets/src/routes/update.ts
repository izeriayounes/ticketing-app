import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@eztickets/common';
import { body } from 'express-validator';
import { ticketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const updateTicketRouter = express.Router();

updateTicketRouter.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than zero.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) throw new NotFoundError();

    if (req.currentUser!.id !== ticket.userId) throw new NotAuthorizedError();

    if (ticket.orderId)
      throw new BadRequestError('Cannot edit a reserved ticket');

    ticket.set(req.body);
    await ticket.save();

    await ticketUpdatedPublisher.publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(200).send(ticket);
  }
);

export { updateTicketRouter };
