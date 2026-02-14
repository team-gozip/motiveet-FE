// Mock AI responses
const mockAIResponses = [
    "네, 이해했습니다. 더 자세히 설명해드릴게요.",
    "좋은 질문이네요. 제 생각에는...",
    "그 부분에 대해서는 다음과 같이 정리할 수 있습니다.",
    "추가로 고려해야 할 사항이 있습니다.",
    "정확한 답변을 드리면...",
];

const chatMessages: Map<number, any[]> = new Map();
let nextMessageId = 1000;

export async function POST(
    request: Request,
    { params }: { params: { messageId: string } }
) {
    try {
        const messageId = parseInt(params.messageId);

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate AI response
        const randomResponse = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];

        const aiMessage = {
            messageId: nextMessageId++,
            role: 'assistant',
            text: randomResponse,
            timestamp: new Date().toISOString(),
        };

        return Response.json(aiMessage);
    } catch (error) {
        return Response.json(
            { error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}
