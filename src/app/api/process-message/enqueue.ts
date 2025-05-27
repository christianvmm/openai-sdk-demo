type Task = () => Promise<void>
const queues = new Map<string, Task[]>()
const processing = new Set<string>()

export async function enqueue(threadId: string, task: Task) {
  if (!queues.has(threadId)) queues.set(threadId, [])

  queues.get(threadId)!.push(task)

  if (!processing.has(threadId)) {
    processing.add(threadId)
    while (queues.get(threadId)!.length > 0) {
      const nextTask = queues.get(threadId)!.shift()!
      await nextTask()
    }
    processing.delete(threadId)
  }
}
