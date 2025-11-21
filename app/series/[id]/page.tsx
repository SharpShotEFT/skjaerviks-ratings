'use client';

import { useState, useEffect } from 'react';
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
    overallRating: number | null;
    seasons: Season[];
}

export default function SeriesDetailsPage({ params }: { params: { id: string } }) {
    const [series, setSeries] = useState<SeriesDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ seasonNumber: '', episodeNumber: '', title: '', rating: '' });

    useEffect(() => {
        fetchSeriesDetails();
    }, []);

    const fetchSeriesDetails = async () => {
        const res = await fetch(`/api/series/${params.id}`);
        if (res.ok) {
            const data = await res.json();
            setSeries(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`/api/series/${params.id}/episodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        setShowForm(false);
        setFormData({ seasonNumber: '', episodeNumber: '', title: '', rating: '' });
        fetchSeriesDetails();
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
                    <button className="btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Episode'}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '8px', maxWidth: '500px' }}>
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
