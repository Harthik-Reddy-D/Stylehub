import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-black/10 bg-paper/95 backdrop-blur">
      <div className="page-shell flex min-h-[76px] items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-pine text-sm text-white">S</span>
          Style<span className="font-display font-normal italic text-clay">Hub</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7">
          <NavLink to="/" className={linkClass}>Shop</NavLink>
          {user && <NavLink to="/orders" className={linkClass}>Orders</NavLink>}
          {user ? (
            <>
              <NavLink to="/cart" className={linkClass}>Bag</NavLink>
              <button className="hidden text-sm font-semibold text-ink/70 transition hover:text-clay sm:inline" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <NavLink to="/login" className="button button-dark !px-4 !py-2">Sign in</NavLink>
          )}
        </nav>
      </div>
      {user && <div className="page-shell flex justify-end pb-2 sm:hidden"><button className="text-xs font-semibold text-ink/60" onClick={handleLogout}>Log out · {user.full_name}</button></div>}
    </header>
  )
}
