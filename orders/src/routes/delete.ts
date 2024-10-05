import { Router, Request, Response } from 'express';
import { Order } from '../models/order';
import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from '@eztickets/common';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { rabbitMQ } from '../rabbitmq';
const deleteOrderRouter = Router();

deleteOrderRouter.delete(
  '/api/orders/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket');

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    order.status = OrderStatus.Cancelled;
    await order.save();

    await new OrderCancelledPublisher(rabbitMQ.channel).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { deleteOrderRouter };
