let scene, camera, renderer, car;
let keys = {}; // Zmienna do śledzenia naciśniętych klawiszy
let speed = 0;  // Aktualna prędkość pojazdu
let maxSpeed = 0.5; // Maksymalna prędkość
let power = 0.0001; // Moc silnika
let rpm = 0; // Obroty silnika
let isGameRunning = false; // Flaga kontrolująca stan gry
let menuDiv; // Do trzymania elementu menu
let powerDiv; // Do wyświetlania mocy w górnej części ekranu
let maxSpeedDiv; // Do wyświetlania maksymalnej prędkości
const acceleration = 0.01; // Przyspieszenie
const deceleration = 0.02; // Zwalnianie

function init() {
     // Utworzenie sceny
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080); // Ustaw kolor tła

    // Ustawienie kamery
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20); // Ustaw pozycję kamery

    // Utworzenie renderera
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Dodanie światła
    const ambientLight = new THREE.AmbientLight(0x404040); // Światło otoczenia
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Światło kierunkowe
    directionalLight.position.set(5, 5, 5); // Ustaw pozycję światła
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Tworzenie modelu samochodu
    createCar();

    // Tworzenie toru
    createTrack();

    // Obsługa zdarzeń klawiatury
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // Tworzenie menu
    createMenu();
    createPowerDisplay();
    createMaxSpeedDisplay();

    // Animacja
    animate();
}

function createCar() {
    // Tworzenie nadwozia samochodu
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(bodyGeometry, bodyMaterial);
    car.position.y = 0.25;
    scene.add(car);

    // Tworzenie atrybutów samochodu (dach, koła, reflektory)
    const roofGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.8);
    const roofMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
    carRoof.position.set(0, 0.65, 0);
    car.add(carRoof);

    const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 16);
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wheelPositions = [
        { x: 0.8, y: 0.0, z: 0.6 },
        { x: 0.8, y: 0.0, z: -0.6 },
        { x: -0.8, y: 0.0, z: 0.6 },
        { x: -0.8, y: 0.0, z: -0.6 }
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2; // obrót w osi Z
        wheel.position.set(pos.x, pos.y, pos.z);
        car.add(wheel);
    });

    const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const headlightPositions = [
        { x: 0.9, y: 0.25, z: 0.5 },
        { x: 0.9, y: 0.25, z: -0.5 }
    ];

    headlightPositions.forEach(pos => {
        const headlight = new THREE.Mesh(lightGeometry, lightMaterial);
        headlight.position.set(pos.x, pos.y, pos.z);
        car.add(headlight);
    });
}

function createTrack() {
    const roadWidth = 12;
    const trackLength = 250;
    const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const trackGeometry = new THREE.PlaneGeometry(roadWidth, trackLength);
    const roadMesh = new THREE.Mesh(trackGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    scene.add(roadMesh);

    const stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripeWidth = 0.5;
    for (let i = -trackLength / 2; i < trackLength / 2; i += 5) {
        const stripeGeometry = new THREE.PlaneGeometry(stripeWidth, 1);
        const stripeMesh = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripeMesh.rotation.x = -Math.PI / 2;
        stripeMesh.position.set(0, 0.1, i);
        scene.add(stripeMesh);
    }

    const fenceMaterial = new THREE.MeshBasicMaterial({ color: 0xcd7f32 });
    const fenceWidth = 0.2;
    const fenceHeight = 1;
    for (let i = -trackLength / 2; i < trackLength / 2; i += 5) {
        const fenceGeometry = new THREE.BoxGeometry(fenceWidth, fenceHeight, 0.1);
        const leftFence = new THREE.Mesh(fenceGeometry, fenceMaterial);
        leftFence.position.set(-roadWidth / 2 - fenceWidth / 2, fenceHeight / 2, i);
        scene.add(leftFence);
        
        const rightFence = new THREE.Mesh(fenceGeometry, fenceMaterial);
        rightFence.position.set(roadWidth / 2 + fenceWidth / 2, fenceHeight / 2, i);
        scene.add(rightFence);
    }
}

function createMenu() {
    menuDiv = document.createElement('div');
    menuDiv.style.position = 'absolute';
    menuDiv.style.top = '20px';
    menuDiv.style.left = '20px';
    menuDiv.style.color = 'white';
    menuDiv.style.fontSize = '24px';
    menuDiv.innerHTML = `
        <h1>Witamy w grze wyścigowej!</h1>
        <p>Wciśnij "Enter", aby rozpocząć grę</p>
        <p>Użyj "WASD" do sterowania</p>
        <p>Użyj "+" i "-" do zmiany mocy</p>
        <p>Użyj "P" do zwiększenia maks. prędkości</p>
        <p>Użyj "O" do zmniejszenia maks. prędkości</p>
    `;
    document.body.appendChild(menuDiv);
}

function createPowerDisplay() {
    powerDiv = document.createElement('div');
    powerDiv.style.position = 'absolute';
    powerDiv.style.top = '70px';
    powerDiv.style.right = '20px';
    powerDiv.style.color = 'red';
    powerDiv.style.fontSize = '21px';
    powerDiv.innerHTML = `Aktualna moc: ${power.toFixed(5)}`;
    document.body.appendChild(powerDiv);
}

function createMaxSpeedDisplay() {
    maxSpeedDiv = document.createElement('div');
    maxSpeedDiv.style.position = 'absolute';
    maxSpeedDiv.style.top = '100px';
    maxSpeedDiv.style.right = '20px';
    maxSpeedDiv.style.color = 'red';
    maxSpeedDiv.style.fontSize = '20px';
    maxSpeedDiv.innerHTML = `Maksymalna prędkość: ${maxSpeed}`;
    document.body.appendChild(maxSpeedDiv);
}

function updateMenu() {
    if (!isGameRunning) return;

    const displayedSpeed = Math.floor(speed * 200000);
    menuDiv.innerHTML = `
        <h1>Witamy w grze wyścigowej!</h1>
        <p><strong>Aktualna prędkość: ${displayedSpeed} m/s</strong></p>
        <p><strong>Aktualne obroty: ${rpm.toFixed(2)} RPM</strong></p>
        <p>Użyj "+" i "-" do zmiany mocy (potwierdź zmianę klawiszem "S")</p>
        <p>Użyj "P" aby zwiększyć maks. prędkość</p>
        <p>Użyj "O" aby zmniejszyć maks. prędkość</p>
    `;

    powerDiv.innerHTML = `Aktualna moc: ${(power).toFixed(2)}`;
    maxSpeedDiv.innerHTML = `Maksymalna prędkość: ${maxSpeed}`;
}

function startGame() {
    isGameRunning = true;
    speed = 0; // Resetowanie prędkości
    document.body.removeChild(menuDiv); // Usunięcie menu po rozpoczęciu gry
}

function stopGame() {
    isGameRunning = false;
}

function animate() {
    requestAnimationFrame(animate);

    // Sterowanie samochodem (WASD)
    if (car && isGameRunning) {
        if (keys['w'] || keys['W']) {
            speed += power;
            if (speed > maxSpeed) speed = maxSpeed;
        }
        if (keys['s'] || keys['S']) {
            speed -= power;
            if (speed < 0) speed = 0;
        }
        if (keys['a'] || keys['A']) {
            car.rotation.y += 0.05; // Obrót samochodu w lewo
        }
        if (keys['d'] || keys['D']) {
            car.rotation.y -= 0.05; // Obrót samochodu w prawo
        }

        // Zmiana pozycji samochodu
        car.position.z -= speed * Math.cos(car.rotation.y);
        car.position.x -= speed * Math.sin(car.rotation.y);
        
        rpm = speed * 100; // Obliczenie obrotów silnika
        updateMenu(); // Aktualizuj menu
    }

    // Ustawienie kamery za samochodem
    const cameraOffset = new THREE.Vector3(0, 2, 5); // Offset kamery
    camera.position.copy(car.position).add(cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), car.rotation.y)); // Rotate offset based on car's rotation
    camera.lookAt(car.position); // Ustaw punkt, na który kamera patrzy

    renderer.render(scene, camera); // Renderuj scenę
}

// Powiększenie sceny przy zmianie rozmiaru okna
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Ustaw proporcje kamery
    camera.updateProjectionMatrix(); // Zaktualizuj macierz projekcji
    renderer.setSize(window.innerWidth, window.innerHeight); // Ustaw rozmiar renderera
});

// Kontrola mocy i maksymalnej prędkości
window.addEventListener('keydown', (event) => {
    if (!isGameRunning && event.key === 'Enter') {
        startGame(); // Rozpocznij grę
    } else if (isGameRunning) {
        if (event.key === '+') {
            power += 0.01; // Zwiększ moc
            updateMenu(); // Aktualizuj wyświetlacz
        } else if (event.key === '-') {
            power = Math.max(0.01, power - 0.01); // Zmniejsz moc
            updateMenu(); // Aktualizuj wyświetlacz
        } else if (event.key === 's') {
            console.log(`Potwierdzona moc: ${power.toFixed(2)}`);
        } else if (event.key === 'p') {
            maxSpeed += 0.1; // Zwiększ maksymalną prędkość
            updateMenu(); // Aktualizuj wyświetlacz
        } else if (event.key === 'o') {
            maxSpeed = Math.max(1, maxSpeed - 0.1); // Zmniejsz maksymalną prędkość
            updateMenu(); // Aktualizuj wyświetlacz
        } else if (event.key === 'Escape') {
            stopGame(); // Zatrzymaj grę
        }
    }
});

// Rozpoczęcie gry
init();
