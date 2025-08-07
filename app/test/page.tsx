"use client";

import { useState } from "react";

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestFetch = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);

    const options = {
      method: "POST",
      body: JSON.stringify({
        poolid: "30",
        chainid: "8453",
        poolname: "Farcaster Cracked Devs",
        username: "sjulh.eth",
        flowrate: "15",
      }),
    };

    try {
      const result = await fetch(`/api/notify-donation`, options);
      const data = await result.text();

      if (result.ok) {
        setResponse(`Success: ${data}`);
      } else {
        setError(`Error ${result.status}: ${data}`);
      }
    } catch (err) {
      setError(
        `Fetch error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Test Notify Donation API
        </h1>

        <button
          onClick={handleTestFetch}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg text-white font-medium text-lg transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Testing..." : "Test Fetch"}
        </button>

        {response && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-lg">
            <p className="text-green-800 text-sm">{response}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
