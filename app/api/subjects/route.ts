export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Mock subject history
        const mockSubjects = Array.from({ length: 8 }, (_, i) => ({
            subjectId: i + 1,
            text: `주제 ${i + 1}: ${['회의 준비', '프로젝트 진행 상황', '예산 검토', '일정 조정', '팀 구성', '기술 검토', '디자인 피드백', '마케팅 전략'][i]}`,
            meetingId: Math.floor(i / 2) + 1,
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        }));

        return Response.json({
            subjects: mockSubjects.slice(0, limit),
            nextCursor: mockSubjects.length > limit ? limit : null,
        });
    } catch (error) {
        return Response.json(
            { error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}
