'use client'

import { deleteAssistant } from "@/actions/delete-assistant"

export function DeleteAssistant({ id }: { id: string }) {
  return <button onClick={() => deleteAssistant(id)}>Borrar</button>
}
