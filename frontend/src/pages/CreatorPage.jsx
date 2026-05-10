import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function CreatorPage() {
  const [form, setForm] = useState({ title: '', caption: '', location: '', peoplePresent: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);

  const loadMyPosts = async () => {
    try {
      const data = await apiFetch('/posts/my-posts');
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadMyPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (file) body.append('image', file);

      await apiFetch('/posts', {
        method: 'POST',
        body
      });

      setForm({ title: '', caption: '', location: '', peoplePresent: '' });
      setFile(null);
      setMessage('Upload successful');
      await loadMyPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page">
      <div className="split-layout">
        <div className="card">
          <h2>Creator Studio</h2>
          <p>Upload a photo and store metadata such as title, caption, location, and people present.</p>
          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
          <form className="stack-form" onSubmit={handleSubmit}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea placeholder="Caption" rows="4" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input placeholder="People present (comma separated)" value={form.peoplePresent} onChange={(e) => setForm({ ...form, peoplePresent: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="primary-btn" type="submit">Upload photo</button>
          </form>
        </div>

        <div className="card">
          <h2>My uploads</h2>
          <div className="stack-list">
            {posts.length === 0 ? <p>No uploads yet.</p> : null}
            {posts.map((post) => (
              <div key={post._id} className="mini-post">
                <img src={post.imageUrl} alt={post.title} />
                <div>
                  <strong>{post.title}</strong>
                  <p>{post.caption || 'No caption'}</p>
                  <small>{post.location || 'No location'} · Rating {post.ratingsAverage}/5</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
