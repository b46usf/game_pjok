const bgMusic = document.getElementById('bg-music');
const clickSound = document.getElementById('click-sound');
const musicToggle = document.getElementById('music-toggle');
const gameButtons = document.querySelectorAll('.game-button');

let musicPlaying = false;

// Play music on first user interaction
function startMusicOnce() {
  if (!musicPlaying) {
    bgMusic.volume = 0.4;
    bgMusic.play().catch(err => console.warn('Audio blocked:', err));
    musicPlaying = true;
    updateMusicToggleText();
  }
}

// Play click sound
function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play().catch(err => console.warn('Click sound error:', err));
}

// Update music toggle button label
function updateMusicToggleText() {
  musicToggle.textContent = musicPlaying ? '🔊 Musik: Aktif' : '🔇 Musik: Mati';
}

// Button interactions
gameButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    startMusicOnce();
    playClickSound();

    // Navigasi ke halaman sesuai tombol
    if (index === 0) {
      window.location.href = 'game.html';
    } else if (index === 1) {
      window.location.href = 'quiz.html';
    } else if (index === 2) {
      window.location.href = 'lencana.html';
    }
  });
});

// Toggle Music
musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play().then(() => {
      musicPlaying = true;
      updateMusicToggleText();
    }).catch(console.warn);
  } else {
    bgMusic.pause();
    musicPlaying = false;
    updateMusicToggleText();
  }
});

// Preload audio after first interaction
document.body.addEventListener('click', startMusicOnce, { once: true });
