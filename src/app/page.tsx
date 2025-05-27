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
      order: 'desc',
      limit: 10,
    }
  )

  const sortedMessages = initialData.data.reverse()

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
        initialMessages={sortedMessages.map((message) => {
          let text: string = ''

          for (const item of message.content) {
            if (item.type === 'text') {
              text += item.text.value
            }
          }

          return {
            content: text,
            received: message.role === 'assistant',
          }
        })}
      />
      <Streaming />
    </div>
  )
}
