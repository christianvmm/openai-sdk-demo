import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { MessagesPage } from 'openai/resources/beta/threads/messages.mjs'
import { AssistantSession } from '@/utils/assistant-session'

export async function POST(req: Request) {
  /**
   * TODO: cannot execute multiple runs on the same thread :/
   * 
   * OpenAI can't process paralel executions by itself
   * 
   * I have to put the executions on a queue or something
   */
  const { assistantId, content } = await req.json()
  const threadId = 'thread_XBIFTKNggRbEAWNRKE0i4lv8'

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const session = new AssistantSession(assistantId, threadId).addActions(LOCAL_FUNCTIONS)
        await session.addUserMessage(content)

        for await (const msgs of session.startRun()) {
          printMessages(msgs)

          const strings = messagesToStrings(msgs)

          for (const str of strings) {
            controller.enqueue(encoder.encode(str + '\n')) // Stream one message at a time
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log('Run already started...', err.message)
        }
      } finally {
        controller.close()
      }
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

function printMessages(messages: MessagesPage['data'] | null) {
  console.log('NUEVOS MENSAJES GENERADOS:')

  for (const message of messages || []) {
    for (const content of message.content) {
      if (content.type === 'text') {
        console.log(content.text.value)
      }
    }
  }

  console.log('-----------')
}

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
