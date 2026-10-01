import React from 'react';
import { getLiveTvUrl } from '../../utils/liveTvUrl';

function LiveTv({ gameid }) {
  return (
    <div>
      <iframe
        src={getLiveTvUrl(gameid)}
        title='Watch Live'
        className='w-full rounded-lg'
        style={{ height: '50vh' }}
        allowFullScreen
        loading='lazy'
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

export default LiveTv;
