import amqp, { Channel, Connection } from 'amqplib';

class RabbitMQ {
  private _connection?: Connection;
  private _channel?: Channel;

  async connect(url: string): Promise<void> {
    this._connection = await amqp.connect(url);
    this._channel = await this._connection.createChannel();
  }

  get channel(): Channel {
    if (!this._channel) {
      throw new Error('Channel not initialized');
    }
    return this._channel;
  }

  async close(): Promise<void> {
    if (this._channel) {
      await this._channel.close();
    }
    if (this._connection) {
      await this._connection.close();
    }
    console.log('RabbitMQ connection closed');
  }
}

export const rabbitMQ = new RabbitMQ();
