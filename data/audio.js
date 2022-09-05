const audio = {
  Map: new Howl({
    src: './audio/map.wav',
    html: true,
    volume: 0.3,
    loop: true,
  }),
  initBattle: new Howl({
    src: './audio/initBattle.wav',
    html: true,
    volume: 0.05,
  }),
  battle: new Howl({
    src: './audio/battle.mp3',
    html: true,
    volume: 0.05,
  }),
  tackleHit: new Howl({
    src: './audio/tackleHit.wav',
    html: true,
    volume: 0.05,
  }),
  initFireball: new Howl({
    src: './audio/initFireball.wav',
    html: true,
    volume: 0.05,
  }),
  fireballHit: new Howl({
    src: './audio/fireballHit.wav',
    html: true,
    volume: 0.05,
  }),

  victory: new Howl({
    src: './audio/victory.wav',
    html: true,
    volume: 0.05,
  }),
};
