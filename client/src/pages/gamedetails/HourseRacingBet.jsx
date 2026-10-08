import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHorse, FaTv } from 'react-icons/fa';
import { toast } from 'react-toastify';
import HorseRacingMarkets from './HorseRacingMarkets';
import MatchedBet from './MatchedBet';
import PlaceBet from './PlaceBet';
import { getUser } from '../../redux/reducer/authReducer';
import {
  fetchHorseRacingBettingData,
} from '../../redux/reducer/horseRacingSlice';
import {
  getPendingBet,
  getPendingBetAmo,
  messageClear,
} from '../../redux/reducer/betReducer';

function HourseRacingBet() {
  const { game, id: gameid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const time = location.state?.time;
  const venue = game || 'Horse Racing';
  const dispatch = useDispatch();
  const [showOdds, setShowOdds] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const {
    bettingData: storedBettingData,
    bettingLoading,
    bettingLoaded,
    bettingError,
    bettingGameId,
  } = useSelector((state) => state.horseRacing);
  const { pendingBetAmounts, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const horseRacingDataMatchesRoute =
    String(bettingGameId) === String(gameid);
  const bettingData = horseRacingDataMatchesRoute ? storedBettingData : [];
  const isBettingLoaded = horseRacingDataMatchesRoute && bettingLoaded;
  const isBettingLoading =
    !horseRacingDataMatchesRoute || bettingLoading;
  const bettingDataError = horseRacingDataMatchesRoute ? bettingError : null;
  const hasHorseRacingMarkets =
    Array.isArray(bettingData) &&
    bettingData.some(
      (market) =>
        Array.isArray(market?.section) &&
        market.section.some((runner) => runner && (runner.nat || runner.tname))
    );

  useEffect(() => {
    if (!gameid) return undefined;

    let requestInProgress = false;
    const refreshBettingData = () => {
      if (requestInProgress) return;
      requestInProgress = true;
      dispatch(fetchHorseRacingBettingData(gameid)).finally(() => {
        requestInProgress = false;
      });
    };

    refreshBettingData();
    const intervalId = window.setInterval(refreshBettingData, 1000);
    return () => window.clearInterval(intervalId);
  }, [dispatch, gameid]);

  useEffect(() => {
    if (
      !isBettingLoaded ||
      bettingDataError ||
      hasHorseRacingMarkets
    ) {
      return undefined;
    }

    const redirectTimer = window.setTimeout(() => navigate('/'), 2500);
    return () => window.clearTimeout(redirectTimer);
  }, [
    isBettingLoaded,
    bettingDataError,
    hasHorseRacingMarkets,
    navigate,
  ]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (!gameid) return;
    dispatch(getPendingBetAmo(gameid));
    dispatch(getPendingBet(gameid));
  }, [dispatch, gameid]);

  useEffect(() => {
    let clearSelectedBetTimer;
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      clearSelectedBetTimer = window.setTimeout(
        () => setSelectedBet(null),
        0
      );
      if (gameid) {
        dispatch(getPendingBetAmo(gameid));
        dispatch(getPendingBet(gameid));
      }
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    return () => window.clearTimeout(clearSelectedBetTimer);
  }, [successMessage, errorMessage, dispatch, gameid]);

  const renderPlaceBet = (isMobile = false) => (
    <PlaceBet
      selectedBet={selectedBet}
      onBetChange={setSelectedBet}
      onClose={() => setSelectedBet(null)}
      isMobile={isMobile}
      team1={venue}
      team2='Horse Racing'
      item={null}
      gameId={gameid}
      eventName={venue}
      sid={10}
      marketName={selectedBet?.marketName}
      gameType={selectedBet?.gameType}
      gameName='Horse Racing'
      maxAmount={selectedBet?.maxAmount}
      minAmount={selectedBet?.minAmount}
    />
  );

  return (
    <div className='mt-0.5 flex min-w-0 gap-px'>
      <main className='ml-0 min-w-0 w-full md:ml-1 lg:w-[calc(100%-352px)]'>
        <div className='bg-secondary text-secondary flex items-center gap-2 p-2 text-sm font-bold'>
          <FaHorse aria-hidden='true' />
          <span>{venue}</span>
          {time && <span className='ml-auto'>{time}</span>}
        </div>

        <div className='bg-primary text-primary flex text-xs font-bold lg:hidden'>
          <button
            type='button'
            className={`w-1/2 border-r border-white p-2 ${
              showOdds ? 'border-t-2 border-t-white' : ''
            }`}
            onClick={() => setShowOdds(true)}
          >
            ODDS
          </button>
          <button
            type='button'
            className={`w-1/2 p-2 ${
              showOdds ? '' : 'border-t-2 border-t-white'
            }`}
            onClick={() => setShowOdds(false)}
          >
            MATCHED BET
          </button>
        </div>

        {showOdds ? (
          <HorseRacingMarkets
            key={gameid}
            bettingData={bettingData}
            loading={isBettingLoading}
            loaded={isBettingLoaded}
            error={bettingDataError}
            venue={venue}
            time={time}
            onBetSelect={setSelectedBet}
          />
        ) : (
          <div className='block lg:hidden'>
            <MatchedBet gameid={gameid} />
          </div>
        )}
      </main>

      <aside className='sticky top-0 hidden h-fit lg:block'>
        <div className='w-[350px]'>
          <div className='mb-1'>
            <div className='bg-secondary text-secondary flex items-center gap-2 p-1 font-bold'>
              <FaTv aria-hidden='true' />
              <span>Place Bet</span>
            </div>
            {renderPlaceBet()}
          </div>
          <div className='bg-secondary text-secondary p-1 font-bold'>
            My Bet
          </div>
          <MatchedBet gameid={gameid} pendingBetAmounts={pendingBetAmounts} />
        </div>
      </aside>

      {selectedBet && (
        <>
          <div
            className='bg-opacity-50 fixed inset-0 z-40 block bg-black/60 lg:hidden'
            onClick={() => setSelectedBet(null)}
          />
          <div className='fixed top-0 right-0 left-0 z-50 block max-h-screen overflow-y-auto bg-white shadow-lg lg:hidden'>
            {renderPlaceBet(true)}
          </div>
        </>
      )}
    </div>
  );
}

export default HourseRacingBet;
