import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPass: string, suppliedPass: string) {
    const [hashedPass, salt] = storedPass.split('.');
    const buf = (await scryptAsync(suppliedPass, salt, 64)) as Buffer;
    return hashedPass === buf.toString('hex');
  }
}
