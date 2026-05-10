import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'consumer' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      login(data.token, data.user);
      navigate(data.user.role === 'creator' ? '/creator' : '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page narrow">
      <div className="card">
        <h2>Create your PhotoSphere account</h2>
        <p className="muted-text">Choose Consumer to browse, comment, and rate. Choose Creator to upload photos and manage your posts.</p>
        {error && <p className="error-text">{error}</p>}
        <form className="stack-form" onSubmit={handleSubmit}>
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <div className="role-selector" aria-label="Choose account type">
            <label className={form.role === 'consumer' ? 'role-option selected' : 'role-option'}>
              <input
                type="radio"
                name="role"
                value="consumer"
                checked={form.role === 'consumer'}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <span>
                <strong>Register as Consumer</strong>
                <small>Browse, search, comment, and rate photos</small>
              </span>
            </label>

            <label className={form.role === 'creator' ? 'role-option selected' : 'role-option'}>
              <input
                type="radio"
                name="role"
                value="creator"
                checked={form.role === 'creator'}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <span>
                <strong>Register as Creator</strong>
                <small>Upload photos with title, caption, location, and people present</small>
              </span>
            </label>
          </div>

          <button className="primary-btn" type="submit">Create account</button>
        </form>
      </div>
    </section>
  );
}
