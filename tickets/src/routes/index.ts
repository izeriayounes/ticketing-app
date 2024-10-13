import { Router, Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const indexTicketRouter = Router();

indexTicketRouter.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ orderId: undefined });
  res.status(200).send(tickets);
});

export { indexTicketRouter };
