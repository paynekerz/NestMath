import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { HeroBg } from './HeroBg';
import { HeroBgLight } from './HeroBgLight';

const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HeroBg"
      component={HeroBg}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={900}
      defaultProps={{}}
    />
    <Composition
      id="HeroBgLight"
      component={HeroBgLight}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={900}
      defaultProps={{}}
    />
  </>
);

registerRoot(RemotionRoot);
