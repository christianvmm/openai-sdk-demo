'use client'
import { useState } from 'react'

export function Streaming() {
  const [streaming, setStreaming] = useState(false)
  const [text, setText] = useState('')

  async function onGet() {
    const res = await fetch('http://localhost:3000/api/test')
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    setStreaming(true)

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        setStreaming(false)
        break
      }

      setText((prev) => prev.concat(decoder.decode(value)))
    }
  }

  return (
    <div className='p-10 border'>

      <h1 className='text-lg font-medium'>Streaming:</h1>

      <p>{text}</p>

      <button onClick={onGet}>{streaming ? 'Cargando...' : 'Probar'}</button>
    </div>
  )
}
