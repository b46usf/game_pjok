// Saat DOM sudah siap, tampilkan UI awal dan siapkan soal pertama
document.addEventListener("DOMContentLoaded", () => {
  questionBox.style.display = "block";
  prepareNextLevel();
});

// Event listeners
startBtn.addEventListener("click", startGame);
canvas.addEventListener("mousedown", onCanvasClick);
window.addEventListener("resize", onWindowResize);
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);