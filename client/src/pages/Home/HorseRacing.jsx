import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function formatRaceTime(stime) {
  const date = new Date(stime);
  if (Number.isNaN(date.getTime())) return stime;
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

export default function HorseRacing({ panel = false }) {
  
  const { venues, loading, error } = useSelector((state) => state.horseRacing);
  const races = venues
    .flatMap((venue) =>
      (venue.races || []).map((race) => ({
        ...race,
        venue: venue.ename,
        country: venue.cname,
      }))
    )
    .sort((a, b) => {
      const aTime = new Date(a.stime).getTime();
      const bTime = new Date(b.stime).getTime();
      return (
        (Number.isNaN(aTime) ? Number.POSITIVE_INFINITY : aTime) -
        (Number.isNaN(bTime) ? Number.POSITIVE_INFINITY : bTime)
      );
    });



    console.log('Horse Racing Races:', races); // Debugging line to check the races data

  return (
    <section
      className={`flex min-h-0 flex-col bg-white text-[#252a2e] z-[99999] ${
        panel
          ? 'h-[calc(100vh-3rem)] w-[min(380px,100vw)] border border-gray-300 shadow-lg lg:w-[min(280px,calc(100vw-220px))]'
          : 'w-full border border-gray-300'
      }`}
      aria-label='All Horse Racing'
    >
      <h2 className='border-b border-gray-300 px-6 py-3 text-2xl font-bold'>
        All Horse Racing
      </h2>
      {loading && races.length === 0 && (
        <p className='px-6 py-4 text-sm text-gray-600'>Loading races...</p>
      )}
      {error && (
        <p className='px-6 py-4 text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
      {!loading && !error && races.length === 0 && (
        <p className='px-6 py-4 text-sm text-gray-600'>No horse races found.</p>
      )}
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {races.map((race) => (
          <Link
            to={`/hourse-racing-bet//${race.venue}/${race.gmid}`}
            key={race.gmid}
            className='flex items-center gap-2 px-6 py-3 text-base hover:bg-gray-50'
          >
            <time className='shrink-0 font-medium'>
              {formatRaceTime(race.stime)}
            </time>
            <span>
              {race.venue} ({race.country})
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
