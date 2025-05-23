'use server'

import { openai } from '@/lib/open-ai'
import { z } from 'zod'
import fs from 'fs/promises'

export async function writeToFile(data: string, outputFile: string) {
  try {
    await fs.writeFile(outputFile, data, 'utf8')
    console.log(`Data written to ${outputFile}`)
  } catch (error) {
    console.error(`Failed to write to file: ${error}`)
    throw error
  }
}
export async function cancelRun(threadId: string, runId: string) {
  try {
    await openai.beta.threads.runs.cancel(threadId, runId)
    console.log(`Run ${runId} cancelado correctamente.`)
  } catch (error) {
    console.error('Error cancelando el run:', error)
  }
}

export async function processMessage(
  assistantId: string,
  content: string
): Promise<string[]> {
  const threadId = 'thread_XBIFTKNggRbEAWNRKE0i4lv8'

  /**
   * Terminar un run
   */
  // const runId = 'run_FI69W2NdrGsPVooxlamDpGqr'
  // await cancelRun(threadId, runId)

  // Step 1: Add user message
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content,
  })

  // Step 2: Run the assistant
  // Poll: 'no continues hasta que lo completes'
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  })

  // process actions
  if (run.required_action) {
    for (const call of run.required_action.submit_tool_outputs.tool_calls) {
      const name = call.function.name
      const args = call.function.arguments
      const fn = FUNCTIONS[name]
      const output = fn ? await fn(JSON.parse(args)) : 'Funcion inválida'

      await openai.beta.threads.runs.submitToolOutputsAndPoll(
        threadId,
        run.id,
        {
          tool_outputs: [
            {
              tool_call_id: call.id,
              output,
            },
          ],
        }
      )
    }
  }

  /**
   * Finally, get all the generated messages for this run
   */
  console.log('Getting messages...')
  const generatedMessages = await openai.beta.threads.messages.list(threadId, {
    run_id: run.id,
    limit: 100,
    order: 'asc',
  })

  console.log(generatedMessages.data.length)
  const strings = []

  for (const message of generatedMessages.data) {
    for (const content of message.content) {
      if (content.type === 'text') {
        strings.push(content.text.value)
      }
    }
  }

  return strings
}

const FUNCTIONS: Record<string, (props: unknown) => Promise<string>> = {
  transferToArea: async (props: unknown) => {
    try {
      const data = z
        .object({
          area: z.string(),
        })
        .parse(props)

      console.log('Ejecutando transferToArea...', data)

      return `Transferido al área ${data.area}`
    } catch {
      return 'No se pudo transferir'
    }
  },
}
