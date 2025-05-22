'use client'
// import OpenAI from 'openai'

// const openai = new OpenAI()

export default function Home() {
  async function onGet() {
    const res = await fetch('http://localhost:3000/api/test')
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      console.log(decoder.decode(value))
    }
  }

  //   const response = await openai.chat.completions.create({
  //     model: 'gpt-4o-mini',
  //     messages: [
  //       {
  //         role: 'user',
  //         content: [
  //           { type: 'text', text: "What's in this image?" },
  //           {
  //             type: 'image_url',
  //             image_url: {
  //               url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   })

  //   console.log(response.choices[0].message.content)

  return (
    <div>
        {/* <p>{response.choices[0].message.content}</p> */}
      <div>
        <h1>Response:</h1>

        <button onClick={onGet}>testear</button>
      </div>
    </div>
  )
}
