'use client';

import Button from '../common/Button';

interface Subject {
    subjectId: number;
    text: string;
}

interface FileData {
    fileId: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
}

interface CurrentSubjectProps {
    subject: Subject | null;
    files: FileData[];
}

export default function CurrentSubject({ subject, files }: CurrentSubjectProps) {
    if (!subject) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <p className="text-gray-500 text-center">현재 주제가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Subject Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6">
                <h2 className="text-sm font-medium text-blue-100 mb-2">현재 주제</h2>
                <p className="text-xl font-semibold text-white">{subject.text}</p>
            </div>

            {/* Related Files */}
            {files.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">관련 자료</h3>
                    <div className="space-y-2">
                        {files.map((file) => (
                            <a
                                key={file.fileId}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-500"
                            >
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                                    <p className="text-xs text-gray-500">{file.fileType}</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
