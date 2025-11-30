"use client";
import { useState } from "react";

export default function Completion() {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState(""); //Store Ai response
  const [isLoading, setIsLoading] = useState(false); //loading flag
  const [error, setError] = useState<string | null>(null);

  //on submit handler
  const complete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrompt("");

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong!");
      }

      setCompletion(data.text);
    } catch (error) {
      console.log("Error : ", error);
      setError(
        error instanceof Error ? error.message : "Something went wrong!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">

    {error && <div className="text-red-500 mb-4">
        {error}
    </div> }    


      {isLoading ? (
        <div>Loading...</div>
      ) : completion ? (
        <div className="whitespace-pre-wrap">{completion}</div>
      ) : null}

      <form
        method="post"
        action="/api/completion"
        className="mt-4"
        onSubmit={complete}
      >
        <div className="flex items-center gap-3">
          <input
            placeholder="Enter your prompt here"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
