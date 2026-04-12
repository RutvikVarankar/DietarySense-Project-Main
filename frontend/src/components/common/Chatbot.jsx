import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("home");

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (customMsg) => {
    const msg = customMsg || input;

    if (!msg.trim()) return;

    const userMessage = { text: msg, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setIsLoading(true);
    setView("chat");

    try {
      const response = await api.post("/ai/chat", { message: msg });

      const aiMessage = {
        text: response.data.reply || response.data.data?.reply,
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Sorry, I couldn't process your request.", sender: "ai" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="position-fixed bottom-0 end-0 m-4 rounded-circle shadow"
          style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #28a745, #1e7e34)",
            color: "white",
            fontSize: "22px",
            border: "none",
            zIndex: 1050,
          }}
        >
          💬
        </button>
      )}

      {/* Chat Container */}
      {isOpen && (
        <div
          className="position-fixed bottom-0 end-0 m-3 shadow-lg d-flex flex-column"
          style={{
            width: "95%",
            maxWidth: "380px",
            height: "90vh",
            maxHeight: "600px",
            borderRadius: "16px",
            overflow: "hidden",
            zIndex: 1050,
            background: "#fff",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f3d3e, #145c5e)",
              color: "white",
              padding: "16px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Hello, {user?.name || 'User'} !!</h5>
                <small style={{ opacity: 0.8 }}>
                  Your Dietary Assistant
                </small>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "white",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* HOME VIEW */}
          {view === "home" && (
            <div className="p-3 overflow-auto flex-grow-1">

              {/* STATUS CARD */}
              <div
                className="mb-3 p-3"
                style={{
                  background: "#f1f3f5",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                ⚠️ <strong>Status:</strong> All systems operational
                <br />
                <small className="text-muted">Updated just now</small>
              </div>

              {/* SEARCH */}
              <div className="mb-3">
                <input
                  className="form-control"
                  placeholder="🔍 Search for help..."
                  style={{
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                />
              </div>

              {/* QUICK ACTIONS */}
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {[
                  "apple calories",
                  "chicken recipe",
                  "healthy diet tips",
                ].map((item, i) => (
                  <div
                    key={i}
                    onClick={() => sendMessage(item)}
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#e9ecef")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* ASK BUTTON */}
              <div
                className="mt-3 p-3"
                style={{
                  background: "#f1f3f5",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                onClick={() => setView("chat")}
              >
                <strong>💬 Ask a Question</strong>
                <br />
                <small className="text-muted">
                  AI assistant will help you instantly
                </small>
              </div>
            </div>
          )}

          {/* CHAT VIEW */}
          {view === "chat" && (
            <>
              {/* MESSAGES */}
              <div
                className="flex-grow-1 p-3 overflow-auto"
                style={{
                  background: "#f4f6f8",
                }}
              >
                {messages.length === 0 && (
                  <div className="text-center text-muted mt-5">
                    Ask me anything about diet & nutrition 🍎
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`d-flex mb-2 ${msg.sender === "user"
                      ? "justify-content-end"
                      : "justify-content-start"
                      }`}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "16px",
                        maxWidth: "75%",
                        background:
                          msg.sender === "user"
                            ? "linear-gradient(135deg, #28a745, #1e7e34)"
                            : "#ffffff",
                        color: msg.sender === "user" ? "#fff" : "#000",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        fontSize: "14px",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="text-muted">Typing...</div>
                )}

                <div ref={chatEndRef}></div>
              </div>

              {/* INPUT */}
              <div
                className="p-2 d-flex"
                style={{
                  borderTop: "1px solid #eee",
                  background: "#fff",
                }}
              >
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Type your message..."
                  value={input}
                  disabled={isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  style={{ borderRadius: "20px" }}
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading}
                  style={{
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    border: "none",
                    background: "#28a745",
                    color: "white",
                  }}
                >
                  ➤
                </button>
              </div>
            </>
          )}

          {/* FOOTER NAV */}
          <div
            className="d-flex justify-content-around p-2"
            style={{
              borderTop: "1px solid #eee",
              background: "#fafafa",
            }}
          >
            <button
              className="btn btn-sm"
              onClick={() => setView("home")}
            >
              🏠 Home
            </button>

            <button
              className="btn btn-sm"
              onClick={() => setView("chat")}
            >
              💬 Chat
            </button>

            <button className="btn btn-sm">❓ Help</button>
          </div>
        </div>
      )}

      {/* Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from {opacity: 0; transform: translateY(20px);}
            to {opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </>
  );
};

export default Chatbot;