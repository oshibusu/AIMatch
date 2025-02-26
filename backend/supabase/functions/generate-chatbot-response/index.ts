// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { OpenAIClient } from "./openai-client.ts";
import type { AIResponse } from "../generate-messages/types.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  userMessage: string;
  partnerName: string;
  profileInfo: string;
  conversationHistory: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `あなたはマッチングアプリユーザーの多目的アシスタントです。
ユーザーの質問や悩みに対して、柔軟かつ簡潔に応答してください。

以下のガイドラインに従ってください：
1. ユーザーの質問内容に合わせて柔軟に対応する
2. 応答は簡潔にし、必要最小限の情報を提供する（長文は避ける）
3. マッチングアプリに関する質問には具体的なアドバイスを提供する
4. 一般的な質問には直接回答する
5. 相手のプロフィール情報や会話履歴は参考程度に留め、過度な分析は避ける
6. 常に親しみやすく自然な会話を心がける

重要：応答は3-4文程度の簡潔な内容にとどめ、箇条書きや長いリストは避けてください。
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let requestData;
  try {
    requestData = await req.json() as RequestBody;
    const { userMessage, partnerName, profileInfo, conversationHistory } = requestData;

    // Load environment variables
    await import('https://deno.land/x/dotenv@v3.2.2/load.ts');
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY環境変数が設定されていません');
    }

    // ユーザープロンプトの作成
    let userPrompt = `
【ユーザーの質問】
${userMessage}

【参考情報】
相手の名前: ${partnerName}
プロフィール: ${profileInfo || '情報なし'}
過去の会話: ${conversationHistory || '情報なし'}

上記を踏まえて、ユーザーの質問に直接答えてください。マッチングアプリに関する質問であれば適切なアドバイスを、一般的な質問であれば直接回答を提供してください。

重要: 回答は3-4文程度の簡潔な内容にし、箇条書きは避けてください。自然な会話のように応答してください。
`;

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ];

    const openaiClient = new OpenAIClient(openaiApiKey);

    try {
      console.log('Generating chatbot response with OpenAI...');
      const completion = await openaiClient.createChatCompletion(messages);
      
      if (!completion || !completion.choices || !completion.choices[0]) {
        throw new Error('OpenAI API returned invalid response');
      }
      
      const response = completion.choices[0].message.content;

      console.log('Chatbot response generated successfully:', {
        model: completion.model || 'gpt-4o',
        timestamp: new Date().toISOString(),
        responsePreview: response.substring(0, 50) + '...',
      });

      return new Response(JSON.stringify({ response }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      throw new Error(`OpenAI API error: ${apiError.message}`);
    }

  } catch (error) {
    console.error('Chatbot response generation failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});