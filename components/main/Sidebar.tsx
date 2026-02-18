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

    const handleDeleteMeeting = async (e: React.MouseEvent, meetingId: number) => {
        e.stopPropagation();
        if (!confirm('이 회의를 삭제하시겠습니까?')) return;

        try {
            await meetingApi.delete(meetingId);
            setMeetings(prev => prev.filter(m => m.meetingId !== meetingId));
        } catch (error) {
            console.error('Failed to delete meeting:', error);
            alert('회의 삭제에 실패했습니다.');
        }
    };

    const handleDeleteSubject = async (e: React.MouseEvent, subjectId: number) => {
        e.stopPropagation();
        if (!confirm('이 주제를 삭제하시겠습니까?')) return;

        try {
            await subjectApi.delete(subjectId);
            setSubjects(prev => prev.filter(s => s.subjectId !== subjectId));
        } catch (error) {
            console.error('Failed to delete subject:', error);
            alert('주제 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
            {/* Tab Headers */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                <button
                    onClick={() => handleTabChange('meetings')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'meetings'
                        ? 'text-red-500 border-b-2 border-red-500 bg-red-500/10'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                >
                    회의 목록
                </button>
                <button
                    onClick={() => handleTabChange('subjects')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'subjects'
                        ? 'text-red-500 border-b-2 border-red-500 bg-red-500/10'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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
                            <div
                                key={meeting.meetingId}
                                className="relative group w-full text-left p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-red-500/50 hover:bg-zinc-800 transition-all cursor-pointer"
                                onClick={() => onMeetingSelect?.(meeting.meetingId)}
                            >
                                <h3 className="font-medium text-zinc-100 truncate pr-8">
                                    {meeting.title || `회의 #${meeting.meetingId}`}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {new Date(meeting.startedAt).toLocaleString('ko-KR')}
                                </p>
                                {meeting.endedAt && (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded">
                                        종료됨
                                    </span>
                                )}
                                {/* 삭제 버튼 */}
                                <button
                                    onClick={(e) => handleDeleteMeeting(e, meeting.meetingId)}
                                    className="absolute top-2 right-2 p-1.5 rounded-md text-zinc-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                    title="회의 삭제"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {subjects.map((subject) => (
                            <div
                                key={subject.subjectId}
                                className="relative group w-full text-left p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-red-500/50 hover:bg-zinc-800 transition-all cursor-pointer"
                                onClick={() => onSubjectSelect?.(subject.subjectId)}
                            >
                                <p className="text-sm text-zinc-200 line-clamp-2 pr-8">
                                    {subject.text}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {new Date(subject.createdAt).toLocaleString('ko-KR')}
                                </p>
                                {/* 삭제 버튼 */}
                                <button
                                    onClick={(e) => handleDeleteSubject(e, subject.subjectId)}
                                    className="absolute top-2 right-2 p-1.5 rounded-md text-zinc-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                    title="주제 삭제"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </>
                )}

                {isLoading && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    </div>
                )}

            </div>
        </div>
    );
}
