const CRICKET_SCORECARD_BASE_URL =
  import.meta.env.VITE_CRICKET_SCORECARD_URL ||
  'https://score.diamondcricketid.com/';

const SPORT_SCORECARD_BASE_URL =
  import.meta.env.VITE_SPORT_SCORECARD_URL ||
  'https://e765432.diamondcricketid.com/anm.php';

export const getCricketScorecardUrl = (eventId) => {
  if (!eventId) return '';
  return `${CRICKET_SCORECARD_BASE_URL}?theme=new&eventid=${eventId}`;
};

export const getTennisScorecardUrl = (eventId) => {
  if (!eventId) return '';
  return `${SPORT_SCORECARD_BASE_URL}?type=scorecard&eventid=${eventId}&sportid=2`;
};

export const getFootballScorecardUrl = (eventId) => {
  if (!eventId) return '';
  return `${SPORT_SCORECARD_BASE_URL}?type=scorecard&eventid=${eventId}&sportid=1`;
};
