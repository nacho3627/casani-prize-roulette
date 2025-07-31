
const prizes = [
  { label: "Premio 1", color: "#ff9999", image: "https://via.placeholder.com/60?text=1" },
  { label: "Premio 2", color: "#99ccff", image: "https://via.placeholder.com/60?text=2" },
  { label: "Premio 3", color: "#ccffcc", image: "https://via.placeholder.com/60?text=3" },
  { label: "Premio 4", color: "#ffff99", image: "https://via.placeholder.com/60?text=4" },
  { label: "Premio 5", color: "#ffccff", image: "https://via.placeholder.com/60?text=5" },
  { label: "Premio 6", color: "#c0c0c0", image: "https://via.placeholder.com/60?text=6" }
];

const wheel = document.getElementById("wheel");
const container = document.getElementById("wheel-container");
const numSectors = prizes.length;
const sectorAngle = 360 / numSectors;
let currentAngle = 0;

function createWheel() {
  wheel.innerHTML = '';
  prizes.forEach((prize, i) => {
    const sector = document.createElement('div');
    sector.className = 'sector';
    sector.style.transform = `rotate(${i * sectorAngle}deg) skewY(${90 - sectorAngle}deg)`;
    sector.style.background = prize.color;

    const content = document.createElement('div');
    content.style.transform = `skewY(-${90 - sectorAngle}deg) rotate(${sectorAngle / 2}deg)`;
    content.innerHTML = `<img src="${prize.image}" alt="${prize.label}"><br>${prize.label}`;
    sector.appendChild(content);

    wheel.appendChild(sector);
  });
}
createWheel();

// Inercia + sonido + tic
let isDragging = false;
let lastAngle = 0;
let velocity = 0;
let lastTimestamp = 0;
let animationFrame;

function getAngleFromEvent(e) {
  const rect = container.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  return Math.atan2(y - cy, x - cx) * (180 / Math.PI);
}

function onDragStart(e) {
  cancelAnimationFrame(animationFrame);
  isDragging = true;
  lastAngle = getAngleFromEvent(e);
  lastTimestamp = performance.now();
  velocity = 0;
}

function onDragMove(e) {
  if (!isDragging) return;
  const angle = getAngleFromEvent(e);
  const delta = angle - lastAngle;
  currentAngle += delta;
  wheel.style.transform = `rotate(${currentAngle}deg)`;

  const now = performance.now();
  velocity = delta / (now - lastTimestamp) * 1000;
  lastAngle = angle;
  lastTimestamp = now;
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  animateInertia();
}

function animateInertia() {
  const friction = 0.98;
  const minVelocity = 0.1;

  const spinSound = document.getElementById("spin-sound");
  const winSound = document.getElementById("win-sound");
  const tickSound = document.getElementById("tick-sound");

  spinSound.currentTime = 0;
  spinSound.play();

  let lastTickSector = -1;

  function step() {
    velocity *= friction;
    currentAngle += velocity;
    wheel.style.transform = `rotate(${currentAngle}deg)`;

    const normalizedAngle = (360 - (currentAngle % 360) + sectorAngle / 2) % 360;
    const currentSector = Math.floor(normalizedAngle / sectorAngle);

    if (currentSector !== lastTickSector) {
      tickSound.currentTime = 0;
      tickSound.play();
      lastTickSector = currentSector;
    }

    if (Math.abs(velocity) > minVelocity) {
      animationFrame = requestAnimationFrame(step);
    } else {
      spinSound.pause();

      const finalIndex = currentSector % prizes.length;
      const sectors = wheel.querySelectorAll(".sector");
      sectors.forEach(s => s.classList.remove("winning"));
      sectors[finalIndex].classList.add("winning");

      winSound.currentTime = 0;
      winSound.play();

      setTimeout(() => {
        alert("¡Ganaste: " + prizes[finalIndex].label + "!");
        sectors[finalIndex].classList.remove("winning");
      }, 500);
    }
  }

  step();
}

container.addEventListener("mousedown", onDragStart);
container.addEventListener("mousemove", onDragMove);
window.addEventListener("mouseup", onDragEnd);

container.addEventListener("touchstart", onDragStart);
container.addEventListener("touchmove", onDragMove);
window.addEventListener("touchend", onDragEnd);
