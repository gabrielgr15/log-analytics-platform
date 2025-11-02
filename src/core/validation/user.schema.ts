import { z } from 'zod';

export const userEntrySchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(6, { message: 'Password must be more than 6 characters' }),
});

export type UserDto = z.infer<typeof userEntrySchema>;
