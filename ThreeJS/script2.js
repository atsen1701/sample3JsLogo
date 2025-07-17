// Initialize renderer and set size
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize camera
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 2, 20);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// Initialize scene and objects
const scene = new THREE.Scene();
const city = new THREE.Object3D();
const smoke = new THREE.Object3D();
const town = new THREE.Object3D();
let createCarPos = true;

// FOG background
const fogColor = 0x3661f1;
scene.background = new THREE.Color(fogColor);
scene.fog = new THREE.FogExp2(fogColor, 0.05);

// Helper functions
const mathRandom = (num = 8) => -Math.random() * num + Math.random() * num;
const setTintColor = () => 0x000000; // Building and tree color

// Define materials
const buildingMaterial = new THREE.MeshStandardMaterial({
  color: setTintColor(),
  flatShading: true,
});

// Use the same material for trees
const treeMaterial = buildingMaterial;

// Occupancy grid to track occupied positions
const occupiedPositions = new Set();

// Create city
function init() {
  const segments = 2;
  const geometry = new THREE.BoxGeometry(1, 0, 0, segments, segments, segments);
  // Create buildings
  for (let i = 1; i < 100; i++) {
    const cube = new THREE.Mesh(geometry, buildingMaterial);
    const floor = new THREE.Mesh(geometry, buildingMaterial);
    cube.castShadow = cube.receiveShadow = true;
    cube.rotationValue = 0.1 + Math.abs(mathRandom(8));
    floor.scale.y = 0.05;
    cube.scale.y = 0.1 + Math.abs(mathRandom(8));

    const cubeWidth = 0.9;
    cube.scale.set(cubeWidth + mathRandom(1 - cubeWidth), cube.scale.y, cubeWidth + mathRandom(1 - cubeWidth));

    // Generate random position and ensure it's not already occupied
    let posX, posZ, key;
    do {
      posX = Math.round(mathRandom(20));
      posZ = Math.round(mathRandom(20));
      key = `${posX},${posZ}`;
    } while (occupiedPositions.has(key));

    occupiedPositions.add(key);
    cube.position.set(posX, 0, posZ);
    floor.position.set(cube.position.x, 0, cube.position.z);

    town.add(floor);
    town.add(cube);
  }
  addTrees(); // Add trees after buildings are placed
}
// Add trees without overlapping buildings
function addTrees() {
  const treeCount = 100;

  for (let i = 0; i < treeCount; i++) {
    const tree = new THREE.Object3D();

    // Trunk
    const trunkHeight = 0.5 + Math.random() * 0.5;
    const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.05, trunkHeight, 8);
    const trunkMesh = new THREE.Mesh(trunkGeometry, treeMaterial);
    trunkMesh.position.y = trunkHeight / 2;
    tree.add(trunkMesh);

    // Foliage
    const foliageLevels = 3;
    for (let j = 0; j < foliageLevels; j++) {
      const foliageHeight = 0.3;
      const foliageRadius = 0.2 - j * 0.05;
      const foliageGeometry = new THREE.ConeGeometry(foliageRadius, foliageHeight, 8);
      const foliageMesh = new THREE.Mesh(foliageGeometry, treeMaterial);
      foliageMesh.position.y =
        trunkHeight + foliageHeight / 2 + j * (foliageHeight - 0.1);
      tree.add(foliageMesh);
    }

    // Generate random position and ensure it's not occupied by a building
    let posX, posZ, key;
    do {
      posX = Math.round(mathRandom(20));
      posZ = Math.round(mathRandom(20));
      key = `${posX},${posZ}`;
    } while (occupiedPositions.has(key));

    occupiedPositions.add(key);
    tree.position.set(posX, 0, posZ);

    // Randomly scale tree size for variety
    const scale = 0.8 + Math.random() * 0.4;
    tree.scale.set(scale, scale, scale);

    city.add(tree);
  }
}

// addTrees();

// Initialize smoke particles
function initSmokeParticles() {
  const gmaterial = new THREE.MeshToonMaterial({ color: 0xc99e0e });
  const gparticularGeometry = new THREE.CircleGeometry(0.01, 3);

  for (let h = 1; h < 100; h++) {
    const particleMesh = new THREE.Mesh(gparticularGeometry, gmaterial);
    // Random position for smoke particles
    particleMesh.position.set(mathRandom(5), mathRandom(5), mathRandom(5));
    smoke.add(particleMesh);
  }

  // Ground plane to receive shadows
  const pmaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    opacity: 0.9,
    transparent: true,
  });

  const pgeometry = new THREE.PlaneGeometry(60, 60);
  const pelementMesh = new THREE.Mesh(pgeometry, pmaterial);

  pelementMesh.rotation.x = -Math.PI / 2;
  pelementMesh.position.y = -0.001;
  pelementMesh.receiveShadow = true;

  city.add(pelementMesh); // Add ground plane to the city
}

// Mouse and touch events
const mouse = new THREE.Vector2();
window.addEventListener(
  'mousemove',
  (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  },
  false
);

window.addEventListener(
  'touchmove',
  (event) => {
    if (event.touches.length === 1) {
      mouse.x = (event.touches[0].pageX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.touches[0].pageY / window.innerHeight) * 2 + 1;
    }
  },
  false
);

// Setup lights in the scene
function setupLights() {
  // Adjusted Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  const lightFront = new THREE.SpotLight(0xffffff, 5, 10);
  const lightBack = new THREE.PointLight(0xffffff, 0.2);

  lightFront.position.set(5, 5, 5);
  lightFront.castShadow = true;
  lightFront.shadow.mapSize.width = 6000;
  lightFront.shadow.mapSize.height = 6000;
  lightFront.penumbra = 0.1;

  lightBack.position.set(0, 6, 0);

  smoke.position.y = 2;

  scene.add(ambientLight);
  city.add(lightFront);
  scene.add(lightBack);
  scene.add(city);
  city.add(smoke);
  city.add(town);
  // Grid Helper
  const gridHelper = new THREE.GridHelper(60, 120, 0x0000ff, 0x000000);
  city.add(gridHelper);
}

// Function to create cars in the city with complementary color gradient
function createCars(cScale=1) {
  // Fog color is 0x3661f1 (blue)
  const fogColor = new THREE.Color(0x3661f1); 
  
  // Compute complementary color by shifting hue by 180 degrees
  let complementaryColor = fogColor.clone().offsetHSL(0.5, 0, 0);  // offset by 180 degrees in hue

  // Optionally, you can create a gradient between fog and complementary color
  // Use THREE.Color.lerp (linear interpolation) for gradient effect
  let gradientColor = fogColor.clone().lerp(complementaryColor, 0.5); // Mix 50% of both colors
  
  // Use the gradient color for the car
  const cMat = new THREE.MeshToonMaterial({ color: gradientColor });

  // Create car geometry
  const cGeo = new THREE.BoxGeometry(1, cScale / 40, cScale / 40);
  const cElem = new THREE.Mesh(cGeo, cMat);

  // Set car position and animation
  if (createCarPos) {
      createCarPos = false;
      cElem.position.set(-20, Math.abs(mathRandom(5)), mathRandom(3));
      gsap.to(cElem.position, { x: 20, repeat: -1, yoyo: true, duration: 10, delay: mathRandom(3) });
  } else {
      createCarPos = true;
      cElem.position.set(mathRandom(3), Math.abs(mathRandom(5)), -20);
      cElem.rotation.y = Math.PI / 2;
      gsap.to(cElem.position, { z: 20, repeat: -1, yoyo: true, duration: 10, delay: mathRandom(3), ease: 'power1.inOut' });
  }

  // Enable shadows for the car
  cElem.receiveShadow = cElem.castShadow = true;
  city.add(cElem);
}


function generateLines() {
  for (let i = 0; i < 20; i++) {
    createCars();
  }
}

// Variables to control animation
let isAnimating = true;

// Animate
function animate() {
  if (isAnimating) {
    requestAnimationFrame(animate);

    // Reduced camera movement speed
    city.rotation.y -= (mouse.x * 4 - camera.rotation.y) * 0.0005; // Adjusted values
    city.rotation.x -= (-mouse.y * 1 - camera.rotation.x) * 0.0005; // Adjusted values
    city.rotation.x = Math.max(-0.05, Math.min(city.rotation.x, 1));

    smoke.rotation.y += 0.01;
    smoke.rotation.x += 0.01;

    camera.lookAt(city.position);
    renderer.render(scene, camera);
  }
}

// Event listeners to pause animation when page is not in focus
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isAnimating = false;
  } else {
    isAnimating = true;
    animate();
  }
});

// Start functions
generateLines();
init();
initSmokeParticles(); 
setupLights(); // Call to setup lights in the scene.
animate();
