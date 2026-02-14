// ===== 외부 API 연동 대기 중 - 이 파일은 사용되지 않음 =====
// lib/api.ts에서 직접 mock 데이터를 반환합니다.

// Mock token generation
// function generateToken(userId: number): string {
//     return `mock_token_${userId}_${Date.now()}`;
// }

// Import mock data from signup (in real app, use shared state or DB)
// const users: any[] = [];

export async function POST(request: Request) {
    // ===== 외부 API 연동 코드 (주석처리) =====
    // try {
    //     const body = await request.json();
    //     const { id, password } = body;
    //
    //     // Find user
    //     const user = users.find(u => u.id === id && u.password === password);
    //
    //     if (!user) {
    //         return Response.json(
    //             { success: false, error: { code: 'INVALID_CREDENTIALS', message: '아이디 또는 비밀번호가 올바르지 않습니다.' } },
    //             { status: 401 }
    //         );
    //     }
    //
    //     // Generate tokens
    //     const accessToken = generateToken(user.userId);
    //     const refreshToken = generateToken(user.userId);
    //
    //     return Response.json({
    //         success: true,
    //         accessToken,
    //         refreshToken,
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
