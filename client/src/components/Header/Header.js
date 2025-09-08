// client/src/components/Header/Header.js
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  // Close mobile menu when route changes
  useEffect(() => {
    closeMenu();
  }, [location]);

  return (
    <header className={styles.header}>
      {/* Logo Section */}
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
          <img 
            src="/logo.png" 
            alt="SocialApp" 
            className={styles.logoImage} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span className={styles.logoText}>SocialApp</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className={styles.nav}>
        {user ? (
          <div className={styles.userMenu}>
            <Link to="/create-post" className={styles.navLink}>
              📝 Create Post
            </Link>
            <Link to="/stories" className={styles.navLink}>
              📸 Stories
            </Link>
            <div className={styles.userDropdown}>
              <img 
                src={user.profilePicture || '/default-avatar.jpg'} 
                alt={user.firstName}
                className={styles.avatar}
              />
              <span className={styles.userName}>{user.firstName}</span>
              <div className={styles.dropdownContent}>
                <Link to="/profile" className={styles.dropdownItem}>
                  👤 Profile
                </Link>
                <Link to="/settings" className={styles.dropdownItem}>
                  ⚙️ Settings
                </Link>
                <button onClick={handleLogout} className={styles.dropdownItem}>
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.authLinks}>
            <Link 
              to="/login" 
              className={`${styles.navLink} ${location.pathname === '/login' ? styles.active : ''}`}
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className={`${styles.navLink} ${styles.primary} ${location.pathname === '/register' ? styles.active : ''}`}
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button 
        className={styles.menuButton}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={styles.hamburger}></span>
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuContent}>
            {user ? (
              <>
                <Link to="/create-post" className={styles.mobileNavLink}>
                  📝 Create Post
                </Link>
                <Link to="/stories" className={styles.mobileNavLink}>
                  📸 Stories
                </Link>
                <Link to="/profile" className={styles.mobileNavLink}>
                  👤 Profile
                </Link>
                <Link to="/settings" className={styles.mobileNavLink}>
                  ⚙️ Settings
                </Link>
                <button onClick={handleLogout} className={styles.mobileNavLink}>
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`${styles.mobileNavLink} ${location.pathname === '/login' ? styles.active : ''}`}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className={`${styles.mobileNavLink} ${styles.primary} ${location.pathname === '/register' ? styles.active : ''}`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
