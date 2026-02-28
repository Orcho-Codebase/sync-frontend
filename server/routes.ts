import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.integrations.list.path, async (req, res) => {
    const data = await storage.getIntegrations();
    res.status(200).json(data);
  });

  app.post(api.integrations.create.path, async (req, res) => {
    try {
      const input = api.integrations.create.input.parse(req.body);
      const data = await storage.createIntegration(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
