'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../common/Input';
import Button from '../common/Button';
import { authApi, setTokens } from '@/lib/api';
import { validatePassword, passwordsMatch } from '@/lib/auth';

export default function SignupForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        id: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.id.trim()) {
            newErrors.id = '아이디를 입력해주세요.';
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            newErrors.password = passwordValidation.error || '';
        }

        if (!passwordsMatch(formData.password, formData.confirmPassword)) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await authApi.signup({
                id: formData.id,
                password: formData.password,
            });

            if (response.success) {
                // Auto-login after successful signup
                const loginResponse = await authApi.signin({
                    id: formData.id,
                    password: formData.password,
                });

                if (loginResponse.success) {
                    setTokens(loginResponse.accessToken, loginResponse.refreshToken);
                    router.push('/');
                }
            }
        } catch (error) {
            setErrors({
                submit: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    회원가입
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="아이디"
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        error={errors.id}
                        placeholder="아이디를 입력하세요"
                        autoComplete="username"
                    />

                    <Input
                        label="비밀번호"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="8자 이상, 특수문자 1개 이상"
                        autoComplete="new-password"
                    />

                    <Input
                        label="비밀번호 확인"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        placeholder="비밀번호를 다시 입력하세요"
                        autoComplete="new-password"
                    />

                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? '처리 중...' : '가입하기'}
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                        이미 계정이 있으신가요?{' '}
                        <a href="/login" className="text-blue-600 hover:underline font-medium">
                            로그인
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
