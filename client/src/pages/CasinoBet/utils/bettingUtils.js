import { QUICK_AMOUNTS } from '../constants';

/**
 * Format number to K format (e.g., 1000 -> 1k)
 */
export const formatToK = (num) => {
  if (!num || num < 1000) return num;
  const n = Number(num);
  return `${n / 1000}k`;
};

/**
 * Get bet details for a specific team from pending bet amounts
 */
export const getBetDetails = (pendingBetAmounts, teamName, sid) => {
  if (!pendingBetAmounts || !Array.isArray(pendingBetAmounts)) {
    return null;
  }
  // Find the bet that matches the current team
  const matchedBet = pendingBetAmounts.find(
    (bet) =>
      bet.teamName?.toLowerCase() === teamName?.toLowerCase() || bet.sid === sid
  );
  return matchedBet || null;
};

/**
 * Calculate potential profit for a bet
 */
export const calculatePotentialProfit = (amount, odds) => {
  if (!amount || !odds) return 0;
  return amount * (odds - 1);
};

/**
 * Calculate potential loss for a bet
 */
export const calculatePotentialLoss = (amount) => {
  return amount || 0;
};

/**
 * Check if a bet has guaranteed profit
 */
export const hasGuaranteedProfit = (pendingBetAmounts) => {
  if (!pendingBetAmounts?.length) return false;
  return pendingBetAmounts.some((bet) => bet.totalPrice < 0);
};

/**
 * Get guaranteed profit bet details
 */
export const getGuaranteedProfitBet = (pendingBetAmounts) => {
  if (!pendingBetAmounts?.length) return null;
  return pendingBetAmounts.find((bet) => bet.totalPrice < 0) || null;
};

/**
 * Calculate display values for P/L based on bet type and state
 */
export const calculatePLDisplay = ({
  hasPendingBet,
  isSelected,
  betDetails,
  pendingBetAmounts,
  isCurrentlySelected,
  betControl,
  amount,
  betOdds,
  subTypeMatch,
}) => {
  // Guaranteed profit for selected team
  if (hasPendingBet && isSelected && betDetails?.totalPrice < 0) {
    const value =
      betDetails?.otype === 'lay'
        ? Math.abs(betDetails?.totalPrice || 0)
        : Math.abs(betDetails?.totalBetAmount || 0);
    return { type: 'profit', value: value.toFixed(2) };
  }

  // Guaranteed profit for non-selected team
  if (
    !hasPendingBet &&
    pendingBetAmounts?.length > 0 &&
    pendingBetAmounts.some((bet) => bet.totalPrice < 0)
  ) {
    const guaranteedBet = pendingBetAmounts.find((bet) => bet.totalPrice < 0);
    if (guaranteedBet) {
      const value =
        guaranteedBet?.otype === 'lay'
          ? Math.abs(guaranteedBet?.totalBetAmount || 0)
          : Math.abs(guaranteedBet?.totalPrice || 0);
      return { type: 'profit', value: value.toFixed(2) };
    }
  }

  // Regular pending bet display
  if (hasPendingBet && isSelected && !(betDetails?.totalPrice < 0)) {
    const currentPL = betDetails?.totalBetAmount || 0;
    return {
      type: currentPL > 0 ? 'profit' : 'loss',
      value: Math.abs(currentPL).toFixed(2),
    };
  }

  // Non-selected team with subtype match
  if (
    !hasPendingBet &&
    subTypeMatch &&
    !(pendingBetAmounts?.[0]?.totalPrice < 0)
  ) {
    const currentPL = pendingBetAmounts?.[0]?.totalPrice || 0;
    if (currentPL) {
      return { type: 'loss', value: Math.abs(currentPL).toFixed(2) };
    }
  }

  // Currently placing a bet - show potential P/L
  if (isCurrentlySelected && betControl && amount > 0) {
    const potentialPL = calculatePotentialProfit(amount, betOdds);
    if (potentialPL > 0) {
      const isLay = betControl?.type === 'lay';
      return {
        type: isLay ? 'loss' : 'profit',
        value: Math.abs(potentialPL).toFixed(2),
      };
    }
  }

  // Non-selected but in same subtype
  if (!isCurrentlySelected && subTypeMatch && betControl && amount > 0) {
    const isLay = betControl?.type === 'lay';
    return {
      type: isLay ? 'profit' : 'loss',
      value: Math.abs(amount).toFixed(2),
    };
  }

  return null;
};

/**
 * Group betting data by subtype or nat
 */
export const groupBettingData = (sub, gameid) => {
  if (!Array.isArray(sub)) return {};
  const filteredSub =
    gameid === 'dt20'
      ? sub.filter((item) => [1, 2, 3].includes(item.sid))
      : sub;
  return filteredSub.reduce((acc, item) => {
    const key = ['poker20'].includes(gameid) ? item.nat : item.subtype;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

/**
 * Filter players for two-player games
 */
export const filterPlayersForTwoPlayerGames = (
  groupedData,
  gameid,
  bettingDataSub,
  twoPlayerGames
) => {
  if (!twoPlayerGames.includes(gameid)) {
    return groupedData;
  }

  if (bettingDataSub) {
    // For teenmuf, only take the first 2 players from the raw data
    const filteredSub = bettingDataSub.slice(0, 2);
    // Re-group the filtered data
    const filteredData = {};
    filteredSub.forEach((item) => {
      const key = item.subtype;
      if (!filteredData[key]) filteredData[key] = [];
      filteredData[key].push(item);
    });
    return filteredData;
  }

  const filteredData = {};
  Object.entries(groupedData).forEach(([key, players]) => {
    if (Array.isArray(players)) {
      filteredData[key] = players.slice(0, 2);
    }
  });

  return filteredData;
};

/**
 * Check if betting data has lay options
 */
export const hasLayOption = (sub) => {
  return (
    Array.isArray(sub) && sub.some((p) => p.l !== undefined && p.l !== null)
  );
};

/**
 * Quick stake buttons: the user's saved casino stakes, falling back to defaults
 */
export const getCasinoQuickAmounts = (userInfo) => {
  const saved = userInfo?.casinoQuickStakes;
  if (!saved?.length) return QUICK_AMOUNTS;
  return QUICK_AMOUNTS.map((def, i) => {
    const item = saved[i];
    if (!item) return def;
    if (typeof item === 'object' && item.label && item.value) {
      return { amt: item.value, label: item.label, img: def.img };
    }
    if (typeof item === 'number' && item > 0) {
      return { amt: item, label: def.label, img: def.img };
    }
    return def;
  });
};

/**
 * Translate the selected option into the arguments placeBet expects
 */
export const getBetPlacement = (betControl, betOdds) => {
  let teamName = betControl?.nat;
  let subtype = '';

  if (betControl?.subtype === 'poker20') {
    const suffix = betControl?.sid >= 11 && betControl?.sid <= 19 ? 'A' : 'B';
    teamName = suffix === 'A' ? 'Player A' : 'Player B';
    subtype = `${betControl?.nat} ${suffix}`;
  }

  return {
    betType: betControl?.type,
    teamName,
    subtype,
    maxAmount: betControl?.max || 100000,
    oddsValue: betControl?.odds || betOdds,
  };
};

/**
 * Compact range label, e.g. 200000 -> "2L"
 */
export const formatStakeLimit = (num) => {
  const n = Number(num);
  if (!n) return '0';
  if (n >= 10000000) return `${+(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `${+(n / 100000).toFixed(2)}L`;
  return String(n);
};
