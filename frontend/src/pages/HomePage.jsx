import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import PostCard from '../components/PostCard';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch(`/posts${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    loadPosts(search);
  };

  return (
    <section className="page">
      <div className="hero">
        <div>
          <h1>Cloud-style photo sharing demo</h1>
          <p>Creators upload photos with metadata. Consumers browse, search, comment, and rate posts.</p>
        </div>
    
      </div>

      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, caption, location, or people"
        />
        <button className="primary-btn" type="submit">Search</button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {loading ? <p>Loading posts...</p> : null}
      {!loading && posts.length === 0 ? <p>No posts found.</p> : null}

      <div className="grid">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
