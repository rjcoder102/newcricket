import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Casino from './Casino';
import { useParams } from 'react-router-dom';
import { fetchCasinoData } from '../../../redux/reducer/casinoSlice';
import { mapCasinoGames } from '../../../utils/casinoCategories';
const casinoCategories = [
  { id: 1, name: 'All Casino' },
  { id: 2, name: 'Roulette' },
  { id: 3, name: 'Teenpatti' },
  { id: 4, name: 'Poker' },
  { id: 5, name: 'Baccarat' },
  { id: 6, name: 'Dragon Tiger' },
  { id: 7, name: '32 Cards' },
  { id: 8, name: 'Andar Bahar' },
  { id: 9, name: 'Lucky 7' },
  { id: 10, name: '3 Card Judgement' },
  { id: 11, name: 'Casino War' },
  { id: 12, name: 'Worli' },
  { id: 13, name: 'Sports' },
  { id: 14, name: 'Bollywood' },
  { id: 15, name: 'Lottery' },
  { id: 16, name: 'Queen' },
  { id: 17, name: 'Race' },
];
function CasinoList() {
  const { category } = useParams();
  const dispatch = useDispatch();
  const { data, loader, error } = useSelector((state) => state.casino);
  const [activeCategory, setActiveCategory] = useState(
    category || 'All Casino'
  );

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category]);

  useEffect(() => {
    if (!data?.length) dispatch(fetchCasinoData());
  }, [dispatch, data?.length]);

  const casinos = useMemo(() => mapCasinoGames(data), [data]);
  const visibleCasinos =
    activeCategory === 'All Casino'
      ? casinos
      : casinos.filter((casino) => casino.category === activeCategory);

  return (
    <>
      {/* <OurCasino  selectedNav="Our Casino"/> */}
      <div className='flex w-full flex-col md:flex-row md:p-0.5'>
        {/* Categories Bar - Horizontal scrollable on mobile, Vertical sidebar on desktop */}
        <div className='scrollbar-hide bg-primary text-primary md-desktop-bg flex w-full flex-row overflow-x-auto md:w-1/6 md:flex-col md:overflow-x-visible md:overflow-y-auto'>
          {casinoCategories.map((category) => (
            <button
              key={category.id}
              className={`flex-shrink-0 px-2 py-1 text-sm text-[16px] font-[400] whitespace-nowrap md:p-1 ${activeCategory === category.name ? 'bg-primary' : ''}`}
              onClick={() => {
                setActiveCategory(category.name);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        {/* Casino Grid */}
        <div className='w-full md:w-5/6'>
          {casinos.length === 0 && loader.games && (
            <div className='p-2 text-xs text-gray-500'>Loading casino...</div>
          )}
          {casinos.length === 0 && !loader.games && error.games && (
            <div className='p-2 text-xs text-red-500'>
              Casino games unavailable right now.
            </div>
          )}
          {casinos.length > 0 && visibleCasinos.length === 0 && (
            <div className='p-2 text-xs text-gray-500'>
              No games in {activeCategory}.
            </div>
          )}
          <Casino casinos={visibleCasinos} />
        </div>
      </div>
    </>
  );
}

export default CasinoList;
