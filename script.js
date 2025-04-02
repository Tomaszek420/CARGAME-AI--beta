let scene, camera, renderer, car;
let keys = {}; // Zmienna do œledzenia naciœniêtych klawiszy
let speed = 0;  // Aktualna prêdkoœæ pojazdu
let maxSpeed = 1; // Maksymalna prêdkoœæ
let power = 0.0001; // Moc silnika
let rpm = 0; // Obroty silnika
let isGameRunning = false; // Flaga kontroluj¹ca stan gry
let menuDiv; // Do trzymania elementu menu
let powerDiv; // Do wyœwietlania mocy w górnej czêœci ekranu
let maxSpeedDiv; // Do wyœwietlania maksymalnej prêdkoœci

function init() {
    // Utworzenie sceny
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Ustaw kolor t³a

    // Ustawienie kamery
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20); // Ustaw pozycjê kamery

    // Utworzenie renderera
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Dodanie œwiat³a
    const ambientLight = new THREE.AmbientLight(0x404040); // Œwiat³o otoczenia
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Œwiat³o kierunkowe
    directionalLight.position.set(5, 5, 5); // Ustaw pozycjê œwiat³a
    scene.add(directionalLight);

    // Stworzenie nieba i chmur
    createSky();
    
    // Tworzenie modelu samochodu
    createCar();

    // Tworzenie drogi slalomu
    createSlalomRoad();

    // Tworzenie drzew
    createTrees();

    // Obs³uga zdarzeñ klawiatury
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // Tworzenie menu
    createMenu();
    createPowerDisplay(); // Dodanie wyœwietlania mocy
    createMaxSpeedDisplay(); // Dodanie wyœwietlania maksymalnej prêdkoœci

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

function createSlalomRoad() {
    const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const roadWidth = 4;
    const roadLength = 100; // D³ugoœæ drogi
    const roadSegments = 20; // Liczba segmentów drogi

    const roadGeometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < roadSegments; i++) {
        const x = -roadLength / 2 + (i * (roadLength / roadSegments));
        const zOffset = Math.sin(i * 0.5) * roadWidth; // Slalom
        const baseY = 0;

        positions.push(x, baseY, zOffset); // Lewy wierzcho³ek
        positions.push(x, baseY, zOffset + roadWidth); // Prawy wierzcho³ek
    }

    roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.y = Math.PI; // Obrót drogi, aby by³a pozioma
    scene.add(roadMesh);
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
        <h1>Witamy w grze wyscigowej!</h1>
        <p>Wciœnij "Enter", aby rozpocz¹æ grê</p>
        <p>U¿yj "WASD" do sterowania</p>
        <p>U¿yj "+" i "-" do zmiany mocy</p>
        <p>U¿yj "P" do zwiêkszenia maks. prêdkoœci</p>
        <p>U¿yj "O" do zmniejszenia maks. prêdkoœci</p>
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
    powerDiv.innerHTML = `Aktualna moc: ${power.toFixed(5)}`; // U¿yj toFixed do wyœwietlania
    document.body.appendChild(powerDiv);
}

function createMaxSpeedDisplay() {
    maxSpeedDiv = document.createElement('div');
    maxSpeedDiv.style.position = 'absolute';
    maxSpeedDiv.style.top = '100px';
    maxSpeedDiv.style.left = '20px';
    maxSpeedDiv.style.color = 'cyan';
    maxSpeedDiv.style.fontSize = '24px';
    maxSpeedDiv.innerHTML = `Maksymalna prêdkoœæ: ${maxSpeed}`;
    document.body.appendChild(maxSpeedDiv);
}

function updateMenu() {
    if (!isGameRunning) return; // Jeœli gra nie jest uruchomiona, nie aktualizuj

    const displayedSpeed = Math.floor(speed * 200000); // Prêdkoœæ do wyœwietlania
    menuDiv.innerHTML = `
        <h1>Witamy w grze wyscigowej!</h1>
        <p><strong>Aktualna prêdkoœæ: ${displayedSpeed} m/s</strong></p>
        <p><strong>Aktualne obroty: ${rpm.toFixed(2)} RPM</strong></p>
        <p>U¿yj "+" i "-" do zmiany mocy (potwierdŸ zmianê klawiszem "S")</p>
        <p>U¿yj "P" aby zwiêkszyæ maks. prêdkoœæ</p>
        <p>U¿yj "O" aby zmniejszyæ maks. prêdkoœæ</p>
    `;

    powerDiv.innerHTML = `Aktualna moc: ${(power).toFixed(2)}`; // Wyœwietl moc
    maxSpeedDiv.innerHTML = `Maksymalna prêdkoœæ: ${maxSpeed}`; // Wyœwietl maks. prêdkoœæ
}

function startGame() {
    isGameRunning = true;
    speed = 0; // Resetowanie prêdkoœci
    document.body.removeChild(menuDiv); // Usuniêcie menu po rozpoczêciu gry
}

function stopGame() {
    isGameRunning = false;
}

// G³ówna pêtla animacji
function animate() {
    requestAnimationFrame(animate);

    // Sterowanie samochodem (WASD)
    if (car && isGameRunning) {
        if (keys['w'] || keys['W']) {
            speed += power; // U¿ycie mocy do przyspieszania
            if (speed > maxSpeed) speed = maxSpeed; // Ograniczenie prêdkoœci
            car.position.z -= speed * Math.cos(car.rotation.y); // Zmiana pozycji samochodu wzd³u¿ osi Z
            car.position.x -= speed * Math.sin(car.rotation.y); // Zmiana pozycji samochodu wzd³u¿ osi X
        }
        if (keys['s'] || keys['S']) {
            speed -= power; // Zmniejsz prêdkoœæ
            if (speed < 0) speed = 0; 
            car.position.z += speed * Math.cos(car.rotation.y); // Zmiana pozycji samochodu wzd³u¿ osi Z
            car.position.x += speed * Math.sin(car.rotation.y); // Zmiana pozycji samochodu wzd³u¿ osi X
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

    renderer.render(scene, camera); // Renderuj scenê
}

// Powiêkszenie sceny przy zmianie rozmiaru okna
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Ustaw proporcje kamery
    camera.updateProjectionMatrix(); // Zaktualizuj macierz projekcji
    renderer.setSize(window.innerWidth, window.innerHeight); // Ustaw rozmiar renderera
});

// Kontrola mocy i maksymalnej prêdkoœci
window.addEventListener('keydown', (event) => {
    if (!isGameRunning && event.key === 'Enter') {
        startGame(); // Rozpocznij grê
    } else if (isGameRunning) {
        if (event.key === '+') {
            power += 0.1; // Zwiêksz moc
            updateMenu(); // Aktualizuj wyœwietlacz
        } else if (event.key === '-') {
            power = Math.max(0.1, power - 0.1); // Zmniejsz moc
            updateMenu(); // Aktualizuj wyœwietlacz
        } else if (event.key === 's') {
            console.log(`Potwierdzona moc: ${power.toFixed(2)}`);
        } else if (event.key === 'p') {
            maxSpeed += 1; // Zwiêksz maksymaln¹ prêdkoœæ
            updateMenu(); // Aktualizuj wyœwietlacz
        } else if (event.key === 'o') {
            maxSpeed = Math.max(1, maxSpeed - 1); // Zmniejsz maksymaln¹ prêdkoœæ
            updateMenu(); // Aktualizuj wyœwietlacz
        }
    }
});

// Rozpoczêcie gry
init();