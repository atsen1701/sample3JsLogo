function resizeCanvas() {
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('three-canvas');

    if (!canvas || !canvasContainer) return;

    // Set canvas dimensions
    canvas.width = canvasContainer.offsetWidth;
    canvas.height = canvasContainer.offsetHeight;

    // If renderer exists, update it too
    if (window.renderer) {
        window.renderer.setSize(canvas.width, canvas.height);
    }

    // If camera exists, update aspect ratio
    if (window.camera) {
        window.camera.aspect = canvas.width / canvas.height;
        window.camera.updateProjectionMatrix();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('three-canvas');

    // Set canvas size explicitly
    resizeCanvas();

    // Initialize renderer with explicit size - FIXED THIS LINE
    window.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    window.renderer.setSize(canvas.width, canvas.height);
    window.renderer.setClearColor(0x000000, 0); // Transparent background

    const scene = new THREE.Scene();
    window.camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
    window.camera.position.z = 10; // Increased for better view

    // Cubes setup
    const size = 0.7;
    const gridSize = 4;
    const cubes = [];
    const colors = [
        [0xFF5555, 0xFF5555, 0xFF5555, 0xFF5555],
        [0xFF6E44, 0xFF6E44, 0xFF6E44, 0xFF6E44],
        [0xFF8844, 0xFF8844, 0xFF8844, 0xFF8844],
        [0xFFA044, 0xFFA044, 0xFFA044, 0xFFA044]
    ];
    const rightLeft = 4;
    const upDown = 1.3;
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const geometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshPhongMaterial({
                color: colors[j][i],
                shininess: 100
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = i * size - (gridSize * size) / 2 + rightLeft;
            cube.position.y = j * size - (gridSize * size) / 2 + upDown;
            scene.add(cube);
            cubes.push(cube);
        }
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 10).normalize();
    scene.add(directionalLight);

    // Text handling function (will be populated when font loads)
    let createTextMesh;

    //Shadow 

    // Font Loading with error handling
    const fontLoader = new THREE.FontLoader();
    fontLoader.load(
        'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
        (font) => {
            // Create function to generate text meshes
            createTextMesh = (text, size, height, bevel, position) => {
                const textGeometry = new THREE.TextGeometry(text, {
                    font,
                    size,
                    height,
                    curveSegments: 12,
                    bevelEnabled: bevel,
                    bevelThickness: 0.02,
                    bevelSize: 0.015,
                    bevelSegments: 5
                });

                textGeometry.computeBoundingBox();

                // Center text horizontally
                const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
                textGeometry.translate(-textWidth / 2, 0, 0);

                const textMaterial = new THREE.MeshStandardMaterial({
                    color: 0xFF0066,
                    metalness: 0.5,
                    roughness: 0.2
                });

                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.copy(position);
                scene.add(textMesh);

                return textMesh;
            };

            // Create text meshes
            createTextMesh('S | E | A',2.1, 0.38, true, new THREE.Vector3(-3.5, 0, 0)); // Increased size and position
            createTextMesh('evolution to excellence', 1, 0.09, true, new THREE.Vector3(-3, -2, 0)); // Adjusted position

            // Render scene after text has been added
            window.renderer.render(scene, window.camera);
        },
    );

    // Set up orbit controls
    // const controls = new THREE.OrbitControls(window.camera, window.renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;
    // controls.enableZoom = false;  // Disable zoom for better UX
    // controls.autoRotate = true;   // Auto-rotate for more visual appeal
    // controls.autoRotateSpeed = 0.01; // Slow rotation
    // controls.enablePan = false;   // Disable panning
    // controls.target.set(-1.5, 0, 0);
    // controls.update();

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Animate cubes
        cubes.forEach(cube => {
            cube.rotation.x += 0.005;
            cube.rotation.y += 0.01;
        });

        // controls.update();
        window.renderer.render(scene, window.camera);
    };

    animate();

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
});