// Mock chat messages store
const chatMessages: Map<number, any[]> = new Map();
let nextMessageId = 1;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { chatId, text, image } = body;

        // Create user message
        const message = {
            messageId: nextMessageId++,
            chatId,
            role: 'user',
            text,
            image,
            timestamp: new Date().toISOString(),
        };

        // Store message
        if (!chatMessages.has(chatId)) {
            chatMessages.set(chatId, []);
        }
        chatMessages.get(chatId)!.push(message);

        return Response.json(message);
    } catch (error) {
        return Response.json(
            { error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}
