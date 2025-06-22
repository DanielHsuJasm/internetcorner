(function() {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let shootingStars = [];
    let animationId;
    let isRunning = true;
    let lastTime = 0;
    const FPS = 30;
    const frameInterval = 1000 / FPS;

    // 根據設備性能調整
    function getStarCount() {
        const area = width * height;
        let base = Math.floor(area / 12000);
        
        if (window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024)) {
            base = Math.min(base, 120);
        }
        
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
            base = Math.floor(base * 0.7);
        }
        
        return Math.max(50, Math.min(base, 280));
    }

    // 增強版星星類別
    class Star {
        constructor() { 
            this.reset(); 
            this.lastUpdate = 0;
            this.lastDirectionChange = 0;
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            
            // 星星類型系統
            const r = Math.random();
            if (r < 0.5) {
                // 微塵星 - 極小，快速閃爍
                this.radius = Math.random() * 0.6 + 0.2;
                this.type = 'dust';
                this.blinkSpeed = 0.005 + Math.random() * 0.008;
                this.moveSpeed = 0.006 + Math.random() * 0.010;
                this.color = { r: 255, g: 255, b: 255 };
                this.hasGlow = false;
                this.hasPulse = false;
            } else if (r < 0.75) {
                // 普通星 - 中等大小，中等閃爍
                this.radius = Math.random() * 1.0 + 0.6;
                this.type = 'normal';
                this.blinkSpeed = 0.003 + Math.random() * 0.005;
                this.moveSpeed = 0.010 + Math.random() * 0.015;
                // 偶爾有色彩
                if (Math.random() < 0.3) {
                    this.color = { r: 200 + Math.random() * 55, g: 220 + Math.random() * 35, b: 255 };
                } else {
                    this.color = { r: 255, g: 255, b: 255 };
                }
                this.hasGlow = false;
                this.hasPulse = false;
            } else if (r < 0.92) {
                // 亮星 - 大一些，慢閃爍，有光暈
                this.radius = Math.random() * 1.4 + 0.9;
                this.type = 'bright';
                this.blinkSpeed = 0.002 + Math.random() * 0.004;
                this.moveSpeed = 0.012 + Math.random() * 0.020;
                // 更多色彩變化
                if (Math.random() < 0.4) {
                    this.color = { r: 255, g: 255 - Math.random() * 55, b: 200 + Math.random() * 55 };
                } else {
                    this.color = { r: 255, g: 255, b: 255 };
                }
                this.hasGlow = true;
                this.hasPulse = false;
            } else {
                // 巨星 - 最大，極慢閃爍，強光暈
                this.radius = Math.random() * 2.0 + 1.3;
                this.type = 'giant';
                this.blinkSpeed = 0.001 + Math.random() * 0.002;
                this.moveSpeed = 0.015 + Math.random() * 0.025;
                // 特殊色彩
                const colorType = Math.random();
                if (colorType < 0.3) {
                    this.color = { r: 255, g: 200 + Math.random() * 55, b: 150 + Math.random() * 50 }; // 暖色
                } else if (colorType < 0.6) {
                    this.color = { r: 150 + Math.random() * 50, g: 200 + Math.random() * 55, b: 255 }; // 冷色
                } else {
                    this.color = { r: 255, g: 255, b: 255 }; // 白色
                }
                this.hasGlow = true;
                this.hasPulse = Math.random() < 0.5; // 50% 機率有脈衝效果
            }
            
            // 設定初始方向
            this.setRandomDirection();
            
            // 閃爍屬性
            this.alpha = Math.random() * 0.4 + 0.4;
            this.alphaDelta = this.blinkSpeed * (Math.random() < 0.5 ? 1 : -1);
            this.minAlpha = 0.1 + Math.random() * 0.3;
            this.maxAlpha = 0.6 + Math.random() * 0.4;
            
            // 特殊效果
            this.hasTwinkle = Math.random() < 0.12;
            this.twinkleChance = 0.001 + Math.random() * 0.002;
            this.isTwinkling = false;
            this.twinkleAlpha = 1.0;
            this.twinkleDuration = 0;
            
            // 脈衝效果
            if (this.hasPulse) {
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.pulseSpeed = 0.02 + Math.random() * 0.03;
                this.pulseIntensity = 0.3 + Math.random() * 0.4;
                this.pulseAlpha = 0;
            }
            
            // 移動模式
            this.movementPattern = Math.random() < 0.85 ? 'random' : 'orbital';
            if (this.movementPattern === 'orbital') {
                this.orbitCenterX = this.x;
                this.orbitCenterY = this.y;
                this.orbitRadius = 20 + Math.random() * 40;
                this.orbitSpeed = 0.005 + Math.random() * 0.010;
                this.orbitAngle = Math.random() * Math.PI * 2;
            }
            
            // 移動相關
            this.directionChangeInterval = 1500 + Math.random() * 3500;
            this.updateInterval = Math.random() * 60 + 30;
        }
        
        setRandomDirection() {
            if (this.movementPattern === 'orbital') return;
            
            const angle = Math.random() * 2 * Math.PI;
            this.vx = Math.cos(angle) * this.moveSpeed;
            this.vy = Math.sin(angle) * this.moveSpeed;
        }
        
        update(currentTime) {
            if (currentTime - this.lastUpdate < this.updateInterval) {
                return;
            }
            this.lastUpdate = currentTime;
            
            // 移動更新
            if (this.movementPattern === 'orbital') {
                // 軌道運動
                this.orbitAngle += this.orbitSpeed;
                this.x = this.orbitCenterX + Math.cos(this.orbitAngle) * this.orbitRadius;
                this.y = this.orbitCenterY + Math.sin(this.orbitAngle) * this.orbitRadius;
                
                // 偶爾改變軌道中心
                if (Math.random() < 0.0005) {
                    this.orbitCenterX += (Math.random() - 0.5) * 100;
                    this.orbitCenterY += (Math.random() - 0.5) * 100;
                    
                    // 確保軌道中心在畫面內
                    this.orbitCenterX = Math.max(50, Math.min(width - 50, this.orbitCenterX));
                    this.orbitCenterY = Math.max(50, Math.min(height - 50, this.orbitCenterY));
                }
            } else {
                // 隨機移動
                if (currentTime - this.lastDirectionChange > this.directionChangeInterval) {
                    this.setRandomDirection();
                    this.lastDirectionChange = currentTime;
                    this.directionChangeInterval = 1000 + Math.random() * 4000;
                }
                
                this.x += this.vx;
                this.y += this.vy;
            }
            
            // 邊界處理
            if (this.x < -20) this.x = width + 20;
            if (this.x > width + 20) this.x = -20;
            if (this.y < -20) this.y = height + 20;
            if (this.y > height + 20) this.y = -20;
            
            // 基本閃爍
            this.alpha += this.alphaDelta;
            if (this.alpha <= this.minAlpha || this.alpha >= this.maxAlpha) {
                this.alphaDelta = -this.alphaDelta;
                this.alpha = Math.max(this.minAlpha, Math.min(this.maxAlpha, this.alpha));
            }
            
            // 脈衝效果
            if (this.hasPulse) {
                this.pulsePhase += this.pulseSpeed;
                this.pulseAlpha = Math.sin(this.pulsePhase) * this.pulseIntensity;
            }
            
            // 特殊閃爍
            if (this.hasTwinkle && !this.isTwinkling && Math.random() < this.twinkleChance) {
                this.isTwinkling = true;
                this.twinkleAlpha = 1.0;
                this.twinkleDuration = 6 + Math.random() * 12;
            }
            
            if (this.isTwinkling) {
                this.twinkleDuration--;
                if (this.twinkleDuration <= 0) {
                    this.isTwinkling = false;
                    this.twinkleAlpha = 1.0;
                } else {
                    this.twinkleAlpha = 0.3 + 0.7 * Math.sin(this.twinkleDuration * 0.5);
                }
            }
        }
        
        draw(ctx) {
            let finalAlpha = this.alpha;
            
            // 應用脈衝效果
            if (this.hasPulse && this.pulseAlpha !== undefined) {
                finalAlpha += this.pulseAlpha;
            }
            
            // 應用閃爍效果
            if (this.isTwinkling) {
                finalAlpha = Math.min(1.0, finalAlpha * this.twinkleAlpha);
            }
            
            finalAlpha = Math.max(0, Math.min(1, finalAlpha));
            
            // 安全檢查
            if (isNaN(this.x) || isNaN(this.y) || isNaN(this.radius) || finalAlpha <= 0) {
                return;
            }
            
            // 繪製光暈（大星星）
            if (this.hasGlow && finalAlpha > 0.5) {
                try {
                    const glowRadius = this.radius * (2 + Math.sin(Date.now() * 0.001) * 0.5);
                    const glowAlpha = finalAlpha * 0.1;
                    
                    const glowGradient = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, glowRadius
                    );
                    glowGradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${glowAlpha})`);
                    glowGradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
                    
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, glowRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = glowGradient;
                    ctx.fill();
                } catch (e) {
                    // 光暈繪製失敗時跳過
                }
            }
            
            // 繪製主星體
            try {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
                
                // 閃爍時的特殊效果
                if (this.isTwinkling && this.twinkleAlpha > 0.7) {
                    ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
                    ctx.shadowBlur = this.radius * 4;
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${finalAlpha})`;
                ctx.fill();
                
                // 繪製星芒（巨星特效）
                if (this.type === 'giant' && finalAlpha > 0.6) {
                    this.drawStarSpikes(ctx, finalAlpha);
                }
                
                ctx.shadowBlur = 0;
            } catch (e) {
                // 主星體繪製失敗時跳過
            }
        }
        
        drawStarSpikes(ctx, alpha) {
            try {
                const spikeLength = this.radius * 3;
                const spikeAlpha = alpha * 0.6;
                
                ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${spikeAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.lineCap = 'round';
                
                // 繪製十字星芒
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2;
                    const x1 = this.x + Math.cos(angle) * this.radius;
                    const y1 = this.y + Math.sin(angle) * this.radius;
                    const x2 = this.x + Math.cos(angle) * spikeLength;
                    const y2 = this.y + Math.sin(angle) * spikeLength;
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            } catch (e) {
                // 星芒繪製失敗時跳過
            }
        }
    }

    // 流星類別
    class ShootingStar {
        constructor() {
            this.reset();
        }
        
        reset() {
            // 從螢幕邊緣開始
            const side = Math.floor(Math.random() * 4);
            switch(side) {
                case 0: // 上
                    this.x = Math.random() * width;
                    this.y = -50;
                    break;
                case 1: // 右
                    this.x = width + 50;
                    this.y = Math.random() * height;
                    break;
                case 2: // 下
                    this.x = Math.random() * width;
                    this.y = height + 50;
                    break;
                case 3: // 左
                default:
                    this.x = -50;
                    this.y = Math.random() * height;
                    break;
            }
            
            // 目標點（螢幕另一側）
            this.targetX = width * Math.random();
            this.targetY = height * Math.random();
            
            // 計算方向和速度
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.speed = 3 + Math.random() * 4;
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
            
            // 流星屬性
            this.life = 1.0;
            this.decay = 0.01 + Math.random() * 0.02;
            this.length = 20 + Math.random() * 30;
            this.brightness = 0.8 + Math.random() * 0.2;
            
            // 顏色（流星通常是白色到黃色）
            this.color = {
                r: 255,
                g: 240 + Math.random() * 15,
                b: 200 + Math.random() * 55
            };
            
            this.trail = []; // 軌跡點
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            
            // 記錄軌跡
            this.trail.push({ x: this.x, y: this.y, alpha: this.life });
            if (this.trail.length > 15) {
                this.trail.shift();
            }
            
            return this.life > 0;
        }
        
        draw(ctx) {
            if (this.trail.length < 2) return;
            
            try {
                // 繪製軌跡
                for (let i = 1; i < this.trail.length; i++) {
                    const prev = this.trail[i - 1];
                    const curr = this.trail[i];
                    const alpha = curr.alpha * this.brightness * (i / this.trail.length);
                    
                    if (isNaN(prev.x) || isNaN(prev.y) || isNaN(curr.x) || isNaN(curr.y)) continue;
                    
                    ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
                    ctx.lineWidth = (i / this.trail.length) * 3;
                    ctx.lineCap = 'round';
                    
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
                
                // 繪製流星頭部
                const headAlpha = this.life * this.brightness;
                if (headAlpha > 0 && !isNaN(this.x) && !isNaN(this.y)) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
                    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${headAlpha})`;
                    ctx.fill();
                    
                    // 頭部光暈
                    if (headAlpha > 0.5) {
                        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`;
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, 1, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            } catch (e) {
                // 繪製失敗時跳過
            }
        }
    }

    // Canvas 設定
    function resizeCanvas() {
        try {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            width = rect.width * dpr;
            height = rect.height * dpr;
            canvas.width = width;
            canvas.height = height;
            ctx.scale(dpr, dpr);
            
            width = rect.width;
            height = rect.height;
            
            initStars();
        } catch (e) {
            console.error('Canvas resize error:', e);
        }
    }
    
    function initStars() {
        try {
            const count = getStarCount();
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push(new Star());
            }
            console.log(`⭐ 初始化 ${count} 顆星星 (終極版本-修復)`);
        } catch (e) {
            console.error('Stars initialization error:', e);
        }
    }
    
    // 流星管理
    function createShootingStar() {
        try {
            if (shootingStars.length < 3) { // 最多同時3顆流星
                shootingStars.push(new ShootingStar());
            }
        } catch (e) {
            console.error('Shooting star creation error:', e);
        }
    }
    
    // 流星定時器
    let lastShootingStarTime = 0;
    const shootingStarInterval = 5000; // 5秒 = 5000毫秒
    
    // 主動畫循環
    function animate(currentTime) {
        if (!isRunning) return;
        
        try {
            if (currentTime - lastTime < frameInterval) {
                animationId = requestAnimationFrame(animate);
                return;
            }
            lastTime = currentTime;
            
            // 清除畫布
            ctx.clearRect(0, 0, width, height);
            
            // 更新和繪製星星
            for (let i = 0; i < stars.length; i++) {
                if (stars[i]) {
                    stars[i].update(currentTime);
                    stars[i].draw(ctx);
                }
            }
            
            // 更新和繪製流星
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                if (shootingStars[i]) {
                    if (!shootingStars[i].update()) {
                        shootingStars.splice(i, 1);
                    } else {
                        shootingStars[i].draw(ctx);
                    }
                }
            }
            
            // 每5秒固定產生一顆流星
            if (currentTime - lastShootingStarTime >= shootingStarInterval) {
                createShootingStar();
                lastShootingStarTime = currentTime;
                console.log('⭐ 5秒定時流星已生成');
            }
            
            animationId = requestAnimationFrame(animate);
        } catch (e) {
            console.error('Animation error:', e);
            // 錯誤時重新啟動
            setTimeout(() => {
                if (isRunning) {
                    animationId = requestAnimationFrame(animate);
                }
            }, 1000);
        }
    }
    
    function startAnimation() {
        if (!animationId && isRunning) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    function stopAnimation() {
        isRunning = false;
        if (animationId) { 
            cancelAnimationFrame(animationId); 
            animationId = null; 
        }
    }
    
    // 事件處理
    document.addEventListener('visibilitychange', function(){
        if (document.hidden) {
            stopAnimation();
        } else {
            isRunning = true;
            startAnimation();
        }
    });
    
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            stopAnimation();
            resizeCanvas();
            isRunning = true;
            startAnimation();
        }, 250);
    }
    
    function init() {
        try {
            resizeCanvas();
            startAnimation();
            
            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', function(){
                setTimeout(handleResize, 300);
            });
        } catch (e) {
            console.error('Initialization error:', e);
        }
    }
    
    // 減少動畫偏好檢測
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', () => {
        if (mediaQuery.matches) {
            stopAnimation();
            shootingStars = [];
            try {
                ctx.clearRect(0, 0, width, height);
                stars.forEach(star => {
                    if (star) {
                        star.alpha = 0.3 + Math.random() * 0.5;
                        star.draw(ctx);
                    }
                });
            } catch (e) {
                console.error('Static render error:', e);
            }
        } else {
            isRunning = true;
            startAnimation();
        }
    });
    
    if (mediaQuery.matches) {
        try {
            resizeCanvas();
            stars.forEach(star => {
                if (star) {
                    star.alpha = 0.3 + Math.random() * 0.5;
                    star.draw(ctx);
                }
            });
        } catch (e) {
            console.error('Initial static render error:', e);
        }
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
    
    // 性能監控
    let frameCount = 0;
    let lastFPSCheck = performance.now();
    
    function checkPerformance() {
        try {
            frameCount++;
            const now = performance.now();
            
            if (now - lastFPSCheck > 5000) {
                const actualFPS = frameCount / ((now - lastFPSCheck) / 1000);
                
                if (actualFPS < 18) {
                    // 性能不佳 - 減少特效
                    if (stars.length > 80) {
                        const newCount = Math.floor(stars.length * 0.8);
                        stars = stars.slice(0, newCount);
                    }
                    
                    // 簡化星星效果
                    stars.forEach(star => {
                        if (star) {
                            star.hasTwinkle = false;
                            star.hasGlow = false;
                            star.hasPulse = false;
                            star.moveSpeed *= 0.8;
                            star.updateInterval += 15;
                        }
                    });
                    
                    // 移除流星
                    shootingStars = [];
                    
                    console.log(`🔧 性能優化：簡化特效，星星數量：${stars.length}`);
                } else if (actualFPS > 25 && stars.length < getStarCount() * 0.9) {
                    // 性能良好 - 可以增加效果
                    const targetCount = Math.min(getStarCount(), stars.length + 15);
                    while (stars.length < targetCount) {
                        stars.push(new Star());
                    }
                    console.log(`✨ 性能良好：增加星星至 ${stars.length}`);
                }
                
                frameCount = 0;
                lastFPSCheck = now;
            }
        } catch (e) {
            console.error('Performance check error:', e);
        }
    }
    
    // 添加性能檢查
    const originalAnimate = animate;
    animate = function(currentTime) {
        originalAnimate(currentTime);
        checkPerformance();
    };
    
    // 控制接口
    window.starBackground = {
        // 暫停動畫
        pause: function() {
            try {
                const wasRunning = isRunning;
                stopAnimation();
                this._wasRunningBeforePause = wasRunning;
                console.log('⏸️ 星空動畫已暫停');
            } catch (e) {
                console.error('Pause error:', e);
            }
        },
        
        // 恢復動畫
        resume: function() {
            try {
                if (this._wasRunningBeforePause !== false) {
                    isRunning = true;
                    startAnimation();
                    console.log('▶️ 星空動畫已恢復');
                }
            } catch (e) {
                console.error('Resume error:', e);
            }
        },
        // 切換閃爍效果
        toggleTwinkle: function(enabled) {
            try {
                stars.forEach(star => {
                    if (star) {
                        star.hasTwinkle = enabled && Math.random() < 0.12;
                    }
                });
                console.log(`✨ 閃爍效果: ${enabled ? '開啟' : '關閉'}`);
            } catch (e) {
                console.error('Toggle twinkle error:', e);
            }
        },
        
        // 調整移動速度
        setMoveSpeed: function(multiplier) {
            try {
                stars.forEach(star => {
                    if (star) {
                        star.moveSpeed *= multiplier;
                        star.setRandomDirection();
                    }
                });
                console.log(`🌟 移動速度: ${multiplier}x`);
            } catch (e) {
                console.error('Set move speed error:', e);
            }
        },
        
        // 手動創建流星
        createShootingStar: function(count = 1) {
            try {
                for (let i = 0; i < count && shootingStars.length < 5; i++) {
                    createShootingStar();
                }
                console.log(`💫 創建 ${count} 顆流星`);
            } catch (e) {
                console.error('Create shooting star error:', e);
            }
        },
        
        // 切換光暈效果
        toggleGlow: function(enabled) {
            try {
                stars.forEach(star => {
                    if (star && (star.type === 'bright' || star.type === 'giant')) {
                        star.hasGlow = enabled;
                    }
                });
                console.log(`🌟 光暈效果: ${enabled ? '開啟' : '關閉'}`);
            } catch (e) {
                console.error('Toggle glow error:', e);
            }
        },
        
        // 切換脈衝效果
        togglePulse: function(enabled) {
            try {
                stars.forEach(star => {
                    if (star && star.type === 'giant') {
                        star.hasPulse = enabled && Math.random() < 0.5;
                    }
                });
                console.log(`💓 脈衝效果: ${enabled ? '開啟' : '關閉'}`);
            } catch (e) {
                console.error('Toggle pulse error:', e);
            }
        },
        
        // 獲取狀態
        getStats: function() {
            try {
                return {
                    stars: stars.length,
                    shootingStars: shootingStars.length,
                    types: stars.reduce((acc, star) => {
                        if (star && star.type) {
                            acc[star.type] = (acc[star.type] || 0) + 1;
                        }
                        return acc;
                    }, {}),
                    specialEffects: {
                        twinkle: stars.filter(s => s && s.hasTwinkle).length,
                        glow: stars.filter(s => s && s.hasGlow).length,
                        pulse: stars.filter(s => s && s.hasPulse).length
                    }
                };
            } catch (e) {
                console.error('Get stats error:', e);
                return { error: 'Unable to get stats' };
            }
        },
        
        // 設置流星間隔
        setShootingStarInterval: function(seconds) {
            try {
                shootingStarInterval = seconds * 1000; // 轉換為毫秒
                console.log(`💫 流星間隔設定為 ${seconds} 秒`);
            } catch (e) {
                console.error('Set shooting star interval error:', e);
            }
        },
        
        // 星雨效果
        starShower: function(duration = 5000) {
            try {
                const originalInterval = shootingStarInterval;
                shootingStarInterval = 200; // 星雨期間每200ms一顆
                
                setTimeout(() => {
                    shootingStarInterval = originalInterval; // 恢復原間隔
                    console.log('🌠 星雨結束，恢復正常流星頻率');
                }, duration);
                
                console.log(`🌠 星雨開始！持續 ${duration/1000} 秒，流星大量增加`);
            } catch (e) {
                console.error('Star shower error:', e);
            }
        },
        
        // 重置星空
        reset: function() {
            try {
                stopAnimation();
                stars = [];
                shootingStars = [];
                initStars();
                isRunning = true;
                startAnimation();
                console.log('🔄 星空已重置');
            } catch (e) {
                console.error('Reset error:', e);
            }
        },
        
        // 獲取性能信息
        getPerformance: function() {
            try {
                return {
                    fps: frameCount > 0 ? Math.round(frameCount / ((performance.now() - lastFPSCheck) / 1000)) : 0,
                    stars: stars.length,
                    shootingStars: shootingStars.length,
                    isRunning: isRunning
                };
            } catch (e) {
                console.error('Get performance error:', e);
                return { error: 'Unable to get performance info' };
            }
        }
    };
    
    // 錯誤恢復機制
    window.addEventListener('error', function(e) {
        if (e.filename && e.filename.includes('star-background')) {
            console.error('星空動畫錯誤，嘗試恢復:', e.message);
            try {
                stopAnimation();
                setTimeout(() => {
                    initStars();
                    isRunning = true;
                    startAnimation();
                }, 1000);
            } catch (recoveryError) {
                console.error('恢復失敗:', recoveryError);
            }
        }
    });
    
    console.log('💫 終極星空已載入！(修復版 + 定時流星)');
    console.log('🎮 可用指令:');
    console.log('  starBackground.createShootingStar(3) - 手動創建流星');
    console.log('  starBackground.setShootingStarInterval(3) - 設定流星間隔(秒)');
    console.log('  starBackground.toggleAutoShootingStars(false) - 關閉自動流星');
    console.log('  starBackground.starShower(8000) - 星雨效果(毫秒)');
    console.log('  starBackground.toggleTwinkle(true) - 閃爍效果');
    console.log('  starBackground.toggleGlow(true) - 光暈效果');
    console.log('  starBackground.getStats() - 查看統計');
    console.log('  starBackground.reset() - 重置星空');
    console.log('  🌟 流星每 5 秒自動掉落一顆！');
})();