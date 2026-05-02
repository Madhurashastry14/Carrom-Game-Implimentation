const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
let striker = {
    x: 300,
    y: 550,
    r: 10,
    vx: 0,
    vy: 0
};
let aiming = false;
let aimX = 0;
let aimY = 0;
// Draw
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
// striker
    ctx.beginPath();
    ctx.arc(striker.x, striker.y, striker.r, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
// aim line
    if (aiming) {
        ctx.beginPath();
        ctx.moveTo(striker.x, striker.y);
        ctx.lineTo(aimX, aimY);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
// Update movement
function update() {
    striker.x += striker.vx;
    striker.y += striker.vy;
    striker.vx *= 0.98;
    striker.vy *= 0.98;
    if (Math.abs(striker.vx) < 0.05) striker.vx = 0;
    if (Math.abs(striker.vy) < 0.05) striker.vy = 0;
    draw();
    requestAnimationFrame(update);
}
// Mouse events
canvas.addEventListener("mousedown", (e) => {
    let dx = e.offsetX - striker.x;
    let dy = e.offsetY - striker.y;

    if (Math.hypot(dx, dy) < striker.r + 10) {
        aiming = true;
    }
});
canvas.addEventListener("mousemove", (e) => {
    if (aiming) {
        aimX = e.offsetX;
        aimY = e.offsetY;
    }
});
canvas.addEventListener("mouseup", () => {
    if (aiming) {
        let dx = striker.x - aimX;
        let dy = striker.y - aimY;
        let power = Math.min(100, Math.hypot(dx, dy));
        let speed = power / 10;
        striker.vx = dx * 0.05 * speed;
        striker.vy = dy * 0.05 * speed;
        aiming = false;
    }
});
// Start
update();