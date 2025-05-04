import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";
import API from "../api";

export default function ChatbotModal({ pet, isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const listEndRef = useRef();

    useEffect(() => {
        if (!isOpen) return;
        
    
        const fetchChatHistory = async () => {
            try {
                const res = await API.get(`/chatbot/${pet._id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                
                const formattedMessages = res.data.history.map(msg => ({
                    from: msg.from || 'system',  // default to 'system' if 'from' is not present
                    text: msg.message || 'No message'  // default text if 'message' is not present
                }));
                // res.data.history is assumed to be an array of { from, text }
                setMessages([
                    { from: "system", text: `Chat about ${pet.name}` },
                    ...formattedMessages
                ]);
            } catch (err) {
                console.error("Failed to fetch chat history", err);
                setMessages([
                    { from: "system", text: `Chat about ${pet.name}` },
                    { from: "bot", text: "Could not load chat history." }
                ]);
            }
        };
    
        fetchChatHistory();
    }, [isOpen, pet]);

    useEffect(() => {
        // scroll to bottom on new messages
        listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatGeminiResponse = (text) => {
        if (!text) return ;
        return text
          .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // bold + italic
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')               // bold
          .replace(/\*(.*?)\*/g, '<em>$1</em>');                          // italic
      }
      
    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { from: "user", text: input };
        setMessages(msgs => [...msgs, userMsg]);
        setInput("");

        try {
            const res = await API.post(
                "/chatbot",
                { petId: pet._id, message: userMsg.text },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            setMessages(msgs => [...msgs, { from: "bot", text: res.data.reply }]);
        } catch (err) {
            setMessages(msgs => [
                ...msgs,
                { from: "bot", text: "Sorry, something went wrong." },
            ]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl p-6 w-full max-w-lg"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">{`Chat about ${pet.name}`}</h2>
                            <button onClick={onClose} className="text-gray-500">✕</button>
                        </div>
                        <div className="h-64 overflow-y-auto mb-4 space-y-2">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`px-3 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${m.from === "user"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: m.from === "bot" ? formatGeminiResponse(m.text) : m.text
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div ref={listEndRef} />
                        </div>
                        <div className="flex">
                            <input
                                className="flex-1 border mr-2 rounded-lg px-3 py-2 focus:outline-none"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                            />
                            <button
                                onClick={sendMessage}
                                className="px-4 py-2 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-all duration-300 shadow-xs flex items-center"
                            >
                                <FiSend />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
