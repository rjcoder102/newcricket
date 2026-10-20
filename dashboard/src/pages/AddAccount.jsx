import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { addAdmin, getAdmin } from '../redux/reducer/authReducer';

const inputClass =
  'h-[34px] w-full rounded-[3px] border border-gray-300 bg-white px-2 text-[12px] font-normal text-[#333] outline-none focus:border-[#0b8bd9]';
const labelClass = 'mb-1 block text-[12px] font-semibold text-[#333]';

const SectionTitle = ({ children }) => (
  <div className='bg-[#2b3a4b] px-3 py-[6px] text-[15px] font-medium text-white'>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className='relative'>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} pr-8`}
        autoComplete='new-password'
      />
      <button
        type='button'
        className='absolute inset-y-0 right-2 flex items-center text-gray-500'
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

const SettingsTable = ({ upline, children, our }) => (
  <div className='mb-3 text-[12px]'>
    <div className='grid grid-cols-[25%_1fr] bg-[#ebebeb]'>
      <div className='px-2 py-[7px] font-semibold'>Upline</div>
      <div className='border-l border-gray-300 px-2 py-[7px] font-semibold'>
        {upline}
      </div>
    </div>
    <div className='grid grid-cols-[25%_1fr] bg-[#f7f7f7]'>
      <div className='px-2 py-[7px] font-semibold'>Downline</div>
      <div className='border-l border-gray-300 px-2 py-1'>{children}</div>
    </div>
    <div className='grid grid-cols-[25%_1fr] bg-[#ebebeb]'>
      <div className='px-2 py-[7px] font-semibold'>Our</div>
      <div className='border-l border-gray-300 px-2 py-[7px] font-semibold'>
        {our}
      </div>
    </div>
  </div>
);

const roleHierarchy = {
  supperadmin: ['admin', 'white', 'super', 'master', 'agent'],
  admin: ['white', 'super', 'master', 'agent'],
  white: ['super', 'master', 'agent'],
  super: ['master', 'agent'],
  master: ['agent'],
  agent: ['user'],
};

const roleLabel = (role) =>
  role === 'white' ? 'White_level' : role.charAt(0).toUpperCase() + role.slice(1);

// mode 'user' creates end users (Userlist); mode 'agent' creates downline
// agents/masters (AgentLIst) with rolling commission and a required partnership.
export default function AddAccount({ mode = 'user' }) {
  const isAgentMode = mode === 'agent';
  const listPath = isAgentMode ? '/agent-download-list' : '/user-download-list';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const allowedRoles = roleHierarchy[userInfo?.role] || [];

  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    accountType: isAgentMode ? '' : 'user',
    commition: '',
    balance: null,
    exposureLimit: null,
    creditReference: null,
    rollingCommission: null,
    partnership: null,
    phone: null,
    password: '',
    masterPassword: '',
    status: 'active',
    confirmPassword: '',
  });

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  const uplinePartnership = Number(userInfo?.partnership || 0);
  const uplineCommission = Number(userInfo?.commition || 0);
  const downCommission = Number(formData.commition);
  const downPartnership = Number(formData.partnership);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password and Confirm Password do not match');
      return;
    }
    if (!userInfo) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const result = await dispatch(addAdmin(formData)).unwrap();
      toast.success(result.message);
      dispatch(getAdmin());
      navigate(listPath);
    } catch (error) {
      toast.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-[#f1f1f1] p-3 md:px-4'>
        <form
          onSubmit={handleSubmit}
          className='rounded-[4px] border border-gray-300 bg-[#f7f7f7] p-3 md:p-4'
        >
          <h1 className='mb-3 text-[22px] leading-tight font-medium text-[#222]'>
            Add Account
          </h1>

          <div className='grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2'>
            <div>
              <SectionTitle>Personal Detail</SectionTitle>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field label='Client Name (User Name):'>
                  <input
                    type='text'
                    className={inputClass}
                    placeholder='Client Name'
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                  />
                </Field>
                <Field label='User Password:'>
                  <PasswordInput
                    placeholder='User Password'
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </Field>
                <Field label='Retype Password:'>
                  <PasswordInput
                    placeholder='Retype Password'
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label='Full Name:'>
                  <input
                    type='text'
                    className={inputClass}
                    placeholder='Full Name'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Field>
                <Field label='Mobile Number:'>
                  <input
                    type='text'
                    className={inputClass}
                    placeholder='Phone Number'
                    value={formData.phone ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Field>
              </div>
            </div>

            <div>
              <SectionTitle>Account Detail</SectionTitle>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field label='Account Type:'>
                  <select
                    className={inputClass}
                    value={formData.accountType}
                    onChange={(e) =>
                      setFormData({ ...formData, accountType: e.target.value })
                    }
                  >
                    {isAgentMode ? (
                      <>
                        <option value=''>Select Account Type</option>
                        {allowedRoles.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleLabel(roleOption)}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value='user'>User</option>
                    )}
                  </select>
                </Field>
                <Field label='Credit Reference:'>
                  <input
                    type='number'
                    className={inputClass}
                    placeholder='Credit Reference'
                    value={formData.creditReference ?? ''}
                    onChange={(e) => {
                      const crRefValue = e.target.value;
                      const roundedValue = crRefValue.includes('.')
                        ? Math.round(parseFloat(crRefValue)).toString()
                        : crRefValue;
                      setFormData({
                        ...formData,
                        creditReference: roundedValue,
                      });
                    }}
                  />
                </Field>
                <Field label='Opening Balance:'>
                  <input
                    type='number'
                    className={inputClass}
                    placeholder='Opening Balance'
                    value={formData.balance ?? ''}
                    onChange={(e) => {
                      const openingValue = e.target.value;
                      if (openingValue.includes('.')) {
                        toast.error('The bank balance must be an integer');
                        return;
                      }
                      setFormData({ ...formData, balance: openingValue });
                    }}
                  />
                </Field>
                {isAgentMode ? (
                  <Field label='Rolling Commission:'>
                    <input
                      type='text'
                      className={inputClass}
                      placeholder='Rolling Commission'
                      value={formData.rollingCommission ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rollingCommission: e.target.value,
                        })
                      }
                    />
                  </Field>
                ) : (
                  <Field label='Exposure Limit:'>
                    <input
                      type='number'
                      className={inputClass}
                      placeholder='Exposure Limit'
                      value={formData.exposureLimit ?? ''}
                      onChange={(e) => {
                        const exposureValue = e.target.value;
                        if (exposureValue.includes('.')) return;
                        setFormData({
                          ...formData,
                          exposureLimit: exposureValue,
                        });
                      }}
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>

          <div className='mt-5'>
            <SectionTitle>Commission Settings</SectionTitle>
            <div className='mt-3'>
              <SettingsTable
                upline={uplineCommission}
                our={
                  formData.commition !== '' && !isNaN(downCommission)
                    ? uplineCommission - downCommission
                    : ''
                }
              >
                <input
                  type='text'
                  className='h-[28px] w-full bg-white px-2 text-[12px] outline-none'
                  placeholder='0'
                  value={formData.commition}
                  onChange={(e) =>
                    setFormData({ ...formData, commition: e.target.value })
                  }
                />
              </SettingsTable>
            </div>
          </div>

          <div>
            <SectionTitle>Partnership</SectionTitle>
            <div className='mt-3'>
              <SettingsTable
                upline={uplinePartnership}
                our={
                  formData.partnership !== null &&
                  formData.partnership !== '' &&
                  !isNaN(downPartnership)
                    ? uplinePartnership - downPartnership
                    : ''
                }
              >
                <input
                  type='number'
                  className='h-[28px] w-full bg-white px-2 text-[12px] outline-none'
                  placeholder='0'
                  value={formData.partnership ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partnership: e.target.value === '' ? null : e.target.value,
                    })
                  }
                />
              </SettingsTable>
            </div>
          </div>

          <div className='mt-6 flex flex-col items-end gap-3'>
            <div className='w-full md:w-[30%]'>
              <Field label='Master Password:'>
                <PasswordInput
                  placeholder='Master Password'
                  value={formData.masterPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, masterPassword: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => navigate(listPath)}
                className='rounded-[3px] bg-[#6c757d] px-4 py-[8px] text-[12px] leading-none font-bold text-white hover:bg-[#5a6268]'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={submitting}
                className='rounded-[3px] bg-[#0b8bd9] px-4 py-[8px] text-[12px] leading-none font-bold text-white hover:bg-[#0976b9] disabled:opacity-60'
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
