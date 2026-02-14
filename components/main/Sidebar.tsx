'use client';

import { useEffect, useState } from 'react';
import { meetingApi, subjectApi } from '@/lib/api';

interface Meeting {
    meetingId: number;
    title: string;
    startedAt: string;
    endedAt: string | null;
    subjectCount?: number;
}

interface Subject {
    subjectId: number;
    text: string;
    meetingId: number;
    createdAt: string;
}

interface SidebarProps {
    onMeetingSelect?: (meetingId: number) => void;
    onSubjectSelect?: (subjectId: number) => void;
}

export default function Sidebar({ onMeetingSelect, onSubjectSelect }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'meetings' | 'subjects'>('meetings');
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            if (activeTab === 'meetings') {
                const response = await meetingApi.getHistory(cursor || undefined, 10);
                setMeetings(prev => cursor ? [...prev, ...response.meetings] : response.meetings);
                setCursor(response.nextCursor);
                setHasMore(response.nextCursor !== null);
            } else {
                const response = await subjectApi.getHistory(cursor || undefined, 10);
                setSubjects(prev => cursor ? [...prev, ...response.subjects] : response.subjects);
                setCursor(response.nextCursor);
                setHasMore(response.nextCursor !== null);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: 'meetings' | 'subjects') => {
        setActiveTab(tab);
        setCursor(null);
        setHasMore(true);
        setMeetings([]);
        setSubjects([]);
    };

    return (
        <div className="h-full bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 bg-white">
                <button
                    onClick={() => handleTabChange('meetings')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'meetings'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    회의 목록
                </button>
                <button
                    onClick={() => handleTabChange('subjects')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'subjects'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    주제 목록
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activeTab === 'meetings' ? (
                    <>
                        {meetings.map((meeting) => (
                            <button
                                key={meeting.meetingId}
                                onClick={() => onMeetingSelect?.(meeting.meetingId)}
                                className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                            >
                                <h3 className="font-medium text-gray-900 truncate">
                                    {meeting.title || `회의 #${meeting.meetingId}`}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(meeting.startedAt).toLocaleString('ko-KR')}
                                </p>
                                {meeting.endedAt && (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                        종료됨
                                    </span>
                                )}
                            </button>
                        ))}
                    </>
                ) : (
                    <>
                        {subjects.map((subject) => (
                            <button
                                key={subject.subjectId}
                                onClick={() => onSubjectSelect?.(subject.subjectId)}
                                className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                            >
                                <p className="text-sm text-gray-900 line-clamp-2">
                                    {subject.text}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(subject.createdAt).toLocaleString('ko-KR')}
                                </p>
                            </button>
                        ))}
                    </>
                )}

                {isLoading && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                )}

            </div>
        </div>
    );
}
