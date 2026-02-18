'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/main/Sidebar';
import CurrentSubject from '@/components/main/CurrentSubject';
import ChatInterface from '@/components/main/ChatInterface';
import MeetingControls from '@/components/main/MeetingControls';
import Memo from '@/components/main/Memo';
import { isAuthenticated, logout } from '@/lib/auth';
import { meetingApi, subjectApi } from '@/lib/api';

export default function MainPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [currentMeeting, setCurrentMeeting] = useState<any>(null);
    const [currentSubject, setCurrentSubject] = useState<any>(null);
    const [chatId, setChatId] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        loadCurrentMeeting();
    }, []);

    const loadCurrentMeeting = async () => {
        setIsLoading(true);
        try {
            const meeting = await meetingApi.getCurrent();
            if (meeting) {
                setCurrentMeeting(meeting);
                setChatId(meeting.chatId);

                // Load current subject
                const subjectResponse = await subjectApi.getCurrent(meeting.meetingId);
                if (subjectResponse.subject) {
                    setCurrentSubject(subjectResponse.subject);
                }
            }
        } catch (error) {
            console.error('Failed to load current meeting:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMeetingStart = (meetingId: number, newChatId: number) => {
        setChatId(newChatId);
        setCurrentMeeting({ meetingId, chatId: newChatId, startedAt: new Date().toISOString(), endedAt: null });
    };

    const handleMeetingEnd = () => {
        setCurrentMeeting(null);
        setCurrentSubject(null);
        setChatId(null);
    };

    const handleMeetingSelect = async (meetingId: number) => {
        try {
            const meeting = await meetingApi.getById(meetingId);
            setCurrentMeeting(meeting);
            setChatId(meeting.chatId);

            const subjectResponse = await subjectApi.getCurrent(meetingId);
            if (subjectResponse.subject) {
                setCurrentSubject(subjectResponse.subject);
            }
        } catch (error) {
            console.error('Failed to load meeting:', error);
        }
    };

    const handleSubjectUpdate = (subject: any) => {
        console.log('[MainPage] Subject updated:', subject);
        setCurrentSubject(subject);
    };

    const handleLogout = () => {
        logout();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                    <p className="text-zinc-400">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-zinc-950 text-white">
            {/* Header */}
            <header className="bg-zinc-900 border-b border-zinc-800 shadow-md">
                <div className="h-14 px-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-red-500">M</span>otiveet
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-1.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors border border-zinc-700"
                    >
                        로그아웃
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-zinc-800 border border-l-0 border-zinc-700 rounded-r-md flex items-center justify-center hover:bg-zinc-700 transition-colors shadow-lg"
                >
                    <svg
                        className={`w-4 h-4 text-zinc-400 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Sidebar */}
                <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
                    <Sidebar
                        onMeetingSelect={handleMeetingSelect}
                        onSubjectSelect={(subjectId) => console.log('Subject selected:', subjectId)}
                    />
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Current Subject */}
                        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 shadow-sm">
                            <CurrentSubject
                                subject={currentSubject}
                                files={currentSubject?.files || []}
                            />
                        </div>

                        {/* Chat Interface */}
                        <div className="h-[500px] bg-zinc-900 rounded-xl shadow-xl overflow-hidden border border-zinc-800">
                            <ChatInterface chatId={chatId} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting Controls */}
            <MeetingControls
                isActive={!!currentMeeting && !currentMeeting.endedAt}
                meetingId={currentMeeting?.meetingId || null}
                onMeetingStart={handleMeetingStart}
                onMeetingEnd={handleMeetingEnd}
                onSubjectUpdate={handleSubjectUpdate}
            />

            {/* Memo Component */}
            <Memo />
        </div>
    );
}
