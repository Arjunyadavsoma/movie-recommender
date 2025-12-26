import Head from 'next/head';

export default function SEO({ 
  title = "MovieRec AI - Smart Movie Recommendations",
  description = "Discover your next favorite movie with AI-powered recommendations. Search 32,000+ movies and get instant, personalized suggestions.",
  image = "/og-image.png",
  url = "https://your-domain.vercel.app"
}) {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      
      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta */}
      <meta name="keywords" content="movie recommendations, AI movies, movie search, film suggestions, TMDB, machine learning" />
      <meta name="author" content="Soma Arjun Yadav" />
      <meta name="theme-color" content="#E50914" />
    </Head>
  );
}
