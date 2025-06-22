/**
 * 優化的信封信件功能模組
 * 解決性能卡頓問題
 */

class LetterManager {
    constructor() {
        this.envelopeContainer = null;
        this.letterContent = null;
        this.isFullscreen = false;
        this.animationDuration = 400; // 縮短動畫時間
        this.isAnimating = false; // 防止重複動畫
        
        this.init();
    }

    /**
     * 初始化信件功能
     */
    init() {
        // 等待 DOM 加載完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    /**
     * 設置元素和事件監聽器
     */
    setupElements() {
        this.envelopeContainer = document.querySelector('.envelope-container');
        this.letterContent = this.envelopeContainer ? this.envelopeContainer.querySelector('.letter-content') : null;

        if (!this.envelopeContainer || !this.letterContent) {
            console.warn('信封元素未找到，信件功能將不可用');
            return;
        }

        // 預先優化元素
        this.optimizeElements();

        // 獲取 CSS 動畫時間
        this.updateAnimationDuration();

        // 綁定事件監聽器
        this.bindEvents();

        console.log('💌 信件功能已初始化 (優化版)');
    }

    /**
     * 預先優化元素性能
     */
    optimizeElements() {
        // 啟用硬體加速
        this.envelopeContainer.style.willChange = 'transform, opacity';
        this.letterContent.style.willChange = 'transform, opacity';
        
        // 設置初始 transform，啟用 GPU 加速
        this.envelopeContainer.style.transform = 'translateZ(0)';
        this.letterContent.style.transform = 'translateZ(0)';
        
        // 優化渲染
        this.envelopeContainer.style.backfaceVisibility = 'hidden';
        this.letterContent.style.backfaceVisibility = 'hidden';
    }

    /**
     * 從 CSS 變數獲取動畫時間
     */
    updateAnimationDuration() {
        try {
            const duration = parseFloat(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--envelope-anim-duration')
            ) * 1000;
            
            if (!isNaN(duration) && duration > 0) {
                this.animationDuration = Math.min(duration, 600); // 最大600ms
            }
        } catch (error) {
            console.warn('無法獲取 CSS 動畫時間，使用預設值:', this.animationDuration + 'ms');
        }
    }

    /**
     * 綁定所有事件監聽器
     */
    bindEvents() {
        // 點擊信封容器
        this.envelopeContainer.addEventListener('click', (e) => {
            this.handleEnvelopeClick(e);
        });

        // 鍵盤事件
        this.envelopeContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });

        // 全域鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });

        // 防止在動畫期間重複觸發
        this.envelopeContainer.addEventListener('touchstart', (e) => {
            if (this.isAnimating) {
                e.preventDefault();
            }
        });
    }

    /**
     * 處理信封容器點擊事件
     */
    handleEnvelopeClick(e) {
        // 防止動畫期間重複點擊
        if (this.isAnimating) {
            return;
        }

        // 如果是全螢幕狀態且點擊的是容器背景（不是信封或信件內容）
        if (this.isFullscreen && e.target === this.envelopeContainer) {
            this.exitFullscreen();
        } else if (!this.isFullscreen) {
            // 如果不是全螢幕狀態，則進入全螢幕
            this.enterFullscreen();
        }
    }

    /**
     * 切換全螢幕狀態
     */
    toggleFullscreen() {
        if (this.isAnimating) return;

        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    /**
     * 進入全螢幕模式
     */
    enterFullscreen() {
        if (this.isFullscreen || this.isAnimating) return;

        this.isAnimating = true;
        this.isFullscreen = true;

        // 檢查並關閉可能存在的圖片預覽
        this.closeImageOverlay();

        // 暫停星空動畫以提升性能
        this.pauseBackgroundAnimations();

        // 禁止頁面滾動
        document.body.style.overflow = 'hidden';

        // 立即應用全螢幕樣式
        this.envelopeContainer.classList.add('fullscreen');

        // 簡化的開啟動畫
        this.envelopeContainer.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

        // 等待動畫完成後顯示信件內容
        setTimeout(() => {
            this.letterContent.classList.add('show');
            this.focusLetter();
            this.isAnimating = false;
            
            // 移除 transition 以避免影響後續操作
            this.envelopeContainer.style.transition = '';
        }, this.animationDuration);

        // 觸發自定義事件
        this.dispatchCustomEvent('letter:opened');
    }

    /**
     * 退出全螢幕模式
     */
    exitFullscreen() {
        if (!this.isFullscreen || this.isAnimating) return;

        this.isAnimating = true;
        this.isFullscreen = false;

        // 隱藏信件內容
        this.letterContent.classList.remove('show');

        // 簡化的關閉動畫
        this.envelopeContainer.style.transition = `all ${this.animationDuration * 0.8}ms ease-in`;

        setTimeout(() => {
            // 恢復頁面滾動
            document.body.style.overflow = '';

            // 移除全螢幕樣式類
            this.envelopeContainer.classList.remove('fullscreen');

            // 恢復背景動畫
            this.resumeBackgroundAnimations();

            // 恢復焦點到 body
            document.body.focus();

            this.isAnimating = false;
            
            // 移除 transition
            this.envelopeContainer.style.transition = '';
        }, this.animationDuration * 0.8);

        // 觸發自定義事件
        this.dispatchCustomEvent('letter:closed');
    }

    /**
     * 暫停背景動畫以提升性能
     */
    pauseBackgroundAnimations() {
        try {
            // 暫停星空動畫
            if (window.starBackground && typeof window.starBackground.pause === 'function') {
                window.starBackground.pause();
            }
            
            // 暫停膠卷動畫
            const filmStrip = document.querySelector('.film-strip');
            if (filmStrip) {
                filmStrip.style.animationPlayState = 'paused';
            }

            // 暫停其他可能的動畫
            const animatedElements = document.querySelectorAll('[style*="animation"]');
            animatedElements.forEach(el => {
                el.style.animationPlayState = 'paused';
            });
        } catch (error) {
            console.warn('暫停背景動畫時出錯:', error);
        }
    }

    /**
     * 恢復背景動畫
     */
    resumeBackgroundAnimations() {
        try {
            // 恢復星空動畫
            if (window.starBackground && typeof window.starBackground.resume === 'function') {
                window.starBackground.resume();
            }
            
            // 恢復膠卷動畫
            const filmStrip = document.querySelector('.film-strip');
            if (filmStrip) {
                filmStrip.style.animationPlayState = 'running';
            }

            // 恢復其他動畫
            const animatedElements = document.querySelectorAll('[style*="animation"]');
            animatedElements.forEach(el => {
                el.style.animationPlayState = 'running';
            });
        } catch (error) {
            console.warn('恢復背景動畫時出錯:', error);
        }
    }

    /**
     * 關閉可能存在的圖片預覽覆蓋層
     */
    closeImageOverlay() {
        const overlay = document.getElementById('overlay');
        const overlayImg = document.getElementById('overlay-img');

        if (overlay && overlay.classList.contains('show')) {
            if (overlayImg) overlayImg.style.opacity = '0';
            
            setTimeout(() => {
                overlay.classList.remove('show');
                if (overlayImg) overlayImg.src = '';
            }, 200); // 縮短時間
        }
    }

    /**
     * 為信件內容設置焦點
     */
    focusLetter() {
        if (this.letterContent) {
            this.letterContent.setAttribute('tabindex', '-1');
            this.letterContent.focus();
        }
    }

    /**
     * 觸發自定義事件
     */
    dispatchCustomEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                letterManager: this,
                isFullscreen: this.isFullscreen,
                ...detail
            },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * 更新信件內容（優化版）
     */
    updateLetterContent(title, content, signature) {
        if (!this.letterContent) return;

        // 使用 DocumentFragment 減少重繪
        const fragment = document.createDocumentFragment();
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = this.letterContent.innerHTML;

        const titleElement = tempContainer.querySelector('h3');
        const signatureElement = tempContainer.querySelector('.signature p');

        if (titleElement && title) {
            titleElement.textContent = title;
        }

        if (signatureElement && signature) {
            signatureElement.textContent = signature;
        }

        if (content) {
            // 移除現有的段落（除了標題和署名）
            const paragraphs = tempContainer.querySelectorAll('p:not(.signature p)');
            paragraphs.forEach(p => {
                if (!p.closest('.signature') && !p.classList.contains('close-hint')) {
                    p.remove();
                }
            });

            // 添加新內容
            const signatureContainer = tempContainer.querySelector('.signature');
            
            if (Array.isArray(content)) {
                content.forEach(text => {
                    const p = document.createElement('p');
                    p.textContent = text;
                    tempContainer.insertBefore(p, signatureContainer);
                });
            } else if (typeof content === 'string') {
                const p = document.createElement('p');
                p.textContent = content;
                tempContainer.insertBefore(p, signatureContainer);
            }
        }

        // 一次性更新 DOM
        this.letterContent.innerHTML = tempContainer.innerHTML;
    }

    /**
     * 獲取當前狀態
     */
    getState() {
        return {
            isFullscreen: this.isFullscreen,
            isAnimating: this.isAnimating,
            isInitialized: !!(this.envelopeContainer && this.letterContent),
            animationDuration: this.animationDuration
        };
    }

    /**
     * 性能優化模式
     */
    enablePerformanceMode() {
        this.animationDuration = Math.min(this.animationDuration, 300);
        
        // 移除所有 backdrop-filter
        if (this.envelopeContainer) {
            this.envelopeContainer.style.backdropFilter = 'none';
        }
        if (this.letterContent) {
            this.letterContent.style.backdropFilter = 'none';
        }

        console.log('💌 信件性能模式已啟用');
    }

    /**
     * 銷毀信件管理器
     */
    destroy() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        }

        // 清理優化設置
        if (this.envelopeContainer) {
            this.envelopeContainer.style.willChange = 'auto';
            this.envelopeContainer.style.transform = '';
        }
        if (this.letterContent) {
            this.letterContent.style.willChange = 'auto';
            this.letterContent.style.transform = '';
        }

        this.envelopeContainer = null;
        this.letterContent = null;

        console.log('💌 信件功能已銷毀');
    }
}

// 創建全域實例
let letterManager = null;

// 自動初始化
(function() {
    // 確保只創建一個實例
    if (!letterManager) {
        letterManager = new LetterManager();
    }
})();

// 導出到全域作用域（用於其他腳本訪問）
window.LetterManager = LetterManager;
window.letterManager = letterManager;

// 為了向後兼容，提供原始的函數接口
window.initEnvelopeBehavior = function() {
    console.warn('initEnvelopeBehavior 已棄用，請使用 LetterManager 類');
    return letterManager;
};

// 性能檢測和自動優化
document.addEventListener('DOMContentLoaded', function() {
    // 檢測性能並自動啟用優化模式
    if (window.performanceOptimizer && window.performanceOptimizer.performanceLevel === 'low') {
        letterManager.enablePerformanceMode();
    }
    
    // 監聽性能變化
    document.addEventListener('letter:opened', function() {
        // 在低性能設備上進一步優化
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            letterManager.enablePerformanceMode();
        }
    });
});

console.log('💌 優化版信件功能已載入');
console.log('🎮 可用指令: letterManager.enablePerformanceMode() - 啟用性能模式');