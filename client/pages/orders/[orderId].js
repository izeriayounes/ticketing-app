import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [time, setTime] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const calcLeftTime = () => {
      const msLeft = new Date(order.expiresAt) - new Date();

      setTime(Math.round(msLeft / 1000));
    };

    calcLeftTime();
    const timerId = setInterval(calcLeftTime, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (time < 0) return <div>Order expired</div>;

  return (
    <div suppressHydrationWarning>
      Remaining time before order expiration {time} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51Q5NxLIvZl8lh1wUYspD0OtAdV1MxRx1E8Ds0acZf5BHztJ9RGxzeduqo3MJkDSKf4Mcc20dzeKrnSpg0hkOsqaQ00lEYYxj4E"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
