'use client';

import { useState, useEffect } from 'react';

export default function Memo() {
    const [content, setContent] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        const savedMemo = localStorage.getItem('meeting_memo');
        if (savedMemo) {
            setContent(savedMemo);
        }
    }, []);

    // Save to localStorage whenever content changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        localStorage.setItem('meeting_memo', newContent);
    };

    return (
        <div className={`fixed bottom-24 right-6 flex flex-col transition-all duration-300 ${isOpen ? 'w-80 h-96' : 'w-12 h-12'}`}>
            {isOpen ? (
                <div className="flex-1 flex flex-col bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
                    <div className="p-3 bg-zinc-700 flex justify-between items-center">
                        <span className="text-sm font-semibold text-white">메모</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-zinc-400 hover:text-white"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                    <textarea
                        className="flex-1 p-4 bg-transparent text-white text-sm resize-none focus:outline-none"
                        placeholder="여기에 메모를 작성하세요..."
                        value={content}
                        onChange={handleChange}
                    />
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                    title="메모 열기"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            )}
        </div>
    );
}
