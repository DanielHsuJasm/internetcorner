document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    const overlayImg = document.getElementById('overlay-img');
    document.body.addEventListener('click', function(e) {
        const target = e.target;
        if (target.tagName === 'IMG' && target.classList.contains('preview-img')) {
            overlayImg.src = target.src;
            overlay.classList.add('show');
        }
    });
    overlay.addEventListener('click', function() {
        overlay.classList.remove('show');
        overlayImg.src = '';
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
            overlay.classList.remove('show');
            overlayImg.src = '';
        }
    });
});
