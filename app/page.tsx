import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

async function getRecentMovies() {
  return await prisma.movie.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
}

async function getRecentSeries() {
  return await prisma.series.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
}

export default async function Home() {
  const movies = await getRecentMovies();
  const series = await getRecentSeries();

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
          Skjærvik's Ratings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Tracking what I watch, one rating at a time.
        </p>
      </header>

      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Recently Rated Movies</h2>
          <Link href="/movies" style={{ color: 'var(--primary)' }}>View All &rarr;</Link>
        </div>
        <div className="grid">
          {movies.map((movie) => (
            <Link href={`/movies`} key={movie.id} className="card">
              <img src={movie.image || '/placeholder.png'} alt={movie.title} className="card-image" />
              <div className="card-content">
                <h3 className="card-title">{movie.title}</h3>
                {movie.rating && <div className="rating-badge">{movie.rating}</div>}
              </div>
            </Link>
          ))}
          {movies.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No movies rated yet.</p>}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Recently Rated Series</h2>
          <Link href="/series" style={{ color: 'var(--primary)' }}>View All &rarr;</Link>
        </div>
        <div className="grid">
          {series.map((show) => (
            <Link href={`/series/${show.id}`} key={show.id} className="card">
              <img src={show.image || '/placeholder.png'} alt={show.title} className="card-image" />
              <div className="card-content">
                <h3 className="card-title">{show.title}</h3>
                {show.overallRating && <div className="rating-badge">{show.overallRating}</div>}
              </div>
            </Link>
          ))}
          {series.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No series rated yet.</p>}
        </div>
      </section>
    </div>
  );
}
