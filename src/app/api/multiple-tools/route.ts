import { UIMessage,InferUITools,UIDataTypes, stepCountIs, streamText, convertToModelMessages,tool } from "ai";
import { google } from "@ai-sdk/google";
import {z} from "zod"
import { Infer } from "next/dist/compiled/superstruct";

const tools = {

    getLocation:tool({
        description:"Get the location of the user",
        inputSchema: z.object({
            name:z.string().describe("The name of the user"),
        }),
        execute: async ({name})=>{
            if(name==="Bruce"){
                return "Delhi"
            } else if (name==="Clark") {
                return "Mumbai"
            } else {
                return "Unknown City"
            }
        },

    }),

    getWeather: tool({
        description: "Get the weather for the location.",
        inputSchema: z.object({
            city:z.string().describe("The city to get the weather for.")
        }),
        execute: async ({city}) =>{
            if (city==="Delhi"){
                return "70C and Burning"
            } else if (city==="Mumbai"){
                return ("10C and wet")
            } else {
                return "Unknown City"
            }
        }
    })
}

export type ChatTools = Infer<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes,ChatTools>

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(3) // keep step count in mind
    });

    

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Error Generating Text", error)
    return new Response("Failed to generate text", { status: 500 });
  }
}
