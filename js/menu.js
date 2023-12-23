import {play1v1, playAgainstAI, stopReset, setDifficulty} from "./app.js";

const splashes = ['Better than the original.', 'Now with 100% more bugs!', 'Now with 100% less bugs!', 'Enjoy the game!', 'Play with your friends!', 'Can you find the secret?', 'Will I get good grade?', 'Hope you like it!', 'Made with love.', 'Hopefully, I won\'t get sued.', 'Made with JavaScript.', 'Made with Three.js'];

window.onload = function () {
    //Mojang Screen
    document.querySelector('.loading-progress').style.width = '100%';
    setTimeout(function () {
        document.querySelector('.loading-bar').style.display = 'none';
        document.getElementById('startButton').style.display = 'block';
    }, 3000);
    document.getElementById('startButton').addEventListener('click', function () {
        const mojangScreen = document.getElementById('mojangScreen');
        mojangScreen.style.opacity = '0';
        setTimeout(function () {
            mojangScreen.style.display = 'none';
            document.getElementById('backgroundMusic').play();
        }, 1000);
    });

    //Menu
    const button = document.querySelectorAll('.btn-minecraft')
    button.forEach(btn => {
        btn.addEventListener('mouseleave', function () {
            btn.blur()
        })
        btn.addEventListener('click', function () {
            document.getElementById('buttonSound').play();
        })
    })

    const splash = document.getElementById('splash')
    splash.innerHTML = splashes[Math.floor(Math.random() * splashes.length)]
    setInterval(function () {
        splash.innerHTML = splashes[Math.floor(Math.random() * splashes.length)]
    }, 5000)


    document.getElementById('quit').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            window.close();
        }, 500);
    })

    document.getElementById('multi').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            startMultiplayer();
        }, 500);
    })

    document.getElementById('single').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            startSinglePlayer();
        }, 500);
    })

    document.getElementById('back').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            showMenu();
        }, 500);
    })

    document.getElementById('options').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            openOptions();
        }, 500);
    })

    document.getElementById('closeOptions').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            closeOptions();
        }, 500);
    })

    document.getElementById('easy').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            setDifficulty('easy');
        }, 500);
    })

    document.getElementById('medium').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            setDifficulty('medium');
        }, 500);
    })

    document.getElementById('hard').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            setDifficulty('hard');
        }, 500);
    })
}

const hideMenu = function () {
    document.querySelector('.menu-container').style.display = 'none';
    document.getElementById('backgroundMusic').pause();
    document.getElementById('back').style.display = 'block';
    document.getElementById('hitSound').volume = 0.4;
    document.getElementById('gameMusic').play();
    document.querySelector('.score-container').style.display = 'flex';
}

const showMenu = function () {
    stopReset();
    document.querySelector('.score-container').style.display = 'none';
    document.getElementById('gameMusic').pause();
    document.querySelector('.menu-container').style.display = 'flex';
    document.getElementById('backgroundMusic').play();
    document.getElementById('back').style.display = 'none';
}

const openOptions = function () {
    document.querySelector('.menu-options-container').style.display = 'flex';
    document.querySelector('.menu-buttons-container').style.display = 'none';
}

const closeOptions = function () {
    document.querySelector('.menu-options-container').style.display = 'none';
    document.querySelector('.menu-buttons-container').style.display = 'flex';
}


const startMultiplayer = function () {
    hideMenu();
    play1v1();
}

const startSinglePlayer = function () {
    hideMenu();
    playAgainstAI();
}
