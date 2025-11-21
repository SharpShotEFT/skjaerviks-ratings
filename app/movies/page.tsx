'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Movie {
    id: number;
    title: string;
    image: string | null;
    rating: number | null;
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', rating: '', image: null as File | null });
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchMovies = async () => {
        const res = await fetch('/api/movies', { cache: 'no-store' });
        const data = await res.json();
        setMovies(data);
        setLoading(false);
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                setIsAuthenticated(data.isAuthenticated);
            } catch (e) { console.error(e); }
        };

        fetchMovies();
        checkAuth();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let imagePath = null;
            if (formData.image) {
                const uploadData = new FormData();
                uploadData.append('file', formData.image);
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData,
                });
                const uploadJson = await uploadRes.json();
                if (uploadJson.success) {
                    imagePath = uploadJson.path;
                } else {
                    alert('Failed to upload image');
                    return;
                }
            }

            const response = await fetch('/api/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    rating: formData.rating,
                    image: imagePath,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to save movie: ${errorData.error || 'Unknown error'}`);
                return;
            }

            // Success - close form and refresh
            setShowForm(false);
            setFormData({ title: '', rating: '', image: null });
            await fetchMovies();
        } catch (error) {
            console.error('Error creating movie:', error);
            alert('Failed to create movie. Please try again.');
        }
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Movies</h1>
                {isAuthenticated && (
                    <button className="btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Movie'}
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '8px' }}>
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Rating (0-10)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-input"
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Cover Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input"
                            onChange={handleFileChange}
                        />
                    </div>
                    <button type="submit" className="btn">Save Movie</button>
                </form>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid">
                    {movies.map((movie) => (
                        isAuthenticated ? (
                            <Link key={movie.id} href={`/movies/${movie.id}`} className="card" style={{ cursor: 'pointer' }}>
                                <img src={movie.image || '/placeholder.png'} alt={movie.title} className="card-image" />
                                <div className="card-content">
                                    <h3 className="card-title">{movie.title}</h3>
                                    {movie.rating && <div className="rating-badge">{movie.rating}</div>}
                                </div>
                            </Link>
                        ) : (
                            <div key={movie.id} className="card">
                                <img src={movie.image || '/placeholder.png'} alt={movie.title} className="card-image" />
                                <div className="card-content">
                                    <h3 className="card-title">{movie.title}</h3>
                                    {movie.rating && <div className="rating-badge">{movie.rating}</div>}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}
