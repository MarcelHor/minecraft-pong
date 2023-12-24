import {onWindowResize, aiMovement, bounceBall} from './game.js';
import {
    createPaddle,
    createBall,
    createLight,
    createFloor,
    createFenceGroup,
    addFence,
    createStonePlatform,
    createSteve,
    createGoldBlock,
} from './prefabs.js';

let camera, scene, renderer, animateRequestId;
const clock = new THREE.Clock();
const mixers = [];

let paddle1, paddle2, ball, goldBlock;

let ballSpeedX = 0.02, ballSpeedY = 0.02;
const ballAcceleration = 1.05;

let paddleSpeed = 0.05;
let paddle1Direction = 0, paddle2Direction = 0;
let paddle1Speed = 0, paddle2Speed = 0;

let score1 = 0, score2 = 0;
const maxScore = 5;
let isPlayingAgainstAI = true;

let aiReactionDelay = 50;
let aiErrorMargin = 0.3;
let lastAiMoveTime = Date.now();

let enableGoldBlock = true;

const paddleBounds = {
    minX: -4, maxX: 4, minY: -1.5, maxY: 1.5
};

const ballBounds = {
    minX: -4, maxX: 4, minY: -1.8, maxY: 1.8
}

// window.onload = function () {
//     init();
//     animate();
// }

async function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -5, 5);
    camera.rotation.x = 0.8
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    paddle1 = createPaddle(-3.8, 0.25, 1.1);
    paddle2 = createPaddle(3.8, 0.25, 1.1);
    ball = createBall();
    const [ambientLight, light] = createLight();
    const floor = createFloor();
    const stonePlatform = createStonePlatform();

    const group1 = createFenceGroup();
    const group2 = createFenceGroup();
    const group3 = createFenceGroup();
    const group4 = createFenceGroup();

    const plotCount = 9;
    for (let i = 0; i < plotCount; i++) {
        await addFence(group1, i);
        await addFence(group2, i);
    }

    for (let i = 0; i < 4; i++) {
        await addFence(group3, i, true);
        await addFence(group4, i, true);
    }

    group1.position.set(-4, 2.5, 0);
    group2.position.set(-4, -2.5, 0);
    group3.position.set(-4.5, -1.5, 0);
    group4.position.set(4.5, -1.5, 0);

    await createSteve(scene, function (mixer) {
        mixers.push(mixer);
    });

    if (enableGoldBlock) {
        setInterval(function () {
            if (goldBlock) {
                return;
            }
            goldBlock = createGoldBlock();
            goldBlock.position.x = Math.random() * (ballBounds.maxX - ballBounds.minX) + ballBounds.minX;
            goldBlock.position.y = Math.random() * (ballBounds.maxY - ballBounds.minY) + ballBounds.minY;
            scene.add(goldBlock);
        }, 10000);
    } else {
        console.log('Gold block disabled');
    }

    scene.add(paddle1, paddle2, ball, light, ambientLight, floor, stonePlatform, group1, group2, group3, group4);


    //paddle input direction
    document.addEventListener('keydown', function (keyboardEvent) {
        if (keyboardEvent.code === 'KeyW') {
            paddle1Direction = 1;
        } else if (keyboardEvent.code === 'KeyS') {
            paddle1Direction = -1;
        } else if (keyboardEvent.code === 'ArrowUp' && !isPlayingAgainstAI) {
            paddle2Direction = 1;
        } else if (keyboardEvent.code === 'ArrowDown' && !isPlayingAgainstAI) {
            paddle2Direction = -1;
        }
    });

    //stop paddle movement when key is released
    document.addEventListener('keyup', function (keyboardEvent) {
        if ((keyboardEvent.code === 'KeyW' && paddle1Direction === 1) || (keyboardEvent.code === 'KeyS' && paddle1Direction === -1)) {
            paddle1Direction = 0;
        } else if ((keyboardEvent.code === 'ArrowUp' && paddle2Direction === 1) || (keyboardEvent.code === 'ArrowDown' && paddle2Direction === -1)) {
            paddle2Direction = 0;
        }
    });

    window.addEventListener('resize', function () {
        onWindowResize(camera, renderer);
    }, false);

    animate();
}

function animate() {
    animateRequestId = requestAnimationFrame(animate);
    //if end game, don't animate
    if (ballSpeedX === 0 && ballSpeedY === 0) {
        return;
    }

    //set paddle speed based on direction and limit their speed
    if (paddle1Direction !== 0) {
        paddle1Speed = Math.max(-paddleSpeed, Math.min(paddleSpeed, paddle1Speed + paddle1Direction * 0.1));
    } else {
        paddle1Speed *= 0.95;
        if (Math.abs(paddle1Speed) < 0.01) paddle1Speed = 0;
    }
    if (paddle2Direction !== 0) {
        paddle2Speed = Math.max(-paddleSpeed, Math.min(paddleSpeed, paddle2Speed + paddle2Direction * 0.1));
    } else {
        paddle2Speed *= 0.95;
        if (Math.abs(paddle2Speed) < 0.01) paddle2Speed = 0;
    }

    //move paddles and limit their movement
    paddle1.position.y += paddle1Speed
    paddle2.position.y += paddle2Speed
    paddle1.position.y = Math.max(paddleBounds.minY, Math.min(paddle1.position.y, paddleBounds.maxY));
    paddle2.position.y = Math.max(paddleBounds.minY, Math.min(paddle2.position.y, paddleBounds.maxY));

    //AI
    if (isPlayingAgainstAI && Date.now() - lastAiMoveTime > aiReactionDelay) {
        lastAiMoveTime = Date.now();
        const aiResult = aiMovement(paddle2, ball, isPlayingAgainstAI, aiReactionDelay, aiErrorMargin, paddleSpeed);
        paddle2Speed = aiResult.paddle2Speed;
    }


    //move ball
    ball.position.x += ballSpeedX;
    ball.position.y += ballSpeedY;

    const bounceResult = bounceBall(paddle1, paddle2, ball, ballSpeedX, ballSpeedY, ballAcceleration, paddle1Speed, paddle2Speed);
    ballSpeedX = bounceResult.ballSpeedX;
    ballSpeedY = bounceResult.ballSpeedY

    //limit ball movement
    if (ball.position.x < ballBounds.minX || ball.position.x > ballBounds.maxX) {
        ballSpeedX *= -1;
    }
    if (ball.position.y < ballBounds.minY || ball.position.y > ballBounds.maxY) {
        ballSpeedY *= -1;
    }

    //score
    if (ball.position.x < ballBounds.minX) {
        updateScore(2);
    } else if (ball.position.x > ballBounds.maxX) {
        updateScore(1);
    }

    const delta = clock.getDelta();
    for (let i = 0; i < mixers.length; i++) {
        mixers[i].update(delta);
    }

    if (goldBlock && enableGoldBlock) {
        goldBlock.rotation.z += 0.01;
        if (goldBlock.position.z > 1.1) {
            goldBlock.position.z -= 0.01;
        }
        //if collides with ball, remove gold block and activate random boost
        if (ball.position.distanceTo(goldBlock.position) < 0.5) {
            document.getElementById('exp').play();
            activateRandomBoost();
            console.log('gold block collected');
            scene.remove(goldBlock);
            goldBlock = null;
        }
    }

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.render(scene, camera);
}

function activateRandomBoost() {
    const boost = Math.floor(Math.random() * 3);
    if (boost === 0) {
        // Zvětšení pálky
        console.log('Zvětšení pálky');
        paddle1.scale.set(1, 2, 1);
        paddle2.scale.set(1, 2, 1);
        setTimeout(function () {
            paddle1.scale.set(1, 1, 1);
            paddle2.scale.set(1, 1, 1);
        }, 5000);
    } else if (boost === 1) {
        console.log('Zrychlení míčku');
        // Zrychlení míčku
        ballSpeedX *= 1.5;
        ballSpeedY *= 1.5;
        setTimeout(function () {
            ballSpeedX /= 1.5;
            ballSpeedY /= 1.5;
        }, 5000);
    } else if (boost === 2) {
        // Zpomalení pálky
        console.log('Zpomalení pálky');
        paddleSpeed /= 3;
        setTimeout(function () {
            paddleSpeed *= 3;
        }, 5000);
    }
}

function updateScore(player) {
    if (player === 1) {
        score1++;
    } else {
        score2++;
    }

    document.getElementById('score1').textContent = score1.toString();
    document.getElementById('score2').textContent = score2.toString();

    if (score1 === maxScore || score2 === maxScore) {
        endGame();
    } else {
        document.getElementById('scoreSound').play();
        reset();
    }
}

function endGame() {
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('gameMusic').pause();
    document.getElementById('gameOverSound').play();

    ballSpeedX = 0;
    ballSpeedY = 0;

    setTimeout(function () {
        document.getElementById('game-over').style.display = 'none';
        score1 = 0;
        score2 = 0;
        document.getElementById('score1').textContent = score1.toString();
        document.getElementById('score2').textContent = score2.toString();
        document.getElementById('gameMusic').play();
        reset();
    }, 6000);
}

function reset() {
    ball.position.set(0, 0, 1.1);
    ballSpeedX = Math.random() > 0.5 ? 0.02 : -0.02;
    ballSpeedY = Math.random() > 0.5 ? 0.02 : -0.02;

    paddle1.position.set(-3.8, 0.25, 1.1);
    paddle2.position.set(3.8, 0.25, 1.1);

    if (goldBlock) {
        scene.remove(goldBlock);
        goldBlock = null;
    }
}

export async function play1v1() {
    isPlayingAgainstAI = false;
    await init();
}

export async function playAgainstAI() {
    isPlayingAgainstAI = true;
    await init();
}

export function stopReset() {
    reset();
    score1 = 0;
    score2 = 0;
    document.getElementById('score1').textContent = score1.toString();
    document.getElementById('score2').textContent = score2.toString();
    if (animateRequestId) {
        cancelAnimationFrame(animateRequestId);
    }
    if (renderer) {
        renderer.domElement.remove();
        renderer.dispose();
    }
}

export function setDifficulty(difficulty) {
    if (difficulty === 'easy') {
        aiReactionDelay = 100;
        aiErrorMargin = 0.5;
    } else if (difficulty === 'medium') {
        aiReactionDelay = 50;
        aiErrorMargin = 0.3;
    } else if (difficulty === 'hard') {
        aiReactionDelay = 10;
        aiErrorMargin = 0.1;
    } else {
        console.error('Invalid difficulty');
    }
}

export function setGoldBlockEnabled(value) {
    enableGoldBlock = value;
}