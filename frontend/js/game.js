const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const board = new Image();
board.src = "assets/board.jpeg";

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

const cx = 560;
const cy = 350;

// STRIKER
const striker = {
    x: 560,
    y: 500,
    radius: 12,
    color: "#ed7c0b",
    vx:0,
    vy:0
};

function createCoins() {

    const h = r * Math.sqrt(3);

    const pos = [

        // CENTER QUEEN
        { x: cx, y: cy, color: "#ed0b3c" },

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
        { x: cx - h, y: cy - 3 * r, color: "black" }
    ];


    coins.length = 0;

    for (let p of pos) {
        coins.push(
            new Coin(
                p.x,
                p.y,
                r,
                p.color
            )
        );
    }
}

function draw() {

    // CLEAR CANVAS
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // DRAW BOARD
    ctx.drawImage(
        board,
        320,
        140,
        480,
        480
    );

    // DRAW COINS
    for (let coin of coins) {

        ctx.beginPath();

        ctx.arc(
            coin.x,
            coin.y,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = coin.color;

        ctx.fill();

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        ctx.stroke();
    
        // INNER RING
        ctx.beginPath();

        ctx.arc(
            coin.x,
            coin.y,
            coin.radius * 0.7,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            coin.color === "white"
                ? "#ddd"
                : "#555";

        ctx.stroke();
    }

    // DRAW STRIKER
    ctx.beginPath();

    ctx.arc(
        striker.x,
        striker.y,
        striker.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = striker.color;

    ctx.fill();

    ctx.lineWidth = 2;

    ctx.strokeStyle = "black";

    ctx.stroke();

    ctx.beginPath();

        ctx.arc(
            striker.x,
            striker.y,
            striker.radius * 0.7,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            striker.color === "#ed7c0b"
                ? "#ca5e10"
                : "#555";

        ctx.stroke();
}

// LOAD BOARD
board.onload = function () {

    createCoins();

    draw();
};

// DRAGGING
let dragging = false;

canvas.addEventListener("mousedown", function (e) {

    const rect =
        canvas.getBoundingClientRect();

    const mouseX =
        e.clientX - rect.left;

    const mouseY =
        e.clientY - rect.top;

    const dx = mouseX - striker.x;
    const dy = mouseY - striker.y;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    if (distance < striker.radius) {

        dragging = true;
    }
});

canvas.addEventListener("mouseup", function () {

    dragging = false;
});

canvas.addEventListener("mousemove", function (e) {

    if (!dragging) return;

    const rect =
        canvas.getBoundingClientRect();

    let mouseX =
        e.clientX - rect.left;

    // LEFT LIMIT
    if (mouseX < 432) {
        mouseX = 432;
    }

    // RIGHT LIMIT
    if (mouseX > 694) {
        mouseX = 694;
    }

    striker.x = mouseX;

    draw();
});

//  AIMING SYSTEM

let aiming = false;
let aimX = 0;
let aimY = 0;
let power = 0;
const MAX_POWER = 90;
let strikerReturned = false;
// RIGHT CLICK TO START AIMING
// ===============================
// PROFESSIONAL TOGGLE AIM SYSTEM
// ===============================

// DISABLE RIGHT CLICK MENU
canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

// RIGHT CLICK = TOGGLE AIM
canvas.addEventListener("mousedown", function (e) {

    // RIGHT CLICK ONLY
    if (e.button !== 2) return;

    const rect =
        canvas.getBoundingClientRect();

    const mouseX =
        e.clientX - rect.left;

    const mouseY =
        e.clientY - rect.top;

    const dx = mouseX - striker.x;
    const dy = mouseY - striker.y;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    // CLICK NEAR STRIKER
    if (distance < 80) {

        // TOGGLE AIM
        aiming = !aiming;

        aimX = mouseX;
        aimY = mouseY;

        if (!aiming) {
            draw();
        }
    }
});

// SMOOTH AIM MOVEMENT
canvas.addEventListener("mousemove", function (e) {

    if (!aiming) return;

    const rect =
        canvas.getBoundingClientRect();

    aimX =
        e.clientX - rect.left;

    aimY =
        e.clientY - rect.top;

    const dx = striker.x - aimX;
    const dy = striker.y - aimY;

    power =
        Math.sqrt(dx * dx + dy * dy);

    if (power > MAX_POWER) {
        power = MAX_POWER;
    }

    drawAim();
});

// LEFT CLICK = STOP AIM
canvas.addEventListener("click", function (e) {

    if (e.button !== 0) return;

    if (aiming) {

        const dx = striker.x - aimX;
        const dy = striker.y - aimY;

        const angle =
            Math.atan2(dy, dx);

        // SPEED BASED ON POWER
        const speed = power * 0.22;

        striker.vx =
            Math.cos(angle) * speed;

        striker.vy =
            Math.sin(angle) * speed;
            strikerReturned = false;

        aiming = false;
    }
});
// DRAW AIM
function drawAim() {
    draw();

    if (!aiming) return;

    const dx = striker.x - aimX;
    const dy = striker.y - aimY;

    const angle =
        Math.atan2(dy, dx);

    // AIM LENGTH
    const aimLength =
         25 + power * 0.55;

    // END POINT
    const endX =
        striker.x +
        Math.cos(angle) * aimLength;

    const endY =
        striker.y +
        Math.sin(angle) * aimLength;
        // =====================
// LIMIT AIM INSIDE BOARD
// BOARD LIMITS
const boardLeft = 320;
const boardRight = 800;
const boardTop = 140;
const boardBottom = 620;

// KEEP AIM INSIDE BOARD
let limitedEndX = endX;
let limitedEndY = endY;

if (limitedEndX < boardLeft) {
    limitedEndX = boardLeft;
}

if (limitedEndX > boardRight) {
    limitedEndX = boardRight;
}

if (limitedEndY < boardTop) {
    limitedEndY = boardTop;
}

if (limitedEndY > boardBottom) {
    limitedEndY = boardBottom;
}
// MAIN AIM LINE
    ctx.beginPath();

    ctx.moveTo(
        striker.x,
        striker.y
    );

    ctx.lineTo(
        limitedEndX,
    limitedEndY
    );
// SMOOTH LINE
    ctx.strokeStyle =
        "rgba(255,255,255,0.95)";

    ctx.lineWidth = 4;

    ctx.lineCap = "butt";

    ctx.shadowColor =
        "rgba(255,255,255,0.8)";

    ctx.shadowBlur = 10;

    ctx.stroke();

    ctx.shadowBlur = 0;

    // DIRECTION POINTER
  ctx.beginPath();

  const arrowSize = 14;

// ARROW ANGLE
const arrowAngle =
    Math.atan2(
        limitedEndY - striker.y,
        limitedEndX - striker.x
    );

// ARROW SIDES
const arrowX1 =
    limitedEndX -
    arrowSize * Math.cos(arrowAngle - Math.PI / 6);

const arrowY1 =
    limitedEndY -
    arrowSize * Math.sin(arrowAngle - Math.PI / 6);

const arrowX2 =
    limitedEndX -
    arrowSize * Math.cos(arrowAngle + Math.PI / 6);

const arrowY2 =
    limitedEndY -
    arrowSize * Math.sin(arrowAngle + Math.PI / 6);

// DRAW ARROW
ctx.beginPath();

ctx.moveTo(
    limitedEndX,
    limitedEndY
);

ctx.lineTo(
    arrowX1,
    arrowY1
);

ctx.lineTo(
    arrowX2,
    arrowY2
);

ctx.closePath();

ctx.fillStyle =
    "#ed7c0b";

ctx.shadowColor =
    "#ed7c0b";

ctx.shadowBlur = 8;

ctx.fill();

ctx.shadowBlur = 0; 

    // POWER BAR
    const barWidth = 140;
    const barHeight = 12;

    const barX = 40;
    const barY = 40;

    // BAR BACKGROUND
    ctx.beginPath();

    ctx.roundRect(
        barX,
        barY,
        barWidth,
        barHeight,
        10
    );

    ctx.fillStyle =
        "rgba(0,0,0,0.5)";

    ctx.fill();

    // POWER FILL
    ctx.beginPath();

    ctx.roundRect(
        barX,
        barY,
        (power / MAX_POWER) * barWidth,
        barHeight,
        10
    );

    // POWER COLOR
    let gradient =
        ctx.createLinearGradient(
            barX,
            0,
            barX + barWidth,
            0
        );

    gradient.addColorStop(
        0,
        "#00ff99"
    );

    gradient.addColorStop(
        0.5,
        "#ffee00"
    );

    gradient.addColorStop(
        1,
        "#ff3300"
    );

    ctx.fillStyle = gradient;

    ctx.fill();
    // AIM CIRCLE
    ctx.beginPath();

    ctx.arc(
        striker.x,
        striker.y,
        24,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(255,255,255,0.35)";

    ctx.lineWidth = 2;

    ctx.stroke();
}

function updateStriker() {

    striker.x += striker.vx;
    striker.y += striker.vy;

    // FRICTION
    striker.vx *= 0.985;
    striker.vy *= 0.985;

    // STOP SMALL MOVEMENT
    if (Math.abs(striker.vx) < 0.05) {
        striker.vx = 0;
    }

    if (Math.abs(striker.vy) < 0.05) {
        striker.vy = 0;
    }

    // BOARD WALLS
    const leftWall = 340;
    const rightWall = 780;
    const topWall = 160;
    const bottomWall = 600;

    // LEFT
    if (striker.x - striker.radius < leftWall) {

        striker.x = leftWall + striker.radius;

        striker.vx *= -1;
    }

    // RIGHT
    if (striker.x + striker.radius > rightWall) {

        striker.x = rightWall - striker.radius;

        striker.vx *= -1;
    }

    // TOP
    if (striker.y - striker.radius < topWall) {

        striker.y = topWall + striker.radius;

        striker.vy *= -1;
    }

    // BOTTOM
    if (striker.y + striker.radius > bottomWall) {

        striker.y = bottomWall - striker.radius;

        striker.vy *= -1;
    }
    // RESET TO BASELINE
// RESET STRIKER AFTER STOPPING
if (strikerStopped() && !strikerReturned) {

    striker.vx = 0;
    striker.vy = 0;

    striker.x = 560;
    striker.y = 500;

    strikerReturned = true;
}
}

function strikerStopped() {

    return (
        Math.abs(striker.vx) < 0.05 &&
        Math.abs(striker.vy) < 0.05
    );
}

function gameLoop() {

    updateStriker();

    if (aiming) {
        drawAim();
    }
    else {
        draw();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();