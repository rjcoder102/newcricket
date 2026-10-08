const LIVE_TV_BASE_URL =
  import.meta.env.VITE_LIVE_TV_URL ||
  // 'https://e765432.diamondcricketid.com/dtv.php';
  "https://tv.nautical7.com/stream";

export const getLiveTvUrl = (etid, id) => {
  if (!id) return '';
  return `${LIVE_TV_BASE_URL}/${etid}_${id}?key=tvk_Nlz_0My2Hc2SXS3sqZPNqJTOrt-qyiWy`;
};
