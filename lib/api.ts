const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

//AccessToken 발급
export const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
};

//RefreshToken 발급
export const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
};

// localStorage에 accessToken, refreshToken 저장
export const setTokens = (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

// localStorage내부 Token(access, refresh) 삭제
export const clearTokens = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAccessToken();

    // 해더 설정 : Content-Type, Authorization
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // 토큰이 존재하면 Authorization 헤더에 추가
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // API 호출
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // response.ok == false => 에러 생성
    if (!response.ok) {
        const error = await response.json().catch(() => ({
            error: { code: 'UNKNOWN', message: 'An error occurred' }
        }));
        throw new Error(error.error?.message || 'API call failed');
    }

    return response.json();
}

// 인증 API
export const authApi = {
    // 회원가입
    //endpoint : /auth/signup
    //method : POST
    //body : { id, password }
    signup: async (data: { id: string; password: string }) => {
        return apiCall<{ success: boolean; userId: number }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // 로그인
    //endpoint : /auth/signin
    //method : POST
    //body : { id, password }
    signin: async (data: { id: string; password: string }) => {
        return apiCall<{ success: boolean; accessToken: string; refreshToken: string }>(
            '/auth/signin',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    },

    // 로그아웃
    //endpoint : /auth/logout
    //method : POST
    //body : { refreshToken }
    logout: async () => {
        const refreshToken = getRefreshToken();
        return apiCall<{ success: boolean }>('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    },
};

// meeting api
export const meetingApi = {
    // 현재 진행중인 회의
    //endpoint : /meetings/current
    //method : GET
    getCurrent: async () => {
        return apiCall<any>('/meetings/current');
    },

    // 회의 상세 조회
    //endpoint : /meetings/{meetingId}
    //method : GET
    getById: async (meetingId: number) => {
        return apiCall<any>(`/meetings/${meetingId}`);
    },

    // 회의 목록 조회
    //endpoint : /meetings
    //method : GET
    //query : cursor, limit
    getHistory: async (cursor?: number, limit: number = 10) => {
        const params = new URLSearchParams();
        if (cursor) params.append('cursor', cursor.toString());
        params.append('limit', limit.toString());

        return apiCall<any>(`/meetings?${params.toString()}`);
    },

    // 회의 시작
    //endpoint : /meetings/start
    //method : POST
    //body : { title }
    start: async (title?: string) => {
        return apiCall<any>('/meetings/start', {
            method: 'POST',
            body: JSON.stringify({ title }),
        });
    },

    // 회의 종료
    //endpoint : /meetings/{meetingId}/end
    //method : POST
    end: async (meetingId: number) => {
        return apiCall<any>(`/meetings/${meetingId}/end`, {
            method: 'POST',
        });
    },

    // 회의 삭제
    //endpoint : /meetings/{meetingId}
    //method : DELETE
    delete: async (meetingId: number) => {
        return apiCall<{ success: boolean }>(`/meetings/${meetingId}`, {
            method: 'DELETE',
        });
    },

    uploadAudio: async (meetingId: number, audioData: string) => {
        return apiCall<{ success: boolean }>(`/meetings/${meetingId}/audio`, {
            method: 'POST',
            body: JSON.stringify({ audioData }),
        });
    },
};

export const subjectApi = {
    getCurrent: async (meetingId: number) => {
        return apiCall<any>(`/meetings/${meetingId}/subject`);
    },

    select: async (text: string) => {
        return apiCall<any>('/subjects/select', {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    },

    getHistory: async (cursor?: number, limit: number = 10) => {
        const params = new URLSearchParams();
        if (cursor) params.append('cursor', cursor.toString());
        params.append('limit', limit.toString());

        return apiCall<any>(`/subjects?${params.toString()}`);
    },

    delete: async (subjectId: number) => {
        return apiCall<{ success: boolean }>(`/subjects/${subjectId}`, {
            method: 'DELETE',
        });
    },
};

export const chatApi = {
    sendMessage: async (chatId: number, text?: string, image?: string) => {
        return apiCall<any>('/chats/messages', {
            method: 'POST',
            body: JSON.stringify({ chatId, text, image }),
        });
    },

    getAnswer: async (messageId: number) => {
        return apiCall<any>(`/chats/messages/${messageId}/answer`, {
            method: 'POST',
        });
    },

    getHistory: async (chatId: number, cursor?: number, limit: number = 50) => {
        const params = new URLSearchParams();
        if (cursor) params.append('cursor', cursor.toString());
        params.append('limit', limit.toString());

        return apiCall<any>(`/chats/${chatId}/messages?${params.toString()}`);
    },
};
