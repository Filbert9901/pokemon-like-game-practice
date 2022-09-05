// getting canvas from index.html and context
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// setting the size of the canvas
canvas.width = 1024;
canvas.height = 576;

// divide they collision array into 40 rows with 70 columns each
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i));
}

// divide they battleZones array into 40 rows with 70 columns each
const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

const offset = {
  x: -735,
  y: -650,
};

const boundaries = [];
// fill the boundaries array with the position of the collision
collisionsMap.forEach((row, i) => {
  row.forEach((column, j) => {
    if (column == 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

const battleZones = [];
// fill the battleZones array with the position of the battle zones
battleZonesMap.forEach((row, i) => {
  row.forEach((column, j) => {
    if (column == 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

// image.onload = () => {
//   c.drawImage(image, -735, -600);

//   // supaya tidak ditimpa map game. playerImage ditulis setelah image. Karena ukuran playerImage lebih kecil
//   c.drawImage(
//     playerImage,

//     //crop coordinates
//     0,
//     0,
//     playerImage.width / 4,
//     playerImage.height,

//     //image size
//     canvas.width / 2 - playerImage.width / 4 / 2,
//     canvas.height / 2 - playerImage.height / 2,

//     //cropped image size
//     playerImage.width / 4,
//     playerImage.height
//   );
// };

// initialize the player
const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2,
  },
  image: playerDown,
  frames: { max: 4, hold: 10 },
  sprites: {
    up: playerUpImage,
    left: playerLeft,
    right: playerRight,
    down: playerDown,
  },
});

// initialize the background or the map
const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image,
});

// initialize the background or the map
const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
});

// object of keys that can be pressed to walk around (default is false)
const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  b: {
    pressed: false,
  },
};

const movables = [background, ...boundaries, foreground, ...battleZones];

function rectangularCollision({ rectangel1, rectangel2 }) {
  return (
    rectangel1.position.x + rectangel1.width >= rectangel2.position.x &&
    rectangel1.position.x <= rectangel2.position.x + rectangel2.width &&
    rectangel1.position.y <= rectangel2.position.y + rectangel2.height &&
    rectangel1.position.y + rectangel1.height >= rectangel2.position.y
  );
}

function animate() {
  // loop the function forever
  const animationID = window.requestAnimationFrame(animate);

  // draw the background
  background.draw();

  // draw the red box boundaries
  boundaries.forEach((boundary) => {
    boundary.draw();
  });

  // draw the battle zones
  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });

  // draw the player
  player.draw();

  // draw the foreground
  foreground.draw();

  let moving = true;
  player.animate = false;

  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    // activate a battle
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlappingArea =
        (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
          Math.max(player.position.y, battleZone.position.y));

      // check battle zone collisions
      if (
        rectangularCollision({ rectangel1: player, rectangel2: battleZone }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.05
      ) {
        //deactivate current animation loop
        window.cancelAnimationFrame(animationID);
        audio.Map.stop();
        audio.initBattle.play();
        audio.battle.play();
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                //activae a new animation loop
                initBattle();
                animateBattle();
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4,
                });
              },
            });
          },
        });
        break;
      }
    }
  }

  // stops player from running
  if (!keys.b.pressed) player.frames.hold = 10;

  // enables player to run
  let speed = 3;
  if (keys.b.pressed) {
    player.frames.hold = 3;
    speed = 6;
  }
  // move the background and collision based on the key pressed
  if (keys.w.pressed) {
    player.animate = true;
    player.image = player.sprites.up;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      // check collisions
      if (
        rectangularCollision({
          rectangel1: player,
          rectangel2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + speed,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) movables.forEach((moveable) => (moveable.position.y += speed));
  } else if (keys.a.pressed) {
    player.animate = true;
    player.image = player.sprites.left;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      // check collisions
      if (
        rectangularCollision({
          rectangel1: player,
          rectangel2: {
            ...boundary,
            position: {
              x: boundary.position.x + speed,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) movables.forEach((moveable) => (moveable.position.x += speed));
  } else if (keys.s.pressed) {
    player.animate = true;
    player.image = player.sprites.down;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      // check collisions
      if (
        rectangularCollision({
          rectangel1: player,
          rectangel2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - speed,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) movables.forEach((moveable) => (moveable.position.y -= speed));
  } else if (keys.d.pressed) {
    player.animate = true;
    player.image = player.sprites.right;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      // check collisions
      if (
        rectangularCollision({
          rectangel1: player,
          rectangel2: {
            ...boundary,
            position: {
              x: boundary.position.x - speed,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) movables.forEach((moveable) => (moveable.position.x -= speed));
  }
}

let lastKey = '';
// code to respond when a key is pressed
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = true;
      lastKey = 'w';
      break;
    case 'a':
      keys.a.pressed = true;
      lastKey = 'a';
      break;
    case 's':
      keys.s.pressed = true;
      lastKey = 's';
      break;
    case 'd':
      keys.d.pressed = true;
      lastKey = 'd';
      break;
    case 'b':
      keys.b.pressed = true;
      lastKey = 'b';
      break;
  }
});

// code to respond when a key is unpressed
window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
    case 's':
      keys.s.pressed = false;
      break;
    case 'd':
      keys.d.pressed = false;
      break;
    case 'b':
      keys.b.pressed = false;
      break;
  }
});

let clicked = false;
window.addEventListener('load', (event) => {
  if (!clicked) audio.Map.play();
  clicked = true;
});
