// ===== 외부 API 연동 대기 중 - 이 파일은 사용되지 않음 =====
// lib/api.ts에서 직접 mock 데이터를 반환합니다.

// Mock data store
// let users: any[] = [];
// let meetings: any[] = [];
// let subjects: any[] = [];
// let chats: any[] = [];
// let messages: any[] = [];
// let currentMeetingId: number | null = null;

// Helper to generate IDs
// let nextUserId = 1;
// let nextMeetingId = 1;
// let nextSubjectId = 1;
// let nextChatId = 1;
// let nextMessageId = 1;

export async function POST(request: Request) {
    // ===== 외부 API 연동 코드 (주석처리) =====
    // try {
    //     const body = await request.json();
    //     const { id, password } = body;
    //
    //     // Check if user already exists
    //     const existingUser = users.find(u => u.id === id);
    //     if (existingUser) {
    //         return Response.json(
    //             { success: false, error: { code: 'USER_EXISTS', message: '이미 존재하는 아이디입니다.' } },
    //             { status: 400 }
    //         );
    //     }
    //
    //     // Create new user
    //     const newUser = {
    //         userId: nextUserId++,
    //         id,
    //         password, // In production, this should be hashed
    //         createdAt: new Date().toISOString(),
    //     };
    //
    //     users.push(newUser);
    //
    //     return Response.json({
    //         success: true,
    //         userId: newUser.userId,
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
