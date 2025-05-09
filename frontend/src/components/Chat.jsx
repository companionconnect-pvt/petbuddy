import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FiSend, FiX, FiChevronLeft } from "react-icons/fi";

// Encryption utilities (unchanged)
const getKeyFromPassword = async (password) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("chat-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

const encryptMessage = async (key, message) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(message)
  );
  return {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
  };
};

const decryptMessage = async (key, encrypted) => {
  const iv = new Uint8Array(encrypted.iv);
  const ciphertext = new Uint8Array(encrypted.ciphertext);
  const dec = new TextDecoder();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return dec.decode(decrypted);
};

const Chat = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState({ senderId: "", senderName: "" });
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    let socket;

    const initializeChat = async () => {
      try {
        setIsLoading(true);
        const decoded = jwtDecode(token);
        setUser({
          senderId: decoded.id,
          senderName: decoded.name,
        });

        const key = await getKeyFromPassword(ticketId);
        setEncryptionKey(key);

        const res = await fetch(`http://localhost:5000/api/chat/${ticketId}`);
        const data = await res.json();

        const decryptedMsgs = await Promise.all(
          (data.messages || []).map(async (msg) => {
            try {
              const text = await decryptMessage(key, msg.encryptedMessage);
              return {
                senderId: msg.senderId,
                senderName: msg.senderName,
                message: text,
                timestamp: msg.createdAt,
              };
            } catch (e) {
              return null;
            }
          })
        );

        setMessages(decryptedMsgs.filter(Boolean));

        // Setup socket after key and initial messages are ready
        socket = io("http://localhost:5000");
        socket.emit("joinRoom", ticketId);
        socketRef.current = socket;

        socket.on("receiveMessage", async (msg) => {
          try {
            // Skip if this is our own message (we already added it optimistically)
            if (msg.senderId === user.senderId) return;

            const decrypted = await decryptMessage(key, msg.encryptedMessage);
            setMessages((prev) => [
              ...prev,
              {
                senderId: msg.senderId,
                senderName: msg.senderName,
                message: decrypted,
                timestamp: msg.createdAt,
              },
            ]);
          } catch (err) {
            console.error("Decryption failed:", err);
          }
        });
      } catch (err) {
        console.error("Chat init error:", err);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [ticketId, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    // Socket cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !encryptionKey) return;

    const encrypted = await encryptMessage(encryptionKey, newMessage);

    const messageData = {
      ticketId,
      senderName: user.senderName,
      senderId: user.senderId,
      encryptedMessage: encrypted,
      // Add a unique ID for the message
      tempId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    // Optimistically add the message to the UI immediately
    setMessages((prev) => [
      ...prev,
      {
        senderId: user.senderId,
        senderName: user.senderName,
        message: newMessage,
        timestamp: new Date().toISOString(),
        tempId: messageData.tempId, // Use the same tempId
      },
    ]);

    try {
      const res = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) {
        console.error("Send failed");
        // Remove the optimistic message if send fails
        setMessages((prev) =>
          prev.filter((msg) => msg.tempId !== messageData.tempId)
        );
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) =>
        prev.filter((msg) => msg.tempId !== messageData.tempId)
      );
    }

    setNewMessage("");
  };

  const handleClose = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      switch (decoded.role) {
        case "user":
          navigate("/profile");
          break;
        case "clinic":
          navigate("/petclinic/dashboard");
          break;
        case "pethouse":
          navigate("/pethouse/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      navigate("/login");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
          aria-label="Close chat"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold">Secure Chat</h2>
          <p className="text-xs opacity-80">End-to-end encrypted</p>
        </div>
        <button
          onClick={handleClose}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
          aria-label="Close chat"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-gradient-to-b from-gray-50 to-gray-100">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
              <div className="text-gray-500">Loading secure chat...</div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center max-w-md">
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm">
                Start the conversation by sending your first secure message.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.senderId === user.senderId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
                  msg.senderId === user.senderId
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.senderId !== user.senderId && (
                  <p className="text-xs font-semibold text-indigo-600 mb-1">
                    {msg.senderName}
                  </p>
                )}
                <p className="text-sm">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === user.senderId
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message input */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full ${
              newMessage.trim()
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            } transition-all shadow-sm`}
            aria-label="Send message"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3 text-green-500"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
            Messages are end-to-end encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chat;
