export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const meetingId = parseInt(params.id);

        // 더미 데이터(수정 에정)
        const mockSubject = {
            subject: {
                subjectId: 1,
                text: "프로젝트 진행 상황 및 다음 단계",
                files: [
                    {
                        fileId: 1,
                        fileName: "프로젝트_계획서.pdf",
                        fileUrl: "#",
                        fileType: "document",
                        uploadedAt: new Date().toISOString(),
                    },
                    {
                        fileId: 2,
                        fileName: "회의록_초안.docx",
                        fileUrl: "#",
                        fileType: "document",
                        uploadedAt: new Date().toISOString(),
                    },
                ],
            },
        };

        return Response.json(mockSubject);
    } catch (error) {
        return Response.json(
            { error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
            { status: 500 }
        );
    }
}
