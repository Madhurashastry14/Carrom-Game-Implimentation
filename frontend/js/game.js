const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// ===================================================================
// 1. PLAYER OBJECTS
// ===================================================================
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

// ANIMATION CONTAINER FOR POCKETED COINS & FLOATING TEXT
const pocketedAnimations = [];

// ===================================================================
// POCKET BOUNDS CONFIGURATION
// ===================================================================
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

    // Memory snapshots for absolute rollbacks
    this.snapshotX = x;
    this.snapshotY = y;
  }
}

let coins = [];
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

    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = coin.color === "white" ? "#ddd" : "#555";
    ctx.stroke();
  }

  // DRAW GLOW, SHRINKING PIECES, AND SCORE POPUPS
  drawPocketAnimations();

  // DRAW BOTTOM STRIKER
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

  // DRAW TOP STRIKER
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

  // Show Warning Overlay text if line currently aims through a restricted zone piece
  const currentState = aimState[currentTurn];
  if (currentState.aiming && currentState.isTargetingBlocked) {
    ctx.save();
    ctx.fillStyle = "rgba(240, 10, 10, 0.95)";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "⚠️ ILLEGAL DIRECT HIT! USE REBOUND WALLL SHOTS",
      canvas.width / 2,
      currentTurn === "bottom" ? bottomWall - 115 : topWall + 100,
    );
    ctx.restore();
  }
}

// RENDER GLOWS AND FLOATING SCORES
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
    isTargetingBlocked: false,
  },
  top: {
    aiming: false,
    aimX: 0,
    aimY: 0,
    power: 0,
    constrainedAngle: 0,
    isTargetingBlocked: false,
  },
};

let activeAiming = null;
const MAX_POWER = 90;
let strikerReturned = false;
let topStrikerReturned = false;
let currentTurn = "bottom";
let turnSwitchPending = false;

// SYSTEM GAME STATES
let scoredThisTurn = false;
let queenWaitingForCover = false;
let queenPocketedThisTurn = false;
let coverPocketedThisTurn = false;
let strikerPocketedThisTurn = false;
let topStrikerPocketedThisTurn = false;

// Illegal tracking variables
let shotViolatedDirectHitRule = false;
let preShotBoardSnapshot = [];
let preShotPlayer1Score = 0;
let preShotPlayer2Score = 0;
let preShotPlayer1Coins = {};
let preShotPlayer2Coins = {};

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
  state.isTargetingBlocked = false;
});

const RAD_20 = (20 * Math.PI) / 180;
const RAD_160 = (160 * Math.PI) / 180;

// HELPER: Check if a coin is sitting in the active player's arrow loop areas
function isCoinInRestrictedZone(coin, side) {
  if (side === "bottom") {
    // Left Loop Boundary
    const blDx = coin.x - (leftWall + 68);
    const blDy = coin.y - (bottomWall - 62);
    if (Math.sqrt(blDx * blDx + blDy * blDy) < 36) return true;

    // Right Loop Boundary
    const brDx = coin.x - (rightWall - 68);
    const brDy = coin.y - (bottomWall - 62);
    if (Math.sqrt(brDx * brDx + brDy * brDy) < 36) return true;
  } else {
    // Top-Left Loop Boundary
    const tlDx = coin.x - (leftWall + 68);
    const tlDy = coin.y - (topWall + 62);
    if (Math.sqrt(tlDx * tlDx + tlDy * tlDy) < 36) return true;

    // Top-Right Loop Boundary
    const trDx = coin.x - (rightWall - 68);
    const trDy = coin.y - (topWall + 62);
    if (Math.sqrt(trDx * trDx + trDy * trDy) < 36) return true;
  }
  return false;
}

// HELPER: Raycast logic to see if aiming vector hits a specific coin directly
function isAimIntersectingCoin(strikerRef, angle, coin) {
  const rx = Math.cos(angle);
  const ry = Math.sin(angle);

  const cx_val = coin.x - strikerRef.x;
  const cy_val = coin.y - strikerRef.y;

  const projection = cx_val * rx + cy_val * ry;
  if (projection < 0) return false;

  const closestX = strikerRef.x + rx * projection;
  const closestY = strikerRef.y + ry * projection;
  const distSq =
    (coin.x - closestX) * (coin.x - closestX) +
    (coin.y - closestY) * (coin.y - closestY);

  return (
    distSq <
    (coin.radius + strikerRef.radius + 3) *
      (coin.radius + strikerRef.radius + 3)
  );
}

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

  // Pre-calculate if this ray line creates an illegal direct strike foul path
  state.isTargetingBlocked = false;
  for (let coin of coins) {
    if (isCoinInRestrictedZone(coin, activeAiming)) {
      if (isAimIntersectingCoin(strikerRef, state.constrainedAngle, coin)) {
        state.isTargetingBlocked = true;
        break;
      }
    }
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

  // 1. MEMORY SNAPSHOT EVERYTHING BEFORE APPLIYING FORCES
  shotViolatedDirectHitRule = state.isTargetingBlocked;

  preShotBoardSnapshot = coins.map((c) => ({
    x: c.x,
    y: c.y,
    radius: c.radius,
    color: c.color,
  }));

  preShotPlayer1Score = player1.score;
  preShotPlayer2Score = player2.score;
  preShotPlayer1Coins = { ...player1.coinsPocketed };
  preShotPlayer2Coins = { ...player2.coinsPocketed };

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

  const angle = state.constrainedAngle;
  const aimLength = 25 + state.power * 0.55;

  const endX = strikerRef.x + Math.cos(angle) * aimLength;
  const endY = strikerRef.y + Math.sin(angle) * aimLength;

  let limitedEndX = Math.max(leftWall, Math.min(rightWall, endX));
  let limitedEndY = Math.max(topWall, Math.min(bottomWall, endY));

  ctx.beginPath();
  ctx.moveTo(strikerRef.x, strikerRef.y);
  ctx.lineTo(limitedEndX, limitedEndY);

  // Highlight line deep red if targeted choice is a foul configuration
  ctx.strokeStyle = state.isTargetingBlocked
    ? "rgba(255, 0, 0, 0.95)"
    : "rgba(255,255,255,0.95)";
  ctx.lineWidth = 4;
  ctx.stroke();

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
  ctx.fillStyle = state.isTargetingBlocked ? "#ff0000" : strikerRef.color;
  ctx.fill();
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

  if (!activeStrikerPocketed) {
    updatePiece(activeStriker);

    for (let pocket of pockets) {
      const sdx = activeStriker.x - pocket.x;
      const sdy = activeStriker.y - pocket.y;
      const sDistSq = sdx * sdx + sdy * sdy;

      if (sDistSq < POCKET_RADIUS * POCKET_RADIUS) {
        const activePlayer = currentTurn === "bottom" ? player1 : player2;
        let isQuiet = false;

        if (activePlayer.score > 0) {
          activePlayer.score -= 5;
          if (activePlayer.score < 0) activePlayer.score = 0;

          if (activePlayer.coinsPocketed.black > 0) {
            activePlayer.coinsPocketed.black--;
            coins.push(new Coin(cx, cy, r, "black"));
          } else if (activePlayer.coinsPocketed.white > 0) {
            activePlayer.coinsPocketed.white--;
            activePlayer.coinsPocketed.black++;
            coins.push(new Coin(cx, cy, r, "black"));
          }
        } else {
          isQuiet = true;
        }

        if (currentTurn === "bottom") strikerPocketedThisTurn = true;
        else topStrikerPocketedThisTurn = true;

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

  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    updatePiece(coin);

    let isPocketed = false;
    let targetPocket = null;
    for (let pocket of pockets) {
      const pdx = coin.x - pocket.x;
      const pdy = coin.y - pocket.y;
      const distSq = pdx * pdx + pdy * pdy;

      if (distSq < POCKET_RADIUS * POCKET_RADIUS) {
        isPocketed = true;
        targetPocket = pocket;
        break;
      }
    }

    if (isPocketed) {
      const activePlayer = currentTurn === "bottom" ? player1 : player2;
      let addedPoints = "";

      if (coin.color === "white") {
        activePlayer.coinsPocketed.white++;
        activePlayer.score += 10;
        addedPoints = "+10";
        scoredThisTurn = true;
        if (queenWaitingForCover) coverPocketedThisTurn = true;
      } else if (coin.color === "black") {
        activePlayer.coinsPocketed.black++;
        activePlayer.score += 5;
        addedPoints = "+5";
        scoredThisTurn = true;
        if (queenWaitingForCover) coverPocketedThisTurn = true;
      } else if (coin.color === "#f60a0a") {
        activePlayer.coinsPocketed.red++;
        activePlayer.score += 25;
        addedPoints = "+25";
        scoredThisTurn = true;
        queenPocketedThisTurn = true;
      }

      pocketedAnimations.push({
        x: targetPocket.x,
        y: targetPocket.y,
        textY: targetPocket.y - 12,
        scoreText: addedPoints,
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

  if (!activeStrikerPocketed) {
    for (let coin of coins) {
      resolveCollision(activeStriker, coin);
    }
  }

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

  const everythingStopped =
    strikerStopped() && topStrikerStopped() && coinsStopped();

  if (everythingStopped && turnSwitchPending) {
    resetStriker(striker, true);
    strikerReturned = true;
    resetStriker(topStriker, false);
    topStrikerReturned = true;

    // ==========================================================
    // CRITICAL FIX: BOARD POSITION ROLLBACK ZONE ON DIRECT FOUL
    // ==========================================================
    if (shotViolatedDirectHitRule) {
      // Re-populate the whole active coins collection from pristine saved states
      coins = preShotBoardSnapshot.map((snap) => {
        let restoredCoin = new Coin(snap.x, snap.y, snap.radius, snap.color);
        restoredCoin.vx = 0;
        restoredCoin.vy = 0;
        return restoredCoin;
      });

      // Restore exact statistical numerical metrics
      player1.score = preShotPlayer1Score;
      player2.score = preShotPlayer2Score;
      player1.coinsPocketed = { ...preShotPlayer1Coins };
      player2.coinsPocketed = { ...preShotPlayer2Coins };

      // Switch turns immediately (The player loses their round entirely)
      currentTurn = currentTurn === "bottom" ? "top" : "bottom";
    } else {
      // Execute normal legitimate carrom round scoring updates
      const activePlayer = currentTurn === "bottom" ? player1 : player2;
      const currentStrikerFouled =
        currentTurn === "bottom"
          ? strikerPocketedThisTurn
          : topStrikerPocketedThisTurn;

      if (queenWaitingForCover) {
        if (coverPocketedThisTurn && !currentStrikerFouled) {
          queenWaitingForCover = false;
        } else {
          activePlayer.score -= 25;
          if (activePlayer.score < 0) activePlayer.score = 0;
          activePlayer.coinsPocketed.red--;
          queenWaitingForCover = false;
          coins.push(new Coin(cx, cy, r, "#f60a0a"));
        }
      }

      if (queenPocketedThisTurn && !currentStrikerFouled) {
        queenWaitingForCover = true;
      }

      if (currentStrikerFouled || !scoredThisTurn) {
        currentTurn = currentTurn === "bottom" ? "top" : "bottom";
      }
    }

    // Clean flag containers
    strikerPocketedThisTurn = false;
    topStrikerPocketedThisTurn = false;
    turnSwitchPending = false;
    shotViolatedDirectHitRule = false;
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
}

// ===================================================================
// 2. DRAW PLAYER PROFILES
// ===================================================================
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

    ctx.lineWidth = 2;
    ctx.strokeStyle = active ? "#ff4d2d" : "#5b3214";
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

gameLoop();
