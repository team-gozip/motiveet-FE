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
            const response = await chatApi.getHistory(chatId);
            setMessages(response.messages);
        } catch (error) {
            console.error('Failed to load chat history:', error);
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
            <div className="h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">회의를 시작하면 채팅을 사용할 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.messageId}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl ${message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
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
                                className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}
                            >
                                {new Date(message.timestamp).toLocaleTimeString('ko-KR')}
                            </p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-end space-x-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-6"
                    >
                        전송
                    </Button>
                </div>
            </div>
        </div>
    );
}
