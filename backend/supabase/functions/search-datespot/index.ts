// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  query: string;
  userId: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
  details: {
    cause: string;
    stack: string;
  };
}

interface SuccessResponse {
  answer: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json() as RequestBody;
    const { query, userId, timestamp } = body;

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!perplexityApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('必要な環境変数が設定されていません');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Sending query to Perplexity API:', query);

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": `Bearer ${perplexityApiKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant specializing in recommending date spots in Japan.
              Rules:
              1. Provide a structured response with a clear title and detailed description.
              2. Do not include any explanation of your thought process.
              3. Format your response with a title on the first line, followed by a detailed description.
              4. Use line breaks to separate paragraphs for better readability.

              Response Format:
              1. First line: A catchy title or name of the recommended spot/activity
              2. Following paragraphs: Detailed description including:
                 - What makes this spot special
                 - Atmosphere and ambiance
                 - What couples can do there
                 - Best time to visit
                 - Any special tips
              3. If suggesting multiple options, separate each with two newlines.
              
              Example:
              渋谷スカイ - 都会の夜景を一望できるロマンチックスポット
              
              渋谷スクランブルスクエアの最上階にある展望施設で、東京の壮大な夜景を360度見渡せます。特に日没後は、キラキラと輝く都会の灯りが広がり、ロマンチックな雰囲気が漂います。
              
              カフェやバーも併設されているので、ドリンクを片手にゆっくりと景色を楽しむことができます。写真スポットも多く、思い出に残るデートになるでしょう。
              
              混雑を避けるなら平日の夕方がおすすめです。事前予約すると入場がスムーズです。`
          },
          {
            role: "user",
            content: query
          }
        ]
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.statusText}`);
    }

    const perplexityResult = await perplexityResponse.json();
    console.log(JSON.stringify(perplexityResult, null, 2));

    // ここで Perplexity のレスポンスから content を取り出す
    const answer = perplexityResult?.choices?.[0]?.message?.content;
    if (!answer) {
      throw new Error('Perplexity API のレスポンスに回答が含まれていません');
    }

    console.log('Received answer from Perplexity:', answer.slice(0, 50), '...');

    // フロントエンドへ返すレスポンス
    const responseData: SuccessResponse = { answer };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
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
