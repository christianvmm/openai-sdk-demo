import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function GET() {
  const openai = new OpenAI()
  const openaiStream = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      {
        role: 'user',
        content: "Say 'double bubble bath' ten times fast.",
      },
    ],
    stream: true,
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of openaiStream) {
        const content = chunk.choices?.[0]?.delta?.content || ''
        controller.enqueue(encoder.encode(content))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
      Connection: 'keep-alive',
    },
  })
}
