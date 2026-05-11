const striker = document.getElementById("striker");
const board = document.getElementById("board");

let isDragging = false;

striker.addEventListener("mousedown", function () {
    isDragging = true;
});

document.addEventListener("mouseup", function () {
    isDragging = false;
});

document.addEventListener("mousemove", function (e) {

    if (!isDragging) return;

    const boardRect = board.getBoundingClientRect();

    let x = e.clientX - boardRect.left;

    // limits
    if (x < 40) x = 40;
    if (x > 560) x = 560;

    striker.style.left = (x - 20) + "px";
});