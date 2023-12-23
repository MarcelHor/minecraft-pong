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

export {createPaddle, createBall, createLight, createFloor, createFenceGroup, addFence, createStonePlatform};