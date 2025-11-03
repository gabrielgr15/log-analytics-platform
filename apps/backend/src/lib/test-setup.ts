import { afterAll, beforeEach } from 'vitest';
import prisma from './prisma.js';

beforeEach(async () => {
  await prisma.alert.deleteMany();
  await prisma.log.deleteMany();
  await prisma.project.deleteMany();
});

afterAll(async () => {
  prisma.$disconnect();
});
