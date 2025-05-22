'use server'

import { openai } from '@/lib/open-ai'
import { revalidatePath } from 'next/cache'

export async function createAssistant() {
  await openai.beta.assistants.create({
    name: 'My Assistant',
    instructions:
      'Eres un asistente virtual que habla español. Los usuarios te harán preguntas y tu le tienes que contestar como si fueras un malviviente de barrios bajos, utilizando lenguaje informal y con jergas locales. Eres mexicano y usas spanglish.',
    model: 'gpt-4-1106-preview', // or gpt-4o
    tools: [
      {
        type: 'function',
        function: {
          name: 'transferToArea',
          description: 'Transfiere al usuario a otra sección de la app',
          parameters: {
            type: 'object',
            properties: {
              area: {
                type: 'string',
                description:
                  "El área a la que transferir (ej. 'soporte', 'ventas')",
              },
            },
            required: ['area'],
          },
        },
      },
    ],
  })

  revalidatePath('/', 'page')
}
