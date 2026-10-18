'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; //eslint-disable-line
import {
  FaBan,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaFileExcel,
  FaFilePdf,
  FaLock,
  FaRegEdit,
  FaUnlock,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdmin,
  deleteSubAdmin,
  getAllUserAndDownline,
  getAllUsersWithCompleteInfo,
  setCurrentPage,
  fetchSubAdminByLevel,
  updateCreditReference,
  getCreditRefHistory,
  withdrawalAndDeposite,
  userSetting,
  updatePartnership,
} from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';
import { IoMdCheckmark, IoMdClose, IoMdSettings } from 'react-icons/io';
import { TbCoinRupeeFilled } from 'react-icons/tb';
import { MdDelete } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import Loader from '../components/Loader';
import { updateGameLock } from '../redux/reducer/downlineReducer';

export default function AgentLIst() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    userInfo,
    currentPage,
    totalPages,
    loading,
    users,
    users1,
    crediteHistory,
  } = useSelector((state) => state.auth);
  const { gamelock } = useSelector((state) => state.downline);

  // console.log("crediteHistory", crediteHistory);
  // console.log("totalCrediteData", totalCrediteData);
  console.log('userData getAllUserAndDownline', users);
  console.log('userData getAllUsersWithCompleteInfo', users1);

  const [entries, setEntries] = useState(10);
  const [creditEntries, setCreditEntries] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showPassword, setShowPassword] = useState(false);
  const [creditPopup, setCreditPopup] = useState(false);
  const [patnerPopup, setPatnerPopup] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [balancePopup, setBalancePopup] = useState(false);
  const [settingPopup, setSettingPopup] = useState(false);
  const [sportsPopup, setSportsPopup] = useState(false);
  const [currentUser, setcurrentUser] = useState(null);
  const [isFetchingAllUsers, setIsFetchingAllUsers] = useState(null);
  const [isFetchCompleteInfo, setIsFetchCompleteInfo] = useState(null);
  const [type, setType] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedCode, setSelectedCode] = useState('');
  const [gameLockData, setGameLockData] = useState([]);
  const [partnershipFormData, setPartnershipFormData] = useState({
    partnership: '',
    masterPassword: '',
  });
  const [showChipsSummary, setShowChipsSummary] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    accountType: '',
    commition: '',
    balance: null,
    exposureLimit: null,
    creditReference: null,
    rollingCommission: null,
    partnership: null,
    phone: null,
    password: '',
    confirmPassword: '',
    masterPassword: '',
    remark: '',
    status: 'active',
  });

  // sport popup checkbox
  const handleToggle = async (game, currentLock) => {
    try {
      dispatch(
        updateGameLock({ userId: currentUser?._id, game, lock: !currentLock })
      ).then((res) => {
        if (res.payload.success) {
          console.log('res.payload111', res.payload);
          setGameLockData(res.payload?.gamelock);
          dispatch(
            getAllUserAndDownline({
              page: currentPage,
              limit: entries,
              searchQuery,
            })
          );
          toast.success(res.payload.message);
        } else {
          toast.error(res.payload.message);
        }
      });
    } catch (err) {
      console.error('Failed to update game lock:', err);
    }
  };

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  const handleDelete = async (id) => {
    try {
      const deleteUser = await dispatch(deleteSubAdmin(id)).unwrap();

      toast.success(deleteUser.message);
      dispatch(
        getAllUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handleLoadNextLevel = (user, code) => {
    if (user.role !== 'user') {
      setIsFetchingAllUsers(false);
      setSelectedCode(code);
      dispatch(setCurrentPage(1));
      dispatch(fetchSubAdminByLevel({ code, page: 1, limit: entries }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(
        updateCreditReference({ formData, userId: currentUser._id })
      ).unwrap();
      toast.success(data.message);
      setCreditPopup(false);
      dispatch(
        getAllUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handleWithdwalDeposite = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(
        withdrawalAndDeposite({ formData, userId: currentUser._id, type })
      ).unwrap();
      toast.success(data.message);
      dispatch(
        getAllUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
      dispatch(getAdmin());
      setBalancePopup(false); // Optional: close the popup on success
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSetting = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        userSetting({
          userId: currentUser._id,
          status: formData.status,
          masterPassword: formData.masterPassword,
        })
      ).unwrap();
      toast.success(result.message);
      setSettingPopup(false);
      dispatch(
        getAllUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handlePartnershipUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        updatePartnership({
          userId: currentUser._id,
          formData: partnershipFormData,
        })
      ).unwrap();
      toast.success(result.message);
      setPatnerPopup(false);
      dispatch(
        getAllUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
      dispatch(getAdmin());
    } catch (error) {
      toast.error(error);
    }
  };

  const handleCreditRefHistory = (userId) => {
    setSelectedUserId(userId);
    setIsOpen(true);
  };
  useEffect(() => {
    if (isOpen && selectedUserId) {
      dispatch(
        getCreditRefHistory({
          userId: selectedUserId,
          page: currentPage,
          limit: creditEntries,
        })
      );
    }
  }, [dispatch, currentPage, creditEntries, selectedUserId, isOpen]);

  useEffect(() => {
    if (isFetchingAllUsers === false && selectedCode) {
      dispatch(
        fetchSubAdminByLevel({
          code: selectedCode,
          page: currentPage,
          limit: entries,
        })
      );
      return;
    }

    setIsFetchingAllUsers(true);
    dispatch(
      getAllUserAndDownline({
        page: currentPage,
        limit: entries,
        searchQuery,
      })
    );
  }, [dispatch, currentPage, entries, searchQuery, isFetchingAllUsers, selectedCode]);

  useEffect(() => {
    setIsFetchCompleteInfo(true);
    dispatch(
      getAllUsersWithCompleteInfo({
        page: currentPage,
        limit: entries,
        searchQuery,
      })
    );
  }, [dispatch, currentPage, entries, searchQuery]);

  const formatNumber = (v) => {
    const num = Math.abs(Number(v));
    if (isNaN(num)) return 0;
    return Number.isInteger(num)
      ? num
      : num.toFixed(v.toString().split('.')[1]?.length === 1 ? 1 : 2);
  };
  const reloadPage = () => {
    window.location.reload();
  };

  const formatMoney = (v) => {
    const num = Number(v);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const handleLoad = () => setSearchQuery(searchDraft.trim());
  const handleResetSearch = () => {
    setSearchDraft('');
    setSearchQuery('');
  };

  const rowBalance = (u) =>
    u.role === 'user'
      ? u.balance || 0
      : (u.baseBalance || 0) + (u.uplineBettingProfitLoss || 0);

  const rowAvailable = (u) =>
    u.role !== 'user' || u.isDirectUser === true
      ? u.avbalance || 0
      : u.balance || 0;

  const rowPL = (u) =>
    u.role === 'user'
      ? (u.bettingProfitLoss || 0) + (u.creditReferenceProfitLoss || 0)
      : (u.uplineBettingProfitLoss || 0) + (u.creditReferenceProfitLoss || 0);

  const isBettingAllowed = (u) =>
    !(u.gamelock || []).some((g) => g.lock === false);

  const roleText = (role) => (role === 'white' ? 'White_level' : role);

  const visibleUsers = (users || []).filter((u) =>
    activeTab === 'active' ? u.status === 'active' : u.status !== 'active'
  );

  const totals = visibleUsers.reduce(
    (acc, u) => ({
      credit: acc.credit + Number(u.creditReference || 0),
      balance: acc.balance + Number(rowBalance(u)),
      pl: acc.pl + Number(rowPL(u)),
      avbalance: acc.avbalance + Number(rowAvailable(u)),
    }),
    { credit: 0, balance: 0, pl: 0, avbalance: 0 }
  );

  const exportRows = () => [
    [
      'User Name',
      'CR',
      'Partnership',
      'Balance',
      'Client(P/L)',
      'Exposure',
      'Available Balance',
      'Upline P/L',
      'U st',
      'B st',
      'Account Type',
    ],
    ...visibleUsers.map((u) => [
      u.userName,
      u.creditReference || 0,
      u.partnership || 0,
      rowBalance(u),
      rowPL(u),
      u.exposure || 0,
      rowAvailable(u),
      Math.round(rowPL(u) * ((100 - (u.partnership || 0)) / 100) * 100) / 100,
      u.status === 'active' ? 'Yes' : 'No',
      isBettingAllowed(u) ? 'Yes' : 'No',
      roleText(u.role),
    ]),
  ];

  const handleExportExcel = () => {
    const csv = exportRows()
      .map((row) =>
        row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'account-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const escapeHtml = (s) =>
      String(s ?? '').replace(
        /[&<>"]/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
      );
    const [head, ...body] = exportRows();
    const html = `<html><head><title>Account List</title><style>
      body{font-family:Arial,sans-serif;font-size:12px}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #999;padding:4px 6px;text-align:left}
      th{background:#eee}
    </style></head><body><h3>Account List</h3><table>
      <thead><tr>${head.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
      <tbody>${body
        .map(
          (r) =>
            `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`
        )
        .join('')}</tbody></table></body></html>`;
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Please allow pop-ups to export PDF');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const downlineBettingPL = userInfo?.uplineBettingProfitLoss || 0;
  const creditRefPL = userInfo?.creditReferenceProfitLoss || 0;
  const totalUplinePL = downlineBettingPL + creditRefPL;
  const pct = userInfo?.partnership || 0;

  const uplineShare = pct
    ? Math.round(totalUplinePL * (pct / 100) * 100) / 100
    : totalUplinePL;

  const myShare = pct
    ? Math.round(totalUplinePL * ((100 - pct) / 100) * 100) / 100
    : 0;

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-[#f1f1f1] p-1 px-[15px] md:px-4'>
        <div className='my-[13px] flex flex-wrap items-center justify-between gap-2'>
          <h1 className='text-[20px] leading-tight font-medium text-[#222]'>
            Account List
          </h1>
          <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center space-x-2'>
            <div className='flex items-center text-[12px] font-semibold md:text-[15px] md:font-bold'>
              Chips Summary
            </div>
            <div
              className={`relative flex h-full w-[60px] items-center justify-evenly rounded ${
                showChipsSummary
                  ? 'bg-color'
                  : 'border border-gray-300 bg-white'
              }`}
            >
              <IoMdCheckmark className={`p-1 text-2xl`} />
              <IoMdClose className={`p-1 text-2xl text-gray-300`} />
              <button
                className={`absolute left-0.5 block h-[25px] w-[25px] rounded border border-gray-300 bg-white transition-transform duration-300 ${
                  showChipsSummary ? 'translate-x-[30px]' : 'translate-x-0'
                }`}
                onClick={() => {
                  const next = !showChipsSummary;
                  setShowChipsSummary(next);
                  if (next) {
                    toast.success('Chips Summary successfully updated');
                  } else {
                    toast.success('Chips Summary successfully updated');
                  }
                }}
              ></button>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <button
              className='rounded-[3px] bg-[#0b8bd9] px-[14px] py-[7px] text-[12px] leading-none font-bold text-white hover:bg-[#0976b9]'
              onClick={() => navigate('/add-agent-account')}
            >
              Add Account
            </button>

            <button
              className='flex h-full w-[30px] items-center justify-center rounded border border-gray-300 bg-white leading-[30px] text-gray-500'
              onClick={reloadPage}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
          </div>
        </div>

        {/* Chips Summary Panel */}
        {/* {showChipsSummary &&
          (() => {
            const downlineBettingPL = userInfo?.uplineBettingProfitLoss || 0;
            const creditRefPL = userInfo?.creditReferenceProfitLoss || 0;
            const totalUplinePL = downlineBettingPL + creditRefPL;
            const pct = userInfo?.partnership || 0;
            // Partnership split applies to combined Upline P/L
            const uplineShare = pct
              ? Math.round(totalUplinePL * (pct / 100) * 100) / 100
              : totalUplinePL;
            const myShare = pct
              ? Math.round(totalUplinePL * ((100 - pct) / 100) * 100) / 100
              : 0;

            return (
              <div className='mb-4 rounded border border-gray-300 bg-white p-4'>
                <h3 className='mb-3 text-[14px] font-bold text-[#333]'>
                  Chips Summary (Partnership: {pct}%)
                </h3>
                <div className='flex flex-wrap gap-6'>
                  <div>
                    <div className='mb-1 text-[12px] font-semibold text-[#9b9b9b]'>
                      Downline Betting P/L
                    </div>
                    <div
                      className={`text-[15px] font-semibold ${downlineBettingPL < 0 ? 'text-red-500' : 'text-green-500'}`}
                    >
                      INR {formatNumber(downlineBettingPL)}
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-[12px] font-semibold text-[#9b9b9b]'>
                      Credit Ref. P/L
                    </div>
                    <div
                      className={`text-[15px] font-semibold ${creditRefPL < 0 ? 'text-red-500' : 'text-green-500'}`}
                    >
                      INR {formatNumber(creditRefPL)}
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-[12px] font-semibold text-[#9b9b9b]'>
                      Total Upline P/L
                    </div>
                    <div
                      className={`text-[15px] font-semibold ${totalUplinePL < 0 ? 'text-red-500' : 'text-green-500'}`}
                    >
                      INR {formatNumber(totalUplinePL)}
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-[12px] font-semibold text-[#9b9b9b]'>
                      Upline Share ({pct}%)
                    </div>
                    <div
                      className={`text-[15px] font-semibold ${uplineShare < 0 ? 'text-red-500' : 'text-blue-600'}`}
                    >
                      INR {formatNumber(uplineShare)}
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-[12px] font-semibold text-[#9b9b9b]'>
                      My Share ({100 - pct}%)
                    </div>
                    <div
                      className={`text-[15px] font-semibold ${myShare < 0 ? 'text-red-500' : 'text-green-600'}`}
                    >
                      INR {formatNumber(myShare)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()} */}

        {/* Financial metrics summary */}
        <div className='mb-4 flex flex-wrap border-b border-[#7e97a7] bg-white pt-[7px] md:pb-[5px]'>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Total Balance
            </div>
            <div className='text-[15px] font-semibold'>
              INR {formatNumber(userInfo?.totalBalance)}
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Total Exposure
            </div>
            <div className='text-[15px] font-semibold'>
              INR
              <span className='text-red-600'>
                ({formatNumber(userInfo?.exposure)})
              </span>
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Available Balance
            </div>
            <div className='text-[15px] font-semibold'>
              INR {formatNumber(userInfo?.agentAvbalance)}
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Balance
            </div>
            <div className='text-[15px] font-semibold'>
              INR {formatNumber(userInfo?.avbalance || 0)}
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Total Avail. bal.
            </div>
            <div className='text-[15px] font-semibold'>
              INR {formatNumber(userInfo?.totalAvbalance)}
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Upline P/L
            </div>

            {showChipsSummary ? (
              <div className='text-[15px] font-semibold'>
                INR{' '}
                <span
                  className={
                    totalUplinePL <= 0 ? 'text-red-500' : 'text-green-500'
                  }
                >
                  {myShare}
                </span>
              </div>
            ) : (
              <div className='text-[15px] font-semibold'>
                INR{' '}
                <span
                  className={
                    totalUplinePL <= 0 ? 'text-red-500' : 'text-green-500'
                  }
                >
                  {formatNumber(totalUplinePL)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main content area with table */}
        <div className='rounded-[3px] bg-white p-4 shadow-sm'>
          {/* Table controls */}
          <div className='mb-3 flex flex-col justify-between gap-2 text-[12px] font-bold text-[#222] md:flex-row md:items-start'>
            <div className='flex items-center'>
              <span className='mr-2'>Show</span>
              <select
                className='rounded border border-gray-300 px-1 py-[2px] text-[11px]'
                value={entries}
                onChange={(e) => setEntries(Number(e.target.value))}
              >
                <option value='10'>10</option>
                <option value='20'>20</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
                <option value='500'>500</option>
              </select>
              <span className='ml-2'>entries</span>
            </div>
            <div className='flex items-center gap-2'>
              <span>Search:</span>
              <input
                type='text'
                placeholder='Search...'
                className='w-[150px] rounded border border-gray-300 px-2 py-[5px] text-[12px] font-normal outline-none'
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
              />
              <button
                type='button'
                onClick={handleLoad}
                className='rounded-[3px] bg-[#0b8bd9] px-3 py-[6px] text-[12px] leading-none font-bold text-white hover:bg-[#0976b9]'
              >
                Load
              </button>
              <button
                type='button'
                onClick={handleResetSearch}
                className='rounded-[3px] bg-[#6c757d] px-3 py-[6px] text-[12px] leading-none font-bold text-white hover:bg-[#5a6268]'
              >
                Reset
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className='mb-3 flex border-b border-gray-300 text-[13px]'>
            {[
              { key: 'active', label: 'Active Users' },
              { key: 'deactive', label: 'Deactive Users' },
            ].map((tab) => (
              <button
                key={tab.key}
                type='button'
                onClick={() => setActiveTab(tab.key)}
                className={`-mb-px px-4 py-2 ${
                  activeTab === tab.key
                    ? 'rounded-t border border-gray-300 border-b-white bg-white text-[#333]'
                    : 'text-[#0b60a8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export */}
          <div className='mb-3 flex gap-2'>
            <button
              type='button'
              onClick={handleExportPdf}
              className='btn-pdf flex items-center gap-1 rounded-[3px] px-3 py-[6px] text-[12px] leading-none font-bold text-white shadow'
            >
              <FaFilePdf /> PDF
            </button>
            <button
              type='button'
              onClick={handleExportExcel}
              className='btn-excel flex items-center gap-1 rounded-[3px] px-3 py-[6px] text-[12px] leading-none font-bold text-white shadow'
            >
              <FaFileExcel /> Excel
            </button>
          </div>

          {/* Table */}
          <div className='overflow-x-auto text-[12px]'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='whitespace-nowrap text-[#333]'>
                  <th className='px-2 py-2 text-left font-bold'>User Name</th>
                  <th className='px-2 py-2 text-center font-bold'>CR</th>
                  <th className='px-2 py-2 text-center font-bold'>
                    Partnership
                  </th>
                  <th className='px-2 py-2 text-center font-bold'>Balance</th>
                  <th className='px-2 py-2 text-center font-bold'>
                    Client(P/L)
                  </th>
                  <th className='px-2 py-2 text-center font-bold'>Exposure</th>
                  <th className='px-2 py-2 text-center font-bold'>
                    Available Balance
                  </th>
                  <th className='px-2 py-2 text-center font-bold'>
                    Upline P/L
                  </th>
                  <th className='px-2 py-2 text-center font-bold'>U st</th>
                  <th className='px-2 py-2 text-center font-bold'>B st</th>
                  <th className='px-2 py-2 text-center font-bold'>
                    Account Type
                  </th>
                  <th className='px-2 py-2 text-left font-bold'>Action</th>
                </tr>
                <tr className='border-y-2 border-[#999] bg-[#e4e4e4] font-bold'>
                  <td className='px-2 py-[5px]'></td>
                  <td className='px-2 py-[5px] text-center'>
                    {formatMoney(totals.credit)}
                  </td>
                  <td className='px-2 py-[5px]'></td>
                  <td className='px-2 py-[5px] text-center'>
                    {formatMoney(totals.balance)}
                  </td>
                  <td className='px-2 py-[5px] text-center'>
                    {formatMoney(totals.pl)}
                  </td>
                  <td className='px-2 py-[5px]'></td>
                  <td className='px-2 py-[5px] text-center'>
                    {formatMoney(totals.avbalance)}
                  </td>
                  <td colSpan='5'></td>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan='12'
                      className='border border-gray-200 p-2 text-center'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : visibleUsers.length > 0 ? (
                  visibleUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`font-bold hover:bg-[#dfeaf3] ${
                        index % 2 ? 'bg-[#efefef]' : 'bg-white'
                      }`}
                    >
                      <td
                        onClick={() => handleLoadNextLevel(user, user.code)}
                        className={`border border-gray-200 px-2 py-[5px] ${user.role === 'user' ? '' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block rounded-[3px] px-3 py-1 text-[12px] leading-none font-bold text-white ${
                            user.role === 'user'
                              ? 'bg-[#3a3f44]'
                              : 'bg-[#0b8bd9]'
                          }`}
                        >
                          {user.userName}
                        </span>
                      </td>
                      <td className='border border-gray-200 px-2 py-[5px] text-center'>
                        <div className='flex items-center justify-center gap-x-2'>
                          {formatMoney(user.creditReference)}
                          <span
                            className='cursor-pointer text-blue2'
                            onClick={() => {
                              setCreditPopup(true);
                              setcurrentUser(user);
                            }}
                          >
                            <FaRegEdit />
                          </span>
                          <span
                            className='cursor-pointer text-blue2'
                            onClick={() => {
                              handleCreditRefHistory(user._id);
                              setcurrentUser(user);
                            }}
                          >
                            <FaEye />
                          </span>
                        </div>
                      </td>
                      <td className='border border-gray-200 px-2 py-[5px] text-center'>
                        <div className='flex items-center justify-center gap-1'>
                          {formatMoney(user.partnership || 0)}
                          {isFetchingAllUsers == true ? (
                            <span
                              className='cursor-pointer text-blue2'
                              onClick={() => {
                                setPatnerPopup(true);
                                setcurrentUser(user);
                                setPartnershipFormData({
                                  partnership: '',
                                  masterPassword: '',
                                });
                              }}
                            >
                              <FaRegEdit />
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className='border border-gray-200 px-2 py-[5px] text-center'>
                        {formatMoney(rowBalance(user))}
                      </td>
                      <td
                        className={`border border-gray-200 px-2 py-[5px] text-center ${
                          rowPL(user) < 0 ? 'text-red-500' : 'text-green-600'
                        }`}
                      >
                        {formatMoney(rowPL(user))}
                      </td>
                      <td className='border border-gray-200 px-2 py-[5px] text-center text-red-500'>
                        ({formatMoney(Math.abs(Number(user.exposure || 0)))})
                      </td>
                      <td className='border border-gray-200 px-2 py-[5px] text-center'>
                        {formatMoney(rowAvailable(user))}
                      </td>
                      {(() => {
                        const pctShare = 100 - (user.partnership || 0);
                        const uplinePL =
                          Math.round(rowPL(user) * (pctShare / 100) * 100) /
                          100;
                        return (
                          <td
                            className={`border border-gray-200 px-2 py-[5px] text-center font-semibold ${
                              uplinePL < 0 ? 'text-red-500' : 'text-green-600'
                            }`}
                          >
                            {formatMoney(uplinePL)}
                            <span className='ml-1 text-[10px] text-gray-400'>
                              ({pctShare}%)
                            </span>
                          </td>
                        );
                      })()}
                      <td className='border border-gray-200 px-2 py-[5px] text-center'>
                        <span
                          title={user.status}
                          onClick={() => {
                            if (isFetchingAllUsers == true) {
                              setSettingPopup(true);
                              setcurrentUser(user);
                            }
                          }}
                          className={`inline-flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-[3px] text-[11px] text-white ${
                            user.status === 'active'
                              ? 'bg-black'
                              : 'border border-gray-400 bg-white'
                          }`}
                        >
                          {user.status === 'active' ? <IoMdCheckmark /> : null}
                        </span>
                      </td>
                      <td className='border border-gray-200 px-2 py-[5px] text-center'>
                        <span
                          title={
                            isBettingAllowed(user)
                              ? 'Betting allowed'
                              : 'Betting locked on some sports'
                          }
                          onClick={() => {
                            if (isFetchingAllUsers == true) {
                              setSportsPopup(true);
                              setGameLockData(user?.gamelock);
                              setcurrentUser(user);
                            }
                          }}
                          className={`inline-flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-[3px] text-[11px] text-white ${
                            isBettingAllowed(user)
                              ? 'bg-black'
                              : 'border border-gray-400 bg-white'
                          }`}
                        >
                          {isBettingAllowed(user) ? <IoMdCheckmark /> : null}
                        </span>
                      </td>
                      <td className='border border-gray-200 px-2 py-[5px] text-center font-normal capitalize'>
                        {roleText(user.role)}
                      </td>
                      <td className='border border-gray-200 px-2 py-[5px]'>
                        <div className='flex items-center gap-1'>
                          {isFetchingAllUsers == true ? (
                            <>
                              <span
                                title='Deposit / Withdraw'
                                onClick={() => {
                                  setBalancePopup(true);
                                  setcurrentUser(user);
                                }}
                                className='flex h-[22px] w-[24px] cursor-pointer items-center justify-center rounded-[3px] bg-[#3a3f44] text-[11px] font-bold text-white hover:bg-black'
                              >
                                D
                              </span>
                              <span
                                title='Settings'
                                onClick={() => {
                                  setSettingPopup(true);
                                  setcurrentUser(user);
                                }}
                                className='flex h-[22px] w-[24px] cursor-pointer items-center justify-center rounded-[3px] bg-[#3a3f44] text-[11px] font-bold text-white hover:bg-black'
                              >
                                S
                              </span>
                            </>
                          ) : null}

                          {!isFetchingAllUsers == true ? (
                            <>
                              <Link
                                to={`/online-user/${user._id}`}
                                state={{ activeTab: 'PL' }}
                                title='Profit / Loss'
                                className='flex h-[22px] w-[24px] items-center justify-center rounded-[3px] bg-[#3a3f44] text-[11px] font-bold text-white hover:bg-black'
                              >
                                P
                              </Link>
                              <Link
                                to={`/online-user/${user._id}`}
                                state={{ activeTab: 'BH' }}
                                title='Bet History'
                                className='flex h-[22px] w-[24px] items-center justify-center rounded-[3px] bg-[#3a3f44] text-[11px] font-bold text-white hover:bg-black'
                              >
                                B
                              </Link>
                            </>
                          ) : null}
                          <Link
                            to={`/online-user/${user._id}`}
                            title='Profile'
                            className='flex h-[22px] w-[24px] items-center justify-center rounded-[3px] bg-[#3a3f44] text-[11px] font-bold text-white hover:bg-black'
                          >
                            U
                          </Link>
                          {isFetchingAllUsers == true ? (
                            <span
                              title='Sports Lock'
                              onClick={() => {
                                setSportsPopup(true);
                                setGameLockData(user?.gamelock);
                                setcurrentUser(user);
                              }}
                              className='flex h-[22px] w-[24px] cursor-pointer items-center justify-center rounded-[3px] bg-[#3a3f44] text-[11px] font-bold text-white hover:bg-black'
                            >
                              L
                            </span>
                          ) : null}
                          {isFetchingAllUsers == true ? (
                            <span
                              title='Delete'
                              className='flex h-[22px] w-[24px] cursor-pointer items-center justify-center rounded-[3px] bg-[#3a3f44] text-[13px] text-white hover:bg-red-700'
                              onClick={() => handleDelete(user._id)}
                            >
                              <MdDelete />
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan='12'
                      className='border border-gray-200 p-2 text-center'
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='mt-4 flex flex-col justify-between gap-3 text-[12px] md:flex-row md:items-center'>
            <div>
              Showing {currentPage} to {totalPages} of {users?.length} entries
            </div>
            <div className='flex flex-wrap items-center gap-[2px]'>
              <button
                className='h-[28px] w-[30px] rounded-[3px] bg-[#f3f3f3] text-[#aaa] enabled:text-[#0b60a8]'
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                title='First'
              >
                «
              </button>
              <button
                className='h-[28px] w-[30px] rounded-[3px] bg-[#f3f3f3] text-[#aaa] enabled:text-[#0b60a8]'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title='Previous'
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`h-[28px] min-w-[30px] rounded-[3px] px-2 ${
                    currentPage === i + 1
                      ? 'bg-[#0b8bd9] text-white'
                      : 'bg-[#f3f3f3] text-[#0b60a8]'
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className='h-[28px] w-[30px] rounded-[3px] bg-[#f3f3f3] text-[#aaa] enabled:text-[#0b60a8]'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title='Next'
              >
                ›
              </button>
              <button
                className='h-[28px] w-[30px] rounded-[3px] bg-[#f3f3f3] text-[#aaa] enabled:text-[#0b60a8]'
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                title='Last'
              >
                »
              </button>
            </div>
          </div>
        </div>
        {creditPopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between p-1 px-3 text-white'>
                <h5 className='text-md font-semibold'>
                  Edit Credit Reference - {currentUser.name}
                </h5>
                <button
                  onClick={() => setCreditPopup(false)}
                  className='text-xl text-white'
                >
                  ×
                </button>
              </div>

              {/* Commission List */}
              <div className='space-y-2'>
                <form onSubmit={handleUpdate} className='space-y-2 p-4'>
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>Current</span>
                    <input
                      readOnly
                      type='text'
                      className='col-span-3 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:basis-[75%]'
                      value={currentUser.creditReference}
                      placeholder='Add here'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>New </span>
                    <input
                      type='text'
                      className='col-span-3 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:basis-[75%]'
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditReference: e.target.value,
                        })
                      }
                      value={formData.creditReference}
                      placeholder='Add here'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>Password</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                      value={formData.masterPassword}
                      placeholder='Enter your password...'
                      className='col-span-3 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:basis-[75%]'
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <button
                      // onClick={() => handleUpdate(e)}
                      className='bg-blue rounded-md px-3 py-1 text-white'
                    >
                      Submit
                    </button>
                    <button
                      className='rounded-md bg-gray-300 px-3 py-1'
                      onClick={() => setCreditPopup(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
        {patnerPopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              <div className='bg-blue flex items-center justify-between px-4 py-1 font-bold text-white'>
                <span>Edit Partnership - {currentUser?.userName}</span>
                <button
                  onClick={() => setPatnerPopup(false)}
                  className='text-xl text-white'
                >
                  &times;
                </button>
              </div>
              <form
                onSubmit={handlePartnershipUpdate}
                className='space-y-2 p-4'
              >
                <div className='grid items-center px-4 py-1 md:grid-cols-4'>
                  <span className='col-span-1 text-sm'>Current</span>
                  <input
                    readOnly
                    type='text'
                    className='col-span-3 mt-1.5 basis-full rounded-md border border-gray-300 bg-gray-100 px-2 py-1 font-light md:mt-0 md:basis-[75%]'
                    value={currentUser?.partnership || 0}
                  />
                </div>
                <div className='grid items-center px-4 py-1 md:grid-cols-4'>
                  <span className='col-span-1 text-sm'>New</span>
                  <input
                    type='number'
                    min='1'
                    max='100'
                    className='col-span-3 mt-1.5 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:mt-0 md:basis-[75%]'
                    value={partnershipFormData.partnership}
                    onChange={(e) =>
                      setPartnershipFormData({
                        ...partnershipFormData,
                        partnership: e.target.value,
                      })
                    }
                    placeholder='Enter new partnership (1-100)'
                  />
                </div>
                <div className='grid items-center px-4 py-1 md:grid-cols-4'>
                  <span className='col-span-1 text-sm'>Password</span>
                  <input
                    type='password'
                    className='col-span-3 mt-1.5 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:mt-0 md:basis-[75%]'
                    value={partnershipFormData.masterPassword}
                    onChange={(e) =>
                      setPartnershipFormData({
                        ...partnershipFormData,
                        masterPassword: e.target.value,
                      })
                    }
                    placeholder='Enter master password'
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <button
                    type='submit'
                    className='bg-blue rounded-md px-3 py-1 text-white'
                  >
                    Submit
                  </button>
                  <button
                    type='button'
                    className='rounded-md bg-gray-300 px-3 py-1'
                    onClick={() => setPatnerPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {balancePopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between px-4 py-1 text-[15px] font-bold text-white'>
                <span>Banking - Master Balance : {userInfo.avbalance}</span>
                <button
                  onClick={() => setBalancePopup(false)}
                  className='text-xl text-white'
                >
                  ×
                </button>
              </div>

              <div className='p-4'>
                <div className='flex justify-between pb-4'>
                  <div className='flex items-center gap-1 lowercase'>
                    {' '}
                    <span className='inline-block h-fit rounded-sm border border-[#4dbd74] bg-[#4dbd74] px-1 py-0.5 text-[11px] leading-none text-white uppercase'>
                      {currentUser.role === 'white'
                        ? 'White_level'
                        : currentUser.role}
                    </span>
                    {currentUser.userName}
                  </div>
                  <div>
                    Client Bal:{' '}
                    <span className='font-semibold'>
                      {currentUser.avbalance}
                    </span>{' '}
                  </div>
                </div>
                <form onSubmit={handleWithdwalDeposite}>
                  <div className='mb-4 grid items-center md:grid-cols-4'>
                    <span className='col-span-1'>Balance</span>
                    <input
                      type='Number'
                      className='col-span-3 mt-1.5 basis-full rounded-md border border-[#e4e7ea] px-3 py-1.5 font-light md:mt-0'
                      onChange={(e) =>
                        setFormData({ ...formData, balance: e.target.value })
                      }
                      value={formData.balance}
                      placeholder='Add here'
                    />
                  </div>
                  <div className='mb-4 grid items-center md:grid-cols-4'>
                    <span className='col-span-1'>Remark</span>
                    <input
                      type='text'
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remark: e.target.value,
                        })
                      }
                      value={formData.remark}
                      className='col-span-3 mt-1.5 basis-full rounded-md border border-[#e4e7ea] px-3 py-1.5 font-light md:mt-0'
                      placeholder='Add here'
                    />
                  </div>
                  <div className='mb-4 grid items-center md:grid-cols-4'>
                    <span className='col-span-1'>Password</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                      value={formData.masterPassword}
                      placeholder='Enter your password...'
                      className='col-span-3 mt-1.5 basis-full rounded-md border border-[#e4e7ea] px-3 py-1.5 font-light md:mt-0'
                    />
                  </div>
                  <div className='flex justify-end gap-2 pt-4 font-bold'>
                    <button
                      onClick={() => setType('deposite')}
                      className='rounded-md bg-green-300 px-3 py-2 text-white'
                    >
                      Deposit
                    </button>
                    <button
                      className='rounded-md bg-red-300 px-3 py-2 text-white'
                      onClick={() => setType('withdrawal')}
                    >
                      Withdraw
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
        {settingPopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between p-1 px-3 text-white'>
                <h2 className='font-semibold'>Change Status</h2>
                <button
                  className='text-xl text-white'
                  onClick={() => setSettingPopup(false)}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className='p-4'>
                {/* User Info */}
                <div className='mb-4 flex items-center justify-between gap-2 text-[13px]'>
                  <div>
                    <span className='rounded bg-green-500 px-1 py-0.5 text-xs text-[11px] text-white'>
                      {currentUser.role === 'white'
                        ? 'White_level'
                        : currentUser.role}
                    </span>
                    <span className='ml-2'>{currentUser.name}</span>
                  </div>
                  <span className='rounded bg-green-200 px-2 py-1 text-xs text-green-800'>
                    {currentUser.status}
                  </span>
                </div>

                {/* Status Buttons */}
                <div className='mb-4 grid grid-cols-3 gap-3'>
                  {/* Active Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: 'active' })
                    }
                    className={`flex flex-col items-center rounded border p-3 ${
                      formData.status === 'active'
                        ? 'bg-green-500 text-white'
                        : 'border-green-500 text-green-600'
                    }`}
                  >
                    <FaCheckCircle size={20} />
                    <span>Active</span>
                  </button>

                  {/* Suspend Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: 'suspend' })
                    }
                    className={`flex flex-col items-center rounded border p-3 ${
                      formData.status === 'suspend'
                        ? 'bg-red-500 text-white'
                        : 'border-red-500 text-red-600'
                    }`}
                  >
                    <FaBan size={20} />
                    <span>Suspend</span>
                  </button>

                  {/* Locked Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: 'locked' })
                    }
                    className={`flex flex-col items-center rounded border p-3 ${
                      formData.status === 'locked'
                        ? 'bg-gray-700 text-white'
                        : 'border-gray-400 text-gray-700'
                    }`}
                  >
                    <FaLock size={20} />
                    <span>Locked</span>
                  </button>
                </div>

                <div className='grid grid-cols-2 gap-1'>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Password..'
                      className='w-full rounded border p-1 px-2'
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      className='absolute top-2 right-3 text-gray-500'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Change Button */}
                  <button
                    onClick={handleSetting}
                    className='bg-blue w-full rounded px-2 text-white'
                  >
                    Change
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {sportsPopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between p-3 py-1 text-white'>
                <h2 className='font-semibold'>Sports Settings</h2>
                <button
                  className='text-xl text-white'
                  onClick={() => setSportsPopup(false)}
                >
                  ×
                </button>
              </div>

              {/* Table */}
              <div className='max-h-[400px] overflow-y-auto p-4'>
                <table className='w-full border-collapse border text-left'>
                  <thead>
                    <tr className='bg-gray-200'>
                      <th className='border p-2'>Sr.No.</th>
                      <th className='border p-2'>Sport Name</th>
                      <th className='border p-2'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameLockData.map((item, index) => {
                      // Find matching parent (admin/userInfo) gamelock entry
                      const parentGameLock = userInfo?.gamelock?.find(
                        (g) => g.game === item.game
                      );

                      // Is the parent lock ON (true)? Only then allow change
                      const isParentLocked = parentGameLock?.lock === true;

                      return (
                        <tr className='border' key={item.game}>
                          <td className='border p-2'>{index + 1}</td>
                          <td className='border p-2'>{item.game}</td>
                          <td className='border p-2 text-center'>
                            <input
                              type='checkbox'
                              checked={item.lock}
                              disabled={!isParentLocked} // disable checkbox if admin lock is false
                              onChange={() =>
                                isParentLocked &&
                                handleToggle(item.game, item.lock)
                              }
                            />
                            {!isParentLocked && (
                              <div className='text-xs text-red-500'>
                                Locked by Admin
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {isOpen && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between p-1 px-3 text-white'>
                <h5 className='text-md font-semibold'>
                  Credit Reference Log - {currentUser.name}
                </h5>
                <button
                  className='text-xl font-bold text-white'
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </div>

              {/* Body */}

              <div className='p-4'>
                {loading ? (
                  <div className='flex items-center justify-center py-10'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
                  </div>
                ) : (
                  <>
                    <div className='mb-4 flex flex-col justify-between md:flex-row'>
                      <div className='mb-2 flex items-center justify-center md:mb-0'>
                        <span className='mr-2'>Show</span>
                        <select
                          className='rounded border border-gray-300 px-2 py-1'
                          value={creditEntries}
                          onChange={(e) => {
                            setCreditEntries(Number(e.target.value));
                            setCurrentPage(1); // reset to first page on entries change
                          }}
                        >
                          <option value='2'>2</option>
                          <option value='5'>5</option>
                          <option value='10'>10</option>
                        </select>
                        <span className='ml-2'>entries</span>
                      </div>
                      <div className='flex items-center justify-center'>
                        <span className='mr-2'>Search:</span>
                        <input
                          type='text'
                          className='rounded border border-gray-300 px-2 py-1'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <table className='w-full border-collapse border border-gray-300'>
                      <thead className='bg-gray-200'>
                        <tr>
                          <th className='border border-gray-300 p-2'>
                            From Name
                          </th>
                          <th className='border border-gray-300 p-2'>
                            Username
                          </th>
                          <th className='border border-gray-300 p-2'>
                            Old Credit Reference
                          </th>
                          <th className='border border-gray-300 p-2'>
                            New Credit Reference
                          </th>
                          <th className='border border-gray-300 p-2'>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {crediteHistory.length > 0 ? (
                          crediteHistory.map((item, index) => (
                            <tr key={index} className='text-center'>
                              <td className='border border-gray-300 p-2 text-red-500'>
                                ({item.formName})
                              </td>
                              <td className='border border-gray-300 p-2'>
                                {item.userName}
                              </td>
                              <td className='border border-gray-300 p-2 text-red-500'>
                                ({item.oldamount})
                              </td>
                              <td className='border border-gray-300 p-2'>
                                {item.newamount}
                              </td>
                              <td className='border border-gray-300 p-2'>
                                {new Date(item.createdAt).toLocaleString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true,
                                  }
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan='5'
                              className='border border-gray-300 p-2 text-center'
                            >
                              No matching records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
