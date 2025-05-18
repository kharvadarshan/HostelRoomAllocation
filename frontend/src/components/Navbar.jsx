import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectIsAdmin, 
  logout 
} from '../store/slices/authSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="font-bold text-xl">Shrrekar Hostel</Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <span className="text-primary-100">
                    Hello, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-primary-700 hover:bg-primary-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-3 py-2 rounded-md text-sm font-medium bg-primary-700 hover:bg-primary-800"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-700 focus:outline-none"
            >
              <svg 
                className={`h-6 w-6 ${isOpen ? 'hidden' : 'block'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`h-6 w-6 ${isOpen ? 'block' : 'hidden'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-700">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-800"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <div className="px-3 py-2 text-primary-100">
                Hello, {user?.name}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-primary-800 hover:bg-primary-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-800"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary-800 hover:bg-primary-900"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;