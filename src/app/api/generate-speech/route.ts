import { GoogleGenerativeAI } from "@google/generative-ai";
import wav from "wav";
import { PassThrough } from "stream";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-tts",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text }] }],
      // @ts-ignore
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" },
          },
        },
      },
    } as any);

    // Extract audio data
    const audioPart = result.response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.data
    );
    if (!audioPart?.inlineData?.data) throw new Error("No audio generated");

    // Convert base64 PCM to Buffer
    const pcmBuffer = Buffer.from(audioPart.inlineData.data, "base64");

    // --- Use wav.Writer to encode PCM to WAV in memory ---
    const pass = new PassThrough();
    const wavWriter = new wav.Writer({
      channels: 1,
      sampleRate: 24000,
      bitDepth: 16,
    });

    wavWriter.pipe(pass);
    wavWriter.end(pcmBuffer);

    // Gather WAV output in a buffer
    const wavBuffer: Buffer = await new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pass.on("data", chunk => chunks.push(chunk));
      pass.on("end", () => resolve(Buffer.concat(chunks)));
      pass.on("error", reject);
    });

    // Send WAV for browser playback
    return new Response(new Uint8Array(wavBuffer), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": wavBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("Speech generation error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to generate speech",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
