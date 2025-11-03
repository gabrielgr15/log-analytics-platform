import { z } from 'zod';

export const logEntrySchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'INFO', 'WARN', 'ERROR']),
  message: z.string().min(1, { message: 'Message cannot be empty' }),
  timestamp: z.iso.datetime({
    message: 'Timestamp must be a valid ISO 8601 date string',
  }),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const logBatchSchema = z.array(logEntrySchema).min(1).max(100);

export type RawLogInput = z.infer<typeof logEntrySchema>;
