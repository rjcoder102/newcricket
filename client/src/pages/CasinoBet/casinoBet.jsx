import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

// Redux actions
import {
  fetchCasinoBatingData,
  clearCasinoBettingData,
  clearCasinoResultData,
} from '../../redux/reducer/casinoSlice';
import {
  getBetHistory,
  getPendingBet,
  getPendingBetAmo,
  clearPendingBetAmounts,
} from '../../redux/reducer/betReducer';
import { getUser } from '../../redux/reducer/authReducer';

// Components
import VideoStream from './components/VideoStream';
import RecentResults from './components/RecentResults';
import ResultPopup from './components/CasinoResult1';
import Spinner2 from './components/Spinner2';
import CasinoPlaceBet from './components/CasinoPlaceBet';
import MatchedBet from '../gamedetails/MatchedBet';

// Hooks
import useBetting from './hooks/useBetting';
import useCasinoResults from './hooks/useCasinoResults';
import useCasinoWebSocket from './hooks/useCasinoWebSocket';

// Utils & Constants
import { renderGameUI } from './utils/gameRendererFactory';
import {
  groupBettingData,
  filterPlayersForTwoPlayerGames,
} from './utils/bettingUtils';
import { TWO_PLAYER_GAMES, getWinnerMap } from './constants';

export default function CasinoBet() {
  const dispatch = useDispatch();
  const { gameid, match } = useParams() || {};

  // Local state
  const [bettingData, setBettingData] = useState(null);
  // Desktop shows the bet slip + My Bet in a side column, mobile shows them inline
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  );
  // const [videoPageLoader, setVideoPageLoader] = useState(true);

  // Refs
  const previousMidRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Redux selectors
  const { battingData, loader, error } = useSelector((state) => state.casino);
  const { userInfo } = useSelector((state) => state.auth);

  // Custom hooks
  const betting = useBetting({ gameid, bettingData });
  const results = useCasinoResults({ gameid });

  // WebSocket connection
  const { isConnected } = useCasinoWebSocket({
    gameid,
    userId: userInfo?._id,
    bettingDataMid: bettingData?.mid,
    onBettingDataUpdate: setBettingData,
  });

  // Winner map for result display
  const winnerMap = getWinnerMap(gameid);

  // ============== EFFECTS ==============

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => setIsDesktop(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Fetch betting data when game changes
  useEffect(() => {
    if (gameid) {
      dispatch(clearCasinoResultData());
      dispatch(clearCasinoBettingData());
      dispatch(clearPendingBetAmounts());
      dispatch(fetchCasinoBatingData(gameid));
      dispatch(getPendingBet());
      // Pending amounts will be fetched with roundId when bettingData loads
    }
  }, [gameid, dispatch]);

  // Sync betting data from Redux
  useEffect(() => {
    setBettingData(battingData?.data);
  }, [battingData]);

  // Reset betting state when game becomes suspended
  useEffect(() => {
    if (!betting.betControl?.sid || !bettingData?.sub) return;
    const selectedSub = bettingData.sub.find(
      (s) => s.sid === betting.betControl.sid
    );
    if (selectedSub?.gstatus === 'SUSPENDED') {
      betting.resetBettingState();
    }
  }, [bettingData?.sub, betting.betControl?.sid, betting.resetBettingState]);

  // Handle round: fetch pending bets with roundId, clear on round change
  useEffect(() => {
    if (!bettingData?.mid || !gameid) return;

    const currentMid = bettingData.mid;
    const previousMid = previousMidRef.current;

    if (hasInitializedRef.current && previousMid !== currentMid) {
      // Round changed - clear Redux and refetch for current round only
      console.log('🔄 Round changed, clearing pending bets');
      betting.resetAllBettingState();
      dispatch(clearPendingBetAmounts());

      setTimeout(() => {
        dispatch(getUser());
        dispatch(getPendingBetAmo({ gameId: gameid, roundId: currentMid }));
        dispatch(
          getBetHistory({
            gameid,
            page: 1,
            limit: 10,
            selectedVoid: 'unsettel',
          })
        );
      }, 100);
    } else if (!hasInitializedRef.current) {
      // First load - fetch pending bets for current round
      dispatch(getPendingBetAmo({ gameId: gameid, roundId: currentMid }));
    }

    previousMidRef.current = currentMid;
    hasInitializedRef.current = true;
  }, [bettingData?.mid, gameid, dispatch, betting.resetAllBettingState]);

  // Fetch user data when game changes
  useEffect(() => {
    if (gameid) {
      dispatch(getUser());
    }
  }, [gameid, dispatch]);

  // Fallback polling when WebSocket disconnected
  useEffect(() => {
    if (!gameid || isConnected) return;

    const pollInterval = setInterval(() => {
      dispatch(fetchCasinoBatingData(gameid));
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [gameid, dispatch, isConnected]);

  // ============== DATA PROCESSING ==============

  // Group and filter betting data
  const groupedData = groupBettingData(bettingData?.sub, gameid);
  const displayData = filterPlayersForTwoPlayerGames(
    groupedData,
    gameid,
    bettingData?.sub,
    TWO_PLAYER_GAMES
  );
  const selectedSub = bettingData?.sub?.find(
    (s) => s.sid === betting.betControl?.sid
  );

  // ============== RENDER ==============

  return (
    <>
      {/* Page Loader */}
      {/* {videoPageLoader && (
        <div className='fixed inset-0 z-50 w-full bg-black'>
          <img
            src='/loader.gif'
            alt='Loading'
            onLoad={() => setVideoPageLoader(false)}
            className='fixed inset-0 z-50 w-full bg-black'
            style={{ display: videoPageLoader ? 'none' : 'block' }}
          />
        </div>
      )} */}

      {/* Bet Placement Loader */}
      {betting.loader && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <Spinner2 />
        </div>
      )}

      <div className='mt-0.5 flex gap-px'>
        {/* Left: table, odds, results */}
        <div className='ml-0 w-full min-w-0 md:ml-1 lg:w-[calc(100%-352px)]'>
          <div className='bg-secondary text-secondary flex items-center justify-between gap-2 p-1 text-[12px] font-bold lg:text-[15px]'>
            <span className='truncate uppercase'>{match || gameid}</span>
            {bettingData?.mid && <span>Round ID: {bettingData.mid}</span>}
          </div>

          {/* Video Stream with Cards and Timer */}
          <VideoStream
            gameid={gameid}
            bettingData={bettingData}
            showWinner={results.showWinner}
            winnerLabel={winnerMap[results.resultData?.res?.[0]?.win]}
          />

          {!bettingData && !loader.betting && error.betting && (
            <div className='bg-white p-6 text-center text-[14px] font-semibold text-[#b3001b]'>
              {error.betting}
            </div>
          )}

          {/* Game-Specific Betting UI */}
          <div>
            {bettingData?.sub &&
              renderGameUI({
                gameid,
                displayData,
                bettingData,
                resultData: results.resultData,
                betControl: betting.betControl,
                setBetControl: betting.setBetControl,
                setValue: betting.setValue,
                setSelectedTeamSubtype: betting.setSelectedTeamSubtype,
                betAmount: betting.betAmount,
                betOdds: betting.betOdds,
                setBetOdds: betting.setBetOdds,
                updateAmount: betting.updateAmount,
                placeBet: betting.placeBet,
                loading: betting.loading,
                pendingBetAmounts: betting.pendingBetAmounts,
                selectedTeamSubtype: betting.selectedTeamSubtype,
                resetBettingState: betting.resetBettingState,
                hasPendingBetForControl: betting.hasPendingBetForControl,
              })}
          </div>

          {bettingData?.remark && (
            <div className='bg-white px-2 py-1 text-[12px] font-semibold text-[#097c93]'>
              {bettingData.remark}
            </div>
          )}

          {/* My Bet - mobile (desktop has it in the right column) */}
          {!isDesktop && (
            <div>
              <div className='bg-secondary text-secondary p-1'>
                <span className='font-bold'>My Bet</span>
              </div>
              <MatchedBet gameid={gameid} />
            </div>
          )}

          {/* Recent Results */}
          <RecentResults
            gameid={gameid}
            currentGameId={results.currentGameId}
            results={results.resultData?.res}
            onItemClick={results.setSelectedItem}
          />
        </div>

        {/* Right: bet slip + my bets (desktop) */}
        {isDesktop && (
          <div className='sticky top-0 h-fit'>
            <div className='w-[350px]'>
              <CasinoPlaceBet
                betControl={betting.betControl}
                betOdds={betting.betOdds}
                betAmount={betting.betAmount}
                updateAmount={betting.updateAmount}
                loading={betting.loading || betting.loader}
                suspended={selectedSub?.gstatus === 'SUSPENDED'}
                onClose={betting.resetBettingState}
                onPlaceBet={betting.placeBet}
              />
              <div className='bg-secondary text-secondary p-1'>
                <span className='font-bold'>My Bet</span>
              </div>
              <MatchedBet gameid={gameid} />
            </div>
          </div>
        )}
      </div>

      {/* Result Detail Popup */}
      {results.selectedItem && (
        <ResultPopup
          mid={bettingData?.mid}
          gameId={gameid}
          item={results.selectedItem}
          onClose={() => results.setSelectedItem(null)}
          showSideBets={true}
        />
      )}
    </>
  );
}
