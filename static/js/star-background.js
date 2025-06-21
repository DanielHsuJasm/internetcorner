(function() {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let animationId;
    let isRunning = true;

    function getStarCount() {
        const area = width * height;
        let base = Math.floor(area / 10000);
        if (window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024)) {
            base = Math.min(base, 150);
        }
        return Math.max(80, Math.min(base, 500));
    }

    class Star {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random()*width;
            this.y = Math.random()*height;
            const r = Math.random();
            if (r<0.7) this.radius = Math.random()*1+0.5;
            else if(r<0.9) this.radius = Math.random()*1.5+1;
            else this.radius = Math.random()*2+2;
            const speedFactor = this.radius/3;
            const angle = Math.random()*2*Math.PI;
            this.vx = Math.cos(angle)*speedFactor*0.02;
            this.vy = Math.sin(angle)*speedFactor*0.02;
            this.alpha = Math.random()*0.5+0.5;
            this.alphaDelta = (Math.random()*0.005+0.002)*(Math.random()<0.5?1:-1);
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x<0||this.x>width||this.y<0||this.y>height) {
                this.reset();
                this.x = Math.random()*width;
                this.y = Math.random()*height;
            }
            this.alpha += this.alphaDelta;
            if (this.alpha<=0.2||this.alpha>=1) {
                this.alphaDelta = -this.alphaDelta;
                this.alpha = Math.max(0.2, Math.min(1, this.alpha));
            }
        }
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
            ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
            ctx.fill();
        }
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio||1;
        const rect = canvas.getBoundingClientRect();
        width = rect.width*dpr;
        height = rect.height*dpr;
        canvas.width = width;
        canvas.height = height;
        ctx.scale(dpr,dpr);
        initStars();
    }
    function initStars() {
        const count = getStarCount();
        stars = [];
        for (let i=0;i<count;i++) stars.push(new Star());
    }
    function animate() {
        if (!isRunning) return;
        ctx.clearRect(0,0,width,height);
        stars.forEach(star=>{star.update();star.draw(ctx);});
        animationId = requestAnimationFrame(animate);
    }
    function startAnimation() {
        if (!animationId) {
            isRunning = true;
            animate();
        }
    }
    function stopAnimation() {
        isRunning=false;
        if (animationId) { cancelAnimationFrame(animationId); animationId=null; }
    }
    document.addEventListener('visibilitychange', function(){
        if (document.hidden) stopAnimation();
        else startAnimation();
    });
    function init() {
        resizeCanvas();
        startAnimation();
        window.addEventListener('resize', function(){
            stopAnimation();
            resizeCanvas();
            startAnimation();
        });
        window.addEventListener('orientationchange', function(){
            setTimeout(()=>{ stopAnimation(); resizeCanvas(); startAnimation(); },300);
        });
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', () => {
        if (mediaQuery.matches) stopAnimation();
        else startAnimation();
    });
    if (mediaQuery.matches) {
        resizeCanvas();
        stars = [];
        const count = getStarCount();
        for (let i=0;i<count;i++){
            const s=new Star();
            s.alphaDelta=0;
            stars.push(s);
        }
        stars.forEach(star=>star.draw(ctx));
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
