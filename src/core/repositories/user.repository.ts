import { PrismaClient, User } from '@prisma/client';
import { UserDto } from '../validation/user.schema.js';

export class UserRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async createUser(data: UserDto): Promise<Omit<User, 'password'>> {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async findUserById(
    id: string
  ): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }
}
