const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('../assets/textures/grass.jpg');
const stoneTexture = textureLoader.load('../assets/textures/stone.png');
const plankTexture = textureLoader.load('../assets/textures/plank.png');
const iceTexture = textureLoader.load('../assets/textures/ice_block.png');
const woolTexture = textureLoader.load('../assets/textures/wool.png');

const loader = new THREE.GLTFLoader();
[grassTexture, stoneTexture, plankTexture, iceTexture, woolTexture].forEach(texture => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
});
grassTexture.repeat.set(100, 100);

const floorMaterial = new THREE.MeshStandardMaterial({map: grassTexture});
const stoneMaterial = new THREE.MeshStandardMaterial({map: stoneTexture});
const paddleMaterial = new THREE.MeshStandardMaterial({map: plankTexture});
const iceMaterial = new THREE.MeshStandardMaterial({map: iceTexture});
const woolMaterial = new THREE.MeshStandardMaterial({map: woolTexture});

let camera, scene, renderer;
let paddle1, paddle2, ball;
let ballSpeedX = 0.02, ballSpeedY = 0.02;
const ballAcceleration = 1.05;

const paddleSpeed = 0.05;
let paddle1Direction = 0, paddle2Direction = 0;
let paddle1Speed = 0, paddle2Speed = 0;

let score1 = 0, score2 = 0;
const maxScore = 5;

let isPlayingAgainstAI = true;


window.onload = function () {
    init();
    animate();
}

export function play1v1() {
    isPlayingAgainstAI = false;
    init();
    animate();
}

export function playAgainstAI() {
    isPlayingAgainstAI = true;
    init();
    animate();
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
        reset();
    }, 6000);

}


function reset() {
    ball.position.set(0, 0, 1.1);
    ballSpeedX = Math.random() > 0.5 ? 0.02 : -0.02;
    ballSpeedY = Math.random() > 0.5 ? 0.02 : -0.02;

    paddle1.position.set(-3.8, 0.25, 1.1);
    paddle2.position.set(3.8, 0.25, 1.1);
}


function createPaddle(x, y, z) {
    const paddleGeometry = new THREE.BoxGeometry(0.4, 1, 0.3);
    const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle.position.set(x, y, z);
    paddle.castShadow = true;
    return paddle;
}

function createBall() {
    const ballGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const ball = new THREE.Mesh(ballGeometry, woolMaterial);
    ball.castShadow = true;
    ball.position.set(0, 0, 1.1);
    return ball;
}

function createLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const light = new THREE.PointLight(0xffffff, 0.5);
    light.castShadow = true;
    light.position.set(-4, -4, 4);
    return [ambientLight, light];
}

function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    return floor;
}

function createFenceGroup() {
    var group = new THREE.Group();
    scene.add(group);
    return group;
}

function addFence(group, index, vertical = false) {
    loader.load('../assets/models/minecraft_fence/scene.gltf', function (gltf) {
        var plot = gltf.scene;
        plot.fixScale = true;
        plot.scale.set(0.5, 0.5, 0.5);
        plot.rotation.x = Math.PI / 2;
        plot.castShadow = true;
        plot.receiveShadow = true;
        if (vertical) {
            plot.position.set(0, index, 1);
            plot.rotation.y = Math.PI / 2;
        } else {
            plot.position.set(index, 0, 1);
        }

        group.add(plot);
    });
}


function createStonePlatform() {
    const blocksWide = 10;
    const blocksDeep = 6;
    const blockHeight = 1;
    const platformGroup = new THREE.Group();

    for (let x = 0; x < blocksWide; x++) {
        for (let z = 0; z < blocksDeep; z++) {
            let blockMaterial = (x === 0 || x === blocksWide - 1 || z === 0 || z === blocksDeep - 1) ? stoneMaterial : iceMaterial;

            const blockGeometry = new THREE.BoxGeometry(1, blockHeight, 1);
            const block = new THREE.Mesh(blockGeometry, blockMaterial);
            block.position.x = x - blocksWide / 2 + 0.5;
            block.position.y = 0;
            block.position.z = z - blocksDeep / 2 + 0.5;
            block.receiveShadow = true;
            block.castShadow = true;
            platformGroup.add(block);
        }
    }

    platformGroup.position.y = 0.5 - blockHeight / 2;
    platformGroup.position.z = 0.5;
    platformGroup.rotation.x = Math.PI / 2;
    platformGroup.receiveShadow = true;
    return platformGroup;
}


function init() {
    document.getElementById('hitSound').volume = 0.4;
    document.getElementById('gameMusic').play();
    document.querySelector('.score-container').style.display = 'flex';
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

    var group1 = createFenceGroup();
    var group2 = createFenceGroup();
    var group3 = createFenceGroup();
    var group4 = createFenceGroup();

    const plotCount = 9;
    for (let i = 0; i < plotCount; i++) {
        addFence(group1, i);
        addFence(group2, i);
    }

    for (let i = 0; i < 4; i++) {
        addFence(group3, i, true);
        addFence(group4, i, true);
    }

    group1.position.set(-4, 2.5, 0);
    group2.position.set(-4, -2.5, 0);
    group3.position.set(-4.5, -1.5, 0);
    group4.position.set(4.5, -1.5, 0);

    scene.add(paddle1, paddle2, ball, light, ambientLight, floor, stonePlatform, group1, group2, group3, group4);

    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 87) { // W key
            paddle1Direction = 1;
        } else if (event.keyCode === 83) { // S key
            paddle1Direction = -1;
        } else if (event.keyCode === 38 && !isPlayingAgainstAI) { // Up arrow
            paddle2Direction = 1;
        } else if (event.keyCode === 40 && !isPlayingAgainstAI) { // Down arrow
            paddle2Direction = -1;
        }
    });

    document.addEventListener('keyup', function (event) {
        if ((event.keyCode === 87 && paddle1Direction === 1) || (event.keyCode === 83 && paddle1Direction === -1)) {
            paddle1Direction = 0;
        } else if ((event.keyCode === 38 && paddle2Direction === 1) || (event.keyCode === 40 && paddle2Direction === -1 && !isPlayingAgainstAI)) {
            paddle2Direction = 0;
        }
    });
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function bounceBall() {
    let paddle1Bounds = new THREE.Box3().setFromObject(paddle1);
    let paddle2Bounds = new THREE.Box3().setFromObject(paddle2);
    let ballBounds = new THREE.Box3().setFromObject(ball);

    if (paddle1Bounds.intersectsBox(ballBounds)) {
        document.getElementById('hitSound').play();
        ballSpeedX *= -1 * ballAcceleration;
        ballSpeedY += paddle1Speed * 0.1;
    }
    if (paddle2Bounds.intersectsBox(ballBounds)) {
        document.getElementById('hitSound').play();
        ballSpeedX *= -1 * ballAcceleration;
        ballSpeedY += paddle2Speed * 0.1;
    }
}


const paddleBounds = {
    minX: -4, maxX: 4, minY: -1.5, maxY: 1.5
};

const ballBounds = {
    minX: -4, maxX: 4, minY: -1.8, maxY: 1.8
}


let aiReactionDelay = 20;
let lastAiMoveTime = Date.now();
let aiErrorMargin = 0.5;

function aiMovement() {
    if (!isPlayingAgainstAI || Date.now() - lastAiMoveTime < aiReactionDelay) return;

    lastAiMoveTime = Date.now();

    let aiTargetY = ball.position.y + (Math.random() - 0.5) * 2 * aiErrorMargin;

    if (Math.abs(aiTargetY - paddle2.position.y) > 0.5) {
        paddle2Speed = aiTargetY > paddle2.position.y ? paddleSpeed : -paddleSpeed;
    } else {
        paddle2Speed = 0;
    }
}


function animate() {
    requestAnimationFrame(animate);
    //if end game, don't animate
    if (ballSpeedX === 0 && ballSpeedY === 0) {
        return;
    }

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


    ball.position.x += ballSpeedX;
    ball.position.y += ballSpeedY;
    bounceBall();
    if (ball.position.x < ballBounds.minX || ball.position.x > ballBounds.maxX) {
        ballSpeedX *= -1;
    }
    if (ball.position.y < ballBounds.minY || ball.position.y > ballBounds.maxY) {
        ballSpeedY *= -1;
    }

    aiMovement();

    //score
    if (ball.position.x < ballBounds.minX) {
        updateScore(2);
    } else if (ball.position.x > ballBounds.maxX) {
        updateScore(1);
    }

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.render(scene, camera);
}