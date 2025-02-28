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
  let [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response]);

  // Clean Markdown Syntax
  function cleanMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold syntax
      .replace(/\*(.*?)\*/g, "$1") // Remove italic syntax
      .replace(/~(.*?)~/g, "$1") // Remove strikethrough syntax
      .replace(/`(.*?)`/g, "$1") // Remove inline code syntax
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Remove links
      .replace(/^\s*[-*+]\s+/gm, "") // Remove bullet points
      .replace(/^#+\s+/gm, "") // Remove headers (e.g., # Header)
      .replace(/\n{2,}/g, "\n"); // Remove extra new lines
  }

  async function fetchChatResponseFromGemini() {
    if (!prompt.trim()) return; // Prevent sending empty prompts
    setLoading(true);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent(prompt);
      const rawResponse = await result.response.text(); // Await the text() promise
      const cleanedResponse = cleanMarkdown(rawResponse);

      const newResponse = [...response, { prompt, response: cleanedResponse }];
      setResponse(newResponse);
      setPrompt(""); // Clear input after submission
    } catch (error) {
      console.error("Error fetching response:", error);
    }

    setLoading(false);
  }

  useEffect(() => {
    setResponse([
      {
        prompt: "Hello, how can I help you today?",
        response: "I am a chatbot, ask me anything.",
      },
    ]);
  }, []);

  return (
    <>
      <h1 className="heading">AI Chat Bot</h1>
      <div className="chatbot_container">
        <div className="chatbot_response_container" aria-live="polite">
          {response?.map((res, index) => (
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
            placeholder="Enter your questions"
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
          <button type="button" onClick={fetchChatResponseFromGemini}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
