import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const API_KEY = Deno.env.get('UPSTAGE_API_KEY')
    if (!API_KEY) {
      throw new Error('UPSTAGE_API_KEY is not set')
    }

    const formData = await req.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      throw new Error('No image file provided')
    }

    // Step 1: OCR - Extract text from image
    const ocrFormData = new FormData()
    ocrFormData.append('document', imageFile)
    ocrFormData.append('model', 'ocr')

    const ocrResponse = await fetch('https://api.upstage.ai/v1/document-digitization', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: ocrFormData,
    })

    const ocrResult = await ocrResponse.json()
    const extractedText = ocrResult.text || ''

    // Step 2: AI Analysis using Solar Pro2
    const aiResponse = await fetch('https://api.upstage.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'solar-pro2',
        messages: [
          {
            role: 'user',
            content: `You are an AI assistant that helps users solve electric vehicle (EV) charger issues. 
The following text was extracted from a photo of an EV charger error or manual:

"""${extractedText}"""

Identify the issue, summarize it, and suggest an actionable solution in Korean.
If possible, include the specific cause (if mentioned) and suggest the next steps.
Format your response in a clear, user-friendly way with:
1. 오류 요약 (Error Summary)
2. 원인 분석 (Cause Analysis) 
3. 해결 방법 (Solution Steps)
4. 추가 조치 (Additional Actions if needed)`
          }
        ],
        stream: false
      }),
    })

    const aiResult = await aiResponse.json()
    const solution = aiResult.choices?.[0]?.message?.content || '분석 결과를 가져올 수 없습니다.'

    return new Response(
      JSON.stringify({
        success: true,
        extractedText,
        solution,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})