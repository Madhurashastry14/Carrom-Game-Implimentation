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



// BOTTOM STRIKER
const striker = {
    x: 560,
    y: 500,
    radius: 12,
    color: "#ed7c0b",
    vx:0,
    vy:0
};



// TOP STRIKER
const topStriker = {
    x: 560,
    y: 216,
    radius: 12,
    color: "white"
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



    // DRAW BOTTOM STRIKER
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



    // DRAW TOP STRIKER
    ctx.beginPath();

    ctx.arc(
        topStriker.x,
        topStriker.y,
        topStriker.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = topStriker.color;

    ctx.fill();

    ctx.lineWidth = 2;

    ctx.strokeStyle = "black";

    ctx.stroke();
}

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
let draggingBottom = false;
let draggingTop = false;

canvas.addEventListener("mousedown", function (e) {

    const rect = canvas.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;



    // BOTTOM STRIKER CHECK
    let dx = mouseX - striker.x;
    let dy = mouseY - striker.y;

    let distance =
        Math.sqrt(dx * dx + dy * dy);



    // TOP STRIKER CHECK
    let dxTop = mouseX - topStriker.x;
    let dyTop = mouseY - topStriker.y;

    let topDistance =
        Math.sqrt(dxTop * dxTop + dyTop * dyTop);



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

    let mouseX =
        e.clientX - rect.left;

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

    // RIGHT LIMIT
    if (mouseX > 675) {
        mouseX = 675;
    }

    drawAim();
});

// LEFT CLICK = STOP AIM
canvas.addEventListener("click", function (e) {

    // MOVE ONLY SELECTED STRIKER
    if (draggingBottom) {
        striker.x = mouseX;
    }

    if (draggingTop) {
        topStriker.x = mouseX;
    }

    if (aiming) {

        const dx = striker.x - aimX;
        const dy = striker.y - aimY;

    draw();
});
