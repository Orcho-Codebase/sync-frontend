import { z } from 'zod';
import { insertIntegrationSchema, integrations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  integrations: {
    list: {
      method: 'GET' as const,
      path: '/api/integrations' as const,
      responses: {
        200: z.array(z.custom<typeof integrations.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/integrations' as const,
      input: insertIntegrationSchema,
      responses: {
        201: z.custom<typeof integrations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
