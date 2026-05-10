import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../utils/imageUrl';

export default function PostDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [score, setScore] = useState(5);
  const [error, setError] = useState('');

  const loadPost = async () => {
    try {
      const data = await apiFetch(`/posts/${id}`);
      setPost(data.post);
      setComments(data.comments);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText })
      });
      setCommentText('');
      await loadPost();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitRating = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/posts/${id}/rate`, {
        method: 'POST',
        body: JSON.stringify({ score: Number(score) })
      });
      await loadPost();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <section className="page"><p className="error-text">{error}</p></section>;
  if (!post) return <section className="page"><p>Loading post...</p></section>;

  return (
    <section className="page">
      <div className="details-layout">
        <div className="card">
          <img src={resolveImageUrl(post.imageUrl)} alt={post.title} className="details-image" />
        </div>
        <div className="card">
          <h2>{post.title}</h2>
          <p>{post.caption || 'No caption provided.'}</p>
          <p><strong>Creator:</strong> {post.creator?.name}</p>
          <p><strong>Location:</strong> {post.location || 'Not specified'}</p>
          <p><strong>People present:</strong> {post.peoplePresent?.length ? post.peoplePresent.join(', ') : 'None listed'}</p>
          <p><strong>Rating:</strong> {post.ratingsAverage} / 5 ({post.ratingsCount} ratings)</p>

          {user && (
            <>
              <form className="stack-form" onSubmit={submitRating}>
                <label>Rate this post</label>
                <select value={score} onChange={(e) => setScore(e.target.value)}>
                  {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <button className="primary-btn" type="submit">Submit rating</button>
              </form>

              <form className="stack-form" onSubmit={submitComment}>
                <label>Add a comment</label>
                <textarea rows="4" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write your comment" />
                <button className="primary-btn" type="submit">Post comment</button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Comments</h3>
        {comments.length === 0 ? <p>No comments yet.</p> : null}
        <div className="stack-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <strong>{comment.user?.name}</strong>
              <p>{comment.text}</p>
              <small>{new Date(comment.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
