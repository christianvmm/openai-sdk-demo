import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { MessagesPage } from 'openai/resources/beta/threads/messages.mjs'
import { AssistantSession } from '@/utils/assistant-session'
import { enqueue } from '@/app/api/process-message/enqueue'

export async function POST(req: Request) {
  const { assistantId, threadId, content } = await req.json()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      await enqueue(threadId, async () => {
        try {
          const session = new AssistantSession(assistantId, threadId).addActions(LOCAL_FUNCTIONS)
          await session.addUserMessage(content)

          for await (const msgs of session.startRun()) {
            const strings = messagesToStrings(msgs)
            for (const str of strings) {
              controller.enqueue(encoder.encode(str + '\n'))
            }
          }
        } catch (err) {
          console.error(err)
        } finally {
          controller.close()
        }
      })
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}

const LOCAL_FUNCTIONS: Record<string, (props: unknown) => Promise<string>> = {
  transferToArea: async (props: unknown) => {
    try {
      const data = z
        .object({
          area: z.string(),
        })
        .parse(props)

      console.log('ACTION: Ejecutando transferToArea...', data)

      return `Transferido al área ${data.area}`
    } catch {
      return 'No se pudo transferir'
    }
  },
}

// function printMessages(messages: MessagesPage['data'] | null) {
//   console.log('NUEVOS MENSAJES GENERADOS:')

//   for (const message of messages || []) {
//     for (const content of message.content) {
//       if (content.type === 'text') {
//         console.log(content.text.value)
//       }
//     }
//   }

//   console.log('-----------')
// }

function messagesToStrings(messages: MessagesPage['data'] | null): string[] {
  const strings = []

  for (const message of messages || []) {
    for (const content of message.content) {
      if (content.type === 'text') {
        strings.push(content.text.value)
      }
    }
  }

  return strings
}
