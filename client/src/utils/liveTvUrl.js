const LIVE_TV_BASE_URL =
  import.meta.env.VITE_LIVE_TV_URL ||
  'https://e765432.diamondcricketid.com/dtv.php';

export const getLiveTvUrl = (id) => {
  if (!id) return '';
  return `${LIVE_TV_BASE_URL}?id=${id}`;
};
