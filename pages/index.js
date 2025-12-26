import Head from 'next/head';
import MovieRecommender from '../components/MovieRecommender';

export default function Home({ user }) {
  return (
    <>
      <Head>
        <title>MovieRec - AI-Powered Movie Recommendations</title>
        <meta name="description" content="Get personalized movie recommendations powered by machine learning" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-dark-bg">
        <MovieRecommender user={user} />
      </main>
    </>
  );
}
