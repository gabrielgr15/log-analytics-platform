import { User } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository.js';
import { UserDto } from '../validation/user.schema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async register(
    userDto: UserDto
  ): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const { email, password } = userDto;

    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.createUser({
      email,
      password: hashedPassword,
    });

    const payload = { userId: newUser.id };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret is not configured.');
    }
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    return { user: newUser, token };
  }

  public async login(userDto: UserDto): Promise<string> {
    const { email, password } = userDto;
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) throw new Error('Email does not exist');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    const payload = { userId: user.id };

    const secret = process.env.JWT_SECRET;

    if (!secret) throw new Error('JWT secret is not configured');

    const token = jwt.sign(payload, secret, {
      expiresIn: '1d',
    });

    return token;
  }
}
