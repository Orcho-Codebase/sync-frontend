import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertIntegration, IntegrationResponse } from "@shared/schema";

export function useIntegrations() {
  return useQuery({
    queryKey: [api.integrations.list.path],
    queryFn: async (): Promise<IntegrationResponse[]> => {
      const res = await fetch(api.integrations.list.path, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch integrations");
      }
      const data = await res.json();
      return api.integrations.list.responses[200].parse(data);
    },
  });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertIntegration): Promise<IntegrationResponse> => {
      // Validate input data before sending
      const validated = api.integrations.create.input.parse(data);
      
      const res = await fetch(api.integrations.create.path, {
        method: api.integrations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create integration");
      }
      
      const responseData = await res.json();
      return api.integrations.create.responses[201].parse(responseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.integrations.list.path] });
    },
  });
}
