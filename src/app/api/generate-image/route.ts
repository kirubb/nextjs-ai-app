import { google } from "@ai-sdk/google";
import { experimental_generateImage as generateImage } from "ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const { image } = await generateImage({
      // FIXED: Use Imagen for image generation. Gemini is for text/chat.
      model: google.image("imagen-4.0-generate-001"), 
      prompt,
      aspectRatio: "16:9",
    });


    
    return Response.json(image.base64);
  } catch (error) {
    console.error("Error generating image", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}