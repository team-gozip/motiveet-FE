export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const chatId = parseInt(params.id);
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Mock chat history
        const mockMessages = [
            {
                messageId: 1,
                chatId,
                role: 'user',
                text: '안녕하세요, 오늘 회의 주제에 대해 설명해주세요.',
                timestamp: new Date(Date.now() - 300000).toISOString(),
            },
            {
                messageId: 2,
                chatId,
                role: 'assistant',
                text: '네, 오늘은 프로젝트 진행 상황과 다음 단계에 대해 논의하겠습니다.',
                timestamp: new Date(Date.now() - 290000).toISOString(),
            },
        ];

        return Response.json({
            messages: mockMessages,
            nextCursor: null,
        });
    } catch (error) {
        return Response.json(
            { error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}
