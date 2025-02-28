import { useEffect, useState, useRef } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SyncLoader } from "react-spinners";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function App() {
  const apiKey = import.meta.env.VITE_API_GEMINI_KEY;
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState([
    {
      prompt: "Hello, how can I help you today?",
      response: "I am a chatbot, ask me anything.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response]);

  useEffect(() => {
    if (!hasFetched.current) {
      setResponse([
        {
          prompt: "Hello, how can I help you today?",
          response: "I am a chatbot, ask me anything.",
        },
      ]);
      hasFetched.current = true;
    }
  }, []);

  // Function to clean Markdown formatting from AI response
  function cleanMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/~(.*?)~/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^#+\s+/gm, "")
      .replace(/\n{2,}/g, "\n");
  }

  async function fetchChatResponseFromGemini() {
    if (!prompt.trim()) return; // Prevent empty messages
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const rawResponse = await result.response.text();
      const cleanedResponse = cleanMarkdown(rawResponse);

      setResponse((prev) => [...prev, { prompt, response: cleanedResponse }]);
      setPrompt("");
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse((prev) => [...prev, { prompt, response: "⚠️ Error: Unable to fetch response." }]);
    }

    setLoading(false);
  }

  return (
    <>
      <h1 className="heading">AI Chat Bot</h1>
      <div className="chatbot_container">
        <div className="chatbot_response_container" aria-live="polite">
          {response.map((res, index) => (
            <div key={index} className="response">
              <p className="chatbot_prompt">{res.prompt}</p>
              <p className="chatbot_response">{res.response}</p>
            </div>
          ))}

          <div ref={chatEndRef}></div>

          {loading && (
            <SyncLoader
              color={"chocolate"}
              loading={loading}
              cssOverride={override}
              size={10}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          )}
        </div>

        <div className="chatbot_input">
          <input
            type="text"
            name="input"
            placeholder="Enter your question..."
            className="input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                fetchChatResponseFromGemini();
              }
            }}
          />
          <button 
            type="button" 
            onClick={fetchChatResponseFromGemini} 
            disabled={!prompt.trim()}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
