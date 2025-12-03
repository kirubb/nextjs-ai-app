// Client Component (page.tsx)
"use client";

import { useState, useRef } from "react";

export default function GenerateSpeechPage() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to generate audio (${response.status})`
        );
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }

      setHasAudio(true);
      setText("");

    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setHasAudio(false);
    } finally {
      setIsLoading(false);
    }
  };

  const replayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <audio
        ref={audioRef}
        onError={() => setError("Audio playback error")}
      />

      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">
          ❌ {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center mb-4 text-blue-600">
          ⏳ Generating audio...
        </div>
      )}

      {hasAudio && !isLoading && (
        <button
          onClick={replayAudio}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔊 Replay Audio
        </button>
      )}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-black border-t"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border border-black-300 rounded"
            placeholder="Enter text to convert to speech"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}
