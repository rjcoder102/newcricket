import React from 'react';

const formatValue = (value) => {
  if (value === null || value === undefined || value === '' || Number(value) === 0) {
    return '-';
  }
  return value;
};

function CricketMarket({ market, onBetSelect }) {
  const runners = Array.isArray(market.section) ? market.section : [];
  const marketName = market.mname || 'Match Odds';
  const marketMax = market.max || market.maxb || 0;
  const marketUnavailable =
    market.status === 'SUSPENDED' || market.gstatus === 'SUSPENDED';

  const selectOdds = (runner, odd) => {
    if (!odd || Number(odd.odds) <= 0 || marketUnavailable) return;

    onBetSelect({
      team: runner.nat || runner.tname || `Selection ${runner.sid}`,
      teams: runners.map(
        (item) => item.nat || item.tname || `Selection ${item.sid}`
      ),
      odds: String(odd.odds),
      size: odd.size,
      sid: runner.sid,
      type: odd.otype,
      oname: odd.oname || '',
      tno: odd.tno,
      marketName,
      gameType: 'Match Odds',
      maxAmount: marketMax,
      minAmount: market.min || 0,
    });
  };

  return (
    <section className='mt-1 min-w-0' aria-label={marketName}>
      <div className='text-secondary flex items-center justify-between bg-[#2C3E50D9] p-1'>
        <span className='text-[13px] font-bold lg:text-[15px]'>
          {marketName.replaceAll('_', ' ')}
        </span>
        <span className='text-xs'>Max: {formatValue(marketMax)}</span>
      </div>
      <div className='grid grid-cols-[minmax(130px,1fr)_repeat(3,minmax(42px,1fr))_repeat(3,minmax(42px,1fr))] border-b border-gray-300 text-center text-xs font-bold text-[#333] sm:grid-cols-[minmax(180px,1fr)_repeat(3,60px)_repeat(3,60px)]'>
        <div />
        <div className='col-span-3 bg-[#72bbef] p-1'>Back</div>
        <div className='col-span-3 bg-[#faa9ba] p-1'>Lay</div>
      </div>

      {runners.map((runner, index) => {
        const runnerName =
          runner.nat || runner.tname || `Selection ${runner.sid || index + 1}`;
        const suspended =
          marketUnavailable ||
          runner.gstatus === 'SUSPENDED' ||
          runner.status === 'SUSPENDED';
        const odds = Array.isArray(runner.odds) ? runner.odds : [];
        const backOdds = odds
          .filter((odd) => odd.otype === 'back')
          .slice(0, 3);
        const layOdds = odds
          .filter((odd) => odd.otype === 'lay')
          .slice(0, 3);

        return (
          <div
            key={runner.sid || `${runnerName}-${index}`}
            className='grid grid-cols-[minmax(130px,1fr)_repeat(3,minmax(42px,1fr))_repeat(3,minmax(42px,1fr))] border-b border-gray-300 sm:grid-cols-[minmax(180px,1fr)_repeat(3,60px)_repeat(3,60px)]'
          >
            <div className='flex min-w-0 items-center px-2 py-2 text-xs font-semibold text-[#333] sm:text-sm'>
              <span className='truncate'>{runnerName}</span>
            </div>
            {suspended ? (
              <div className='col-span-6 flex min-h-[38px] items-center justify-center bg-[#4b4b4b] text-center text-xs font-bold text-white'>
                {runner.gstatus || runner.status || market.status || 'SUSPENDED'}
              </div>
            ) : (
              <>
                {[0, 1, 2].map((slot) => {
                  const odd = backOdds[slot];
                  return (
                    <button
                      key={`back-${slot}`}
                      type='button'
                      disabled={!odd || Number(odd.odds) <= 0}
                      onClick={() => selectOdds(runner, odd)}
                      className={`flex min-h-[38px] flex-col items-center justify-center border-l border-white bg-[#72bbef] px-1 text-[#333] ${
                        odd && Number(odd.odds) > 0
                          ? 'cursor-pointer hover:brightness-95'
                          : 'cursor-default'
                      }`}
                    >
                      <span className='font-bold'>{formatValue(odd?.odds)}</span>
                      {odd && (
                        <span className='text-[10px]'>
                          {formatValue(odd.size)}
                        </span>
                      )}
                    </button>
                  );
                })}
                {[0, 1, 2].map((slot) => {
                  const odd = layOdds[slot];
                  return (
                    <button
                      key={`lay-${slot}`}
                      type='button'
                      disabled={!odd || Number(odd.odds) <= 0}
                      onClick={() => selectOdds(runner, odd)}
                      className={`flex min-h-[38px] flex-col items-center justify-center border-l border-white bg-[#faa9ba] px-1 text-[#333] ${
                        odd && Number(odd.odds) > 0
                          ? 'cursor-pointer hover:brightness-95'
                          : 'cursor-default'
                      }`}
                    >
                      <span className='font-bold'>{formatValue(odd?.odds)}</span>
                      {odd && (
                        <span className='text-[10px]'>
                          {formatValue(odd.size)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default CricketMarket;
