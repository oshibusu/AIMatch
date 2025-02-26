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
  textLength: number; // 追加: 50, 100, 150 のいずれか
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

  let requestData;
  try {
    requestData = await req.json() as RequestBody;
    const { recognizedText, tone, useDeepseek, textLength } = requestData;

    // textLengthから生成する文数を決定
    const sentenceCount = textLength === 50 ? 1 : textLength === 100 ? 2 : 3;

    // Load environment variables (Edge Functions本番環境ではdotenv不要)
    await import('https://deno.land/x/dotenv@v3.2.2/load.ts');
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    console.log('Check grokApiKey:', grokApiKey);
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!grokApiKey || !deepseekApiKey) {
      throw new Error('必要な環境変数が設定されていません');
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
以下の条件で、自然な返信メッセージを(1)～(5)の形式で5つ考えてください。

【形式】
(1) メッセージ例1
(2) メッセージ例2
...のように番号をカッコ付きで必ず書いてください。他の形式にはしないでください。

【トーンの指定】
・あなたの口調は「${toneType}${isInformal ? '（タメ口で話してください）' : ''}」です。  
　例：  
　- "frank"（タメ口、カジュアルな表現。例：「～だよ」「～だね」）  絶対に"だよな"を使うな
　- "normal"（ややフランク、砕けた口調）  
　- "formal"（敬語、丁寧な表現）  
　- "humorous"（適度にジョークを交えた、面白い表現） 

【文量の指定】
・あなたの生成するメッセージの文量は、${sentenceCount}文にしろ、必ず守れ。

【目的の指定】
・今回の返信の目的は「${purpose}」です。これに従ってメッセージを生成しなさい 
　- "greeting"：必ず"こんにちは"か"はじめまして"などの丁寧な挨拶を行いなさい。また、挨拶として、相手に親しみを感じさせることを言いなさい。5個のメッセージにおいて挨拶の表現は変えなさい。絶対にデートの提案をしてはいけない
　- "date"：デートに誘う、またはデートの約束を進める
　- "chat"：日常会話を続け、共感や話題の拡げを狙う。デートの誘いは基本的にしてはいけない

【OCRテキスト】
${recognizedText || ''}

【重要な注意点】
あなたは恋愛コーチングのエキスパートです。
- マッチングアプリの会話を円滑に進めるプロとして、魅力的かつ自然なメッセージを考案します
- 基本的に、相手のメッセージにしっかり寄り添いなさい
- 句点はなるべく使わないようにしなさい
- 若者言葉を適度に使用しなさい
- 絵文字はあまり使用せず、言葉で感情を表現してください
- 相手の話題や文脈、興味に合わせて、前向きな印象を与える返信ができます
- 文脈を理解して適切な返答ができます
- フランクまたは普通のトーンの場合は必ずタメ口を使用し、「です・ます」ではなく「だよ・だね」などのカジュアルな表現を使ってください
- ‘プライベートを侵害するような質問’や‘過度に踏み込みすぎる話題’は絶対に提案しません
- 読み手が次に返しやすい内容・質問を含めることを推奨します
- 箇条書きはしないでください
- 基本的に、各返信は以下の異なる視点から考え、異なる表現を取るようにしてください：
    5個の表現全てで、文頭を変える様にしなさい。挨拶は"こんにちは"か"はじめまして"などの丁寧な挨拶を行いなさい。また、挨拶として、相手に親しみを感じさせることを言いなさい。絶対にデートの提案をしてはいけない
    必ず相手の名前には"さん"付けすること
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
- 押しつけがましくない、自然な会話を心がけます
- エクスクラメーションマークは2回までしか使ってはいけない
`;

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ];

    const grokClient = new GrokClient(grokApiKey);
    const deepseekClient = new DeepseekClient(deepseekApiKey);

    let completion: AIResponse | null = null;
    let usedModel = 'Grok';  // デフォルトでGrokを使用

    try {
      console.log('Attempting to generate messages with Grok...');
      completion = await grokClient.createChatCompletion(messages);
    } catch (err) {
      console.error('Grok API error:', err);
      try {
        console.log('Grok failed, falling back to Deepseek...');
        completion = await deepseekClient.createChatCompletion(messages);
        usedModel = 'Deepseek';
      } catch (deepseekErr) {
        console.error('Deepseek API error:', deepseekErr);
        throw new Error('Both Grok and Deepseek failed to generate messages');
      }
    }

    if (!completion) {
      throw new Error('Failed to generate messages with both models');
    }

    const rawOutput: string = completion.choices[0].message.content;

    const generatedMessages = rawOutput
      .split(/\(\d+\)/)
      .map((m: string) => m.trim())
      .filter((m: string) => m);

    console.log('Messages generated successfully:', {
      count: generatedMessages.length,
      tone: requestData.tone,
      model: usedModel,
      timestamp: new Date().toISOString(),
      firstMessagePreview: generatedMessages[0]?.substring(0, 50) + '...',
      recognizedTextPreview: recognizedText?.substring(0, 50) + '...'
    });

    const response: SuccessResponse = { messages: generatedMessages };
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Message generation failed:', {
      error: error.message,
      tone: requestData?.tone,
      timestamp: new Date().toISOString(),
      recognizedTextPreview: requestData?.recognizedText?.substring(0, 50) + '...',
      modelAttempted: requestData?.useDeepseek ? 'Deepseek' : 'Grok',
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
