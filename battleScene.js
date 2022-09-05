// initialize the battle background
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
});

// initialize enemy draggle
let draggle = new Monster(monsters.Draggle);

// initialize ally emby
let emby = new Monster(monsters.Emby);

let renderedSprites;
let battleAnimationID;
let queue = [];

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';
  document.querySelector('#enemyHealthBar').style.width = '100%';
  document.querySelector('#playerHealthBar').style.width = '100%';
  document.querySelector('#attacksBox').replaceChildren();

  draggle = new Monster(monsters.Draggle);
  emby = new Monster(monsters.Emby);
  renderedSprites = [draggle, emby];
  queue = [];

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    document.querySelector('#attacksBox').append(button);
  });

  // event listener for buttons
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      emby.attack({ attack: selectedAttack, recipient: draggle, renderedSprites });

      // check if draggle faints
      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });
        queue.push(() => {
          // fade to black
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              window.cancelAnimationFrame(battleAnimationID);
              animate();
              document.querySelector('#userInterface').style.display = 'none';
              gsap.to('#overlappingDiv', {
                opacity: 0,
              });
              audio.victory.stop();
              audio.Map.play();
            },
          });
        });
      }

      // draggle or enemy attacks here
      const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];
      queue.push(() => {
        draggle.attack({ attack: randomAttack, recipient: emby, renderedSprites });
        // check if emby or ally faints
        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          });
          queue.push(() => {
            // fade to black
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                window.cancelAnimationFrame(battleAnimationID);
                animate();
                document.querySelector('#userInterface').style.display = 'none';
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                });
                audio.Map.play();
              },
            });
          });
        }
      });
    });

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector('#attackType').innerHTML = selectedAttack.type;
      document.querySelector('#attackType').style.color = selectedAttack.color;
    });

    button.addEventListener('mouseleave', (e) => {
      document.querySelector('#attackType').innerHTML = 'Attack Type';
    });
  });
}

function animateBattle() {
  battleAnimationID = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();
  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}
animate();
// initBattle();
// animateBattle();

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = 'none';
    document.querySelector('#clickToContinue').style.display = 'none';
  }
});
