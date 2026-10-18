import React, { memo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  formatStakeLimit,
  getBetPlacement,
  getCasinoQuickAmounts,
} from '../utils/bettingUtils';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

/**
 * CasinoPlaceBet - desktop bet slip, same look as the sports PlaceBet panel.
 * Driven by the same betControl / betAmount state the inline mobile panel uses,
 * so both place bets through the same placeBet() call.
 */
const CasinoPlaceBet = memo(function CasinoPlaceBet({
  betControl,
  betOdds,
  betAmount,
  updateAmount,
  loading,
  suspended,
  onClose,
  onPlaceBet,
}) {
  const { userInfo } = useSelector((state) => state.auth);
  const stakeInputRef = useRef(null);

  if (!betControl) return null;

  const isBack = betControl.type === 'back';
  const quickAmounts = getCasinoQuickAmounts(userInfo);
  const { betType, teamName, subtype, maxAmount, oddsValue } = getBetPlacement(
    betControl,
    betOdds
  );
  const odds = Number(oddsValue) || 0;
  const stake = Number(betAmount) || 0;
  const minAmount = betControl.min || 0;
  const profit = stake * (odds - 1);
  const disabled = loading || suspended || stake <= 0;

  const handleSubmit = () =>
    onPlaceBet(betType, teamName, maxAmount, oddsValue, subtype);

  return (
    <div className='bg-white'>
      <div className='bg-secondary text-secondary flex items-center justify-between p-1 text-[15px] font-bold'>
        <span>Place Bet</span>
        <span className='text-[13px]'>
          Range: {formatStakeLimit(minAmount)} to {formatStakeLimit(maxAmount)}
        </span>
      </div>

      <div className='grid grid-cols-[1.4fr_0.8fr_1fr_0.8fr] bg-[#cccccc] text-[12px] font-bold text-black'>
        <div className='p-2'>(Bet for)</div>
        <div className='p-2'>Odds</div>
        <div className='p-2'>Stake</div>
        <div className='p-2'>Profit</div>
      </div>

      <div className={isBack ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}>
        <div className='grid grid-cols-[1.4fr_0.8fr_1fr_0.8fr] items-center text-[12px] text-black'>
          <div className='flex items-center gap-1 p-2 font-semibold'>
            <button
              type='button'
              onClick={onClose}
              title='Remove'
              className='cursor-pointer text-[14px] leading-none font-bold text-[#d9232b]'
            >
              ×
            </button>
            <span className='truncate'>{betControl.nat}</span>
          </div>
          <div className='p-2'>
            <input
              type='number'
              value={odds.toFixed(2)}
              readOnly
              className='h-[25px] w-full bg-white px-1 py-0.5 text-[12px]'
            />
          </div>
          <div className='p-2'>
            <input
              ref={stakeInputRef}
              type='number'
              value={stake || ''}
              onChange={(e) => updateAmount(parseInt(e.target.value, 10) || 0)}
              className='h-[25px] w-full bg-white px-1 py-0.5 text-[12px]'
            />
          </div>
          <div
            className={`p-2 font-semibold ${
              isBack ? 'text-[#0a6b2d]' : 'text-[#b3001b]'
            }`}
          >
            {stake > 0 ? formatMoney(profit) : '-'}
          </div>
        </div>

        <div className='p-2'>
          <div className='mb-1 flex flex-wrap gap-1'>
            {quickAmounts.map((item) => (
              <button
                key={item.amt}
                type='button'
                onClick={() => updateAmount(stake + item.amt)}
                className='bg-[#cccccc] px-2 py-1 text-[14px] font-bold text-black hover:bg-gray-500'
                style={{ width: 'calc(33.33% - 3px)' }}
              >
                +{item.label || item.amt}
              </button>
            ))}
          </div>
          <div className='mt-1 flex justify-end'>
            <button
              type='button'
              onClick={() => updateAmount(0)}
              className='cursor-pointer text-[12px] text-[#212529] underline'
            >
              clear
            </button>
          </div>
        </div>

        <div className='flex gap-1 p-2'>
          <button
            type='button'
            onClick={() => stakeInputRef.current?.select()}
            className='flex-1 border border-[#097c93] bg-[#097c93] py-2 text-[12px] font-bold text-white hover:bg-[#086a82]'
          >
            Edit
          </button>
          <button
            type='button'
            onClick={() => updateAmount(0)}
            className='flex-1 border border-[#bd1828] bg-[#bd1828] py-2 text-[12px] font-bold text-white hover:bg-[#c82333]'
          >
            Reset
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={disabled}
            className={`flex-1 border border-[#198754] bg-[#198754] py-2 text-[12px] font-bold text-white hover:bg-[#157347] ${
              disabled ? 'cursor-not-allowed opacity-60' : ''
            }`}
          >
            {loading ? 'Placing...' : suspended ? 'Suspended' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default CasinoPlaceBet;
