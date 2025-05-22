export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 5; i++) {
        await new Promise((res) => setTimeout(res, 1000))
        controller.enqueue(encoder.encode(`chunk ${i}\n`))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked', // Optional; some clients auto-detect
    },
  })
}
