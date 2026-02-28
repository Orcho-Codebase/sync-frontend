import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(),
  apiKey: text("api_key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({ id: true, createdAt: true });

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type IntegrationResponse = Integration;
