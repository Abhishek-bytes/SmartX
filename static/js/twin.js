// Babylon.js Digital Twin
let engine, scene, camera, light, machine, machineGroup;
let sensorData = {};
let animationRunning = true;
let currentMachine = 'robot';
let machineSpeed = 50;
let lightingLevel = 80;

document.addEventListener('DOMContentLoaded', function() {
    initBabylonScene();
    setupEventListeners();
    startDataUpdates();
});

function initBabylonScene() {
    const canvas = document.getElementById('twin-canvas');
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.06, 0.09, 0.16);

    camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 4, 10, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);

    // Lighting
    light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    light.position = new BABYLON.Vector3(10, 10, 5);
    light.intensity = 0.8;
    scene.ambientColor = new BABYLON.Color3(0.25, 0.25, 0.25);

    // Shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10}, scene);
    ground.receiveShadows = true;
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new BABYLON.Color3(0.12, 0.16, 0.23);

    createMachine();

    engine.runRenderLoop(() => {
        if (animationRunning && machine) {
            animateMachine();
        }
        scene.render();
    });

    window.addEventListener('resize', () => engine.resize());
}

function createMachine() {
    if (machineGroup) {
        machineGroup.dispose();
    }
    machineGroup = new BABYLON.TransformNode("machineGroup", scene);

    // Main body
    const body = BABYLON.MeshBuilder.CreateBox("body", {width:2, height:1, depth:2}, scene);
    body.position.y = 0.5;
    body.parent = machineGroup;
    body.material = new BABYLON.PBRMaterial("bodyMat", scene);
    body.material.albedoColor = new BABYLON.Color3(0.15, 0.39, 0.92);
    body.material.metallic = 0.7;
    body.material.roughness = 0.3;

    // Control panel
    const panel = BABYLON.MeshBuilder.CreateBox("panel", {width:0.3, height:0.8, depth:1.5}, scene);
    panel.position.set(1.15, 0.9, 0);
    panel.parent = machineGroup;
    panel.material = new BABYLON.PBRMaterial("panelMat", scene);
    panel.material.albedoColor = new BABYLON.Color3(0.12, 0.16, 0.23);

    // Rotating component
    machine = BABYLON.MeshBuilder.CreateCylinder("rotor", {diameter:0.6, height:0.8}, scene);
    machine.position.set(0, 1.4, 0);
    machine.parent = machineGroup;
    machine.material = new BABYLON.PBRMaterial("rotorMat", scene);
    machine.material.albedoColor = new BABYLON.Color3(0.94, 0.27, 0.27);
    machine.material.metallic = 1;
    machine.material.roughness = 0.2;

    // Support pillars
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const pillar = BABYLON.MeshBuilder.CreateCylinder("pillar", {diameter:0.1, height:1.5}, scene);
        pillar.position.set(Math.cos(angle) * 0.8, 0.75, Math.sin(angle) * 0.8);
        pillar.parent = machineGroup;
        pillar.material = new BABYLON.PBRMaterial("pillarMat", scene);
        pillar.material.albedoColor = new BABYLON.Color3(0.42, 0.45, 0.50);
    }

    // Sensor indicators
    createSensorIndicators();

    // Shadows
    [body, panel, machine].forEach(mesh => {
        mesh.receiveShadows = true;
        mesh.castShadow = true;
    });
}

function createSensorIndicators() {
    // Temperature sensor
    const tempSensor = BABYLON.MeshBuilder.CreateSphere("tempSensor", {diameter:0.2}, scene);
    tempSensor.position.set(0.8, 1.2, 0.8);
    tempSensor.parent = machineGroup;
    tempSensor.material = new BABYLON.PBRMaterial("tempMat", scene);
    tempSensor.material.emissiveColor = new BABYLON.Color3(0.94, 0.27, 0.27);

    // Pressure sensor
    const pressureSensor = BABYLON.MeshBuilder.CreateSphere("pressureSensor", {diameter:0.2}, scene);
    pressureSensor.position.set(-0.8, 1.2, 0.8);
    pressureSensor.parent = machineGroup;
    pressureSensor.material = new BABYLON.PBRMaterial("pressureMat", scene);
    pressureSensor.material.emissiveColor = new BABYLON.Color3(0.23, 0.51, 0.96);

    // Vibration sensor
    const vibrationSensor = BABYLON.MeshBuilder.CreateSphere("vibrationSensor", {diameter:0.2}, scene);
    vibrationSensor.position.set(0, 1.2, -0.8);
    vibrationSensor.parent = machineGroup;
    vibrationSensor.material = new BABYLON.PBRMaterial("vibMat", scene);
    vibrationSensor.material.emissiveColor = new BABYLON.Color3(0.96, 0.62, 0.04);
}

function animateMachine() {
    // Smoother animation using Babylon.js
    const speedMultiplier = (machineSpeed / 100) * 0.05;
    machine.rotation.y += speedMultiplier * 2;
    // Add vibration effect for high speed
    if (machineSpeed > 80) {
        machine.position.x = Math.sin(performance.now() * 0.01) * 0.02;
        machine.position.z = Math.cos(performance.now() * 0.01) * 0.02;
    }
}

// You can adapt event listeners and sensor update logic similarly using Babylon.js APIs.
