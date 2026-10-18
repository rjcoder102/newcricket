import { useEffect, useState } from 'react';
import {
  IoMdArrowDropdown,
  IoMdClose,
  IoMdRefresh,
  IoMdMenu,
} from 'react-icons/io';
import { FiArrowDownCircle, FiArrowUpCircle } from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { MdLogout } from 'react-icons/md';
import newshivalogo from '../assets/newshivalogo.png';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAdmin,
  userLogout,
  changePasswordBySubAdmin,
} from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, loading, isPasswordChanged } = useSelector(
    (state) => state.auth
  );

  const [showPopup, setShowPopup] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const shouldShowPasswordPopup = isPasswordChanged === false;
  const [changeFormData, setChangeFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  const changeSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(
        changePasswordBySubAdmin({
          oldPassword: changeFormData.oldPassword,
          newPassword: changeFormData.newPassword,
          confirmPassword: changeFormData.confirmPassword,
        })
      );

      if (result.type.endsWith('/fulfilled')) {
        toast.success('Password changed successfully');
        setChangeFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else if (result.type.endsWith('/rejected')) {
        toast.error(result.payload || 'Failed to change password');
      }
    } catch (error) {
      console.log('Password change error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/home' },
    {
      name: 'Downline List',
      submenu: [
        { name: 'User Downline List', path: '/user-download-list' },
        {
          name: 'Agent Downline List',
          path: '/agent-download-list',
          reload: true,
        },
      ],
    },
    { name: 'My account', path: '/my-account' },
    { name: 'Security', path: '/secureauth' },
    {
      name: 'My Report',
      submenu: [
        { name: 'Event Profit/Loss', path: '/eventpl' },
        { name: 'Downline Profit/Loss', path: '/downpl' },
      ],
    },
    { name: 'BetList', path: '/betlist' },
    { name: 'Market Analysis', path: '/my-market' },
    {
      name: 'Banking',
      submenu: [
        { name: 'User Banking', path: '/banking' },
        { name: 'Master Banking', path: '/master-banking' },
      ],
    },
    // { name: "Commision", path: "/commission" },
    { name: 'Password History', path: '/password-history' },
    { name: 'Restore User', path: '/restore-user' },
    ...(userInfo?.role === 'supperadmin'
      ? [
          {
            name: 'Manual Control',
            submenu: [
              { name: 'Match Control', path: '/match-control' },
              { name: 'Result Control', path: '/result-control' },
            ],
          },
        ]
      : []),
  ];

  const logout = async () => {
    try {
      const data = await dispatch(userLogout()).unwrap();
      localStorage.removeItem('auth');
      toast.success(data.message);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (error) {
      toast.error(error);
    }
  };

  const reload = () => {
    dispatch(getAdmin());
  };

  const visibleSubmenu = (item) =>
    item.submenu.filter(
      (sub) =>
        !(userInfo?.role === 'agent' && sub.name === 'Agent Downline List')
    );

  const isSubmenuActive = (item) =>
    !!item.submenu?.some((sub) => location.pathname === sub.path);

  const handleSubClick = (e, item, sub) => {
    setMobileMenuOpen(false);
    setMobileSubmenuOpen(null);
    setHoveredItem(null);
    if (sub.reload) {
      e.preventDefault();
      navigate(sub.path);
      window.location.reload();
    }
  };

  const handleClientSearch = (e) => {
    e.preventDefault();
    navigate('/user-download-list', { state: { search: clientSearch.trim() } });
    setMobileMenuOpen(false);
  };

  const roleLabel = userInfo?.role === 'white' ? 'white_label' : userInfo?.role;

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div
        className={`sticky top-0 z-20 w-full ${
          location.pathname == '/login' ? 'hidden' : 'block'
        }`}
      >
        {/* Top blue bar */}
        <header className='bg-topnav relative flex min-h-[35px] items-center justify-between gap-2 px-3 text-white'>
          <div className='flex min-w-0 items-center gap-3'>
            <Link to='/home' className='flex shrink-0 items-center'>
              <img src={newshivalogo} alt='logo' className='h-[30px]' />
            </Link>
            <button
              type='button'
              className='flex shrink-0 items-center text-[22px] xl:hidden'
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? <IoMdClose /> : <IoMdMenu />}
            </button>

            <nav className='hidden xl:block'>
              <ul className='flex items-center'>
                {navItems.map((item, i) => (
                  <li
                    key={i}
                    className='relative'
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.path ? (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block px-2.5 py-[9px] text-[12px] leading-[17px] font-bold whitespace-nowrap transition-colors hover:bg-black/10 ${
                            isActive ? 'bg-black/15' : ''
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    ) : (
                      <span
                        className={`flex cursor-pointer items-center gap-0.5 px-2.5 py-[9px] text-[12px] leading-[17px] font-bold whitespace-nowrap hover:bg-black/10 ${
                          isSubmenuActive(item) ? 'bg-black/15' : ''
                        }`}
                      >
                        {item.name}
                        <IoMdArrowDropdown className='text-[14px]' />
                      </span>
                    )}

                    {item.submenu && hoveredItem === item.name && (
                      <ul className='bg-topnav absolute top-full left-0 z-30 min-w-[170px] shadow-lg'>
                        {visibleSubmenu(item).map((sub, index) => (
                          <li
                            key={index}
                            className='border-t border-white/20 first:border-t-0'
                          >
                            <NavLink
                              to={sub.path}
                              className='block px-3 py-2 text-[12px] font-bold whitespace-nowrap hover:bg-black/15'
                              onClick={(e) => handleSubClick(e, item, sub)}
                            >
                              {sub.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className='flex shrink-0 items-center gap-3'>
            <div
              className='relative'
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button
                type='button'
                className='flex items-center gap-0.5 py-[9px] text-[12px] leading-[17px] font-bold'
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                {userInfo?.userName}
                <IoMdArrowDropdown className='text-[14px]' />
              </button>
              {userMenuOpen && (
                <ul className='absolute top-full right-0 z-30 min-w-[170px] bg-white text-[12px] font-bold text-[#333] shadow-lg'>
                  <li className='flex items-center justify-between border-b border-gray-200 px-3 py-2'>
                    <span>IRP</span>
                    <span>
                      {loading ? 'Loading...' : userInfo?.avbalance || 0}
                    </span>
                  </li>
                  <li>
                    <button
                      type='button'
                      onClick={reload}
                      className='flex w-full items-center gap-1 border-b border-gray-200 px-3 py-2 hover:bg-gray-100'
                    >
                      <IoMdRefresh /> Refresh
                    </button>
                  </li>
                  <li>
                    <button
                      type='button'
                      onClick={logout}
                      className='flex w-full items-center gap-1 px-3 py-2 hover:bg-gray-100'
                    >
                      <MdLogout /> Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>

            <form
              onSubmit={handleClientSearch}
              className='hidden items-stretch md:flex'
            >
              <input
                type='text'
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder='All Client'
                className='h-[26px] w-[120px] rounded-l-[3px] bg-white px-2 text-[12px] text-[#333] outline-none placeholder:text-gray-400 lg:w-[150px]'
              />
              <button
                type='submit'
                className='flex h-[26px] w-[34px] items-center justify-center rounded-r-[3px] bg-white text-[16px] text-black'
                aria-label='Search client'
              >
                <FaSearch />
              </button>
            </form>
          </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className='bg-topnav max-h-[calc(100vh-35px)] overflow-y-auto border-t border-white/20 text-white xl:hidden'>
            <form
              onSubmit={handleClientSearch}
              className='flex items-stretch p-2 md:hidden'
            >
              <input
                type='text'
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder='All Client'
                className='h-[30px] w-full rounded-l-[3px] bg-white px-2 text-[12px] text-[#333] outline-none'
              />
              <button
                type='submit'
                className='flex h-[30px] w-[38px] items-center justify-center rounded-r-[3px] bg-white text-black'
                aria-label='Search client'
              >
                <FaSearch />
              </button>
            </form>
            <ul>
              {navItems.map((item, i) => (
                <li key={i} className='border-b border-white/20'>
                  {item.path ? (
                    <NavLink
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-[13px] font-bold ${
                          isActive ? 'bg-black/15' : ''
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  ) : (
                    <>
                      <button
                        type='button'
                        className={`flex w-full items-center justify-between px-4 py-2 text-[13px] font-bold ${
                          isSubmenuActive(item) ? 'bg-black/15' : ''
                        }`}
                        onClick={() =>
                          setMobileSubmenuOpen((open) =>
                            open === item.name ? null : item.name
                          )
                        }
                      >
                        {item.name}
                        <IoMdArrowDropdown className='text-[16px]' />
                      </button>
                      {mobileSubmenuOpen === item.name && (
                        <ul className='bg-black/15'>
                          {visibleSubmenu(item).map((sub, index) => (
                            <li key={index}>
                              <NavLink
                                to={sub.path}
                                className='block px-8 py-2 text-[13px] font-bold'
                                onClick={(e) => handleSubClick(e, item, sub)}
                              >
                                {sub.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              ))}
              <li>
                <button
                  type='button'
                  onClick={logout}
                  className='flex w-full items-center gap-1 px-4 py-2 text-[13px] font-bold'
                >
                  Logout <MdLogout />
                </button>
              </li>
            </ul>
          </nav>
        )}

        {/* Dark strip with account summary toggle */}
        <div className='bg-[#2b3a4b] text-white'>
          <div className='flex h-[45px] items-center justify-center'>
            {showSummary ? (
              <div className='flex flex-wrap items-center justify-center gap-3 px-3'>
                <p className='rounded-sm bg-[#292929] px-1.5 text-[10px] uppercase'>
                  {roleLabel}
                </p>
                <p className='text-[13px]'>{userInfo?.name}</p>
                <p className='text-[13px] font-semibold'>
                  {loading ? (
                    'Loading...'
                  ) : (
                    <>IRP ({userInfo?.avbalance || 0})</>
                  )}
                </p>
                <button
                  type='button'
                  onClick={reload}
                  className='flex h-[25px] w-[25px] items-center justify-center rounded-[2px] bg-[#1d2935] text-[20px]'
                  aria-label='Refresh balance'
                >
                  <IoMdRefresh />
                </button>
              </div>
            ) : null}
            <button
              type='button'
              onClick={() => setShowSummary((open) => !open)}
              className='ml-3 flex items-center text-[22px] text-white/90 hover:text-white'
              aria-label='Toggle account summary'
            >
              {showSummary ? <FiArrowUpCircle /> : <FiArrowDownCircle />}
            </button>
          </div>
        </div>

        {/* Popup */}
        {showPopup && (
          <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className='bg-opacity-50 absolute inset-0 bg-black'></div>
            <div className='bg-color relative z-10 mx-4 w-full p-4 text-white shadow-lg md:max-w-lg'>
              <div className='flex items-center justify-between'>
                <h2 className='text-center text-lg font-bold'>
                  Non-Gambling Territories.
                </h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className='bg-color rounded-md p-1 text-xl'
                >
                  <IoMdClose />
                </button>
              </div>
              <hr className='my-2 border-white' />
              <p className='text-sm'>
                Connecting to our site from non-gambling countries, it will be
                User's responsibility to ensure that their use of the service is
                lawful.
              </p>
              <h3 className='my-3 text-center font-bold'>
                Underage gambling is prohibited.
              </h3>
              <p className='text-center text-sm'>
                Please confirm if you are 18 years old and above as of today.
              </p>
              <hr className='my-2 border-white' />
              <div className='mt-4 flex justify-center gap-2'>
                <button
                  className='w-[130px] rounded bg-white py-1 text-black hover:bg-gray-300'
                  onClick={() => setShowPopup(false)}
                >
                  Confirm
                </button>
                <button
                  className='w-[130px] rounded border border-white bg-black py-1 text-white'
                  onClick={() => setShowPopup(false)}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {shouldShowPasswordPopup && (
        <div className='fixed z-50 flex h-full w-full items-center justify-center bg-black/30'>
          <div className='fixed top-6 left-1/2 w-90 -translate-x-1/2 rounded-lg bg-white shadow-lg md:w-[500px]'>
            <div className='flex items-center justify-between rounded-t-lg bg-gray-700 px-4 py-2 text-white'>
              <h2 className='font-semibold'>Change Password</h2>
            </div>
            <form className='space-y-4 p-6' onSubmit={changeSubmit}>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='relative'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Old Password <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type={showOld ? 'text' : 'password'}
                    placeholder='Old Password..'
                    value={changeFormData.oldPassword}
                    onChange={(e) =>
                      setChangeFormData({
                        ...changeFormData,
                        oldPassword: e.target.value,
                      })
                    }
                    className='mt-1 w-full rounded border px-3 py-2 focus:ring focus:ring-blue-200'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowOld(!showOld)}
                    className='absolute top-9 right-3 text-gray-500'
                  >
                    {showOld ? '🙈' : '👁️'}
                  </button>
                </div>

                <div className='relative'>
                  <label className='block text-sm font-medium text-gray-700'>
                    New Password <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder='New Password..'
                    value={changeFormData.newPassword}
                    onChange={(e) =>
                      setChangeFormData({
                        ...changeFormData,
                        newPassword: e.target.value,
                      })
                    }
                    className='mt-1 w-full rounded border px-3 py-2 focus:ring focus:ring-blue-200'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowNew(!showNew)}
                    className='absolute top-9 right-3 text-gray-500'
                  >
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className='relative'>
                <label className='block text-sm font-medium text-gray-700'>
                  Confirm Password <span className='text-red-500'>*</span>
                </label>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder='Confirm Password..'
                  value={changeFormData.confirmPassword}
                  onChange={(e) =>
                    setChangeFormData({
                      ...changeFormData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className='mt-1 w-full rounded border px-3 py-2 focus:ring focus:ring-blue-200'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirm(!showConfirm)}
                  className='absolute top-9 right-3 text-gray-500'
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  className='rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900'
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
