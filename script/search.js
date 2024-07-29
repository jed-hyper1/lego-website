const filterHeader = document.querySelector('.filter-header');
const filterContent = document.querySelector('.filter-content');

filterHeader.addEventListener('click', () => {
    filterHeader.classList.toggle('active');
    filterContent.classList.toggle('active');
});