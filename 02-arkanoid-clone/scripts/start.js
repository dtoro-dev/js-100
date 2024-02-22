const soundPress = (sound = "start") => {
  const audio = document.querySelector('.audio-play');
  audio.src = `./sounds/${sound}.mp3`;
  audio.play();
}

soundPress("music");

document.addEventListener('keydown', (event) => {
  let homePage = document.querySelector('.home-page');
  let startPage = document.querySelector('.start-page');
  let endPage = document.querySelector('.end-page');


  if (event.key === 'Enter' && startPage.classList.contains('hidden')) {
    soundPress();

    homePage.classList.add('hidden');
    startPage.classList.remove('hidden');

    if (!endPage.classList.contains('hidden')) {
      endPage.classList.add('hidden');
      RESTART_GAME = true;
    }

  } else if (event.key === 'Escape') {
    soundPress();
    soundPress("music");

    homePage.classList.remove('hidden');
    startPage.classList.add('hidden');

    if (!endPage.classList.contains('hidden')) {
      endPage.classList.add('hidden');
      RESTART_GAME = true;
    }
  } else if (event.key === 'p' || event.key === 'P' && !startPage.classList.contains('hidden')) {
    soundPress("pause");
    PAUSED_GAME = !PAUSED_GAME;
  }
});