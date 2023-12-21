import {init, animate} from "./app.js";

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

    document.getElementById('play').addEventListener('click', function () {
        document.getElementById('buttonSound').play();
        setTimeout(function () {
            hideMenu();
        }, 500);
    })
}

const hideMenu = function () {
    document.querySelector('.menu-container').style.display = 'none';
    document.getElementById('back').style.display = 'block';
    document.body.style.backgroundImage = 'none';

    init();
    animate();
}

const showMenu = function () {
    document.querySelector('.menu-container').style.display = 'block';
    document.getElementById('back').style.display = 'none';
    document.body.style.backgroundImage = "url('../assets/images/backgroundmenu.png')";
}

