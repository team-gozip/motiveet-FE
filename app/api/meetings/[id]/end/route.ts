let currentMeeting: any = null;

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const meetingId = parseInt(params.id);

        // End the meeting
        if (currentMeeting && currentMeeting.meetingId === meetingId) {
            currentMeeting.endedAt = new Date().toISOString();

            return Response.json({
                success: true,
                endedAt: currentMeeting.endedAt,
            });
        }

        return Response.json(
            { success: false, error: { code: 'NOT_FOUND', message: '회의를 찾을 수 없습니다.' } },
            { status: 404 }
        );
    } catch (error) {
        return Response.json(
            { success: false, error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}
