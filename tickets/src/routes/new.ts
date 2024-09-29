import { requireAuth, validateRequest } from '@eztickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { ticketCreatedPublisher } from '../services/ticket-created-publisher';

const createTicketRouter = express.Router();

createTicketRouter.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than zero.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
    await ticket.save();

    await ticketCreatedPublisher.publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
    });

    res.status(201).send(ticket);
  }
);

export { createTicketRouter };
