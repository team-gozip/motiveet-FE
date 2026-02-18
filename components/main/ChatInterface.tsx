'use client';

import { useState, useRef, useEffect } from 'react';
import { chatApi } from '@/lib/api';
import Button from '../common/Button';

interface ChatMessage {
    messageId: number;
    role: 'user' | 'assistant';
    text?: string;
    image?: string;
    timestamp: string;
}

interface ChatInterfaceProps {
    chatId: number | null;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatId) {
            loadChatHistory();
        }
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatHistory = async () => {
        if (!chatId) return;

        try {
            console.log(`[ChatHistory] Loading history for chatId: ${chatId}`);
            const response = await chatApi.getHistory(chatId);
            console.log('[ChatHistory] Response received:', response);

            // Defensive: Check if messages exists and is an array
            if (response && Array.isArray(response.messages)) {
                setMessages(response.messages);
                console.log(`[ChatHistory] Loaded ${response.messages.length} messages`);
            } else {
                console.warn('[ChatHistory] Invalid response format:', response);
                setMessages([]);
            }
        } catch (error) {
            console.error('[ChatHistory] Failed to load chat history:', error);
            // Don't throw, just set empty messages to prevent app crash
            setMessages([]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !chatId || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        try {
            // Send user message
            const userResponse = await chatApi.sendMessage(chatId, userMessage);
            const newUserMessage: ChatMessage = {
                messageId: userResponse.messageId,
                role: 'user',
                text: userMessage,
                timestamp: userResponse.timestamp,
            };
            setMessages(prev => [...prev, newUserMessage]);

            // Get AI answer
            const aiResponse = await chatApi.getAnswer(userResponse.messageId);
            const aiMessage: ChatMessage = {
                messageId: aiResponse.messageId,
                role: 'assistant',
                text: aiResponse.text,
                image: aiResponse.image,
                timestamp: aiResponse.timestamp,
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Add error message
            setMessages(prev => [...prev, {
                messageId: Date.now(),
                role: 'assistant',
                text: '죄송합니다. 메시지 전송에 실패했습니다.',
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!chatId) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-900/50">
                <p className="text-zinc-500">회의를 시작하면 채팅을 사용할 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-900 border border-zinc-800">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.messageId}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl ${message.role === 'user'
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                                }`}
                        >
                            {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Message attachment"
                                    className="mt-2 rounded-lg max-w-full"
                                />
                            )}
                            <p
                                className={`text-xs mt-1 ${message.role === 'user' ? 'text-red-100' : 'text-zinc-500'
                                    }`}
                            >
                                {new Date(message.timestamp).toLocaleTimeString('ko-KR')}
                            </p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-2xl">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800 p-4 bg-zinc-900/50">
                <div className="flex items-end space-x-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-lg resize-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white rounded-lg transition-colors font-medium self-end mb-1"
                    >
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}
