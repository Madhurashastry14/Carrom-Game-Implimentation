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


function createCoins() {
    const h = r * Math.sqrt(3); // Horizontal spacing factor

    const pos = [
        // 1. CENTER
        { x: cx, y: cy, color: "#ff00ff" }, // Bright Pink/Red Queen

        // 2. INNER CIRCLE (6 coins)
        { x: cx, y: cy - 2 * r, color: "white" },            // Top
        { x: cx + h, y: cy - r, color: "black" },            // Top-Right
        { x: cx + h, y: cy + r, color: "white" },            // Bottom-Right
        { x: cx, y: cy + 2 * r, color: "black" },            // Bottom
        { x: cx - h, y: cy + r, color: "white" },            // Bottom-Left
        { x: cx - h, y: cy - r, color: "black" },            // Top-Left

        // 3. OUTER CIRCLE (12 coins)
        { x: cx, y: cy - 4 * r, color: "white" },            // 12 o'clock
        { x: cx + h, y: cy - 3 * r, color: "black" },
        { x: cx + 2 * h, y: cy - 2 * r, color: "white" },
        { x: cx + 2 * h, y: cy, color: "black" },            // 3 o'clock
        { x: cx + 2 * h, y: cy + 2 * r, color: "white" },
        { x: cx + h, y: cy + 3 * r, color: "black" },
        { x: cx, y: cy + 4 * r, color: "white" },            // 6 o'clock
        { x: cx - h, y: cy + 3 * r, color: "black" },
        { x: cx - 2 * h, y: cy + 2 * r, color: "white" },
        { x: cx - 2 * h, y: cy, color: "black" },            // 9 o'clock
        { x: cx - 2 * h, y: cy - 2 * r, color: "white" },
        { x: cx - h, y: cy - 3 * r, color: "black" }
    ];

    coins.length = 0; 
    for (let p of pos) {
        coins.push(new Coin(p.x, p.y, r, p.color));
    }
}

function draw() {
    // 1. Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Draw Board
    ctx.drawImage(board, 320, 140, 480, 480);
    
    // 3. Draw Coins
    for (let coin of coins) {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = coin.color;
        ctx.fill();
        
        // Match the outline look of the reference
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Optional: Add the inner ring detail from the image
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = coin.color === "white" ? "#ddd" : "#555";
        ctx.stroke();
    }
}

board.onload = function () {
    createCoins();
    draw();
};