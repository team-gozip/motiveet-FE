'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/main/Sidebar';
import CurrentSubject from '@/components/main/CurrentSubject';
import ChatInterface from '@/components/main/ChatInterface';
import MeetingControls from '@/components/main/MeetingControls';
import { isAuthenticated, logout } from '@/lib/auth';
import { meetingApi, subjectApi } from '@/lib/api';

export default function MainPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [currentMeeting, setCurrentMeeting] = useState<any>(null);
    const [currentSubject, setCurrentSubject] = useState<any>(null);
    const [chatId, setChatId] = useState<number | null>(null);

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

    const handleLogout = () => {
        logout();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="h-16 px-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        회의 기록 시스템
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        로그아웃
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 flex-shrink-0">
                    <Sidebar
                        onMeetingSelect={handleMeetingSelect}
                        onSubjectSelect={(subjectId) => console.log('Subject selected:', subjectId)}
                    />
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Current Subject */}
                        <CurrentSubject
                            subject={currentSubject}
                            files={currentSubject?.files || []}
                        />

                        {/* Chat Interface */}
                        <div className="h-[500px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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
            />
        </div>
    );
}
