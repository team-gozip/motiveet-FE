export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Mock meeting history
        const mockMeetings = Array.from({ length: 5 }, (_, i) => ({
            meetingId: i + 1,
            title: `회의 #${i + 1}`,
            startedAt: new Date(Date.now() - i * 86400000).toISOString(),
            endedAt: new Date(Date.now() - i * 86400000 + 3600000).toISOString(),
            subjectCount: Math.floor(Math.random() * 5) + 1,
        }));

        return Response.json({
            meetings: mockMeetings.slice(0, limit),
            nextCursor: mockMeetings.length > limit ? limit : null,
        });
    } catch (error) {
        return Response.json(
            { error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}
