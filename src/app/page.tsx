import { Streaming } from '@/app/streaming'
import { Chat } from '@/components/chat'
import { CreateAssistant } from '@/components/create-assistant'
import { DeleteAssistant } from '@/components/delete-assistant'
import { openai } from '@/lib/open-ai'

export default async function Home() {
  const assistants = (await openai.beta.assistants.list()).data

  const initialData = await openai.beta.threads.messages.list(
    'thread_XBIFTKNggRbEAWNRKE0i4lv8',
    {
      order: 'asc',
      limit: 100,
    }
  )

  console.log(initialData.data)

  return (
    <div className='flex flex-col gap-10 p-10'>
      {assistants.map((a) => {
        return (
          <div key={a.id}>
            <p>ID: {a.id}</p>

            <p>{a.name}</p>
            <p>{a.instructions}</p>

            <DeleteAssistant id={a.id} />
          </div>
        )
      })}
      <CreateAssistant />

      <Chat
        assistantId={assistants.at(0)?.id || ''}
        initialMessages={initialData.data.map((idk) => {
          let text: string = ''

          for (const item of idk.content) {
            if (item.type === 'text') {
              text += item.text.value
            }
          }

          return {
            content: text,
            received: idk.role === 'assistant',
          }
        })}
      />
      <Streaming />
    </div>
  )
}
