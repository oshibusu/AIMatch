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

    // Load environment variables (Edge Functions本番環境ではdotenv不要)
    await import('https://deno.land/x/dotenv@v3.2.2/load.ts');
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    console.log('Check grokApiKey:', grokApiKey);
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
    
    /**
     * [★ 重要 ★]
     * "必ず(1)、(2)、(3)...の番号をつけて出力してください" と明記し、
     * split(/\(\d+\)/) で分割しやすい形式にしてもらう
     */
    let userPrompt = `
あなたは20代後半の男性です。マッチングアプリで気になる相手とチャットをしています。
以下の条件で、自然な返信メッセージを(1)～(5)の形式で5つ考えてください。

【形式】
(1) メッセージ例1
(2) メッセージ例2
...のように番号をカッコ付きで必ず書いてください。他の形式にはしないでください。

【トーン】
- ${toneType}${isInformal ? '（タメ口で話してください）' : ''}

【目的】
- ${purpose}
- この目的に従ってメッセージを生成しなさい 

【OCRテキスト】
${recognizedText || ''}

【重要な注意点】
あなたは恋愛コーチングのエキスパートです。
- マッチングアプリの会話を円滑に進めるプロとして、魅力的かつ自然なメッセージを考案します
- 基本的に、相手のメッセージにしっかり寄り添いなさい
- 若者言葉を適度に使用しなさい
- 絵文字はあまり使用せず、言葉で感情を表現してください
- 相手の話題や文脈、興味に合わせて、前向きな印象を与える返信ができます
- 文脈を理解して適切な返答ができます
- フランクまたは普通のトーンの場合は必ずタメ口を使用し、「です・ます」ではなく「だよ・だね」などのカジュアルな表現を使ってください
- ‘プライベートを侵害するような質問’や‘過度に踏み込みすぎる話題’は絶対に提案しません
- 読み手が次に返しやすい内容・質問を含めることを推奨します」
- 箇条書きはしないでください
- 基本的に、各返信は以下の異なる視点から考えてください：
    1つ目：相手の話に共感しながら、自分の感想を伝える
    2つ目：相手の話に関連付けて話を展開する
    3つ目：自分の似たような経験や考えを共有しつつ、相手の話に寄り添う
    4つ目：相手の興味や活動に関連した新しい提案や可能性について触れる
    5つ目：相手の話から派生した質問を投げかけ、会話を広げる
- 過度に馴れ馴れしくならないよう節度を保ちつつ、友だちにアドバイスをする感覚でメッセージ案を提案します
- "(笑)"も"笑"も使わないでください
- 自慢話はしません
- 相手の意図や行動を否定しません。ネガティブな言葉を使いません。
- 必ずユーザーが指定するトーン（フランク／普通／丁寧など）に合った口調を使用します
- ユーザーが希望するtoneが"Humorous"やユーモラスな場合は、ジョークを混ぜて面白い返信をします
- ユーザーが希望するtoneがformalや丁寧な場合は、落ち着いて品のある雰囲気で、相手との距離感に配慮したメッセージ案を提案してください
- 押しつけがましくない、自然な会話を心がけます`;

;

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

    // [★ 分割処理 ★]
    // (1) ... (2) ... (3) ... となっているテキストを split(/\(\d+\)/) する
    const rawOutput: string = completion.choices[0].message.content;

    const generatedMessages = rawOutput
      .split(/\(\d+\)/)           // 例: "(1)"や"(2)"を区切りに分割
      .map((m: string) => m.trim())
      .filter((m: string) => m);  // 空要素排除

    // Edge Functionが返すJSON
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
