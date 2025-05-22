'use client'

import { processMessage } from '@/actions/process-message'
import { useState } from 'react'

type Message = {
  received?: boolean
  content: string
}

export function Chat({
  assistantId,
  initialMessages = [],
}: {
  assistantId: string
  initialMessages: Message[]
}) {
  const [content, setContent] = useState('')
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  function addMessage(content: string, received: boolean) {
    setMessages((prev) => [
      ...prev,
      {
        content,
        received,
      },
    ])
  }

  async function onSubmit() {
    addMessage(content, false)
    setContent('')

    try {
      const m = await processMessage(assistantId, content)

      if (m) {
        const texts: string[] = m
          .map((a) => {
            if (a.type === 'text') {
              return a.text.value
            }

            return ''
          })
          .filter(Boolean)
        console.log(m)

        for (const text of texts) {
          addMessage(text, true)
        }
      }
    } catch {
      console.log('ok')
    }
  }

  return (
    <div className='flex flex-col h-screen bg-gray-100 p-4'>
      {/* Chat header */}
      <div className='bg-white p-4 rounded-t-2xl shadow-md'>
        <h2 className='text-xl font-semibold text-gray-800'>Chat with Alice</h2>
      </div>

      {/* Message area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
        {messages.map((m, i) => {
          if (m.received)
            return <ReceivedMessage key={i}>{m.content}</ReceivedMessage>

          return <SentMessage key={i}>{m.content}</SentMessage>
        })}
      </div>

      {/* Input area */}
      <form
        className='bg-white p-4 rounded-b-2xl shadow-md flex items-center'
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <input
          type='text'
          placeholder='Type your message...'
          className='flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          type='submit'
          className='ml-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 transition'
        >
          Send
        </button>
      </form>
    </div>
  )
}

function SentMessage({ children }: { children: string }) {
  return (
    <div className='flex justify-end'>
      <div className='bg-blue-500 text-white p-3 rounded-2xl shadow max-w-xs'>
        <p>{children}</p>
      </div>
    </div>
  )
}

function ReceivedMessage({ children }: { children: string }) {
  return (
    <div className='flex items-start'>
      <div className='bg-white p-3 rounded-2xl shadow max-w-xs'>
        <p className='text-gray-800'>{children}</p>
      </div>
    </div>
  )
}
