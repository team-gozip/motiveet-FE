'use client';

import { useState } from 'react';
import Button from '../common/Button';
import { meetingApi } from '@/lib/api';

interface MeetingControlsProps {
    isActive: boolean;
    meetingId: number | null;
    onMeetingStart: (meetingId: number, chatId: number) => void;
    onMeetingEnd: () => void;
    onSubjectUpdate?: (subject: any) => void;
}

export default function MeetingControls({
    isActive,
    meetingId,
    onMeetingStart,
    onMeetingEnd,
    onSubjectUpdate,
}: MeetingControlsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const startRecording = async (currentMeetingId: number) => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('마이크 접근이 불가능합니다.\n보안 연결(HTTPS) 또는 localhost에서만 마이크를 사용할 수 있습니다.\n현재 주소(HTTP IP)에서는 브라우저가 마이크를 차단합니다.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            let chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            const id = setInterval(() => {
                if (recorder.state === 'recording') {
                    recorder.requestData();

                    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                    chunks = [];

                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64Data = reader.result as string;
                        meetingApi.uploadAudio(currentMeetingId, base64Data)
                            .then(response => {
                                console.log('[Audio Upload] Success:', response);
                                // 주제가 업데이트되었으면 부모 컴포넌트에 알림
                                if (response.success && response.subject && onSubjectUpdate) {
                                    onSubjectUpdate(response.subject);
                                }
                            })
                            .catch(err => console.error('Audio upload failed:', err));
                    };
                }
            }, 60000);

            setIntervalId(id);
            setMediaRecorder(recorder);
            recorder.start();
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('마이크 접근 권한이 필요합니다.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        setMediaRecorder(null);
    };

    const handleStart = async () => {
        const title = prompt('회의 제목을 입력해주세요:', '새로운 회의');
        if (!title) return;

        setIsLoading(true);
        try {
            const response = await meetingApi.start(title);
            if (response.success) {
                onMeetingStart(response.meetingId, response.chatId);
                await startRecording(response.meetingId);
            }
        } catch (error) {
            console.error('Failed to start meeting:', error);
            alert('회의 시작에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnd = async () => {
        if (!meetingId) return;

        const confirmed = confirm('회의를 종료하시겠습니까?');
        if (!confirmed) return;

        setIsLoading(true);
        try {
            const response = await meetingApi.end(meetingId);
            if (response.success) {
                stopRecording();
                onMeetingEnd();
            }
        } catch (error) {
            console.error('Failed to end meeting:', error);
            alert('회의 종료에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-300 border-t border-zinc-400 p-4 shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-zinc-400'}`}></div>
                    <span className="text-sm font-semibold text-zinc-700">
                        {isActive ? '회의 진행 중' : '회의 대기 중'}
                    </span>
                </div>

                <div className="flex space-x-3">
                    {!isActive ? (
                        <button
                            onClick={handleStart}
                            disabled={isLoading}
                            className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:bg-zinc-500 disabled:scale-100"
                        >
                            {isLoading ? '시작 중...' : '회의 시작'}
                        </button>
                    ) : (
                        <button
                            onClick={handleEnd}
                            disabled={isLoading}
                            className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:bg-zinc-500"
                        >
                            {isLoading ? '종료 중...' : '회의 종료'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
