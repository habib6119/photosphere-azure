import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">PhotoSphere</Link>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        {user?.role === 'creator' && <NavLink to="/creator">Creator Studio</NavLink>}
        {!user && <NavLink to="/login">Login</NavLink>}
        {!user && <NavLink to="/register">Register</NavLink>}
        {user && <span className="user-chip">{user.name} ({user.role})</span>}
        {user && <button className="ghost-btn" onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
}
