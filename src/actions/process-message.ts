'use server'

import { openai } from '@/lib/open-ai'
import { z } from 'zod'
import fs from 'fs'

export async function writeStreamToFile(stream: string, outputFile: string) {
  const writeStream = fs.createWriteStream(outputFile, { flags: 'w' })

  for await (const event of stream) {
    const line = JSON.stringify(event) + '\n'
    writeStream.write(line)
  }

  writeStream.end(() => {
    console.log(`Datos escritos a ${outputFile}`)
  })
}

export async function cancelRun(threadId: string, runId: string) {
  try {
    await openai.beta.threads.runs.cancel(threadId, runId)
    console.log(`Run ${runId} cancelado correctamente.`)
  } catch (error) {
    console.error('Error cancelando el run:', error)
  }
}

export async function processMessage(assistantId: string, content: string) {
  const threadId = 'thread_XBIFTKNggRbEAWNRKE0i4lv8'

  /**
   * Terimnar un run
   */
  // const runId = 'run_ml7bCximj1NOHmzFilGdVZ2N'
  // await cancelRun(threadId, runId)

  // Step 1: Add user message
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content,
  })

  // Step 2: Run the assistant
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  })

  let polling = true

  while (polling) {
    console.log(run.status)
    switch (run.status) {
      case 'completed':
        polling = false
        break

      case 'requires_action':
        {
          const toolCalls =
            run.required_action?.submit_tool_outputs.tool_calls || []

          for (const call of toolCalls) {
            const output =
              (await FUNCTIONS[call.function.name]?.(
                JSON.parse(call.function.arguments)
              )) || 'No se pudo ejecutar el proceso'
            await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
              tool_outputs: [
                {
                  tool_call_id: call.id,
                  output,
                },
              ],
            })
          }
        }
        break
    }
  }
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
