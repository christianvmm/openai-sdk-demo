import { openai } from '@/lib/open-ai'
import type {
  MessageContentPartParam,
  MessagesPage,
} from 'openai/resources/beta/threads/messages.js'
import type { Run } from 'openai/resources/beta/threads/index.js'

type Action = Record<string, (props: unknown) => Promise<string>>

export class AssistantSession {
  private actions: Action | null = null
  private run: Run | null = null
  private generatedMessageIds: Set<string>

  constructor(private assistantId: string, private threadId: string) {
    this.generatedMessageIds = new Set()
  }

  addActions(actions: Action) {
    this.actions = actions
    return this
  }

  async addUserMessage(content: string | MessageContentPartParam[]) {
    return await openai.beta.threads.messages.create(this.threadId, {
      role: 'user',
      content,
    })
  }

  async startRun() {
    this.run = await openai.beta.threads.runs.createAndPoll(this.threadId, {
      assistant_id: this.assistantId,
    })

    let newMessages = await this.getNewMessages()
    printMessages(newMessages)

    if (this.run.required_action && this.actions) {
      for (const call of this.run.required_action.submit_tool_outputs
        .tool_calls) {
        const name = call.function.name
        const args = call.function.arguments
        const fn = this.actions[name]
        const output = fn ? await fn(JSON.parse(args)) : 'Invalid Action'

        await openai.beta.threads.runs.submitToolOutputsAndPoll(
          this.threadId,
          this.run.id,
          {
            tool_outputs: [
              {
                tool_call_id: call.id,
                output,
              },
            ],
          }
        )

        newMessages = await this.getNewMessages()
        printMessages(newMessages)
      }
    }

    return this.run
  }

  async cancelRun(runId: string) {
    return await openai.beta.threads.runs.cancel(this.threadId, runId)
  }

  private async getNewMessages(): Promise<MessagesPage['data'] | null> {
    const allMessages = await this.getGeneratedMessages()

    const newMessages =
      allMessages?.filter(
        (message) => !this.generatedMessageIds.has(message.id)
      ) ?? null

    newMessages?.forEach((m) => this.generatedMessageIds.add(m.id))

    return newMessages
  }

  public async getGeneratedMessages(
    limit = 100
  ): Promise<MessagesPage['data'] | null> {
    if (!this.run) {
      return null
    }

    const result = await openai.beta.threads.messages.list(this.threadId, {
      run_id: this.run!.id,
      limit,
      order: 'asc',
    })

    return result.data
  }
}

function printMessages(messages: MessagesPage['data'] | null) {
  console.log('MESSAGES:')

  for (const message of messages || []) {
    for (const content of message.content) {
      if (content.type === 'text') {
        console.log(content.text.value)
      }
    }
  }

  console.log('-----------')
}
