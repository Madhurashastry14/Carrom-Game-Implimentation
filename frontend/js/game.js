const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const player1 = { name: "PLAYER 1", score: 0, color: "#ed7c0b" };
const player2 = { name: "PLAYER 2", score: 0, color: "#ed7c0b" };

const board = new Image();
board.src = "assets/board.jpeg";

// BOARD SIZE
const boardWidth = 480;
const boardHeight = 480;

// CENTER BOARD
const boardX = (canvas.width - boardWidth) / 2;
const boardY = (canvas.height - boardHeight) / 2;

// BOARD WALLS
const leftWall = boardX + 20;
const rightWall = boardX + boardWidth - 20;
const topWall = boardY + 20;
const bottomWall = boardY + boardHeight - 38;

// BOARD CENTER
const cx = boardX + boardWidth / 2 + 2;
const cy = boardY + boardHeight / 2 - 27;

class Coin {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.vx = 0;
    this.vy = 0;

    this.mass = 1;
  }
}

const coins = [];

const r = 12;

// BOTTOM STRIKER
const striker = {
  x: cx,
  y: bottomWall - 80,
  radius: 12,
  color: "#ed7c0b",
  vx: 0,
  vy: 0,
  mass: 2,
};

// TOP STRIKER
const topStriker = {
  x: cx,
  y: topWall + 60,
  radius: 12,
  color: "#ed7c0b",
  vx: 0,
  vy: 0,
  mass: 2,
};

function createCoins() {
  const h = r * Math.sqrt(3) + 1.5;
  const pos = [
    // CENTER QUEEN
    { x: cx, y: cy, color: "#f60a0a" },

    // INNER CIRCLE
    { x: cx, y: cy - 2 * r, color: "white" },
    { x: cx + h, y: cy - r, color: "black" },
    { x: cx + h, y: cy + r, color: "white" },
    { x: cx, y: cy + 2 * r, color: "black" },
    { x: cx - h, y: cy + r, color: "white" },
    { x: cx - h, y: cy - r, color: "black" },

    // OUTER CIRCLE
    { x: cx, y: cy - 4 * r, color: "white" },
    { x: cx + h, y: cy - 3 * r, color: "black" },
    { x: cx + 2 * h, y: cy - 2 * r, color: "white" },
    { x: cx + 2 * h, y: cy, color: "black" },
    { x: cx + 2 * h, y: cy + 2 * r, color: "white" },
    { x: cx + h, y: cy + 3 * r, color: "black" },
    { x: cx, y: cy + 4 * r, color: "white" },
    { x: cx - h, y: cy + 3 * r, color: "black" },
    { x: cx - 2 * h, y: cy + 2 * r, color: "white" },
    { x: cx - 2 * h, y: cy, color: "black" },
    { x: cx - 2 * h, y: cy - 2 * r, color: "white" },
    { x: cx - h, y: cy - 3 * r, color: "black" },
  ];

  coins.length = 0;

  for (let p of pos) {
    coins.push(new Coin(p.x, p.y, r, p.color));
  }
}

function draw() {
  // CLEAR CANVAS
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(board, boardX, boardY, boardWidth, boardHeight);

  // DRAW COINS
  for (let coin of coins) {
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = coin.color;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();

    // INNER RING
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = coin.color === "white" ? "#ddd" : "#555";
    ctx.stroke();
  }

  // --- DRAW BOTTOM STRIKER (Only if it's bottom's turn) ---
  if (currentTurn === "bottom") {
    ctx.beginPath();
    ctx.arc(striker.x, striker.y, striker.radius, 0, Math.PI * 2);
    ctx.fillStyle = striker.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // INNER RING
    ctx.beginPath();
    ctx.arc(striker.x, striker.y, striker.radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = striker.color === "white" ? "#ddd" : "#b64f0a";
    ctx.stroke();
  }

  // --- DRAW TOP STRIKER (Only if it's top's turn) ---
  if (currentTurn === "top") {
    ctx.beginPath();
    ctx.arc(topStriker.x, topStriker.y, topStriker.radius, 0, Math.PI * 2);
    ctx.fillStyle = topStriker.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // INNER RING
    ctx.beginPath();
    ctx.arc(
      topStriker.x,
      topStriker.y,
      topStriker.radius * 0.7,
      0,
      Math.PI * 2,
    );
    ctx.strokeStyle = topStriker.color === "white" ? "#ddd" : "#b64f0a";
    ctx.stroke();
  }

  // DRAW PLAYER PROFILES
  drawPlayerProfiles();
}

// LOAD BOARD
board.onload = function () {
  createCoins();

  draw();
};

// DRAGGING
let draggingBottom = false;
let draggingTop = false;

canvas.addEventListener("mousedown", function (e) {
  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // BOTTOM STRIKER CHECK
  let dx = mouseX - striker.x;
  let dy = mouseY - striker.y;

  let distance = Math.sqrt(dx * dx + dy * dy);

  // TOP STRIKER CHECK
  let dxTop = mouseX - topStriker.x;
  let dyTop = mouseY - topStriker.y;

  let topDistance = Math.sqrt(dxTop * dxTop + dyTop * dyTop);

  // Only allow dragging if it matches the current player's turn
  if (distance < striker.radius && currentTurn === "bottom") {
    draggingBottom = true;
  }

  if (topDistance < topStriker.radius && currentTurn === "top") {
    draggingTop = true;
  }
});

canvas.addEventListener("mouseup", function () {
  draggingBottom = false;
  draggingTop = false;
});

canvas.addEventListener("mousemove", function (e) {
  if (!draggingBottom && !draggingTop) return;

  const rect = canvas.getBoundingClientRect();

  let mouseX = e.clientX - rect.left;

  // LEFT LIMIT
  if (mouseX < leftWall + 90) {
    mouseX = leftWall + 90;
  }

  // RIGHT LIMIT
  if (mouseX > rightWall - 90) {
    mouseX = rightWall - 90;
  }

  // MOVE ONLY SELECTED STRIKER
  if (draggingBottom) {
    striker.x = mouseX;
  }

  if (draggingTop) {
    topStriker.x = mouseX;
  }

  draw();
});

//  AIMING SYSTEM
const aimState = {
  bottom: { aiming: false, aimX: 0, aimY: 0, power: 0 },
  top: { aiming: false, aimX: 0, aimY: 0, power: 0 },
};

let activeAiming = null;
const MAX_POWER = 90;

let strikerReturned = false;
let topStrikerReturned = false;
let currentTurn = "bottom";
let turnSwitchPending = false;

// RIGHT CLICK TO START AIMING

// DISABLE RIGHT CLICK MENU
canvas.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// RIGHT CLICK = TOGGLE AIM
canvas.addEventListener("mousedown", function (e) {
  if (e.button !== 2) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const check = (s) => {
    const dx = mouseX - s.x;
    const dy = mouseY - s.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const bottomDist = check(striker);
  const topDist = check(topStriker);

  // Enforce turn restrictions when initiating aim
  if (bottomDist < 80 && currentTurn === "bottom") {
    activeAiming = "bottom";
  } else if (topDist < 80 && currentTurn === "top") {
    activeAiming = "top";
  } else {
    return;
  }

  const state = aimState[activeAiming];
  state.aiming = !state.aiming;

  state.aimX = mouseX;
  state.aimY = mouseY;
});

// SMOOTH AIM MOVEMENT
canvas.addEventListener("mousemove", function (e) {
  if (!activeAiming) return;

  const state = aimState[activeAiming];

  if (!state.aiming) return;

  const rect = canvas.getBoundingClientRect();

  state.aimX = e.clientX - rect.left;
  state.aimY = e.clientY - rect.top;

  const strikerRef = activeAiming === "bottom" ? striker : topStriker;

  const dx = strikerRef.x - state.aimX;
  const dy = strikerRef.y - state.aimY;

  state.power = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_POWER);
});

// LEFT CLICK TO SHOOT
document.addEventListener("click", function () {
  if (!activeAiming) return;

  const state = aimState[activeAiming];
  if (!state.aiming) return;

  const strikerRef = activeAiming === "bottom" ? striker : topStriker;

  const dx = strikerRef.x - state.aimX;
  const dy = strikerRef.y - state.aimY;

  const angle = Math.atan2(dy, dx);
  const speed = state.power * 0.22;

  strikerRef.vx = Math.cos(angle) * speed;
  strikerRef.vy = Math.sin(angle) * speed;

  state.aiming = false;
  activeAiming = null;

  strikerReturned = false;
  topStrikerReturned = false;
  turnSwitchPending = true;
});

// DRAW AIM
function drawAimFor(strikerRef, state) {
  const dx = strikerRef.x - state.aimX;
  const dy = strikerRef.y - state.aimY;

  const angle = Math.atan2(dy, dx);

  const aimLength = 25 + state.power * 0.55;

  const endX = strikerRef.x + Math.cos(angle) * aimLength;
  const endY = strikerRef.y + Math.sin(angle) * aimLength;

  let limitedEndX = Math.max(leftWall, Math.min(rightWall, endX));
  let limitedEndY = Math.max(topWall, Math.min(bottomWall, endY));

  ctx.beginPath();
  ctx.moveTo(strikerRef.x, strikerRef.y);
  ctx.lineTo(limitedEndX, limitedEndY);

  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // arrow
  const arrowAngle = Math.atan2(
    limitedEndY - strikerRef.y,
    limitedEndX - strikerRef.x,
  );

  const arrowSize = 14;

  const x1 = limitedEndX - arrowSize * Math.cos(arrowAngle - Math.PI / 6);
  const y1 = limitedEndY - arrowSize * Math.sin(arrowAngle - Math.PI / 6);
  const x2 = limitedEndX - arrowSize * Math.cos(arrowAngle + Math.PI / 6);
  const y2 = limitedEndY - arrowSize * Math.sin(arrowAngle + Math.PI / 6);

  ctx.beginPath();
  ctx.moveTo(limitedEndX, limitedEndY);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();

  ctx.fillStyle = strikerRef.color;
  ctx.fill();
}

function updatePiece(piece) {
  piece.x += piece.vx;
  piece.y += piece.vy;

  // friction
  piece.vx *= 0.985;
  piece.vy *= 0.985;

  // stop small movement
  if (Math.abs(piece.vx) < 0.05) piece.vx = 0;
  if (Math.abs(piece.vy) < 0.05) piece.vy = 0;

  // left wall
  if (piece.x - piece.radius < leftWall) {
    piece.x = leftWall + piece.radius;
    piece.vx *= -1;
  }

  // right wall
  if (piece.x + piece.radius > rightWall) {
    piece.x = rightWall - piece.radius;
    piece.vx *= -1;
  }

  // top wall
  if (piece.y - piece.radius < topWall) {
    piece.y = topWall + piece.radius;
    piece.vy *= -1;
  }

  // bottom wall
  if (piece.y + piece.radius > bottomWall) {
    piece.y = bottomWall - piece.radius;
    piece.vy *= -1;
  }
}

function resolveCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  // Calculate squared distance (skipping the slow Math.sqrt)
  const distanceSq = dx * dx + dy * dy;
  const minDistance = a.radius + b.radius;

  // Broad-phase check using multiplication instead of square root
  if (distanceSq >= minDistance * minDistance) return;

  // Real collision confirmed: Now compute actual distance for resolution
  const distance = Math.sqrt(distanceSq);

  // Prevent division by zero if pieces are perfectly overlapping
  if (distance === 0) return;

  // NORMAL UNIT VECTORS
  const nx = dx / distance;
  const ny = dy / distance;

  // SEPARATE OBJECTS SLIGHTLY (Positional Correction)
  const overlap = minDistance - distance;
  const separationFactor = 0.5; // Distribute correction evenly

  a.x -= nx * overlap * separationFactor;
  a.y -= ny * overlap * separationFactor;

  b.x += nx * overlap * separationFactor;
  b.y += ny * overlap * separationFactor;

  // RELATIVE VELOCITY
  const dvx = a.vx - b.vx;
  const dvy = a.vy - b.vy;

  // VELOCITY ALONG NORMAL
  const impactSpeed = dvx * nx + dvy * ny;

  // ALREADY MOVING APART
  if (impactSpeed < 0) return;

  // ELASTICITY
  const restitution = 0.85;

  // IMPULSE SCALAR (Account for masses)
  const impulse = (2 * impactSpeed) / (a.mass + b.mass);

  a.vx -= impulse * b.mass * nx * restitution;
  a.vy -= impulse * b.mass * ny * restitution;

  b.vx += impulse * a.mass * nx * restitution;
  b.vy += impulse * a.mass * ny * restitution;
}

function resetStriker(piece, isBottom) {
  piece.vx = 0;
  piece.vy = 0;
  piece.x = cx;
  piece.y = isBottom ? bottomWall - 80 : topWall + 60;
}

function updateGame() {
  // 1. Identify and update ONLY the active striker and coins
  const activeStriker = currentTurn === "bottom" ? striker : topStriker;

  updatePiece(activeStriker);
  for (let coin of coins) {
    updatePiece(coin);
  }

  // 2. COLLISION: Active Striker ↔ Coins
  for (let coin of coins) {
    resolveCollision(activeStriker, coin);
  }

  // 3. COLLISION: Coin ↔ Coin (Optimized)
  for (let i = 0; i < coins.length; i++) {
    const coinA = coins[i];
    const coinAIsMoving = coinA.vx !== 0 || coinA.vy !== 0;

    for (let j = i + 1; j < coins.length; j++) {
      const coinB = coins[j];
      if (coinAIsMoving || coinB.vx !== 0 || coinB.vy !== 0) {
        resolveCollision(coinA, coinB);
      }
    }
  }

  // 4. TURN RESET MECHANISM
  const everythingStopped =
    strikerStopped() && topStrikerStopped() && coinsStopped();

  if (everythingStopped && turnSwitchPending) {
    // Reset BOTH to their baselines behind the scenes
    resetStriker(striker, true);
    strikerReturned = true;

    resetStriker(topStriker, false);
    topStrikerReturned = true;

    // Flip the turn identity (This will instantly change which one is drawn)
    currentTurn = currentTurn === "bottom" ? "top" : "bottom";

    turnSwitchPending = false;
  }
}

function strikerStopped() {
  return Math.abs(striker.vx) < 0.05 && Math.abs(striker.vy) < 0.05;
}

function coinsStopped() {
  for (let coin of coins) {
    if (Math.abs(coin.vx) > 0.05 || Math.abs(coin.vy) > 0.05) {
      return false;
    }
  }

  return true;
}

function topStrikerStopped() {
  return Math.abs(topStriker.vx) < 0.05 && Math.abs(topStriker.vy) < 0.05;
}

function gameLoop() {
  updateGame();

  draw();

  if (aimState.bottom.aiming) {
    drawAimFor(striker, aimState.bottom);
  }

  if (aimState.top.aiming) {
    drawAimFor(topStriker, aimState.top);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
// --- PLACE THE NEW TURN MANAGEMENT VARIABLES HERE ---

// --- PLAYER DATA ---

function drawPlayerProfiles() {
  const cardWidth = 145;
  const cardHeight = 65;
  const padding = 25;
  const edgeSafety = 5; // Forces distance from canvas walls

  const profiles = [
    {
      p: player1,
      turn: "bottom",
      x: Math.max(edgeSafety, boardX - cardWidth - padding),
      y: boardY + boardHeight - cardHeight,
    },
    {
      p: player2,
      turn: "top",
      x: Math.min(
        canvas.width - cardWidth - edgeSafety,
        boardX + boardWidth + padding,
      ),
      y: boardY,
    },
  ];

  profiles.forEach((profile) => {
    const { p, x, y } = profile;
    const isActive = currentTurn === profile.turn;

    ctx.save();

    // --- 1. THE CARD BODY ---
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardHeight, 12);

    // ACTIVE PLAYER GLOW
    if (isActive) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#1b1b1b";
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#111111";
    }

    ctx.fill();

    // --- 2. BORDER ---
    ctx.strokeStyle = isActive ? "#ffffff" : p.color;
    ctx.lineWidth = isActive ? 3 : 2;

    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, cardWidth - 2, cardHeight - 2, 11);
    ctx.stroke();

    // --- 3. TEXT RENDERING ---
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Player Name (Top half)
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillText(p.name, x + cardWidth / 2, y + 22);

    // Professional Divider
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 34);
    ctx.lineTo(x + cardWidth - 15, y + 34);
    ctx.stroke();

    // Score (Bottom half)
    ctx.fillStyle = p.color;
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText(
      "SCORE: " +
        (p.score !== undefined ? p.score.toString().padStart(2, "0") : "00"),
      x + cardWidth / 2,
      y + 48,
    );

    ctx.restore();
  });
}
