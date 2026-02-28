import { db } from "./db";
import {
  integrations,
  type IntegrationResponse,
  type InsertIntegration
} from "@shared/schema";

export interface IStorage {
  getIntegrations(): Promise<IntegrationResponse[]>;
  createIntegration(integration: InsertIntegration): Promise<IntegrationResponse>;
}

export class DatabaseStorage implements IStorage {
  async getIntegrations(): Promise<IntegrationResponse[]> {
    return await db.select().from(integrations);
  }

  async createIntegration(integration: InsertIntegration): Promise<IntegrationResponse> {
    const [created] = await db.insert(integrations)
      .values(integration)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
