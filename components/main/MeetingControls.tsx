'use client';

import { useState } from 'react';
import Button from '../common/Button';
import { meetingApi } from '@/lib/api';

interface MeetingControlsProps {
    isActive: boolean;
    meetingId: number | null;
    onMeetingStart: (meetingId: number, chatId: number) => void;
    onMeetingEnd: () => void;
}

export default function MeetingControls({
    isActive,
    meetingId,
    onMeetingStart,
    onMeetingEnd,
}: MeetingControlsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const startRecording = async (currentMeetingId: number) => {
        try {
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
        setIsLoading(true);
        try {
            const response = await meetingApi.start();
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
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                        {isActive ? '회의 진행 중' : '회의 대기 중'}
                    </span>
                </div>

                <div className="flex space-x-3">
                    {!isActive ? (
                        <Button
                            onClick={handleStart}
                            disabled={isLoading}
                            variant="primary"
                            size="lg"
                            className="min-w-[120px]"
                        >
                            {isLoading ? '시작 중...' : '회의 시작'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleEnd}
                            disabled={isLoading}
                            variant="danger"
                            size="lg"
                            className="min-w-[120px]"
                        >
                            {isLoading ? '종료 중...' : '회의 종료'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
