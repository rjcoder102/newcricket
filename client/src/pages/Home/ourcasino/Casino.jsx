import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PLAYABLE_SLUGS } from '../../../utils/casinoCategories';

function Casino({ casinos }) {
  const navigate = useNavigate();

  return (
    <div className='grid grid-cols-3 md:grid-cols-7'>
      {casinos.map((casino) => (
        <div key={casino.slug} className='flex flex-col items-center p-0.5'>
          <img
            src={casino.image}
            alt={casino.name}
            loading='lazy'
            onClick={() => {
              // if (PLAYABLE_SLUGS.has(casino.slug)) {
                navigate(`/casino-bet/${casino.name}/${casino.slug}`);
              // }
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default Casino;
