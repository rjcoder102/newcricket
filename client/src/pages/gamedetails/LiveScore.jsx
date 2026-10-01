import React from 'react';
import { getCricketScorecardUrl } from '../../utils/scorecardUrl';

function LiveScore({ gameid }) {
  return (
    <div>
      <iframe
        src={getCricketScorecardUrl(gameid)}
        allowFullScreen
        className='w-full rounded-lg'
        title='Live Score'
        allow='
          autoplay;
          encrypted-media;
          fullscreen;
          picture-in-picture;
          accelerometer;
          gyroscope
        '
      />
    </div>
  );
}

export default LiveScore;
