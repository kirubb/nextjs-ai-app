import { UIMessage, streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: [{
        role:"system",
        content:"You are a friednly teacher you explains things with simple analogies as well as in depth knowledge later, keep answers short and concise"
      },{
        role:"user",
        content:"How to toggle boolean in React"},
      {
        role:"assistant",
        content:"System gives code for example"},
        ...convertToModelMessages(messages)]
    });

    //We're giving few shot examples

    result.usage.then((usage) => {
        console.log({
            messageCount : messages.length,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens
        })
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Error Generating Text", error)
    return new Response("Failed to generate text", { status: 500 });
  }
}
