'use server'

import { openai } from '@/lib/open-ai'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

async function writeStreamToFile(stream: string, outputFile: string) {
  const writeStream = fs.createWriteStream(outputFile, { flags: 'w' })

  for await (const event of stream) {
    const line = JSON.stringify(event) + '\n'
    writeStream.write(line)
  }

  writeStream.end(() => {
    console.log(`Datos escritos a ${outputFile}`)
  })
}

export async function processMessage(assistantId: string, content: string) {
  const threadId = 'thread_XBIFTKNggRbEAWNRKE0i4lv8'

  /**
   * Terimnr un run
   */
  const runId = 'run_ml7bCximj1NOHmzFilGdVZ2N'
  const output = 'OK'
  await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
    tool_outputs: [
      {
        output,
      },
    ],
  })
  return

  // Step 1: Add user message
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content,
  })

  // Step 2: Run the assistant
  const stream = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    stream: true,
  })

  // const writeStream = fs.createWriteStream(outputFile, { flags: 'w' })

  const outputPath = path.join(__dirname, 'event_output.txt')

  for await (const event of stream) {
    writeStreamToFile(JSON.stringify(event), outputPath)

    // if (event.event === 'thread.message.delta') {

    // for(const item of event.data.delta.content) {

    // }
    // const type = event.data.delta.content?.[0]?.type
    // if (type === 'text') {
    // console.log('Partial Response:', type)
    // console.log(event.data.delta.content)
    // You can process each chunk here in real-time
    // }
    // } else {
    //   console.log('Other Event:', event)
    // }
  }

  // Step 3: Poll until run is complete or needs action
  // while (run. !== 'completed') {
  // if (run.status === 'requires_action') {
  //   const toolCalls =
  //     run.required_action?.submit_tool_outputs.tool_calls || []
  //   for (const call of toolCalls) {
  //     const output =
  //       (await FUNCTIONS[call.function.name]?.(
  //         JSON.parse(call.function.arguments)
  //       )) || 'No se pudo ejecutar el proceso'
  //     await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
  //       tool_outputs: [
  //         {
  //           tool_call_id: call.id,
  //           output,
  //         },
  //       ],
  //     })
  //   }
  // }
  // Wait a bit before polling again
  // await new Promise((resolve) => setTimeout(resolve, 1000))
  // Get latest run state
  // run = await openai.beta.threads.runs.retrieve(threadId, run.id)
  // }

  // Step 4: Get the latest assistant message
  // const messages = await openai.beta.threads.messages.list(threadId, {
  //   limit: 10, // in case the last one is not assistant
  // })

  // const assistantMessage = messages.data.find((msg) => msg.role === 'assistant')

  // return assistantMessage?.content ?? null
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
