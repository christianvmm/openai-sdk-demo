'use server'

import { z } from 'zod'
import { AssistantSession } from '@/utils/assistant-session'

export async function processMessage(
  assistantId: string,
  content: string
): Promise<string[]> {
  // Step 1: Create or use an existing thread for this "user"
  const threadId = 'thread_XBIFTKNggRbEAWNRKE0i4lv8'
  const session = new AssistantSession(assistantId, threadId).addActions(
    LOCAL_FUNCTIONS
  )

  // Step 2: Add user message
  await session.addUserMessage(content)

  // Step 3: Run the assistant
  await session.startRun()

  /**
   * Finally, get all the generated messages for this run
   */
  console.log('Getting messages...')
  const generatedMessages = await session.getGeneratedMessages()
  console.log(generatedMessages?.length)

  const strings = []

  for (const message of generatedMessages || []) {
    for (const content of message.content) {
      if (content.type === 'text') {
        strings.push(content.text.value)
      }
    }
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
