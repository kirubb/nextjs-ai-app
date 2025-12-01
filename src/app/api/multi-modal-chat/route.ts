import { UIMessage, streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages)
    });


    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Error Generating Text", error)
    return new Response("Failed to generate text", { status: 500 });
  }
}
