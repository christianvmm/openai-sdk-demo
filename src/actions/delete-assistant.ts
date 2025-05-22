'use server'

import { openai } from '@/lib/open-ai'
import { revalidatePath } from 'next/cache'

export async function deleteAssistant(id: string) {
  await openai.beta.assistants.del(id)
  revalidatePath('/', 'page')
}
