const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('../assets/textures/grass.jpg');
const stoneTexture = textureLoader.load('../assets/textures/stone.png');
const plankTexture = textureLoader.load('../assets/textures/plank.png');
const iceTexture = textureLoader.load('../assets/textures/ice_block.png');

const loader = new THREE.GLTFLoader();
[grassTexture, stoneTexture, plankTexture, iceTexture].forEach(texture => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
});
grassTexture.repeat.set(100, 100);

const floorMaterial = new THREE.MeshBasicMaterial({map: grassTexture});
const stoneMaterial = new THREE.MeshBasicMaterial({map: stoneTexture});
const paddleMaterial = new THREE.MeshBasicMaterial({map: plankTexture});
const iceMaterial = new THREE.MeshBasicMaterial({map: iceTexture});

let camera, scene, renderer;
let paddle1, paddle2, ball;
let ballSpeedX = 0.02, ballSpeedY = 0.02;
const paddleSpeed = 0.5;

window.onload = function () {
    init();
    animate();
}

function createPaddle(x, y, z) {
    const paddleGeometry = new THREE.BoxGeometry(0.4, 1, 0.2);
    const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle.position.set(x, y, z);
    return paddle;
}

function createBall() {
    const ballGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const ballMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0, 1);
    return ball;
}

function createLight() {
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 5);
    light.castShadow = true;
    return light;
}

function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
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
            platformGroup.add(block);
        }
    }

    platformGroup.position.y = 0.5 - blockHeight / 2;
    platformGroup.position.z = 0.5;
    platformGroup.rotation.x = Math.PI / 2;
    return platformGroup;
}


export function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -3, 5);
    camera.rotation.x = 0.5;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    paddle1 = createPaddle(-3.8, 0.25, 1.1);
    paddle2 = createPaddle(3.8, 0.25, 1.1);
    ball = createBall();
    const light = createLight();
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

    scene.add(paddle1, paddle2, ball, light, floor, stonePlatform, group1, group2, group3, group4);

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
    minX: -4,
    maxX: 4,
    minY: -1.5,
    maxY: 1.5
};

const ballBounds = {
    minX: -4,
    maxX: 4,
    minY: -1.8,
    maxY: 1.8
}

export function animate() {
    requestAnimationFrame(animate);

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
    if (ball.position.x < paddle1.position.x + 0.2 && ball.position.x > paddle1.position.x - 0.2 &&
        ball.position.y < paddle1.position.y + 0.5 && ball.position.y > paddle1.position.y - 0.5) {
        ballSpeedX *= -1;
    }

    // Kolize s pádkou 2
    if (ball.position.x < paddle2.position.x + 0.2 && ball.position.x > paddle2.position.x - 0.2 &&
        ball.position.y < paddle2.position.y + 0.5 && ball.position.y > paddle2.position.y - 0.5) {
        ballSpeedX *= -1;
    }

    renderer.render(scene, camera);
}