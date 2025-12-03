import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio file provided", { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this audio exactly." },
            { 
              type: "file", 
              data: base64Audio, 
              mediaType: audioFile.type 
            },
          ],
        },
      ],
    });

    return Response.json({ text });

  } catch (error) {
    console.error("Transcription error", error);
    return new Response("Failed to transcribe", { status: 500 });
  }
}