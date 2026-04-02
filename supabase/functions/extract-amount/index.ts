import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-20240307',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'This is a receipt or invoice. Extract the TOTAL amount to pay. Return ONLY the number without currency symbols, commas or spaces. For example: 1234.50 or 850. If you cannot find a total, return null.',
            },
          ],
        },
      ],
    })

    const raw = message.content[0]?.type === 'text' ? message.content[0].text.trim() : null
    const monto = raw && raw !== 'null' ? parseFloat(raw.replace(/[^0-9.]/g, '')) : null

    return new Response(JSON.stringify({ monto: isNaN(monto) ? null : monto }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
