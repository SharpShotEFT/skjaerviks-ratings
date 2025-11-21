'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Movie {
    id: number;
    title: string;
    image: string | null;
    rating: number | null;
}

export default function MovieEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [formData, setFormData] = useState({ title: '', rating: '', image: null as File | null });
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                if (!data.isAuthenticated) {
                    // Not authenticated, redirect to movies list
                    router.push('/movies');
                    return;
                }
                setIsAuthenticated(data.isAuthenticated);
            } catch (e) {
                console.error(e);
                router.push('/movies');
            }
        };

        const fetchMovie = async () => {
            try {
                const res = await fetch(`/api/movies/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMovie(data);
                    setFormData({
                        title: data.title,
                        rating: data.rating?.toString() || '',
                        image: null,
                    });
                    setCurrentImage(data.image);
                } else {
                    router.push('/movies');
                }
            } catch (e) {
                console.error(e);
                router.push('/movies');
            }
            setLoading(false);
        };

        checkAuth();
        fetchMovie();
    }, [id, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let imagePath = currentImage;

            // Upload new image if selected
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

            const response = await fetch(`/api/movies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    rating: formData.rating,
                    image: imagePath,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to update movie: ${errorData.error || 'Unknown error'}`);
                return;
            }

            // Success - redirect back to movies list
            router.push('/movies');
        } catch (error) {
            console.error('Error updating movie:', error);
            alert('Failed to update movie. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${movie?.title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/movies/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to delete movie: ${errorData.error || 'Unknown error'}`);
                return;
            }

            // Success - redirect to movies list
            router.push('/movies');
        } catch (error) {
            console.error('Error deleting movie:', error);
            alert('Failed to delete movie. Please try again.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!movie || !isAuthenticated) return null;

    return (
        <div style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Edit Movie</h1>
                <button className="btn" onClick={() => router.push('/movies')} style={{ background: 'var(--surface-highlight)' }}>
                    Cancel
                </button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                {currentImage && (
                    <div>
                        <h3 style={{ marginBottom: '1rem' }}>Current Image</h3>
                        <img src={currentImage} alt={movie.title} style={{ width: '200px', borderRadius: '8px' }} />
                    </div>
                )}
            </div>

            <form onSubmit={handleUpdate} style={{ maxWidth: '600px', padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
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
                    <label className="form-label">Update Cover Image (optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={handleFileChange}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn" style={{ flex: 1 }}>
                        Save Changes
                    </button>
                    <button
                        type="button"
                        className="btn"
                        onClick={handleDelete}
                        style={{ background: 'var(--danger)', flex: 1 }}
                    >
                        Delete Movie
                    </button>
                </div>
            </form>
        </div>
    );
}
