import { apiRequest } from './api';

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatApiResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  } | null;
  provider: string;
}

export async function sendAIChatMessage(
  message: string,
  history: ChatHistoryItem[]
): Promise<ChatApiResponse> {
  return apiRequest<ChatApiResponse>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      history,
    }),
  });
}
