import { useMutation } from "@tanstack/react-query";
import { api, type CreateSubscriberInput, type SubscriberResponse } from "@shared/routes";
import { z } from "zod";

export function useCreateSubscriber() {
  return useMutation({
    mutationFn: async (data: CreateSubscriberInput): Promise<SubscriberResponse> => {
      // Validate input using the shared schema before sending
      const validated = api.subscribers.create.input.parse(data);
      
      const res = await fetch(api.subscribers.create.path, {
        method: api.subscribers.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const error = api.subscribers.create.responses[409].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 400) {
          const error = api.subscribers.create.responses[400].parse(await res.json());
          throw new Error(error.message || "Invalid email address");
        }
        throw new Error('Failed to subscribe. Please try again later.');
      }

      return api.subscribers.create.responses[201].parse(await res.json());
    },
  });
}
