{
    const globalMenuButton = document.querySelector('#global-menu-button');
    const globalMenuImg    = document.querySelector('#global-menu-img');
    const main = document.querySelector('main');
    const globalMenuOverlay    = document.querySelector('#global-menu-overlay');
    const body = document.querySelector('body');

    let openLabel   = globalMenuButton.dataset.openLabel;
    let closeLabel  = globalMenuButton.dataset.closeLabel;

    let overlayMenu = document.querySelector(`#${globalMenuButton.getAttribute('aria-controls')}`);
    let menuTitle   = document.querySelector(`#${globalMenuImg.getAttribute('aria-labelledby')}`);

    const toggleRegion = () => {
        if (globalMenuButton.getAttribute('aria-expanded') == 'false') {
            globalMenuButton.setAttribute('aria-expanded', 'true');
            overlayMenu.setAttribute('aria-hidden', 'false');
            menuTitle.innerHTML = closeLabel;
            globalMenuButton.focus();
            body.classList.add('clip');
        } else {
            globalMenuButton.setAttribute('aria-expanded', 'false');
            overlayMenu.setAttribute('aria-hidden', 'true');
            menuTitle.innerHTML = openLabel;
            body.classList.remove('clip');
        }
    };
    //開いているときmainを押したら閉じる
    const toggleRegion_check = () => {
        if (globalMenuButton.getAttribute('aria-expanded') == 'false') {
        } else {
            globalMenuButton.setAttribute('aria-expanded', 'false');
            overlayMenu.setAttribute('aria-hidden', 'true');
            menuTitle.innerHTML = openLabel;
            body.classList.remove('clip'); 
        }
    };
    globalMenuButton.addEventListener('click', toggleRegion);
    //追加 ボタン押したらtoggleregionでボタン状態（展開状態見る）
    globalMenuOverlay.addEventListener('click', toggleRegion);
    main.addEventListener('click', toggleRegion_check);
}