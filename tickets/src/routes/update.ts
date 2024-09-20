import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@eztickets/common';
import { body } from 'express-validator';

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

    if (!ticket) {
      throw new NotFoundError();
    }

    if (req.currentUser!.id !== ticket.userId) {
      throw new NotAuthorizedError();
    }

    ticket.set(req.body);

    await ticket.save();

    res.status(200).send(ticket);
  }
);

export { updateTicketRouter };
