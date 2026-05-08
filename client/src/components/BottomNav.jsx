import { NavLink } from 'react-router-dom';

const WomanNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50 safe-area-inset-bottom">
    {[
      { to: '/home',    icon: '🏠', label: 'Home' },
      { to: '/history', icon: '📋', label: 'History' },
      { to: '/profile', icon: '👤', label: 'Profile' },
    ].map(({ to, icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) =>
        `flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`
      }>
        <span className="text-xl">{icon}</span>
        {label}
      </NavLink>
    ))}
  </nav>
);

const VolunteerNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50">
    {[
      { to: '/volunteer/home',    icon: '🏠', label: 'Home' },
      { to: '/volunteer/history', icon: '📋', label: 'History' },
      { to: '/volunteer/profile', icon: '👤', label: 'Profile' },
    ].map(({ to, icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) =>
        `flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${isActive ? 'text-safe' : 'text-gray-400'}`
      }>
        <span className="text-xl">{icon}</span>
        {label}
      </NavLink>
    ))}
  </nav>
);

export { WomanNav, VolunteerNav };
