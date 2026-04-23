import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
    const navigate = useNavigate()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('mcis_token'))
        const handler = () => setIsLoggedIn(!!localStorage.getItem('mcis_token'))
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('mcis_token')
        setIsLoggedIn(false)
        navigate('/')
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner container">
                {/* Logo */}
                <NavLink to="/" className="navbar-logo">
                    <span className="navbar-logo-icon">🔍</span>
                    <span className="navbar-logo-text">
                        <span className="brand-mcis">MCIS</span>
                    </span>
                </NavLink>

                {/* Hamburger */}
                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>

                {/* Nav links */}
                <div className={`navbar-links ${menuOpen ? 'show' : ''}`}>
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
                        Home
                    </NavLink>
                    <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
                        🔎 Search
                    </NavLink>
                    {isLoggedIn && (
                        <>
                            <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
                                ➕ Register
                            </NavLink>
                            <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
                                📊 Reports
                            </NavLink>
                        </>
                    )}

                    {isLoggedIn ? (
                        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    ) : (
                        <NavLink to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                            Admin Login
                        </NavLink>
                    )}
                </div>
            </div>
        </nav>
    )
}
