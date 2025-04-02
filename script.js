let scene, camera, renderer, car;
let keys = {}; // Zmienna do �ledzenia naci�ni�tych klawiszy
let speed = 0;  // Aktualna pr�dko�� pojazdu
let maxSpeed = 1; // Maksymalna pr�dko��
let power = 0.0001; // Moc silnika
let rpm = 0; // Obroty silnika
let isGameRunning = false; // Flaga kontroluj�ca stan gry
let menuDiv; // Do trzymania elementu menu
let powerDiv; // Do wy�wietlania mocy w g�rnej cz�ci ekranu
let maxSpeedDiv; // Do wy�wietlania maksymalnej pr�dko�ci

function init() {
    // Utworzenie sceny
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Ustaw kolor t�a

    // Ustawienie kamery
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20); // Ustaw pozycj� kamery

    // Utworzenie renderera
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Dodanie �wiat�a
    const ambientLight = new THREE.AmbientLight(0x404040); // �wiat�o otoczenia
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // �wiat�o kierunkowe
    directionalLight.position.set(5, 5, 5); // Ustaw pozycj� �wiat�a
    scene.add(directionalLight);

    // Stworzenie nieba i chmur
    createSky();
    
    // Tworzenie modelu samochodu
    createCar();

    // Tworzenie drogi slalomu
    createSlalomRoad();

    // Tworzenie drzew
    createTrees();

    // Obs�uga zdarze� klawiatury
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // Tworzenie menu
    createMenu();
    createPowerDisplay(); // Dodanie wy�wietlania mocy
    createMaxSpeedDisplay(); // Dodanie wy�wietlania maksymalnej pr�dko�ci

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
    const roadLength = 100; // D�ugo�� drogi
    const roadSegments = 20; // Liczba segment�w drogi

    const roadGeometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < roadSegments; i++) {
        const x = -roadLength / 2 + (i * (roadLength / roadSegments));
        const zOffset = Math.sin(i * 0.5) * roadWidth; // Slalom
        const baseY = 0;

        positions.push(x, baseY, zOffset); // Lewy wierzcho�ek
        positions.push(x, baseY, zOffset + roadWidth); // Prawy wierzcho�ek
    }

    roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.y = Math.PI; // Obr�t drogi, aby by�a pozioma
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
        <p>Wci�nij "Enter", aby rozpocz�� gr�</p>
        <p>U�yj "WASD" do sterowania</p>
        <p>U�yj "+" i "-" do zmiany mocy</p>
        <p>U�yj "P" do zwi�kszenia maks. pr�dko�ci</p>
        <p>U�yj "O" do zmniejszenia maks. pr�dko�ci</p>
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
    powerDiv.innerHTML = `Aktualna moc: ${power.toFixed(5)}`; // U�yj toFixed do wy�wietlania
    document.body.appendChild(powerDiv);
}

function createMaxSpeedDisplay() {
    maxSpeedDiv = document.createElement('div');
    maxSpeedDiv.style.position = 'absolute';
    maxSpeedDiv.style.top = '100px';
    maxSpeedDiv.style.left = '20px';
    maxSpeedDiv.style.color = 'cyan';
    maxSpeedDiv.style.fontSize = '24px';
    maxSpeedDiv.innerHTML = `Maksymalna pr�dko��: ${maxSpeed}`;
    document.body.appendChild(maxSpeedDiv);
}

function updateMenu() {
    if (!isGameRunning) return; // Je�li gra nie jest uruchomiona, nie aktualizuj

    const displayedSpeed = Math.floor(speed * 200000); // Pr�dko�� do wy�wietlania
    menuDiv.innerHTML = `
        <h1>Witamy w grze wyscigowej!</h1>
        <p><strong>Aktualna pr�dko��: ${displayedSpeed} m/s</strong></p>
        <p><strong>Aktualne obroty: ${rpm.toFixed(2)} RPM</strong></p>
        <p>U�yj "+" i "-" do zmiany mocy (potwierd� zmian� klawiszem "S")</p>
        <p>U�yj "P" aby zwi�kszy� maks. pr�dko��</p>
        <p>U�yj "O" aby zmniejszy� maks. pr�dko��</p>
    `;

    powerDiv.innerHTML = `Aktualna moc: ${(power).toFixed(2)}`; // Wy�wietl moc
    maxSpeedDiv.innerHTML = `Maksymalna pr�dko��: ${maxSpeed}`; // Wy�wietl maks. pr�dko��
}

function startGame() {
    isGameRunning = true;
    speed = 0; // Resetowanie pr�dko�ci
    document.body.removeChild(menuDiv); // Usuni�cie menu po rozpocz�ciu gry
}

function stopGame() {
    isGameRunning = false;
}

// G��wna p�tla animacji
function animate() {
    requestAnimationFrame(animate);

    // Sterowanie samochodem (WASD)
    if (car && isGameRunning) {
        if (keys['w'] || keys['W']) {
            speed += power; // U�ycie mocy do przyspieszania
            if (speed > maxSpeed) speed = maxSpeed; // Ograniczenie pr�dko�ci
            car.position.z -= speed * Math.cos(car.rotation.y); // Zmiana pozycji samochodu wzd�u� osi Z
            car.position.x -= speed * Math.sin(car.rotation.y); // Zmiana pozycji samochodu wzd�u� osi X
        }
        if (keys['s'] || keys['S']) {
            speed -= power; // Zmniejsz pr�dko��
            if (speed < 0) speed = 0; 
            car.position.z += speed * Math.cos(car.rotation.y); // Zmiana pozycji samochodu wzd�u� osi Z
            car.position.x += speed * Math.sin(car.rotation.y); // Zmiana pozycji samochodu wzd�u� osi X
        }
        if (keys['a'] || keys['A']) {
            car.rotation.y += 0.05; // Obr�t samochodu w lewo
        }
        if (keys['d'] || keys['D']) {
            car.rotation.y -= 0.05; // Obr�t samochodu w prawo
        }

        rpm = speed * 100; // Obliczenie obrot�w silnika
        updateMenu(); // Aktualizuj menu
    }

    renderer.render(scene, camera); // Renderuj scen�
}

// Powi�kszenie sceny przy zmianie rozmiaru okna
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Ustaw proporcje kamery
    camera.updateProjectionMatrix(); // Zaktualizuj macierz projekcji
    renderer.setSize(window.innerWidth, window.innerHeight); // Ustaw rozmiar renderera
});

// Kontrola mocy i maksymalnej pr�dko�ci
window.addEventListener('keydown', (event) => {
    if (!isGameRunning && event.key === 'Enter') {
        startGame(); // Rozpocznij gr�
    } else if (isGameRunning) {
        if (event.key === '+') {
            power += 0.1; // Zwi�ksz moc
            updateMenu(); // Aktualizuj wy�wietlacz
        } else if (event.key === '-') {
            power = Math.max(0.1, power - 0.1); // Zmniejsz moc
            updateMenu(); // Aktualizuj wy�wietlacz
        } else if (event.key === 's') {
            console.log(`Potwierdzona moc: ${power.toFixed(2)}`);
        } else if (event.key === 'p') {
            maxSpeed += 1; // Zwi�ksz maksymaln� pr�dko��
            updateMenu(); // Aktualizuj wy�wietlacz
        } else if (event.key === 'o') {
            maxSpeed = Math.max(1, maxSpeed - 1); // Zmniejsz maksymaln� pr�dko��
            updateMenu(); // Aktualizuj wy�wietlacz
        }
    }
});

// Rozpocz�cie gry
init();