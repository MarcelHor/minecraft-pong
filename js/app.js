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
const paddleSpeed = 1;

let score1 = 0, score2 = 0;
const maxScore = 5;

window.onload = function () {
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
        reset();
    }
}

function endGame() {
    document.getElementById('game-over').style.opacity = '1';

    ballSpeedX = 0;
    ballSpeedY = 0;

    setTimeout(function () {
        document.getElementById('game-over').style.opacity = '0';
        score1 = 0;
        score2 = 0;
        document.getElementById('score1').textContent = score1.toString();
        document.getElementById('score2').textContent = score2.toString();
        reset();
    }, 3000);

}


function reset() {
    ball.position.set(0, 0, 1.1);
    ballSpeedX = 0.02;
    ballSpeedY = 0.02;

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


export function init() {
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
        switch (event.keyCode) {
            case 87: // W klávesa - pohyb první pádky nahoru
                paddle1.position.y += paddleSpeed;
                break;
            case 83: // S klávesa - pohyb první pádky dolů
                paddle1.position.y -= paddleSpeed;
                break;
            case 38: // Šipka nahoru - pohyb druhé pádky nahoru
                paddle2.position.y += paddleSpeed;
                break;
            case 40: // Šipka dolů - pohyb druhé pádky dolů
                paddle2.position.y -= paddleSpeed;
                break;
        }
    });
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


const paddleBounds = {
    minX: -4, maxX: 4, minY: -1.5, maxY: 1.5
};

const ballBounds = {
    minX: -4, maxX: 4, minY: -1.8, maxY: 1.8
}

export function animate() {
    requestAnimationFrame(animate);

    if (ballSpeedX === 0 && ballSpeedY === 0) {
        return;
    }
    ball.position.x += ballSpeedX;
    ball.position.y += ballSpeedY;

    paddle1.position.x = Math.max(paddleBounds.minX, Math.min(paddle1.position.x, paddleBounds.maxX));
    paddle1.position.y = Math.max(paddleBounds.minY, Math.min(paddle1.position.y, paddleBounds.maxY));

    paddle2.position.x = Math.max(paddleBounds.minX, Math.min(paddle2.position.x, paddleBounds.maxX));
    paddle2.position.y = Math.max(paddleBounds.minY, Math.min(paddle2.position.y, paddleBounds.maxY));

    if (ball.position.x < ballBounds.minX || ball.position.x > ballBounds.maxX) {
        ballSpeedX *= -1;
    }

    if (ball.position.y < ballBounds.minY || ball.position.y > ballBounds.maxY) {
        ballSpeedY *= -1;
    }

    // Kolize s pádkou 1
    if (ball.position.x < paddle1.position.x + 0.2 && ball.position.x > paddle1.position.x - 0.2 && ball.position.y < paddle1.position.y + 0.5 && ball.position.y > paddle1.position.y - 0.5) {
        ballSpeedX *= -1;
    }

    // Kolize s pádkou 2
    if (ball.position.x < paddle2.position.x + 0.2 && ball.position.x > paddle2.position.x - 0.2 && ball.position.y < paddle2.position.y + 0.5 && ball.position.y > paddle2.position.y - 0.5) {
        ballSpeedX *= -1;
    }

    if (ball.position.x < ballBounds.minX) {
        updateScore(2);
    } else if (ball.position.x > ballBounds.maxX) {
        updateScore(1);
    }

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.render(scene, camera);
}