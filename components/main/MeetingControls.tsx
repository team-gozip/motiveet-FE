import { useState, useEffect, useRef } from 'react';
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
    const [volume, setVolume] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const startRecording = async (currentMeetingId: number) => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('마이크 접근이 불가능합니다.\n보안 연결(HTTPS) 또는 localhost에서만 마이크를 사용할 수 있습니다.\n현재 주소(HTTP IP)에서는 브라우저가 마이크를 차단합니다.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup Web Audio API for volume monitoring
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setVolume(average);
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();

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

                    meetingApi.uploadAudio(currentMeetingId, audioBlob)
                        .then(response => {
                            console.log('[Audio Upload] Success:', response);
                            if (response.success && response.subject && onSubjectUpdate) {
                                onSubjectUpdate(response.subject);
                            }
                        })
                        .catch(err => console.error('Audio upload failed:', err));
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
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setMediaRecorder(null);
        setVolume(0);
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

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (intervalId) clearInterval(intervalId);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [intervalId]);

    // Volume Meter Component (SVG Waves)
    const VolumeMeter = () => {
        const isHigh = volume > 80;
        const color = isHigh ? '#ef4444' : '#10b981'; // Red-500 or Emerald-500
        const opacity = isActive ? Math.min(0.3 + volume / 100, 1) : 0.2;

        return (
            <div className="flex items-center space-x-1.5 ml-2">
                <div className="flex items-center space-x-0.5">
                    {/* Visualizing 3 waves like ))) */}
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="w-1 rounded-full transition-all duration-75"
                            style={{
                                height: `${Math.max(4, (volume / (4 - i + 1)) * 0.4)}px`,
                                backgroundColor: isActive && volume > (i * 20) ? color : '#94a3b8',
                                opacity: isActive ? 1 : 0.3
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] px-6 py-3 rounded-full shadow-2xl transition-all duration-300 hover:shadow-[var(--accent-primary)]/10 active:scale-[0.99]">
            <div className="flex items-center justify-between space-x-8">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className={`w-3.5 h-3.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-gray-400 opacity-50'}`}></div>
                            {isActive && <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping opacity-40"></div>}
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)] opacity-60 tracking-wider whitespace-nowrap">
                            {isActive ? 'RECORDING LIVE' : 'READY TO START'}
                        </span>
                    </div>

                    {/* Real-time Audio Visualizer */}
                    <div className="flex items-center h-4 border-l border-[var(--border-color)] pl-4">
                        <VolumeMeter />
                    </div>
                </div>

                <div className="flex items-center">
                    {!isActive ? (
                        <button
                            onClick={handleStart}
                            disabled={isLoading}
                            className="px-10 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-500 disabled:scale-100 uppercase tracking-widest"
                        >
                            {isLoading ? 'Wait...' : 'Start Meeting'}
                        </button>
                    ) : (
                        <button
                            onClick={handleEnd}
                            disabled={isLoading}
                            className="px-10 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-sm font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-500 uppercase tracking-widest"
                        >
                            {isLoading ? 'Wait...' : 'End Meeting'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
