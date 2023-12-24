import {play1v1, playAgainstAI, stopReset, setDifficulty} from "./app.js";
import {setGoldBlockEnabled} from "./app.js";

const splashes = ['Better than the original.', 'Now with 100% more bugs!', 'Now with 100% less bugs!', 'Enjoy the game!', 'Play with your friends!', 'Can you find the secret?', 'Will I get good grade?', 'Hope you like it!', 'Made with love.', 'Hopefully, I won\'t get sued.', 'Made with JavaScript.', 'Made with Three.js'];

const easy = document.getElementById('easy');
const medium = document.getElementById('medium');
const hard = document.getElementById('hard');

const quit = document.getElementById('quit');
const multi = document.getElementById('multi');
const single = document.getElementById('single');
const options = document.getElementById('options');

const closeOptionsButton = document.getElementById('closeOptions');
const back = document.getElementById('back');
const mojangScreen = document.getElementById('mojangScreen');
const loadingProgress = document.querySelector('.loading-progress');
const loadingBar = document.querySelector('.loading-bar');
const buttons = document.querySelectorAll('.btn-minecraft')
const startButton = document.getElementById('startButton');
const splash = document.getElementById('splash')
const menuContainer = document.querySelector('.menu-container');
const scoreContainer = document.querySelector('.score-container');
const menuOptionsContainer = document.querySelector('.menu-options-container');
const menuButtonsContainer = document.querySelector('.menu-buttons-container');
const loading = document.getElementById('loading');

const hitSound = document.getElementById('hitSound');
const gameMusic = document.getElementById('gameMusic');
const buttonSound = document.getElementById('buttonSound');
const backgroundMusic = document.getElementById('backgroundMusic');
const goldBlockOption = document.getElementById('goldBlockOption');

window.onload = function () {
    //Mojang Screen
    loadingProgress.style.width = '100%';
    setTimeout(function () {
        loadingBar.style.display = 'none';
        startButton.style.display = 'block';
    }, 3000);
    startButton.addEventListener('click', function () {
        mojangScreen.style.opacity = '0';
        setTimeout(function () {
            mojangScreen.style.display = 'none';
            backgroundMusic.play();
        }, 1000);
    });

    //Menu
    buttons.forEach(btn => {
        btn.addEventListener('mouseleave', function () {
            btn.blur()
        })
        btn.addEventListener('click', function () {
            buttonSound.play();
        })
    })

    splash.innerHTML = splashes[Math.floor(Math.random() * splashes.length)]
    setInterval(function () {
        splash.innerHTML = splashes[Math.floor(Math.random() * splashes.length)]
    }, 5000)


    quit.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            window.close();
        });
    })

    multi.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            startMultiplayer().then(r => console.log("Starting multiplayer"));
        });
    })

    single.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            startSinglePlayer().then(r => console.log("Starting single player"));
        });
    })

    back.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            showMenu();
        });
    })

    //Options

    options.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            openOptions();
        });
    })

    closeOptionsButton.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            closeOptions();
        });
    })

    easy.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            handleSetDifficulty(easy, 'easy');
        });
    })

    medium.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            handleSetDifficulty(medium, 'medium');
        });
    })


    hard.addEventListener('click', function () {
        buttonClick(buttonSound, function () {
            handleSetDifficulty(hard, 'hard');
        });
    })

    goldBlockOption.addEventListener('change', function () {
        setGoldBlockEnabled(goldBlockOption.checked);
    });
    goldBlockOption.checked = false;


    handleSetDifficulty(medium, 'medium');
}

const hideMenu = function () {
    menuContainer.style.display = 'none';
    backgroundMusic.currentTime = 0;
    backgroundMusic.pause();
    back.style.display = 'block';
    hitSound.volume = 0.4;
    gameMusic.currentTime = 0;
    gameMusic.play();
    scoreContainer.style.display = 'flex';
}

const showMenu = function () {
    stopReset();
    scoreContainer.style.display = 'none';
    gameMusic.currentTime = 0;
    gameMusic.pause();
    menuContainer.style.display = 'flex';
    gameMusic.currentTime = 0;
    backgroundMusic.play();
    back.style.display = 'none';
}

const openOptions = function () {
    menuOptionsContainer.style.display = 'flex';
    menuButtonsContainer.style.display = 'none';
}

const closeOptions = function () {
    menuOptionsContainer.style.display = 'none';
    menuButtonsContainer.style.display = 'flex';
}

const handleSetDifficulty = function (element, difficulty) {
    easy.style.background = '#727272';
    medium.style.background = '#727272';
    hard.style.background = '#727272';
    element.style.background = '#4d4d4d';

    setDifficulty(difficulty);
}

const startMultiplayer = async function () {
    hideMenu();
    loading.style.display = 'flex';
    await play1v1();
    loading.style.display = 'none';
}

const startSinglePlayer = async function () {
    hideMenu();
    loading.style.display = 'flex';
    await playAgainstAI();
    loading.style.display = 'none';
}

const buttonClick = function (sound, callback) {
    if (sound) {
        sound.play();

        sound.onended = function () {
            sound.onended = null;
            if (callback) {
                callback();
            }
        }
    } else {
        if (callback) {
            callback();
        }
    }
}
