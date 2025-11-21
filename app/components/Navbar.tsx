'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                setIsAuthenticated(data.isAuthenticated);
            } catch (error) {
                console.error('Auth check failed', error);
            }
        };
        checkAuth();
    }, [pathname]);

    const handleLogout = async () => {
        document.cookie = 'auth=; Max-Age=0; path=/;';
        setIsAuthenticated(false);
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link href="/">Skjærvik's Ratings</Link>
                <span className={`mode-badge ${isAuthenticated ? 'mode-odin' : 'mode-visitor'}`}>
                    {isAuthenticated ? 'Odin Mode' : 'Visitor Mode'}
                </span>
            </div>
            <div className="nav-links">
                <Link href="/movies" className={pathname === '/movies' ? 'active' : ''}>Movies</Link>
                <Link href="/series" className={pathname === '/series' ? 'active' : ''}>Series</Link>
                <Link href="/anime" className={pathname === '/anime' ? 'active' : ''}>Anime</Link>

                {isAuthenticated ? (
                    <button onClick={handleLogout} className="nav-link-btn">Logout</button>
                ) : (
                    <Link href="/login" className={pathname === '/login' ? 'active' : ''}>Login</Link>
                )}
            </div>
        </nav>
    );
}
