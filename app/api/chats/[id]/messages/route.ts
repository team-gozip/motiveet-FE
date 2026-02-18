const BE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://222.116.142.95:8000';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = searchParams.get('limit');

        const queryParams = new URLSearchParams();
        if (cursor) queryParams.append('cursor', cursor);
        if (limit) queryParams.append('limit', limit);

        const response = await fetch(`${BE_URL}/chats/${id}/messages?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return Response.json(data, { status: response.status });
    } catch (error) {
        return Response.json(
            { error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}

