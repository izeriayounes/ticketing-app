import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = 'Error connection to database.';
  constructor() {
    super('Error connecting to db.');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
  public serializeErrors() {
    return [{ message: this.reason }];
  }
}
