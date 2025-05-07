import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX, FiMessageSquare, FiUser } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
import API from "../api";

export default function ChatbotModal({ pet, isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const listEndRef = useRef();

    useEffect(() => {
        if (!isOpen) return;
        
        const fetchChatHistory = async () => {
            setIsLoading(true);
            try {
                const res = await API.get(`/chatbot/${pet._id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                
                const formattedMessages = res.data.history.map(msg => ({
                    from: msg.from || 'system',
                    text: msg.message || 'No message'
                }));
                
                setMessages([
                    { 
                        from: "system", 
                        text: `Welcome to your conversation about ${pet.name}. Ask me anything about adoption, care, or personality traits!` 
                    },
                    ...formattedMessages
                ]);
            } catch (err) {
                console.error("Failed to fetch chat history", err);
                setMessages([
                    { 
                        from: "system", 
                        text: `Let's chat about ${pet.name}! I can answer questions about their personality, care needs, and adoption process.` 
                    },
                    { 
                        from: "bot", 
                        text: "I couldn't load our previous conversation, but I'm ready to chat!" 
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchChatHistory();
    }, [isOpen, pet]);

    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatGeminiResponse = (text) => {
        if (!text) return '';
        return text
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>');
    };
      
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMsg = { from: "user", text: input };
        setMessages(msgs => [...msgs, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await API.post(
                "/chatbot",
                { petId: pet._id, message: userMsg.text },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            
            // Simulate typing delay for premium feel
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
            
            setMessages(msgs => [...msgs, { from: "bot", text: res.data.reply }]);
        } catch (err) {
            setMessages(msgs => [
                ...msgs,
                { from: "bot", text: "I'm having trouble responding right now. Please try again shortly." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const getMessageAvatar = (from) => {
        switch(from) {
            case 'user':
                return <FiUser className="text-white bg-[#F27781] rounded-full p-1" size={20} />;
            case 'bot':
                return <BsRobot className="text-white bg-[#F27781] rounded-full p-1" size={20} />;
            default:
                return <FiMessageSquare className="text-white bg-gray-500 rounded-full p-1" size={20} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        initial={{ y: 20, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.98 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#F27781] to-[#e85f6a] p-4 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <BsRobot className="text-white" size={24} />
                                <h2 className="text-white font-semibold text-lg">{pet.name}'s AI Assistant</h2>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        {/* Chat area */}
                        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                                    initial={{ opacity: 0, y: m.from === "user" ? 10 : -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={`flex max-w-[85%] ${m.from === "user" ? "flex-row-reverse" : ""}`}>
                                        <div className="flex-shrink-0 mt-1">
                                            {getMessageAvatar(m.from)}
                                        </div>
                                        <div
                                            className={`px-4 py-3 rounded-2xl mx-2 ${m.from === "user"
                                                ? "bg-[#F27781] text-white rounded-tr-none"
                                                : "bg-white text-gray-800 shadow-sm rounded-tl-none"
                                            }`}
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: m.from === "bot" ? formatGeminiResponse(m.text) : m.text
                                                }}
                                                className="text-sm leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isLoading && (
                                <motion.div
                                    className="flex justify-start"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="flex max-w-[85%]">
                                        <div className="flex-shrink-0 mt-1">
                                            <BsRobot className="text-white bg-[#F27781] rounded-full p-1" size={20} />
                                        </div>
                                        <div className="px-4 py-3 rounded-2xl mx-2 bg-white text-gray-800 shadow-sm rounded-tl-none">
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            <div ref={listEndRef} />
                        </div>
                        
                        {/* Input area */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center space-x-2">
                                <input
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent transition-all"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                                    placeholder={`Ask about ${pet.name}...`}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading}
                                    className="p-3 bg-gradient-to-r from-[#F27781] to-[#F27781] text-white rounded-full hover:from-[#F27781] hover:to-[#e85f6a] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <FiSend size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                {pet.name}'s AI assistant can answer questions about personality, care, and adoption.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}