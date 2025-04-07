let scene, camera, renderer, car;
let keys = {}; // Zmienna do śledzenia naciśniętych klawiszy
let speed = 0;  // Aktualna prędkość pojazdu
let maxSpeed = 1; // Maksymalna prędkość
let power = 0.0001; // Moc silnika
let rpm = 0; // Obroty silnika
let isGameRunning = false; // Flaga kontrolująca stan gry
let menuDiv; // Do trzymania elementu menu
let powerDiv; // Do wyświetlania mocy w górnej części ekranu
let maxSpeedDiv; // Do wyświetlania maksymalnej prędkości

function init() {
    // Utworzenie sceny
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Ustaw kolor tła

    // Ustawienie kamery
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20); // Ustaw pozycję kamery

    // Utworzenie renderera
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Dodanie światła
    const ambientLight = new THREE.AmbientLight(0x404040); // Światło otoczenia
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Światło kierunkowe
    directionalLight.position.set(5, 5, 5); // Ustaw pozycję światła
    scene.add(directionalLight);

    // Tworzenie nieba i chmur
    createSky();
    
    // Tworzenie modelu samochodu
    createCar();

    // Tworzenie toru
    createTrack();

    // Tworzenie drzew
    createTrees();

    // Obsługa zdarzeń klawiatury
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // Tworzenie menu
    createMenu();
    createPowerDisplay(); // Dodanie wyświetlania mocy
    createMaxSpeedDisplay(); // Dodanie wyświetlania maksymalnej prędkości

    // Animacja
    animate();
}

function createSky() {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.DoubleSide });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.position.set(0, 500, 0); // Pozycjonuj niebo wysoko
    scene.add(sky);
}

function createCar() {
    const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 1);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(bodyGeometry, bodyMaterial);
    car.position.y = 0.25;
    scene.add(car);

    const coneGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
    const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    let frontIndicator = new THREE.Mesh(coneGeometry, coneMaterial);
    frontIndicator.position.set(0, 0, 0.75);
    frontIndicator.rotation.x = Math.PI;
    car.add(frontIndicator);

    camera.position.set(0, 2, 4);
    car.add(camera);
}

function createTrack() {
    const roadWidth = 10;
    const trackLength = 100; // Długość toru
    const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const trackGeometry = new THREE.PlaneGeometry(roadWidth, trackLength);
    const roadMesh = new THREE.Mesh(trackGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2; // Ustawienie płaszczyzny poziomo
    scene.add(roadMesh);

    // Rysowanie białych pasów
    const stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripeWidth = 0.5;
    for (let i = -trackLength / 2; i < trackLength / 2; i += 5) {
        const stripeGeometry = new THREE.PlaneGeometry(stripeWidth, 1);
        const stripeMesh = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripeMesh.rotation.x = -Math.PI / 2; // Ustawienie pasów poziomo
        stripeMesh.position.set(0, 0.1, i); // Ustawienie pozycji pasów
        scene.add(stripeMesh);
    }

    // Dodawanie bronzowych płotków po bokach toru
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

function createTrees() {
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });

    for (let i = -40; i <= 40; i += 10) {
        for (let j = -20; j <= 20; j += 10) {
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(i, 1, j);
            scene.add(trunk);

            const leavesGeometry = new THREE.SphereGeometry(0.8, 8, 8);
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(i, 3, j);
            scene.add(leaves);
        }
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
    powerDiv.style.top = '60px';
    powerDiv.style.left = '20px';
    powerDiv.style.color = 'yellow';
    powerDiv.style.fontSize = '24px';
    powerDiv.innerHTML = `Aktualna moc: ${power.toFixed(5)}`; // Użyj toFixed do wyświetlania
    document.body.appendChild(powerDiv);
}

function createMaxSpeedDisplay() {
    maxSpeedDiv = document.createElement('div');
    maxSpeedDiv.style.position = 'absolute';
    maxSpeedDiv.style.top = '100px';
    maxSpeedDiv.style.left = '20px';
    maxSpeedDiv.style.color = 'cyan';
    maxSpeedDiv.style.fontSize = '24px';
    maxSpeedDiv.innerHTML = `Maksymalna prędkość: ${maxSpeed}`;
    document.body.appendChild(maxSpeedDiv);
}

function updateMenu() {
    if (!isGameRunning) return; // Jeżeli gra nie jest uruchomiona, nie aktualizuj

    const displayedSpeed = Math.floor(speed * 200000); // Prędkość do wyświetlania
    menuDiv.innerHTML = `
        <h1>Witamy w grze wyścigowej!</h1>
        <p><strong>Aktualna prędkość: ${displayedSpeed} m/s</strong></p>
        <p><strong>Aktualne obroty: ${rpm.toFixed(2)} RPM</strong></p>
        <p>Użyj "+" i "-" do zmiany mocy (potwierdź zmianę klawiszem "S")</p>
        <p>Użyj "P" aby zwiększyć maks. prędkość</p>
        <p>Użyj "O" aby zmniejszyć maks. prędkość</p>
    `;

    powerDiv.innerHTML = `Aktualna moc: ${(power).toFixed(2)}`; // Wyświetl moc
    maxSpeedDiv.innerHTML = `Maksymalna prędkość: ${maxSpeed}`; // Wyświetl maks. prędkość
}

function startGame() {
    isGameRunning = true;
    speed = 0; // Resetowanie prędkości
    document.body.removeChild(menuDiv); // Usunięcie menu po rozpoczęciu gry
}

function stopGame() {
    isGameRunning = false;
}

// Główna pętla animacji
function animate() {
    requestAnimationFrame(animate);

    // Sterowanie samochodem (WASD)
    if (car && isGameRunning) {
        if (keys['w'] || keys['W']) {
            speed += power; // Użycie mocy do przyspieszania
            if (speed > maxSpeed) speed = maxSpeed; // Ograniczenie prędkości
            car.position.z -= speed * Math.cos(car.rotation.y); // Zmiana pozycji samochodu wzdłuż osi Z
            car.position.x -= speed * Math.sin(car.rotation.y); // Zmiana pozycji samochodu wzdłuż osi X
        }
        if (keys['s'] || keys['S']) {
            speed -= power; // Zmniejsz prędkość
            if (speed < 0) speed = 0; 
            car.position.z += speed * Math.cos(car.rotation.y); // Zmiana pozycji samochodu wzdłuż osi Z
            car.position.x += speed * Math.sin(car.rotation.y); // Zmiana pozycji samochodu wzdłuż osi X
        }
        if (keys['a'] || keys['A']) {
            car.rotation.y += 0.05; // Obrót samochodu w lewo
        }
        if (keys['d'] || keys['D']) {
            car.rotation.y -= 0.05; // Obrót samochodu w prawo
        }

        rpm = speed * 100; // Obliczenie obrotów silnika
        updateMenu(); // Aktualizuj menu
    }

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
            power += 0.1; // Zwiększ moc
            updateMenu(); // Aktualizuj wyświetlacz
        } else if (event.key === '-') {
            power = Math.max(0.1, power - 0.1); // Zmniejsz moc
            updateMenu(); // Aktualizuj wyświetlacz
        } else if (event.key === 's') {
            console.log(`Potwierdzona moc: ${power.toFixed(2)}`);
        } else if (event.key === 'p') {
            maxSpeed += 1; // Zwiększ maksymalną prędkość
            updateMenu(); // Aktualizuj wyświetlacz
        } else if (event.key === 'o') {
            maxSpeed = Math.max(1, maxSpeed - 1); // Zmniejsz maksymalną prędkość
            updateMenu(); // Aktualizuj wyświetlacz
        }
    }
});

// Rozpoczęcie gry
init();
