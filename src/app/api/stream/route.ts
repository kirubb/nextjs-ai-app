import {streamText} from "ai"
import {google} from "@ai-sdk/google"

export async function POST(req:Request) {


    try {
        const {prompt} = await req.json()

         const result  = streamText({
        model : google("gemini-2.5-flash"),
        prompt:prompt
    })

    return result.toUIMessageStreamResponse()
        
    } catch (error) {

        console.error("Error Generating Text", error)
        return Response.json({error:"Failed to generate text"}, {status:500})
        
    }
    
}