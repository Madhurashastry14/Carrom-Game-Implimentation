const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// 1. PLAYER OBJECTS
const player1 = {
  name: "PLAYER 1",
  score: 0,
  color: "#ed7c0b",
  coinsPocketed: { white: 0, black: 0, red: 0 },
};

const player2 = {
  name: "PLAYER 2",
  score: 0,
  color: "#ed7c0b",
  coinsPocketed: { white: 0, black: 0, red: 0 },
};

const board = new Image();
board.src = "assets/board.jpeg";

const boardWidth = 480;
const boardHeight = 480;

const boardX = (canvas.width - boardWidth) / 2;
const boardY = (canvas.height - boardHeight) / 2;

const leftWall = boardX + 20;
const rightWall = boardX + boardWidth - 20;
const topWall = boardY + 20;
const bottomWall = boardY + boardHeight - 38;

const cx = boardX + boardWidth / 2 + 2;
const cy = boardY + boardHeight / 2 - 27;

const pocketedAnimations = [];
const pockets = [
  { x: leftWall + 15, y: topWall + 15 }, // Top Left
  { x: rightWall - 15, y: topWall + 15 }, // Top Right
  { x: leftWall + 15, y: bottomWall - 15 }, // Bottom Left
  { x: rightWall - 15, y: bottomWall - 15 }, // Bottom Right
];
const POCKET_RADIUS = 22;

class Coin {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.vx = 0;
    this.vy = 0;
    this.mass = 1;
    this.snapshotX = x;
    this.snapshotY = y;
  }
}

let coins = [];
const r = 12;

const striker = {
  x: cx,
  y: bottomWall - 80,
  radius: 12,
  color: "#ed7c0b",
  vx: 0,
  vy: 0,
  mass: 2,
};

const topStriker = {
  x: cx,
  y: topWall + 60,
  radius: 12,
  color: "#ed7c0b",
  vx: 0,
  vy: 0,
  mass: 2,
};
let gameOver = false;

function createCoins() {
  const h = r * Math.sqrt(3) + 1.5;
  const pos = [
    { x: cx, y: cy, color: "#f60a0a" },

    { x: cx, y: cy - 2 * r, color: "white" },
    { x: cx + h, y: cy - r, color: "black" },
    { x: cx + h, y: cy + r, color: "white" },
    { x: cx, y: cy + 2 * r, color: "black" },
    { x: cx - h, y: cy + r, color: "white" },
    { x: cx - h, y: cy - r, color: "black" },

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(board, boardX, boardY, boardWidth, boardHeight);

  for (let coin of coins) {
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = coin.color;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = coin.color === "white" ? "#ddd" : "#555";
    ctx.stroke();
  }

  drawPocketAnimations();

  if (currentTurn === "bottom" && !strikerPocketedThisTurn) {
    ctx.beginPath();
    ctx.arc(striker.x, striker.y, striker.radius, 0, Math.PI * 2);
    ctx.fillStyle = striker.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(striker.x, striker.y, striker.radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = striker.color === "white" ? "#ddd" : "#b64f0a";
    ctx.stroke();
  }
  if (currentTurn === "top" && !topStrikerPocketedThisTurn) {
    ctx.beginPath();
    ctx.arc(topStriker.x, topStriker.y, topStriker.radius, 0, Math.PI * 2);
    ctx.fillStyle = topStriker.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

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

  drawPlayerProfiles();
  drawNotifications();
  if (gameOver) {
    ctx.save();
    const modalWidth = 400;
    const modalHeight = 250;
    const modalX = canvas.width / 2 - modalWidth / 2;
    const modalY = canvas.height / 2 - modalHeight / 2;

    const bgGrad = ctx.createLinearGradient(
      modalX,
      modalY,
      modalX,
      modalY + modalHeight,
    );
    bgGrad.addColorStop(0, "#fffcf5");
    bgGrad.addColorStop(1, "#f7dfb7");

    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 30;
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(modalX, modalY, modalWidth, modalHeight, 25);
    ctx.fill();

    ctx.strokeStyle = "#5b3214";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = "#d4af37"; // Gold accent
    ctx.lineWidth = 2;
    ctx.stroke();

    const titleGrad = ctx.createLinearGradient(0, modalY + 20, 0, modalY + 70);
    titleGrad.addColorStop(0, "#8b5a00");
    titleGrad.addColorStop(0.5, "#d4af37");
    titleGrad.addColorStop(1, "#5d3a00");

    ctx.fillStyle = titleGrad;
    ctx.font = "bold 48px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, modalY + 65);

    let winnerText =
      player1.score === player2.score
        ? "IT'S A TIE!"
        : player1.score > player2.score
          ? `${player1.name} WINS!`
          : `${player2.name} WINS!`;

    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#ff4d2d";
    ctx.fillText(winnerText, canvas.width / 2, modalY + 115);

    ctx.font = "18px Georgia";
    ctx.fillStyle = "#3d1e10";
    ctx.fillText(
      `${player1.name} : ${player1.score}   vs   ${player2.name} : ${player2.score}`,
      canvas.width / 2,
      modalY + 155,
    );

    // 7. Decorative Line
    ctx.beginPath();
    ctx.moveTo(modalX + 50, modalY + 175);
    ctx.lineTo(modalX + modalWidth - 50, modalY + 175);
    ctx.strokeStyle = "#c6a664";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 8. Call to Action (The "Button" Area)
    const btnX = canvas.width / 2 - 80;
    const btnY = modalY + 190;
    const btnW = 160;
    const btnH = 35;

    ctx.fillStyle = "#d4af37"; // Gold button background
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 8);
    ctx.fill();

    ctx.fillStyle = "#5b3214"; // Text color
    ctx.font = "bold 16px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("PLAY AGAIN", canvas.width / 2, btnY + 24);

    ctx.restore();
  }
}

function drawPocketAnimations() {
  for (let i = pocketedAnimations.length - 1; i >= 0; i--) {
    let anim = pocketedAnimations[i];

    ctx.save();

    if (!anim.isQuietFoul) {
      ctx.shadowBlur = 35 * anim.opacity;
      ctx.shadowColor = anim.isFoul
        ? "rgba(255, 10, 10, 1)"
        : "rgba(255, 220, 0, 1)";

      ctx.beginPath();
      ctx.arc(
        anim.x,
        anim.y,
        anim.initialRadius + 32 * (1 - anim.opacity),
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = anim.isFoul
        ? `rgba(255, 50, 50, ${anim.opacity * 0.7})`
        : `rgba(255, 235, 50, ${anim.opacity * 0.7})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (anim.drawPiece) {
      ctx.globalAlpha = anim.opacity;
      ctx.beginPath();
      ctx.arc(anim.x, anim.y, Math.max(0, anim.currentRadius), 0, Math.PI * 2);
      ctx.fillStyle = anim.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.stroke();
    }

    if (!anim.isQuietFoul) {
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.fillStyle = anim.isFoul ? "#ff3333" : "#ffee55";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.fillText(anim.scoreText, anim.x, anim.textY);
    }

    ctx.restore();

    anim.currentRadius -= 0.25;
    anim.opacity -= 0.015;
    anim.textY -= 0.8;

    if (anim.opacity <= 0 || anim.currentRadius <= 0) {
      pocketedAnimations.splice(i, 1);
    }
  }
}

board.onload = function () {
  createCoins();
  draw();
};

// DRAGGING
let draggingBottom = false;
let draggingTop = false;

canvas.addEventListener("mousedown", function (e) {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let dx = mouseX - striker.x;
  let dy = mouseY - striker.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  let dxTop = mouseX - topStriker.x;
  let dyTop = mouseY - topStriker.y;
  let topDistance = Math.sqrt(dxTop * dxTop + dyTop * dyTop);

  if (
    distance < striker.radius &&
    currentTurn === "bottom" &&
    !turnSwitchPending
  )
    draggingBottom = true;
  if (
    topDistance < topStriker.radius &&
    currentTurn === "top" &&
    !turnSwitchPending
  )
    draggingTop = true;
});

canvas.addEventListener("mouseup", function () {
  draggingBottom = false;
  draggingTop = false;
});

canvas.addEventListener("mousemove", function (e) {
  if (gameOver) return;
  if (!draggingBottom && !draggingTop) return;

  const rect = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;

  const strikerRef = draggingBottom ? striker : topStriker;
  const minDist = strikerRef.radius + r;

  for (let coin of coins) {
    const dy = strikerRef.y - coin.y;

    if (Math.abs(dy) < minDist) {
      const maxDx = Math.sqrt(minDist * minDist - dy * dy);

      const leftBlockedBound = coin.x - maxDx;
      const rightBlockedBound = coin.x + maxDx;

      if (mouseX > leftBlockedBound && mouseX < rightBlockedBound) {
        if (strikerRef.x <= leftBlockedBound) {
          mouseX = leftBlockedBound;
        } else if (strikerRef.x >= rightBlockedBound) {
          mouseX = rightBlockedBound;
        } else {
          mouseX =
            mouseX - leftBlockedBound < rightBlockedBound - mouseX
              ? leftBlockedBound
              : rightBlockedBound;
        }
      }
    }
  }

  if (mouseX < leftWall + 90) mouseX = leftWall + 90;
  if (mouseX > rightWall - 90) mouseX = rightWall - 90;

  strikerRef.x = mouseX;
  draw();
});

// AIMING SYSTEM CONFIG
const aimState = {
  bottom: {
    aiming: false,
    aimX: 0,
    aimY: 0,
    power: 0,
    constrainedAngle: 0,
  },
  top: {
    aiming: false,
    aimX: 0,
    aimY: 0,
    power: 0,
    constrainedAngle: 0,
  },
};

let activeAiming = null;
const MAX_POWER = 90;
let currentTurn = "bottom";
let turnSwitchPending = false;

// SYSTEM GAME STATES
let scoredThisTurn = false;
let queenWaitingForCover = false;
let queenPocketedThisTurn = false;
let coverPocketedThisTurn = false;
let strikerPocketedThisTurn = false;
let topStrikerPocketedThisTurn = false;

canvas.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

canvas.addEventListener("mousedown", function (e) {
  if (e.button !== 2 || turnSwitchPending) return;

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

const RAD_20 = (20 * Math.PI) / 180;
const RAD_160 = (160 * Math.PI) / 180;

canvas.addEventListener("mousemove", function (e) {
  if (!activeAiming) return;
  const state = aimState[activeAiming];
  if (!state.aiming) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const strikerRef = activeAiming === "bottom" ? striker : topStriker;

  let dx = mouseX - strikerRef.x;
  let dy = mouseY - strikerRef.y;
  let shotAngle = Math.atan2(dy, dx);

  if (activeAiming === "bottom") {
    let upwardAngle = -shotAngle;
    if (upwardAngle < 0 || upwardAngle > Math.PI) {
      upwardAngle = dx > 0 ? RAD_20 : RAD_160;
    } else {
      if (upwardAngle < RAD_20) upwardAngle = RAD_20;
      if (upwardAngle > RAD_160) upwardAngle = RAD_160;
    }
    state.constrainedAngle = -upwardAngle;
  } else {
    let downwardAngle = shotAngle;
    if (downwardAngle < 0 || downwardAngle > Math.PI) {
      downwardAngle = dx > 0 ? RAD_20 : RAD_160;
    } else {
      if (downwardAngle < RAD_20) downwardAngle = RAD_20;
      if (downwardAngle > RAD_160) downwardAngle = RAD_160;
    }
    state.constrainedAngle = downwardAngle;
  }

  const dist = Math.sqrt(dx * dx + dy * dy);
  state.power = Math.min(dist, MAX_POWER);

  state.aimX = strikerRef.x + Math.cos(state.constrainedAngle) * state.power;
  state.aimY = strikerRef.y + Math.sin(state.constrainedAngle) * state.power;
});

document.addEventListener("click", function () {
  if (!activeAiming) return;
  const state = aimState[activeAiming];
  if (!state.aiming) return;

  const strikerRef = activeAiming === "bottom" ? striker : topStriker;
  const angle = state.constrainedAngle;
  const speed = state.power * 0.22;

  // 2. LAUNCH PHYSICS
  strikerRef.vx = Math.cos(angle) * speed;
  strikerRef.vy = Math.sin(angle) * speed;

  state.aiming = false;
  activeAiming = null;
  strikerReturned = false;
  topStrikerReturned = false;
  turnSwitchPending = true;

  scoredThisTurn = false;
  queenPocketedThisTurn = false;
  coverPocketedThisTurn = false;
  strikerPocketedThisTurn = false;
  topStrikerPocketedThisTurn = false;
});
function drawAimFor(strikerRef, state) {
  if (currentTurn === "bottom" && strikerPocketedThisTurn) return;
  if (currentTurn === "top" && topStrikerPocketedThisTurn) return;

  ctx.save();
  const angle = state.constrainedAngle;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  // Hard cap on power calculation to keep things professional
  const maxClampedPower = Math.min(state.power, 65);

  // FIX: Tightened the circle scaling factor (0.4) so it matches the power perfectly without ballooning
  const circleRadius = 24 + maxClampedPower * 0.4;

  // Forward path length remains tight and proportional
  const forwardPathLength = 50 + maxClampedPower * 0.65;

  // Coordinate positions along the shot vector
  const arrowBaseX = strikerRef.x + dx * (circleRadius - 16);
  const arrowTipX = strikerRef.x + dx * circleRadius;
  const arrowBaseY = strikerRef.y + dy * (circleRadius - 16);
  const arrowTipY = strikerRef.y + dy * circleRadius;

  // 2. DRAW THE LARGE BACKWARD/DRAG CIRCLE
  ctx.beginPath();
  ctx.arc(strikerRef.x, strikerRef.y, circleRadius, 0, Math.PI * 2);
  ctx.setLineDash([2, 4]);
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 3. DRAW THE BACKWARD DOTTED TRAIL
  ctx.beginPath();
  ctx.moveTo(strikerRef.x, strikerRef.y);
  ctx.lineTo(
    strikerRef.x - dx * circleRadius,
    strikerRef.y - dy * circleRadius,
  );
  ctx.setLineDash([2, 5]);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. DRAW THE STICK / SHAFT HOLDING THE ARROW
  ctx.beginPath();
  ctx.moveTo(strikerRef.x, strikerRef.y);
  ctx.lineTo(arrowBaseX, arrowBaseY);

  ctx.setLineDash([]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineCap = "round";
  ctx.stroke();

  // Thin background outline for the stick shaft
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
  ctx.globalCompositeOperation = "destination-over";
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";

  // 5. DRAW THE SOLID GRADIENT ARROWHEAD
  const arrowheadWidth = 6;
  const sideAngleX = Math.cos(angle + Math.PI / 2);
  const sideAngleY = Math.sin(angle + Math.PI / 2);

  const baseLeftX = arrowBaseX + sideAngleX * arrowheadWidth;
  const baseLeftY = arrowBaseY + sideAngleY * arrowheadWidth;
  const baseRightX = arrowBaseX - sideAngleX * arrowheadWidth;
  const baseRightY = arrowBaseY - sideAngleY * arrowheadWidth;

  ctx.beginPath();
  ctx.moveTo(baseLeftX, baseLeftY);
  ctx.lineTo(arrowTipX, arrowTipY);
  ctx.lineTo(baseRightX, baseRightY);
  ctx.closePath();

  const arrowGrad = ctx.createLinearGradient(
    arrowBaseX,
    arrowBaseY,
    arrowTipX,
    arrowTipY,
  );

  arrowGrad.addColorStop(0, "#e65100");
  arrowGrad.addColorStop(0.5, "#ffb300");
  arrowGrad.addColorStop(1, "#fff200");
  ctx.fillStyle = arrowGrad;
  ctx.fill();

  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 6. DRAW THE REFINED SMALLER FORWARD DOTS
  let currentX = arrowTipX;
  let currentY = arrowTipY;
  let runDx = dx;
  let runDy = dy;

  let distanceTravelled = 0;
  const stepSize = 12;

  while (distanceTravelled < forwardPathLength) {
    currentX += runDx * stepSize;
    currentY += runDy * stepSize;
    distanceTravelled += stepSize;

    let bounced = false;
    if (currentX - strikerRef.radius <= leftWall) {
      currentX = leftWall + strikerRef.radius;
      runDx *= -1;
      bounced = true;
    } else if (currentX + strikerRef.radius >= rightWall) {
      currentX = rightWall - strikerRef.radius;
      runDx *= -1;
      bounced = true;
    }

    if (currentY - strikerRef.radius <= topWall) {
      currentY = topWall + strikerRef.radius;
      runDy *= -1;
      bounced = true;
    } else if (currentY + strikerRef.radius >= bottomWall) {
      currentY = bottomWall - strikerRef.radius;
      runDy *= -1;
      bounced = true;
    }

    // FIX: Reduced dot radius sizing rules to make them look much smaller, subtle, and clean
    const progressRatio = distanceTravelled / forwardPathLength;
    const dotRadius = 1.2 + progressRatio * 1.0;

    ctx.beginPath();
    ctx.arc(currentX, currentY, dotRadius, 0, Math.PI * 2);

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 1;
    ctx.fill();
  }

  ctx.restore();
}

function updatePiece(piece) {
  piece.x += piece.vx;
  piece.y += piece.vy;
  piece.vx *= 0.985;
  piece.vy *= 0.985;

  if (Math.abs(piece.vx) < 0.05) piece.vx = 0;
  if (Math.abs(piece.vy) < 0.05) piece.vy = 0;

  if (piece.x - piece.radius < leftWall) {
    piece.x = leftWall + piece.radius;
    piece.vx *= -1;
  }
  if (piece.x + piece.radius > rightWall) {
    piece.x = rightWall - piece.radius;
    piece.vx *= -1;
  }
  if (piece.y - piece.radius < topWall) {
    piece.y = topWall + piece.radius;
    piece.vy *= -1;
  }
  if (piece.y + piece.radius > bottomWall) {
    piece.y = bottomWall - piece.radius;
    piece.vy *= -1;
  }
}

function resolveCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distanceSq = dx * dx + dy * dy;
  const minDistance = a.radius + b.radius;

  if (distanceSq >= minDistance * minDistance) return;

  const distance = Math.sqrt(distanceSq);
  if (distance === 0) return;

  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = minDistance - distance;
  const separationFactor = 0.5;

  a.x -= nx * overlap * separationFactor;
  a.y -= ny * overlap * separationFactor;
  b.x += nx * overlap * separationFactor;
  b.y += ny * overlap * separationFactor;

  const dvx = a.vx - b.vx;
  const dvy = a.vy - b.vy;
  const impactSpeed = dvx * nx + dvy * ny;

  if (impactSpeed < 0) return;

  const restitution = 0.85;
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
  const activeStriker = currentTurn === "bottom" ? striker : topStriker;
  const activeStrikerPocketed =
    currentTurn === "bottom"
      ? strikerPocketedThisTurn
      : topStrikerPocketedThisTurn;

  // Update active striker physics and check pocket
  if (!activeStrikerPocketed) {
    updatePiece(activeStriker);
    for (let pocket of pockets) {
      if (
        Math.hypot(activeStriker.x - pocket.x, activeStriker.y - pocket.y) <
        POCKET_RADIUS
      ) {
        const activePlayer = currentTurn === "bottom" ? player1 : player2;
        let isQuiet = false;

        if (
          activePlayer.score > 0 ||
          activePlayer.coinsPocketed.white > 0 ||
          activePlayer.coinsPocketed.black > 0
        ) {
          activePlayer.score -= 5;
          if (activePlayer.score < 0) activePlayer.score = 0;

          if (activePlayer.coinsPocketed.black > 0) {
            activePlayer.coinsPocketed.black--;
            coins.push(new Coin(cx, cy, r, "black"));
          } else if (activePlayer.coinsPocketed.white > 0) {
            activePlayer.coinsPocketed.white--;
            activePlayer.coinsPocketed.black++;
            coins.push(new Coin(cx, cy, r, "white"));

            for (let i = 0; i < coins.length; i++) {
              if (coins[i].color === "black") {
                coins.splice(i, 1);
                break;
              }
            }
          }
        } else {
          isQuiet = true;
        }

        if (currentTurn === "bottom") strikerPocketedThisTurn = true;
        else topStrikerPocketedThisTurn = true;

        showNotification("-5 PENALTY", "#ff3333", "Striker pocketed", true);

        pocketedAnimations.push({
          x: pocket.x,
          y: pocket.y,
          textY: pocket.y - 12,
          scoreText: "-5",
          initialRadius: activeStriker.radius,
          currentRadius: activeStriker.radius,
          color: activeStriker.color,
          drawPiece: true,
          isFoul: true,
          isQuietFoul: isQuiet,
          opacity: 1.0,
        });

        activeStriker.vx = 0;
        activeStriker.vy = 0;
        break;
      }
    }
  }

  // Coin movement and pocketing
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    updatePiece(coin);

    let isPocketed = false;
    let targetPocket = null;
    for (let pocket of pockets) {
      if (Math.hypot(coin.x - pocket.x, coin.y - pocket.y) < POCKET_RADIUS) {
        isPocketed = true;
        targetPocket = pocket;
        break;
      }
    }

    if (isPocketed) {
      const activePlayer = currentTurn === "bottom" ? player1 : player2;

      if (coin.color === "white") {
        activePlayer.coinsPocketed.white++;
        activePlayer.score += 10;
        showNotification("+10", "#4ade80", "White Coin");
        scoredThisTurn = true;
        coverPocketedThisTurn = true;
      } else if (coin.color === "black") {
        activePlayer.coinsPocketed.black++;
        activePlayer.score += 5;
        showNotification("+5", "#4ade80", "Black Coin");
        scoredThisTurn = true;
        coverPocketedThisTurn = true;
      } else if (coin.color === "#f60a0a") {
        activePlayer.coinsPocketed.red++;
        activePlayer.score += 25;
        showNotification("+25", "#facc15", "QUEEN POCKETED!", false);
        scoredThisTurn = true;
        queenPocketedThisTurn = true;
      }

      pocketedAnimations.push({
        x: targetPocket.x,
        y: targetPocket.y,
        textY: targetPocket.y - 12,
        scoreText: "",
        initialRadius: coin.radius,
        currentRadius: coin.radius,
        color: coin.color,
        drawPiece: true,
        isFoul: false,
        opacity: 1.0,
      });

      coins.splice(i, 1);
      continue;
    }
  }

  // Collisions
  if (!activeStrikerPocketed) {
    for (let coin of coins) resolveCollision(activeStriker, coin);
  }
  for (let i = 0; i < coins.length; i++) {
    for (let j = i + 1; j < coins.length; j++) {
      resolveCollision(coins[i], coins[j]);
    }
  }

  const everythingStopped =
    strikerStopped() && topStrikerStopped() && coinsStopped();

  // === TURN RESOLUTION ===
  if (everythingStopped && turnSwitchPending) {
    const activePlayer = currentTurn === "bottom" ? player1 : player2;
    const currentStrikerFouled =
      currentTurn === "bottom"
        ? strikerPocketedThisTurn
        : topStrikerPocketedThisTurn;

    // Queen & Cover Logic
    if (queenPocketedThisTurn && !currentStrikerFouled) {
      if (coverPocketedThisTurn) {
        showNotification("QUEEN COVERED!", "#4ade80", "Excellent Play");
      } else {
        activePlayer.score = Math.max(0, activePlayer.score - 25);
        if (activePlayer.coinsPocketed.red > 0)
          activePlayer.coinsPocketed.red--;
        showNotification("-25 PENALTY", "#ff3333", "Queen not covered", true);
        coins.push(new Coin(cx, cy, r, "#f60a0a"));
      }
      queenWaitingForCover = false;
    }

    if (queenWaitingForCover && !queenPocketedThisTurn) {
      queenWaitingForCover = false;
    }

    // Endgame Queen Rule (Must pocket Queen first)
    if (
      !queenPocketedThisTurn &&
      coverPocketedThisTurn &&
      !currentStrikerFouled
    ) {
      const hasQueenOnBoard = coins.some((c) => c.color === "#f60a0a");
      if (hasQueenOnBoard && coins.length <= 1) {
        activePlayer.score = Math.max(0, activePlayer.score - 5);
        coins.push(new Coin(cx, cy, r, "black"));

        if (activePlayer.coinsPocketed.black > 0) {
          activePlayer.coinsPocketed.black--;
        }

        showNotification(
          "-5 PENALTY",
          "#ff3333",
          "Must pocket Queen first",
          true,
        );

        pocketedAnimations.push({
          x: pockets[0].x,
          y: pockets[0].y,
          textY: pockets[0].y - 20,
          scoreText: "-5",
          initialRadius: r,
          currentRadius: r,
          color: "#222",
          drawPiece: false,
          isFoul: true,
          opacity: 1.0,
        });
      }
    }

    // === IMPORTANT: Reset Strikers to original positions ===
    resetStriker(striker, true);
    resetStriker(topStriker, false);

    // Switch turn only if fouled or no score made
    if (currentStrikerFouled || !scoredThisTurn) {
      currentTurn = currentTurn === "bottom" ? "top" : "bottom";
    }

    // Game Over Check
    if (coins.length === 0 && !gameOver) {
      gameOver = true;
    }

    // Reset all turn flags
    strikerPocketedThisTurn = false;
    topStrikerPocketedThisTurn = false;
    turnSwitchPending = false;
    scoredThisTurn = false;
    queenPocketedThisTurn = false;
    coverPocketedThisTurn = false;
  }
}
function strikerStopped() {
  return (
    strikerPocketedThisTurn ||
    (Math.abs(striker.vx) < 0.05 && Math.abs(striker.vy) < 0.05)
  );
}
function topStrikerStopped() {
  return (
    topStrikerPocketedThisTurn ||
    (Math.abs(topStriker.vx) < 0.05 && Math.abs(topStriker.vy) < 0.05)
  );
}
function coinsStopped() {
  for (let coin of coins) {
    if (Math.abs(coin.vx) > 0.05 || Math.abs(coin.vy) > 0.05) return false;
  }
  return true;
}

function gameLoop() {
  updateGame();
  draw();
  if (aimState.bottom.aiming) drawAimFor(striker, aimState.bottom);
  if (aimState.top.aiming) drawAimFor(topStriker, aimState.top);
  requestAnimationFrame(gameLoop);
  canvas.addEventListener("click", function (e) {
    if (!gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Define the button coordinates used in the draw function
    const modalY = canvas.height / 2 - 125; // 250/2 = 125
    const btnX = canvas.width / 2 - 80;
    const btnY = modalY + 190;
    const btnW = 160;
    const btnH = 35;

    // Check if click is inside the button
    if (
      mouseX >= btnX &&
      mouseX <= btnX + btnW &&
      mouseY >= btnY &&
      mouseY <= btnY + btnH
    ) {
      resetGame();
    }
  });
}

function resetGame() {
  // Reset players
  player1.score = 0;
  player1.coinsPocketed = { white: 0, black: 0, red: 0 };
  player2.score = 0;
  player2.coinsPocketed = { white: 0, black: 0, red: 0 };

  // Reset board/coins
  createCoins();

  // Reset Game State Flags
  gameOver = false;
  currentTurn = "bottom";
  scoredThisTurn = false;
  queenWaitingForCover = false;
  strikerPocketedThisTurn = false;
  topStrikerPocketedThisTurn = false;

  // Reset Strikers
  resetStriker(striker, true);
  resetStriker(topStriker, false);

  // Clear any leftover animations
  pocketedAnimations.length = 0;
}

// 2. DRAW PLAYER PROFILES
function drawPlayerProfiles() {
  const cardWidth = 210;
  const cardHeight = 84;

  const leftX = boardX - cardWidth - 20;
  const rightX = boardX + boardWidth + 20;

  const profiles = [
    {
      player: player1,
      x: leftX,
      y: 100,
      turn: "bottom",
      mainCoinColor: "#f4f4f4",
    },
    { player: player2, x: rightX, y: 100, turn: "top", mainCoinColor: "#222" },
  ];

  profiles.forEach((profile) => {
    const { player, x, y, turn, mainCoinColor } = profile;
    const active = currentTurn === turn;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;

    const gradient = ctx.createLinearGradient(x, y, x, y + cardHeight);
    gradient.addColorStop(0, "#f7dfb7");
    gradient.addColorStop(1, "#e8c08d");
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardHeight, 15);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = active ? "#e01111" : "#5b3214";

    ctx.stroke();

    const avatarX = x + 34;
    const avatarY = y + 42;
    const outerRadius = 22;

    ctx.beginPath();
    ctx.arc(avatarX, avatarY, outerRadius, 0, Math.PI * 2);

    const avatarGradient = ctx.createRadialGradient(
      avatarX - 6,
      avatarY - 6,
      2,
      avatarX,
      avatarY,
      outerRadius,
    );
    if (mainCoinColor === "#f4f4f4") {
      avatarGradient.addColorStop(0, "#ffffff");
      avatarGradient.addColorStop(1, "#d8d8d8");
    } else {
      avatarGradient.addColorStop(0, "#555");
      avatarGradient.addColorStop(1, "#111");
    }
    ctx.fillStyle = avatarGradient;
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#6b3d1d";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 13, 0, Math.PI * 2);
    ctx.strokeStyle = mainCoinColor === "#f4f4f4" ? "#bbb" : "#666";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#3d1e10";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.fillText(player.name, x + 66, y + 25);

    ctx.fillStyle = "#6b3d1d";
    ctx.font = "10px Arial";
    ctx.fillText("SCORE", x + 66, y + 43);

    ctx.fillStyle = "#8b0000";
    ctx.font = "bold 26px Arial";
    ctx.fillText(player.score.toString().padStart(2, "0"), x + 66, y + 71);

    const displayCoins = [
      {
        color: "#ffffff",
        stroke: "#5b3214",
        count: player.coinsPocketed.white,
      },
      {
        color: "#222222",
        stroke: "#5b3214",
        count: player.coinsPocketed.black,
      },
      { color: "#f60a0a", stroke: "#5b3214", count: player.coinsPocketed.red },
    ];

    const startX = x + 138;
    const coinY = y + 42;
    const coinRadius = 8;
    const spacing = 22;

    displayCoins.forEach((coinCfg, i) => {
      const cx = startX + i * spacing;

      ctx.beginPath();
      ctx.arc(cx, coinY, coinRadius, 0, Math.PI * 2);
      ctx.fillStyle = coinCfg.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = coinCfg.stroke;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, coinY, coinRadius * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle =
        coinCfg.color === "#222222" ? "#555" : "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#3d1e10";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(coinCfg.count.toString(), cx, y + 66);
    });

    ctx.restore();
  });

  const centerBoxWidth = 200;
  const centerBoxHeight = 62;
  const centerX = canvas.width / 2 - centerBoxWidth / 2;
  const centerY = 50;

  ctx.save();
  const centerGradient = ctx.createLinearGradient(
    centerX,
    centerY,
    centerX,
    centerY + centerBoxHeight,
  );
  centerGradient.addColorStop(0, "#4a2a18");
  centerGradient.addColorStop(1, "#2a140b");
  ctx.fillStyle = centerGradient;

  ctx.beginPath();
  ctx.roundRect(centerX, centerY, centerBoxWidth, centerBoxHeight, 14);
  ctx.fill();

  ctx.strokeStyle = "#7a4a29";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#f7d9a5";
  ctx.textAlign = "center";
  ctx.font = "bold 26px Georgia";
  ctx.fillText("CARROM", canvas.width / 2, centerY + 28);

  ctx.fillStyle = "#ff4d2d";
  ctx.font = "bold 13px Arial";
  ctx.fillText("2 PLAYERS", canvas.width / 2, centerY + 48);
  ctx.restore();
}
// ==================== NOTIFICATION SYSTEM ====================
const notifications = [];

class Notification {
  constructor(text, color, subText = "", isFoul = false) {
    this.text = text;
    this.subText = subText;
    this.color = color;
    this.opacity = 1.0;
    this.y = 185;
    this.life = 160;
    this.isFoul = isFoul;
    // detect special types by text content
    this.isQueen = text.includes("25") && !isFoul;
    this.isCover = text === "QUEEN COVERED!";
    this.isQueenPenalty = text.includes("25") && isFoul;
  }
}

function showNotification(text, color, subText = "", isFoul = false) {
  notifications.push(new Notification(text, color, subText, isFoul));
}

function drawNotifications() {
  for (let i = notifications.length - 1; i >= 0; i--) {
    const note = notifications[i];
    const ncx = canvas.width / 2;
    const w = 290,
      h = 76,
      rad = 20;
    const x = ncx - w / 2,
      y = note.y - 14;

    ctx.save();
    ctx.globalAlpha = note.opacity;

    // — Theme —
    let glowCol, glassBg, borderCol, scoreCol, iconChar, labelText;
    if (note.isCover) {
      glowCol = "rgba(56,182,255,0.35)";
      glassBg = "rgba(0,50,90,0.55)";
      borderCol = "rgba(56,220,255,0.25)";
      scoreCol = "#38dfff";
      iconChar = "✔";
      labelText = "GOOD PLAY";
    } else if (note.isQueenPenalty) {
      glowCol = "rgba(255,26,110,0.35)";
      glassBg = "rgba(80,0,30,0.55)";
      borderCol = "rgba(255,80,160,0.25)";
      scoreCol = "#ff6eb0";
      iconChar = "♛";
      labelText = "QUEEN RETURNED";
    } else if (note.isQueen) {
      glowCol = "rgba(255,210,0,0.35)";
      glassBg = "rgba(80,55,0,0.55)";
      borderCol = "rgba(255,220,0,0.25)";
      scoreCol = "#ffe066";
      iconChar = "♛";
      labelText = "COVER NEXT SHOT";
    } else if (note.isFoul) {
      glowCol = "rgba(255,60,60,0.35)";
      glassBg = "rgba(80,0,0,0.55)";
      borderCol = "rgba(255,80,80,0.25)";
      scoreCol = "#ff7070";
      iconChar = "✕";
      labelText = "FOUL · PENALTY";
    } else {
      glowCol = "rgba(0,255,100,0.35)";
      glassBg = "rgba(0,70,25,0.55)";
      borderCol = "rgba(78,255,122,0.25)";
      scoreCol = "#4eff7a";
      iconChar = "✦";
      labelText = "SCORED";
    }

    // — Outer glow bloom —
    ctx.shadowColor = glowCol.replace("0.35", "0.6");
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, rad);
    ctx.fillStyle = glassBg;
    ctx.fill();
    ctx.shadowBlur = 0;

    // — Glass border —
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, rad);
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // — Top shine (glass effect) —
    const shineGrad = ctx.createLinearGradient(x, y, x, y + h * 0.5);
    shineGrad.addColorStop(0, "rgba(255,255,255,0.12)");
    shineGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.roundRect(x, y, w, h * 0.5, [rad, rad, 0, 0]);
    ctx.fillStyle = shineGrad;
    ctx.fill();

    // — Icon circle —
    const iconX = x + 52,
      iconY = y + h / 2;
    ctx.shadowColor = scoreCol;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 21, 0, Math.PI * 2);
    ctx.fillStyle = scoreCol + "18";
    ctx.fill();
    ctx.strokeStyle = scoreCol + "55";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = "bold 19px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = scoreCol;
    ctx.shadowBlur = 10;
    ctx.fillStyle = scoreCol;
    ctx.fillText(iconChar, iconX, iconY + 7);
    ctx.shadowBlur = 0;

    // — Divider —
    ctx.beginPath();
    ctx.moveTo(x + 83, y + 16);
    ctx.lineTo(x + 83, y + h - 16);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // — Score / Title text —
    ctx.textAlign = "left";
    const isCoverType = note.isCover;
    ctx.shadowColor = scoreCol;
    ctx.shadowBlur = 12;
    ctx.fillStyle = scoreCol;
    ctx.font = isCoverType ? "bold 19px Arial" : "bold 26px Arial";
    ctx.fillText(
      isCoverType ? "Queen Covered" : note.text,
      x + 97,
      y + (isCoverType ? 35 : 37),
    );
    ctx.shadowBlur = 0;

    // — Sub text —
    ctx.font = "500 12.5px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(note.subText || "", x + 97, y + 53);

    // — Label —
    ctx.font = "9px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(labelText, x + 97, y + 67);

    ctx.restore();

    // — Animate —
    note.life--;
    const fadeIn = Math.min(1, (160 - note.life) / 10);
    const fadeOut = Math.min(1, note.life / 30);
    note.opacity = Math.min(fadeIn, fadeOut);
    note.y -= 0.28;
    if (note.life <= 0) notifications.splice(i, 1);
  }
}
gameLoop();
