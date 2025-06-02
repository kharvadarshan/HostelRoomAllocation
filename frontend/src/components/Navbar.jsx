import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectIsAdmin, 
  logout 
} from '../store/slices/authSlice';
import { ThemeContext } from '../theme/ThemeProvider';
import { Button } from './ui/Button';
import { 
  FiMenu, 
  FiX, 
  FiSun, 
  FiMoon, 
  FiUser, 
  FiLogOut, 
  FiSettings,
  FiShield,
  FiHome,
  FiUsers
} from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                className="text-xl font-bold text-primary-600 dark:text-primary-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Shreekar Hostel
              </motion.span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <FiSun className="h-5 w-5" />
              ) : (
                <FiMoon className="h-5 w-5" />
              )}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center">
                {isAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      icon={<FiHome />}
                      onClick={() => navigate('/rooms')}
                    >
                      Rooms
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      icon={<FiUsers />}
                      onClick={() => navigate('/room-allocation')}
                    >
                      Allocation
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        icon={<FiShield />}
                        onClick={() => navigate('/admin')}
                    >
                      Admin
                    </Button>
                  </>
                )}
                
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-600 dark:border-primary-400">
                      {user?.photo ? (
                        <img 
                          src={user.photo} 
                          alt={user?.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <FiUser className="text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium hidden lg:block">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-100 dark:border-gray-700"
                      >
                        <Link 
                          to="/dashboard" 
                          className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FiUser className="mr-2" />
                          Dashboard
                        </Link>
                        
                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiShield className="mr-2" />
                            Admin Panel
                          </Link>
                        )}
                        
                        {isAdmin && (
                          <Link 
                            to="/rooms" 
                            className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiHome className="mr-2" />
                            Room Management
                          </Link>
                        )}
                        
                        {isAdmin && (
                          <Link 
                            to="/room-allocation" 
                            className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiUsers className="mr-2" />
                            Room Allocation
                          </Link>
                        )}
                        
                        {/*<Link */}
                        {/*  to="/settings" */}
                        {/*  className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"*/}
                        {/*  onClick={() => setIsDropdownOpen(false)}*/}
                        {/*>*/}
                        {/*  <FiSettings className="mr-2" />*/}
                        {/*  Settings*/}
                        {/*</Link>*/}
                        
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <FiLogOut className="mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <FiSun className="h-5 w-5" />
              ) : (
                <FiMoon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-800 shadow-lg border-t border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-5 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 p-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-600 dark:border-primary-400">
                      {user?.photo ? (
                        <img 
                          src={user.photo} 
                          alt={user?.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <FiUser className="text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.field}</p>
                    </div>
                  </div>
                  
                  <Link 
                    to="/dashboard"
                    className="block py-2 px-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={toggleMobileMenu}
                  >
                    <FiUser className="mr-2" />
                    Dashboard
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      to="/admin"
                      className="block py-2 px-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={toggleMobileMenu}
                    >
                      <FiShield className="mr-2" />
                      Admin Panel
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <Link 
                      to="/rooms"
                      className="block py-2 px-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={toggleMobileMenu}
                    >
                      <FiHome className="mr-2" />
                      Room Management
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <Link 
                      to="/room-allocation"
                      className="block py-2 px-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={toggleMobileMenu}
                    >
                      <FiUsers className="mr-2" />
                      Room Allocation
                    </Link>
                  )}
                  
                  <Link 
                    to="/settings"
                    className="block py-2 px-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={toggleMobileMenu}
                  >
                    <FiSettings className="mr-2" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="block w-full text-left py-2 px-3 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="block py-2 px-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="block py-2 px-3 rounded-md bg-primary-600 text-white hover:bg-primary-700"
                    onClick={toggleMobileMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;