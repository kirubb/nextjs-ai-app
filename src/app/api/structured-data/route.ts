import {streamObject} from "ai"
import {google} from "@ai-sdk/google"
import {recipeSchema} from "./schema"

export async function POST(req:Request){
    try {
        const {dish} = await req.json();
        
        const result = streamObject({
            model:google("gemini-2.5-flash"),
            schema: recipeSchema,
            prompt: `Generate a recipe in 150 words for ${dish}`,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("error generating recipe",error)
        return new Response("Failed to generate recipe", {status:500});
    }
}