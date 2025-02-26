import type { AIClient, AIResponse } from "./types.d.ts";

export class GrokClient implements AIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.x.ai/v1";  
  }

  async createChatCompletion(messages: Array<{ role: string; content: string }>): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages,
          temperature: 0.9,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grok API error: ${response.status} - ${response.statusText}\n${errorText}`);
      }

      const data: AIResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Grok API request failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}