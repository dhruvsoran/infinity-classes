import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" aria-label="Infinity Classes home"><Logo /></Link>
        {user && (
          <nav className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/history">My attempts</NavLink>
            {user.role === 'admin' && <NavLink to="/admin">Add questions</NavLink>}
            <span className="nav-user">{user.name.split(' ')[0]}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
          </nav>
        )}
      </div>
    </header>
  );
}
