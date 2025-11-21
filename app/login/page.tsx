'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        console.log('Submitting login...');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            console.log('Login response:', { status: res.status, data });

            if (res.ok && data.success) {
                console.log('Login successful, redirecting...');
                // Login successful - force full page reload to ensure auth state updates
                window.location.href = '/';
            } else {
                console.log('Login failed');
                setError(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <form onSubmit={handleSubmit} style={{ padding: '2rem', backgroundColor: 'var(--secondary)', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Login</h1>
                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
            </form>
        </div>
    );
}
