import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const data = await apiFetch('/auth/login', {
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
        <h2>Login</h2>
        {error && <p className="error-text">{error}</p>}
        <form className="stack-form" onSubmit={handleSubmit}>
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="primary-btn" type="submit">Login</button>
        </form>
      </div>
    </section>
  );
}
