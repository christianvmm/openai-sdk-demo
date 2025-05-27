'use server'

import { z } from 'zod'
import { AssistantSession } from '@/utils/assistant-session'
import { MessagesPage } from 'openai/resources/beta/threads/messages.mjs'

export async function processMessage(
  assistantId: string,
  content: string
): Promise<string[]> {
  /**
   * This action executes only after the previous 'processMessage' ended
   * NO CONCURRENCY
   */

  // Step 1: Create or use an existing thread for this "user"
  const threadId = 'thread_XBIFTKNggRbEAWNRKE0i4lv8'
  const session = new AssistantSession(assistantId, threadId).addActions(
    LOCAL_FUNCTIONS
  )

  // Step 2: Add user message
  await session.addUserMessage(content)

  // Step 3: Run the assistant
  const strings: string[] = []

  for await (const msgs of session.startRun()) {
    // From here we can Stream (view streaming.tsx) the responses,
    // we can store them in db, send them to WhatsApp, etc.
    printMessages(msgs)

    strings.push(...messagesToStrings(msgs))
  }

  return strings
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
