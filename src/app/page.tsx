import { Chat } from '@/components/chat'
import { openai } from '@/lib/open-ai'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const assistants = (await openai.beta.assistants.list()).data

  const one = await openai.beta.threads.messages.list(
    'thread_XBIFTKNggRbEAWNRKE0i4lv8',
    {
      order: 'desc',
      limit: 10,
    }
  )

  const _one = one.data.reverse()

  const two = await openai.beta.threads.messages.list(
    'thread_fpPlVfYiz73sUwygnn8lwgCa',
    {
      order: 'desc',
      limit: 100,
    }
  )

  const _two = two.data.reverse()

  return (
    <div className='flex gap-10 w-full bg-green-200'>
      <Chat
        name='Juan'
        threadId='thread_XBIFTKNggRbEAWNRKE0i4lv8'
        assistantId={assistants.at(0)?.id || ''}
        initialMessages={_one.map((message) => {
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

      <Chat
        name='Daniel'
        threadId='thread_fpPlVfYiz73sUwygnn8lwgCa'
        assistantId={assistants.at(0)?.id || ''}
        initialMessages={_two.map((message) => {
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
    </div>
  )
}
