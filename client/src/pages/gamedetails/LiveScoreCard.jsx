import React from 'react';
import { BiSolidCricketBall } from 'react-icons/bi';
import { MdSportsCricket } from 'react-icons/md';

const ballClass = (ball) => {
  if (ball === '4') return 'bg-[#1e88e5] text-white';
  if (ball === '6') return 'bg-[#43a047] text-white';
  if (['W', 'w', 'ww'].includes(ball)) return 'bg-[#e53935] text-white';
  return 'bg-white text-[#333]';
};

const TeamScore = ({ name, score, crr, rrr, batting, align }) => (
  <div className={`flex-1 ${align === 'right' ? 'text-right' : 'text-left'}`}>
    <div
      className={`flex items-center gap-2 ${
        align === 'right' ? 'flex-row-reverse' : ''
      }`}
    >
      {batting ? (
        <MdSportsCricket className='text-[18px] text-[#43a047]' />
      ) : (
        <BiSolidCricketBall className='text-[16px] text-[#e53935]' />
      )}
      <span className='text-[22px] leading-none font-bold text-white'>
        {score || '0-0'}
      </span>
    </div>
    <div className='mt-1 text-[13px] font-bold text-white/90'>
      {name || ''}
    </div>
    <div className='text-[11px] text-white/70'>
      {crr ? <span>CRR {crr} </span> : null}
      {rrr ? <span>RRR {rrr}</span> : null}
    </div>
  </div>
);

export default function LiveScoreCard({ data }) {
  const balls = Array.isArray(data?.balls) ? data.balls : [];
  const message = data?.spnmessage;

  return (
    <div className='w-full bg-[#2b3a4b] px-3 py-2'>
      <div className='flex items-start justify-between gap-3'>
        <TeamScore
          name={data?.spnnation1}
          score={data?.score1}
          crr={data?.spnrunrate1}
          rrr={data?.spnreqrate1}
          batting={data?.activenation1 === '1'}
        />
        <TeamScore
          name={data?.spnnation2}
          score={data?.score2}
          crr={data?.spnrunrate2}
          rrr={data?.spnreqrate2}
          batting={data?.activenation2 === '1'}
          align='right'
        />
      </div>
      {(message || balls.length > 0) && (
        <div className='mt-2 flex flex-wrap items-center justify-between gap-2'>
          <div className='text-[12px] font-semibold text-[#ffd54f]'>
            {message}
          </div>
          <div className='flex flex-wrap gap-1'>
            {balls.map((ball, index) => (
              <span
                key={index}
                className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${ballClass(ball)}`}
              >
                {ball}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
