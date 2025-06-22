/**
 * 信封信件功能模組
 * 提供右下角信封的全螢幕展開和互動功能
 */

class LetterManager {
    constructor() {
        this.envelopeContainer = null;
        this.letterContent = null;
        this.isFullscreen = false;
        this.animationDuration = 600; // CSS 變數 --envelope-anim-duration 的預設值
        
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

        // 獲取 CSS 動畫時間
        this.updateAnimationDuration();

        // 綁定事件監聽器
        this.bindEvents();

        console.log('💌 信件功能已初始化');
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
                this.animationDuration = duration;
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

        // 視窗大小改變時更新動畫時間
        window.addEventListener('resize', () => {
            this.updateAnimationDuration();
        });
    }

    /**
     * 處理信封容器點擊事件
     */
    handleEnvelopeClick(e) {
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
        if (this.isFullscreen) return;

        this.isFullscreen = true;

        // 檢查並關閉可能存在的圖片預覽
        this.closeImageOverlay();

        // 禁止頁面滾動
        document.body.style.overflow = 'hidden';

        // 添加全螢幕樣式類
        this.envelopeContainer.classList.add('fullscreen');

        // 等待 CSS 動畫完成後顯示信件內容
        setTimeout(() => {
            this.letterContent.classList.add('show');
            this.focusLetter();
        }, this.animationDuration + 50);

        // 觸發自定義事件
        this.dispatchCustomEvent('letter:opened');
    }

    /**
     * 退出全螢幕模式
     */
    exitFullscreen() {
        if (!this.isFullscreen) return;

        this.isFullscreen = false;

        // 隱藏信件內容
        this.letterContent.classList.remove('show');

        // 恢復頁面滾動
        document.body.style.overflow = '';

        // 移除全螢幕樣式類
        this.envelopeContainer.classList.remove('fullscreen');

        // 恢復焦點到 body
        document.body.focus();

        // 觸發自定義事件
        this.dispatchCustomEvent('letter:closed');
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
            }, 300);
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
     * 更新信件內容
     */
    updateLetterContent(title, content, signature) {
        if (!this.letterContent) return;

        const titleElement = this.letterContent.querySelector('h3');
        const signatureElement = this.letterContent.querySelector('.signature p');

        if (titleElement && title) {
            titleElement.textContent = title;
        }

        if (signatureElement && signature) {
            signatureElement.textContent = signature;
        }

        if (content) {
            // 移除現有的段落（除了標題和署名）
            const paragraphs = this.letterContent.querySelectorAll('p:not(.signature p)');
            paragraphs.forEach(p => {
                if (!p.closest('.signature') && !p.classList.contains('close-hint')) {
                    p.remove();
                }
            });

            // 添加新內容
            const titleElement = this.letterContent.querySelector('h3');
            const signatureElement = this.letterContent.querySelector('.signature');

            if (Array.isArray(content)) {
                content.forEach(text => {
                    const p = document.createElement('p');
                    p.textContent = text;
                    this.letterContent.insertBefore(p, signatureElement);
                });
            } else if (typeof content === 'string') {
                const p = document.createElement('p');
                p.textContent = content;
                this.letterContent.insertBefore(p, signatureElement);
            }
        }
    }

    /**
     * 獲取當前狀態
     */
    getState() {
        return {
            isFullscreen: this.isFullscreen,
            isInitialized: !!(this.envelopeContainer && this.letterContent),
            animationDuration: this.animationDuration
        };
    }

    /**
     * 銷毀信件管理器
     */
    destroy() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        }

        // 移除事件監聽器的引用會在垃圾回收時自動清理
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