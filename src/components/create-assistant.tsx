'use client'

import { createAssistant } from '@/actions/create-assistant'

export function CreateAssistant() {
  async function onCreate() {
    await createAssistant()
  }

  return (
    <div className='p-10 border'>
      <h1 className='text-lg font-medium'>Create:</h1>

      <button onClick={onCreate}>Crear asistente</button>
    </div>
  )
}
