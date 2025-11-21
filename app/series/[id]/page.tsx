'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Episode {
    id: number;
    episodeNumber: number;
    title: string | null;
    rating: number | null;
}

interface Season {
    id: number;
    seasonNumber: number;
    episodes: Episode[];
}

interface SeriesDetails {
    id: number;
    title: string;
    image: string | null;
    type: string;
    overallRating: number | null;
    seasons: Season[];
}

export default function SeriesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [series, setSeries] = useState<SeriesDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [formData, setFormData] = useState({ seasonNumber: '', episodeNumber: '', title: '', rating: '' });
    const [editFormData, setEditFormData] = useState({ title: '', overallRating: '', image: null as File | null });
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchSeriesDetails = async () => {
        const res = await fetch(`/api/series/${id}`);
        if (res.ok) {
            const data = await res.json();
            setSeries(data);
            setEditFormData({
                title: data.title,
                overallRating: data.overallRating?.toString() || '',
                image: null,
            });
            setCurrentImage(data.image);
        }
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

        fetchSeriesDetails();
        checkAuth();
    }, [id]);

    const handleEpisodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`/api/series/${id}/episodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        setShowForm(false);
        setFormData({ seasonNumber: '', episodeNumber: '', title: '', rating: '' });
        fetchSeriesDetails();
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let imagePath = currentImage;

            if (editFormData.image) {
                const uploadData = new FormData();
                uploadData.append('file', editFormData.image);
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

            const response = await fetch(`/api/series/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editFormData.title,
                    overallRating: editFormData.overallRating,
                    image: imagePath,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to update series: ${errorData.error || 'Unknown error'}`);
                return;
            }

            setShowEditForm(false);
            fetchSeriesDetails();
        } catch (error) {
            console.error('Error updating series:', error);
            alert('Failed to update series. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${series?.title}" and ALL its episodes? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/series/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to delete series: ${errorData.error || 'Unknown error'}`);
                return;
            }

            // Redirect based on series type
            router.push(series?.type === 'ANIME' ? '/anime' : '/series');
        } catch (error) {
            console.error('Error deleting series:', error);
            alert('Failed to delete series. Please try again.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!series) return <p>Series not found</p>;

    // Prepare Graph Data
    const allEpisodes = series.seasons.flatMap(s =>
        s.episodes.map(e => ({
            label: `S${s.seasonNumber}E${e.episodeNumber}`,
            rating: e.rating,
            season: s.seasonNumber
        }))
    );

    const chartData = {
        labels: allEpisodes.map(e => e.label),
        datasets: [
            {
                label: 'Episode Rating',
                data: allEpisodes.map(e => e.rating),
                borderColor: 'rgb(229, 9, 20)',
                backgroundColor: 'rgba(229, 9, 20, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Rating History',
            },
        },
        scales: {
            y: {
                min: 0,
                max: 10,
            },
        },
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <div className="series-header">
                <img src={series.image || '/placeholder.png'} alt={series.title} className="series-poster" />
                <div className="series-info">
                    <h1>{series.title}</h1>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        Overall Rating: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{series.overallRating}</span>
                    </div>
                    {isAuthenticated && (
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn" onClick={() => { setShowForm(!showForm); setShowEditForm(false); }}>
                                {showForm ? 'Cancel' : 'Add Episode'}
                            </button>
                            <button className="btn" onClick={() => { setShowEditForm(!showEditForm); setShowForm(false); }} style={{ background: 'var(--surface-highlight)' }}>
                                {showEditForm ? 'Cancel' : 'Edit Series'}
                            </button>
                            <button className="btn" onClick={handleDelete} style={{ background: 'var(--danger)' }}>
                                Delete Series
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {showForm && (
                <form onSubmit={handleEpisodeSubmit} style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '8px', maxWidth: '500px' }}>
                    <div className="form-group">
                        <label className="form-label">Season Number</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.seasonNumber}
                            onChange={(e) => setFormData({ ...formData, seasonNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Episode Number</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.episodeNumber}
                            onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    <button type="submit" className="btn">Save Episode</button>
                </form>
            )}

            {showEditForm && (
                <form onSubmit={handleEditSubmit} style={{ marginBottom: '2rem', padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--glass-border)', maxWidth: '600px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Edit Series Details</h2>

                    {currentImage && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>Current Image</h4>
                            <img src={currentImage} alt={series.title} style={{ width: '150px', borderRadius: '8px' }} />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Overall Rating (0-10)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-input"
                            value={editFormData.overallRating}
                            onChange={(e) => setEditFormData({ ...editFormData, overallRating: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Update Cover Image (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setEditFormData({ ...editFormData, image: e.target.files[0] });
                                }
                            }}
                        />
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Save Changes
                    </button>
                </form>
            )}

            <div className="graph-container">
                <Line options={chartOptions} data={chartData} />
            </div>

            <div style={{ marginTop: '4rem' }}>
                {series.seasons.map((season) => (
                    <div key={season.id} className="season-section">
                        <h2 style={{ marginBottom: '1rem' }}>Season {season.seasonNumber}</h2>
                        <div className="episode-list">
                            {season.episodes.map((episode) => (
                                <div key={episode.id} className="episode-item">
                                    <span>
                                        <strong>{episode.episodeNumber}.</strong> {episode.title || `Episode ${episode.episodeNumber}`}
                                    </span>
                                    <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{episode.rating}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
