// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { GrokClient } from "./grok-client.ts";
import { DeepseekClient } from "./deepseek-client.ts";
import type { AIResponse } from "./types.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  recognizedText?: string;
  tone: {
    formalityLevel: number;
    friendlinessLevel: number;
    humorLevel: number;
  };
  useDeepseek?: boolean;
}

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  messages: string[];
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `あなたは恋愛コーチングのエキスパートです。
(既存の長いガイドラインをここに)
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { recognizedText, tone, useDeepseek } = await req.json() as RequestBody;

    // Load environment variables
    await import('https://deno.land/x/dotenv@v3.2.2/load.ts');
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!grokApiKey || !deepseekApiKey) {
      throw new Error('API keys are not set in .env file');
    }

    // toneを解釈
    let toneType = 'normal';
    if (tone.formalityLevel === 1) toneType = 'frank';
    else if (tone.formalityLevel === 3) toneType = 'formal';
    if (tone.humorLevel === 3) toneType = 'humorous';

    // friendlinessLevelからpurposeを推定
    let purpose = 'chat';
    if (tone.friendlinessLevel === 2) purpose = 'greeting';
    else if (tone.friendlinessLevel === 3) purpose = 'date';

    // Chat用のプロンプト
    const isInformal = toneType === 'frank' || toneType === 'normal';
    let userPrompt = `
あなたは20代後半の男性です。マッチングアプリで気になる相手とチャットをしています。
以下の条件で、自然な返信メッセージを5つ考えてください。

【メッセージの条件】
- トーン: ${toneType}${isInformal ? '（タメ口で話してください）' : ''}
- 目的: ${purpose}

OCRテキスト: 
${recognizedText || ''}

【重要な注意点】
(既存のルールをここに追記)
`;

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ];

    const grokClient = new GrokClient(grokApiKey);
    const deepseekClient = new DeepseekClient(deepseekApiKey);

    let completion;
    try {
      if (!useDeepseek) {
        // Grok優先
        completion = await grokClient.createChatCompletion(messages);
      }
    } catch (err) {
      console.error('Grok API error:', err);
    }

    // Grokがエラー、またはuseDeepseekがtrueならDeepseekを呼ぶ
    if (!completion) {
      completion = await deepseekClient.createChatCompletion(messages);
    }

    if (!completion) {
      throw new Error('Failed to generate messages with both Grok and Deepseek');
    }

    const generatedMessages = completion.choices[0].message.content
      .split(/\(\d+\)/)
      .map((m: string) => m.trim())
      .filter((m: string) => m);

    const response: SuccessResponse = { messages: generatedMessages };
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
