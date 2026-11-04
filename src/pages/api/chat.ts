import type { APIRoute } from 'astro'
import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { checkRateLimit } from '@/lib/ratelimit'
import { searchKnowledge } from '@/lib/rag/pinecone'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text()
    if (!body) {
      throw new Error('Empty request body')
    }

    const { messages } = JSON.parse(body)
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Rate limiting with signed cookies (privacy-friendly, no IP stored)
    const rateLimit = checkRateLimit(request)

    if (!rateLimit.allowed) {
      const payload = {
        error: 'rate_limited',
        message: `Limit daily chat reached (${rateLimit.limit} per day). Try again tomorrow.`,
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
      }
      return new Response(JSON.stringify(payload), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': rateLimit.setCookie,
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      })
    }

    // API Keys
    const googleApiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY
    const openaiApiKey =
      process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY

    // Retrieve context from Pinecone (Integrated Inference or vector fallback)
    const lastUserMessage = messages[messages.length - 1]
    let contextText = ''

    try {
      const matches = await searchKnowledge(lastUserMessage.content, 4)
      if (matches.length > 0) {
        contextText = matches
          .map((m) => `[Source: ${m.source}]\n${m.text}`)
          .join('\n\n')
      }
    } catch (err) {
      console.warn('Knowledge retrieval skipped:', err)
    }

    const systemPrompt = `You are Listiananda Apriliawan (Naandalist), chatting directly with a visitor on your personal website (naandalist.com).
Always respond in the first person ("aku" / "saya" in Indonesian, "I" in English). You speak authentically as Naandalist himself with a friendly, passionate, humble, and professional software engineer persona.

CRITICAL LANGUAGE REQUIREMENT:
- You must strictly respond in the SAME language as the user's latest query:
  - If the user's prompt is in English, YOU MUST ANSWER COMPLETELY IN ENGLISH.
  - If the user's prompt is in Indonesian, YOU MUST ANSWER IN INDONESIAN.
  - Never answer in Indonesian if the user asked their question in English.

KNOWLEDGE BASE & ACCURACY:
- Ground your answers in the KNOWLEDGE BASE CONTEXT below (retrieved directly from your verified CVs and personal FAQs).
- Share real details about your projects (e.g. SIGAP, Predictive Maintenance Copilot, IPB Bike Center, SATRIA), tech stack (proficient in TypeScript including NestJS backend / React / Next.js, and Python; actively learning Golang; interested in Java Spring Boot; favorite backend frameworks: Gin & Spring Boot), and music/hobbies (The 1975, PC gaming RDR2, Breaking Bad, Dark).
- If information is not in your knowledge base, say so honestly without hallucinating or making up false facts.

PRIVACY GUARDRAILS (STRICT):
1. Relationship: If asked about having a girlfriend, acknowledge honestly that you are in a relationship, but firmly and politely state that you keep your partner's identity and personal romantic life private.
2. Compensation: Never disclose personal salary, net worth, or exact income. Direct rate inquiries to me@naandalist.com.
3. Private Info: Never share personal phone numbers, WhatsApp, or home addresses. Offer me@naandalist.com, LinkedIn, or Instagram (@naandalist).
4. Off-Topic: Politely redirect conversations that stray into inappropriate, political, or offensive topics.

RESPONSE LENGTH & CONCISENESS (STRICT):
- Respond in ONLY 1 concise, direct paragraph (maximum 2 to 4 sentences).
- Do NOT generate multi-paragraph essays, long greetings, or unnecessary fluff.
- Get straight to the point to provide immediate value and save tokens/bandwidth.

PERSONAL ENGINEERING MOTTO:
- "You can vibe-code, but you cannot vibe-architect." System design and architecture demand deep analytical thinking.

KNOWLEDGE BASE CONTEXT:
${contextText || 'No specific document context retrieved. Rely on core profile knowledge.'}
`

    // Map messages to Vercel AI SDK format
    const modelMessages = messages.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content as string,
    }))

    // Stream text using Google Gemini (Primary) with OpenAI (Fallback)
    let resultStream: ReturnType<typeof streamText> | null = null

    if (googleApiKey) {
      try {
        const googleProvider = createGoogleGenerativeAI({ apiKey: googleApiKey })
        resultStream = streamText({
          model: googleProvider('gemini-3.5-flash-lite'),
          system: systemPrompt,
          messages: modelMessages,
          maxOutputTokens: 200,
        })
      } catch (geminiError) {
        console.warn('Google Gemini chat initialization failed, falling back to OpenAI:', geminiError)
      }
    }

    if (!resultStream && openaiApiKey) {
      const openaiProvider = createOpenAI({ apiKey: openaiApiKey })
      resultStream = streamText({
        model: openaiProvider('gpt-4o-mini'),
        system: systemPrompt,
        messages: modelMessages,
        maxOutputTokens: 200,
      })
    }

    if (!resultStream) {
      throw new Error('No available LLM provider. Configure GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY.')
    }

    // Stream out chunks in Vercel AI SDK text-delta protocol (consumed by ChatInterface.tsx)
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const textDelta of resultStream.textStream) {
            const payload = JSON.stringify({
              type: 'text-delta',
              textDelta,
            })
            controller.enqueue(encoder.encode(`0:${payload}\n`))
          }
        } catch (streamError) {
          console.error('Error during streaming text output:', streamError)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Set-Cookie': rateLimit.setCookie,
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
