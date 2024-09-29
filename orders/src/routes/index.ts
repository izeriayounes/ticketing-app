import { Router, Request, Response } from 'express';
import { Order } from '../models/order';
import { requireAuth } from '@eztickets/common';
const indexOrderRouter = Router();

indexOrderRouter.get(
  '/api/orders',
  requireAuth,
  async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.currentUser!.id }).populate(
      'ticket'
    );
    res.status(200).send(orders);
  }
);

export { indexOrderRouter };
