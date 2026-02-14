// ===== 외부 API 연동 대기 중 - 이 파일은 사용되지 않음 =====
// lib/api.ts에서 직접 mock 데이터를 반환합니다.

// Mock meetings store
// const meetings: any[] = [];
// let nextMeetingId = 1;
// let nextChatId = 1;
// let currentMeeting: any = null;

export async function POST(request: Request) {
    // ===== 외부 API 연동 코드 (주석처리) =====
    // try {
    //     const body = await request.json();
    //     const { title } = body;
    //
    //     // Create new meeting
    //     const meeting = {
    //         meetingId: nextMeetingId++,
    //         userId: 1, // Mock user ID
    //         title: title || `회의 #${nextMeetingId}`,
    //         startedAt: new Date().toISOString(),
    //         endedAt: null,
    //         chatId: nextChatId++,
    //         files: [],
    //     };
    //
    //     meetings.push(meeting);
    //     currentMeeting = meeting;
    //
    //     return Response.json({
    //         success: true,
    //         meetingId: meeting.meetingId,
    //         chatId: meeting.chatId,
    //         startedAt: meeting.startedAt,
    //     });
    // } catch (error) {
    //     return Response.json(
    //         { success: false, error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
    //         { status: 500 }
    //     );
    // }
    // ===== 외부 API 연동 코드 끝 =====

    // API 연동 대기 중 - lib/api.ts에서 mock 데이터 사용
    return Response.json({
        success: false,
        error: { code: 'API_DISABLED', message: 'API integration disabled - using mock data' }
    }, { status: 501 });
}
