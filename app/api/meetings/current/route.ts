// Mock current meeting (for demo purposes)
let currentMeeting: any = null;

export async function GET() {
    try {
        // Return current active meeting
        if (currentMeeting && !currentMeeting.endedAt) {
            return Response.json(currentMeeting);
        }

        // Return null if no active meeting
        return Response.json(null);
    } catch (error) {
        return Response.json(
            { error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}
