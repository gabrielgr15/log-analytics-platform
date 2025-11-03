import { AuthService } from 'src/core/services/auth.service.js';
import { Request, Response } from 'express';
import { userEntrySchema } from 'src/core/validation/user.schema.js';

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const validationResult = userEntrySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Invalid register credentials',
        errors: validationResult.error.issues,
      });
      return;
    }

    try {
      const { user, token } = await this.authService.register(
        validationResult.data
      );
      res.cookie('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({
        message: 'User registered succesfully',
        data: {
          user,
        },
      });
    } catch (error) {
      console.error('Error in AuthController (register)', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const validationResult = userEntrySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Invalid login credentials',
        errors: validationResult.error.issues,
      });
      return;
    }
    try {
      const token = await this.authService.login(validationResult.data);
      res.cookie('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ message: 'User logged in succesfully' });
    } catch (error) {
      console.error('Error in AuthController (login)', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}
