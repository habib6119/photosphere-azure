import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <article className="card post-card">
      <img src={post.imageUrl} alt={post.title} className="post-image" />
      <div className="card-body">
        <h3>{post.title}</h3>
        <p>{post.caption || 'No caption provided.'}</p>
        <div className="meta">Creator: {post.creator?.name || 'Unknown'}</div>
        <div className="meta">Location: {post.location || 'Not specified'}</div>
        <div className="meta">People: {post.peoplePresent?.length ? post.peoplePresent.join(', ') : 'None listed'}</div>
        <div className="meta">Rating: {post.ratingsAverage} / 5 ({post.ratingsCount})</div>
        <Link className="primary-btn inline-btn" to={`/posts/${post._id}`}>View Post</Link>
      </div>
    </article>
  );
}
