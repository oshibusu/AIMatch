// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  image: string;    // Base64エンコード済みの画像データ
  userId: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
  details: {
    cause: string;
    stack: string;
  }
}

interface SuccessResponse {
  partnerId: string;          // partnersテーブルの partner_id
  recognizedText: string;     // OCR結果
  screenType: 'profile' | 'dm';
  partnerName: string;
}

/**
 * SCREEN_TYPE_PROMPT:
 *  - 次のテキストがプロフィール画面かDM画面かをJSON形式で出力してもらう
 *  - 必ず {"type": "profile"} または {"type": "dm"} のように返すことを要求
 */
const SCREEN_TYPE_PROMPT = `
あなたはJSONのみを出力する画面タイプ判定APIです。
与えられたテキストを解析し、プロフィール画面かDM画面かを判定して、必ず以下の形式のJSONのみを出力してください。
前後に説明文や余計な空白を含めないでください。

必須ルール:
1. 出力は {"type": "profile"} または {"type": "dm"} のみ
2. 前後に説明文を含めない
3. 改行を含めない
4. 空白を含めない

判定基準:
- プロフィール画面: 年齢、趣味、自己紹介などの情報が含まれる
- DM画面: 会話のやり取りが含まれる

テキスト:
`;

/**
 * PARTNER_NAME_PROMPT:
 *  - 次のテキストから相手の名前を抽出し、JSONで返すことを要求
 *  - 不明な場合 {"name": "不明さん"} と返す
 */
const PARTNER_NAME_PROMPT = `
あなたはJSONのみを出力する名前抽出APIです。
与えられたテキストから相手の名前を抽出し、必ず以下の形式のJSONのみを出力してください。
前後に説明文や余計な空白を含めないでください。

必須ルール:
1. 出力は {"name": "抽出した名前"} の形式のみ
2. 前後に説明文を含めない
3. 改行を含めない
4. 空白を含めない

テキスト:ユーザーの名前は、基本的に画面上部or左上にある。そこから抽出しなさい 
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    // CORSプリフライトリクエストへの応答
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // リクエストBodyのパース
    const body = await req.json() as RequestBody;
    const { image, userId, timestamp } = body;
    
    // --- 環境変数読み込み（ローカルテスト時のみ） ---
    // Edge Functions本番環境ではSupabaseダッシュボードで設定し、dotenvの読み込みは削除推奨
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!geminiApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing environment variables:', {
        hasGeminiKey: !!geminiApiKey,
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRoleKey: !!supabaseServiceRoleKey
      });
      throw new Error('必要な環境変数が設定されていません');
    }

    // --- Supabaseクライアント初期化 ---
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // --- Geminiクライアント初期化 ---
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-1.5-pro',
      generationConfig: {
        temperature: 0.1,  // temperatureを0.1に設定（0に近いほど決定論的）
        topP: 0.1,        // より確実な選択のために低く設定
        topK: 1,          // 最も確実な選択のみを使用
      }
    });

    console.log('Performing OCR...');
    // 画像のOCR: 画像データを inlineData で渡し、「Caption this image.」とだけ指示
    const ocrResult = await model.generateContent([
      {
        inlineData: {
          data: image,       // すでにBase64でエンコード済みの文字列
          mimeType: "image/jpeg", // 実際の画像形式に合わせて指定(例: "image/png")
        },
      },
      'Caption this image.',
    ]);
    const ocrResp = await ocrResult.response;
    const recognizedText = await ocrResp.text();
    console.log('OCR completed:', recognizedText.slice(0, 50), '...');

    // --- 画面種類を推定: JSONで "profile" か "dm" を返すようプロンプト ---
    const screenTypeReq = await model.generateContent([
      SCREEN_TYPE_PROMPT + recognizedText
    ]);
    const screenTypeResp = await screenTypeReq.response;
    const screenTypeStr = await screenTypeResp.text();

    let screenType: 'profile' | 'dm' = 'dm';
    try {
      // JSON形式を期待
      const parsed = JSON.parse(screenTypeStr);
      if (parsed.type === 'profile') {
        screenType = 'profile';
      } else if (parsed.type === 'dm') {
        screenType = 'dm';
      } else {
        console.warn('screenType JSONが "profile" でも "dm" でもありませんでした。dm扱いにします。');
      }
    } catch (e) {
      console.warn('Failed to parse screenType as JSON. Default to dm.');
    }

    // --- 相手名を抽出: JSONで "name" を返すようプロンプト ---
    const partnerNameReq = await model.generateContent([
      PARTNER_NAME_PROMPT + recognizedText
    ]);
    const partnerNameResp = await partnerNameReq.response;
    const partnerNameStr = await partnerNameResp.text();

    let partnerName = '不明さん';
    try {
      // JSON形式を期待
      const parsedName = JSON.parse(partnerNameStr);
      if (parsedName.name) {
        partnerName = parsedName.name;
      }
    } catch (e) {
      console.warn('Failed to parse partnerName as JSON. Using 不明さん.');
    }

    // --- partnersテーブルで相手を検索 or 新規作成 ---
    // ここで maybeSingle() に変更して、0件/複数件でもerror扱いしないようにする
    const { data: existingPartner, error: searchError } = await supabase
      .from('partners')
      .select('partner_id, partner_name')
      .eq('user_id', userId)
      .eq('partner_name', partnerName)
      .maybeSingle();  // <= 変更

    if (searchError) {
      // 明らかなSQLエラー等があれば処理中断
      console.error('Error searching partner:', searchError);
      throw searchError;
    }

    let partnerId: string;
    // existingPartner が null ならレコードなし
    if (existingPartner) {
      partnerId = existingPartner.partner_id;
    } else {
      // 0件だった場合は新規作成する
      const { data: newPartner, error: insertError } = await supabase
        .from('partners')
        .insert([
          {
            user_id: userId,
            partner_name: partnerName,
            created_at: timestamp
          }
        ])
        .select()
        .single(); // 新規作成は必ず1件返る想定なので single() を使用
      if (insertError) throw insertError;
      partnerId = newPartner.partner_id;
    }

    // --- OCR結果をprofiles/messagesに保存 ---
    if (screenType === 'profile') {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            partner_id: partnerId,
            recognized_text: recognizedText,
            created_at: timestamp
          }
        ]);
      if (profileError) throw profileError;
    } else {
      // dm の場合
      const { error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            partner_id: partnerId,
            recognized_text: recognizedText,
            created_at: timestamp
          }
        ]);
      if (messageError) throw messageError;
    }

    // --- 最終レスポンス ---
    const responseData: SuccessResponse = {
      partnerId,
      recognizedText,
      screenType,
      partnerName,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // 例外発生時の処理
    console.error('Error processing request:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });

    const errorResponse: ErrorResponse = {
      error: error.message,
      details: {
        cause: error.cause,
        stack: error.stack
      }
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
