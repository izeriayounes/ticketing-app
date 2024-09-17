import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { body } from 'express-validator';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('you must supply a password.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      throw new BadRequestError('Invalid login informations');
    }

    const passwordsMatch = await Password.compare(foundUser.password, password);

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid login informations');
    }

    const userJwt = jwt.sign({ id: foundUser.id, email }, process.env.JWT_KEY!);
    req.session = { jwt: userJwt };

    res.status(200).send(foundUser);
  }
);

export { router as signinRouter };
