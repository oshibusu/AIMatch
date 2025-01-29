import type { AIClient, AIResponse } from "./types.d.ts";

export class DeepseekClient implements AIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.deepseek.com/v1";
  }

  async createChatCompletion(messages: Array<{ role: string; content: string }>): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`Deepseek API error: ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}