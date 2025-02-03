// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  image: string;    // Base64
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
  partnerId: string;
  recognizedText: string;
  screenType: 'profile' | 'dm';
  partnerName: string;
}

const SCREEN_TYPE_PROMPT = `... (既存の判定プロンプト) ...`;
const PARTNER_NAME_PROMPT = `... (既存の相手名抽出プロンプト) ...`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json() as RequestBody;
    const { image, userId, timestamp } = body;
    
    // load .env
    await import('https://deno.land/x/dotenv@v3.2.2/load.ts');
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

    // Supabaseクライアント
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // GeminiでOCR
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    console.log('Performing OCR...');
    const ocrResult = await model.generateContent([image]);
    const ocrResp = await ocrResult.response;
    const recognizedText = await ocrResp.text();
    console.log('OCR completed:', recognizedText.slice(0, 50), '...');

    // 画面種類を推定
    const screenTypeReq = await model.generateContent([SCREEN_TYPE_PROMPT, recognizedText]);
    const screenTypeResp = await screenTypeReq.response;
    const screenTypeStr = await screenTypeResp.text();
    let screenType: 'profile' | 'dm' = 'dm';
    try {
      const parsed = JSON.parse(screenTypeStr);
      screenType = parsed.type as 'profile' | 'dm';
    } catch (e) {
      console.warn('Failed to parse screenType. Default to dm.');
    }

    // 相手名を抽出
    const partnerNameReq = await model.generateContent([PARTNER_NAME_PROMPT, recognizedText]);
    const partnerNameResp = await partnerNameReq.response;
    const partnerNameStr = await partnerNameResp.text();
    let partnerName = '不明さん';
    try {
      const parsedName = JSON.parse(partnerNameStr);
      partnerName = parsedName.name || '不明さん';
    } catch (e) {
      console.warn('Failed to parse partnerName. Using 不明さん.');
    }

    // partners テーブルで相手を検索 or 新規作成
    const { data: existingPartner, error: searchError } = await supabase
      .from('partners')
      .select('partner_id, partner_name')
      .eq('user_id', userId)
      .eq('partner_name', partnerName)
      .single();

    if (searchError && searchError.details !== 'No rows returned') {
      console.error('Error searching partner:', searchError);
      throw searchError;
    }

    let partnerId: string;
    if (existingPartner) {
      partnerId = existingPartner.partner_id;
    } else {
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
        .single();
      if (insertError) throw insertError;
      partnerId = newPartner.partner_id;
    }

    // OCR結果をprofiles/messagesに保存
    if (screenType === 'profile') {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ partner_id: partnerId, recognized_text: recognizedText, created_at: timestamp }]);
      if (profileError) throw profileError;
    } else {
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{ partner_id: partnerId, recognized_text: recognizedText, created_at: timestamp }]);
      if (messageError) throw messageError;
    }

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
    console.error('Error processing request:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({
        error: error.message,
        details: {
          cause: error.cause,
          stack: error.stack
        }
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
