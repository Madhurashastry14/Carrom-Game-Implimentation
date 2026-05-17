const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

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
const bottomWall = boardY + boardHeight - 20;

// BOARD CENTER
const cx = boardX + boardWidth / 2 + 2;
const cy = boardY + boardHeight / 2 - 27;

class Coin {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
}

const coins = [];

const r = 12;

// BOTTOM STRIKER
const striker = {
  x: cx,
  y: bottomWall - 100,
  radius: 12,
  color: "#ed7c0b",
  vx: 0,
  vy: 0,
};

// TOP STRIKER
const topStriker = {
  x: cx,
  y: topWall + 60,
  radius: 12,
  color: "#ed7c0b",
  vx: 0,
  vy: 0,
};

function createCoins() {
  const h = r * Math.sqrt(3);

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
    drawPlayerProfiles();
  }
  // DRAW BOTTOM STRIKER
  ctx.beginPath();

  ctx.arc(striker.x, striker.y, striker.radius, 0, Math.PI * 2);

  ctx.fillStyle = striker.color;

  ctx.fill();

  ctx.lineWidth = 2;

  ctx.strokeStyle = "black";

  ctx.stroke();

  //INNER RING
  ctx.beginPath();

  ctx.arc(striker.x, striker.y, striker.radius * 0.7, 0, Math.PI * 2);

  ctx.strokeStyle = striker.color === "white" ? "#ddd" : "#b64f0a";

  ctx.stroke();

  // DRAW TOP STRIKER
  ctx.beginPath();

  ctx.arc(topStriker.x, topStriker.y, topStriker.radius, 0, Math.PI * 2);

  ctx.fillStyle = topStriker.color;

  ctx.fill();

  ctx.lineWidth = 2;

  ctx.strokeStyle = "black";

  ctx.stroke();

  ctx.beginPath();

  ctx.arc(topStriker.x, topStriker.y, topStriker.radius * 0.7, 0, Math.PI * 2);

  ctx.strokeStyle = topStriker.color === "white" ? "#ddd" : "#b64f0a";

  ctx.stroke();
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

  if (distance < striker.radius) {
    draggingBottom = true;
  }

  if (topDistance < topStriker.radius) {
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
  bottom: {
    aiming: false,
    aimX: 0,
    aimY: 0,
    power: 0,
  },
  top: {
    aiming: false,
    aimX: 0,
    aimY: 0,
    power: 0,
  },
};

let activeAiming = null; // "bottom" or "top"
const MAX_POWER = 90;
let strikerReturned = false;

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

  if (bottomDist < 80) {
    activeAiming = "bottom";
  } else if (topDist < 80) {
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
canvas.addEventListener("click", function () {
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

let topStrikerReturned = false;

function resetStriker(piece, isBottom) {
  piece.vx = 0;
  piece.vy = 0;

  piece.x = cx;
  piece.y = isBottom ? bottomWall - 100 : topWall + 60;
}

function updateGame() {
  updatePiece(striker);
  updatePiece(topStriker);

  // reset only bottom striker (if you want asymmetry)
  if (strikerStopped() && !strikerReturned) {
    resetStriker(striker, true);
    strikerReturned = true;
  }

  if (topStrikerStopped() && !topStrikerReturned) {
    resetStriker(topStriker, false);
    topStrikerReturned = true;
  }
}

function strikerStopped() {
  return Math.abs(striker.vx) < 0.05 && Math.abs(striker.vy) < 0.05;
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
// --- PLAYER DATA ---
const player1 = { name: "PLAYER 1", score: 0, color: "#ed7c0b" };
const player2 = { name: "PLAYER 2", score: 0, color: "#ed7c0b" };

function drawPlayerProfiles() {
    const cardWidth = 155; 
    const cardHeight = 65;
    const padding = 25;
    const edgeSafety = 5; // Forces distance from canvas walls

    const profiles = [
        { 
            p: player1, 
            // Calculated X with a safety check to prevent left-side cutting
            x: Math.max(edgeSafety, boardX - cardWidth - padding), 
            y: boardY + boardHeight - cardHeight,
        },
        { 
            p: player2, 
            // Calculated X with a safety check to prevent right-side cutting
            x: Math.min(canvas.width - cardWidth - edgeSafety, boardX + boardWidth + padding), 
            y: boardY, 
        }
    ];

    profiles.forEach(profile => {
        const { p, x, y } = profile;

        ctx.save();
        
        // --- 1. THE CARD BODY ---
        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, cardHeight, 12);
        
        // Solid dark background for professional look
        ctx.fillStyle = "#111111"; 
        ctx.fill();

        // --- 2. THE NON-CUTTING STROKE ---
        // We draw the stroke slightly INSIDE the box (x+1, y+1) 
        // with a smaller width/height to ensure no edges are clipped
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
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
        ctx.fillText("SCORE: " + p.score.toString().padStart(2, '0'), x + cardWidth / 2, y + 48);
        
        ctx.restore();
    });
}