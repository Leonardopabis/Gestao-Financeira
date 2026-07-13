const asideMenuToggle = document.querySelector('.header-image-container');
const asideMenu = document.querySelector('.aside-menu');

const content = document.querySelector('.content');

asideMenuToggle.addEventListener('click', () => {
    asideMenu.classList.toggle('open');
    content.classList.toggle('menu-open');
});