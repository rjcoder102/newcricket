import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { getResultLabel, getResultBgColor } from '../constants';

/**
 * RecentResults - Horizontal scrollable list of recent game results
 * Each result shows the winner (A/B/T for regular, P/B/T for baccarat)
 */
const RecentResults = memo(function RecentResults({
  gameid,
  currentGameId,
  results,
  onItemClick,
}) {
  // Only show results from the correct game
  const visibleResults =
    currentGameId === gameid && results?.length ? results : [];

  return (
    <div className='mb-25 lg:mb-2'>
      <div className='bg-secondary text-secondary flex items-center justify-between p-1 text-[15px] font-bold'>
        <span>Last Result</span>
        <Link
          to='/casino-results'
          className='text-[13px] font-semibold hover:underline'
        >
          View All
        </Link>
      </div>
      <div className='min-h-[44px] overflow-x-auto bg-white p-1 text-right whitespace-nowrap'>
        {visibleResults.map((item, index) => {
          const label = getResultLabel(gameid, item.win);
          const bgColor = getResultBgColor(gameid, item.win);

          return (
            <span
              onClick={() => onItemClick?.(item)}
              key={index}
              className={`mr-2 inline-flex h-[34px] w-[38px] cursor-pointer items-center justify-center rounded-full leading-none font-bold text-black ${bgColor}`}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
});

export default RecentResults;
