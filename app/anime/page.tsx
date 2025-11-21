'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Series {
    id: number;
    title: string;
    image: string | null;
    overallRating: number | null;
}

export default function AnimePage() {
    const [series, setSeries] = useState<Series[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', overallRating: '', image: null as File | null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSeries();
    }, []);

    const fetchSeries = async () => {
        const res = await fetch('/api/series?type=ANIME');
        const data = await res.json();
        setSeries(data);
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            }
        }

        await fetch('/api/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: formData.title,
                overallRating: formData.overallRating,
                image: imagePath,
                type: 'ANIME',
            }),
        });

        setShowForm(false);
        setFormData({ title: '', overallRating: '', image: null });
        fetchSeries();
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Anime</h1>
                <button className="btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add Anime'}
                </button>
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
                        <label className="form-label">Overall Rating (0-10)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-input"
                            value={formData.overallRating}
                            onChange={(e) => setFormData({ ...formData, overallRating: e.target.value })}
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
                    <button type="submit" className="btn">Save Anime</button>
                </form>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid">
                    {series.map((show) => (
                        <Link key={show.id} href={`/series/${show.id}`} className="card">
                            <img src={show.image || '/placeholder.png'} alt={show.title} className="card-image" />
                            <div className="card-content">
                                <h3 className="card-title">{show.title}</h3>
                                {show.overallRating && <div className="rating-badge">{show.overallRating}</div>}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
