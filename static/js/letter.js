// ===== 🔧 統一信封系統 - 修復置中問題 =====

class LetterManager {
    constructor() {
        this.envelopeContainer = null;
        this.letterContent = null;
        this.isFullscreen = false;
        this.animationDuration = 400;
        this.isAnimating = false;
        
        this.init();
    }

    /**
     * 初始化信件功能
     */
    init() {
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
            console.warn('💌 信封元素未找到，信件功能將不可用');
            return;
        }

        // 🔧 修復置中問題 - 設置正確的樣式
        this.fixCenteringStyles();

        // 預先優化元素
        this.optimizeElements();

        // 獲取 CSS 動畫時間
        this.updateAnimationDuration();

        // 綁定事件監聽器
        this.bindEvents();

        console.log('💌 信件功能已初始化 (置中修復版)');
    }

    /**
     * 🔧 修復置中問題 - 設置正確的CSS樣式
     */
    fixCenteringStyles() {
        // 確保信件內容有正確的置中樣式
        this.letterContent.style.position = 'fixed';
        this.letterContent.style.top = '50%';
        this.letterContent.style.left = '50%';
        this.letterContent.style.transform = 'translate(-50%, -50%)';
        this.letterContent.style.zIndex = '10001';
        
        // 設置適當的尺寸和邊距
        this.letterContent.style.width = '90%';
        this.letterContent.style.maxWidth = '600px';
        this.letterContent.style.maxHeight = '80vh';
        this.letterContent.style.overflow = 'auto';
        
        // 確保背景和邊框樣式
        this.letterContent.style.background = 'rgba(255, 255, 255, 0.98)';
        this.letterContent.style.borderRadius = '15px';
        this.letterContent.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.5)';
        this.letterContent.style.border = '3px solid #d4af37';
        this.letterContent.style.padding = '40px';
        this.letterContent.style.fontFamily = "'Noto Sans TC', serif";
        this.letterContent.style.color = '#333';
        this.letterContent.style.lineHeight = '1.8';
        this.letterContent.style.textAlign = 'center';
        
        // 響應式調整
        const updateResponsiveStyles = () => {
            if (window.innerWidth <= 768) {
                this.letterContent.style.width = '95%';
                this.letterContent.style.padding = '25px';
                this.letterContent.style.maxHeight = '85vh';
            } else {
                this.letterContent.style.width = '90%';
                this.letterContent.style.padding = '40px';
                this.letterContent.style.maxHeight = '80vh';
            }
        };
        
        // 初始設置
        updateResponsiveStyles();
        
        // 監聽視窗大小變化
        window.addEventListener('resize', updateResponsiveStyles);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateResponsiveStyles, 300);
        });

        console.log('🔧 信件置中樣式已修復');
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
        this.letterContent.style.transform = 'translate(-50%, -50%) translateZ(0)';
        
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
                this.animationDuration = Math.min(duration, 600);
            }
        } catch (error) {
            console.warn('💌 無法獲取 CSS 動畫時間，使用預設值:', this.animationDuration + 'ms');
        }
    }

    /**
     * 🔧 綁定所有事件監聽器 - 完全模仿生日蛋糕
     */
    bindEvents() {
        // 🔧 點擊信封容器 - 模仿蛋糕點擊
        this.envelopeContainer.addEventListener('click', (e) => {
            if (!this.isFullscreen && (e.target === this.envelopeContainer || e.target.closest('.envelope'))) {
                this.openLetter();
            } else if (this.isFullscreen && e.target === this.envelopeContainer) {
                this.closeLetter();
            }
        });

        // 🔧 鍵盤事件 - 模仿蛋糕鍵盤支援
        this.envelopeContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!this.isFullscreen) {
                    this.openLetter();
                }
            }
        });

        // 🔧 全域鍵盤事件 - ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.closeLetter();
            }
        });

        // 防止在動畫期間重複觸發
        this.envelopeContainer.addEventListener('touchstart', (e) => {
            if (this.isAnimating) {
                e.preventDefault();
            }
        });

        console.log('💌 事件監聽器已綁定 (蛋糕風格)');
    }

    /**
     * 🔧 開啟信件 - 修復置中問題
     */
    openLetter() {
        if (this.isFullscreen || this.isAnimating) return;

        this.isAnimating = true;
        this.isFullscreen = true;

        console.log('💌 信件開啟中...');

        // 檢查並關閉可能存在的圖片預覽
        this.closeImageOverlay();

        // 暫停星空動畫以提升性能
        this.pauseBackgroundAnimations();

        // 禁止頁面滾動
        document.body.style.overflow = 'hidden';

        // 立即應用全螢幕樣式
        this.envelopeContainer.classList.add('fullscreen');

        // 🔧 強制重新計算置中位置
        this.recenterLetter();

        // 等待動畫完成後顯示信件內容
        setTimeout(() => {
            this.letterContent.classList.add('show');
            this.letterContent.style.opacity = '1';
            this.letterContent.style.visibility = 'visible';
            
            // 🔧 再次確保置中
            this.recenterLetter();
            
            this.focusLetter();
            this.isAnimating = false;
            
            console.log('💌 信件已開啟且置中');
        }, this.animationDuration);

        // 觸發自定義事件
        this.dispatchCustomEvent('letter:opened');
    }

    /**
     * 🔧 重新計算並確保信件置中
     */
    recenterLetter() {
        if (!this.letterContent) return;

        // 強制重新計算位置
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 設置固定定位
        this.letterContent.style.position = 'fixed';
        this.letterContent.style.top = '50%';
        this.letterContent.style.left = '50%';
        this.letterContent.style.transform = 'translate(-50%, -50%)';
        this.letterContent.style.zIndex = '10001';
        
        // 響應式尺寸調整
        if (viewportWidth <= 768) {
            this.letterContent.style.width = '95%';
            this.letterContent.style.maxWidth = '95vw';
            this.letterContent.style.padding = '25px';
            this.letterContent.style.fontSize = '1rem';
        } else {
            this.letterContent.style.width = '90%';
            this.letterContent.style.maxWidth = '600px';
            this.letterContent.style.padding = '40px';
            this.letterContent.style.fontSize = '1.1rem';
        }
        
        // 高度限制
        this.letterContent.style.maxHeight = viewportHeight <= 600 ? '90vh' : '80vh';
        
        console.log('🔧 信件已重新置中', {
            viewport: `${viewportWidth}x${viewportHeight}`,
            letterSize: `${this.letterContent.offsetWidth}x${this.letterContent.offsetHeight}`
        });
    }

    /**
     * 🔧 關閉信件 - 模仿蛋糕關閉動畫
     */
    closeLetter() {
        if (!this.isFullscreen || this.isAnimating) return;

        this.isAnimating = true;
        this.isFullscreen = false;

        console.log('💌 信件關閉中...');

        // 隱藏信件內容
        this.letterContent.classList.remove('show');
        this.letterContent.style.opacity = '0';
        this.letterContent.style.visibility = 'hidden';

        setTimeout(() => {
            // 恢復頁面滾動
            document.body.style.overflow = '';

            // 移除全螢幕樣式類
            this.envelopeContainer.classList.remove('fullscreen');

            // 恢復背景動畫
            this.resumeBackgroundAnimations();

            // 恢復焦點
            this.envelopeContainer.focus();

            this.isAnimating = false;
            
            console.log('💌 信件已關閉');
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
            console.warn('💌 暫停背景動畫時出錯:', error);
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
            console.warn('💌 恢復背景動畫時出錯:', error);
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
            }, 200);
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
     * 🔧 更新信件內容（優化版）
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
        
        // 重新應用置中樣式
        this.fixCenteringStyles();
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
            this.closeLetter();
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

// ===== 🔧 全域實例和控制接口 - 模仿生日系統 =====

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

// 🔧 為了向後兼容，提供原始的函數接口
window.initEnvelopeBehavior = function() {
    console.warn('initEnvelopeBehavior 已棄用，請使用 LetterManager 類');
    return letterManager;
};

// 🔧 全域函數：開啟信件（模仿生日系統）
window.openLetter = function() {
    if (letterManager) {
        letterManager.openLetter();
    }
};

// 🔧 全域函數：關閉信件（模仿生日系統）
window.closeLetter = function() {
    if (letterManager) {
        letterManager.closeLetter();
    }
};

// 🔧 全域函數：切換信件狀態（模仿生日系統）
window.toggleLetter = function() {
    if (letterManager) {
        if (letterManager.isFullscreen) {
            letterManager.closeLetter();
        } else {
            letterManager.openLetter();
        }
    }
};

// 🔧 全域函數：重新置中信件
window.recenterLetter = function() {
    if (letterManager && letterManager.isFullscreen) {
        letterManager.recenterLetter();
        console.log('💌 信件已手動重新置中');
    }
};

// ===== 🔧 事件監聽和集成 - 模仿生日系統 =====

// 性能檢測和自動優化
document.addEventListener('DOMContentLoaded', function() {
    // 檢測性能並自動啟用優化模式
    if (window.performanceOptimizer && window.performanceOptimizer.performanceLevel === 'low') {
        if (letterManager) {
            letterManager.enablePerformanceMode();
        }
    }
    
    // 監聽性能變化
    document.addEventListener('letter:opened', function() {
        // 在低性能設備上進一步優化
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            if (letterManager) {
                letterManager.enablePerformanceMode();
            }
        }
    });

    console.log('💌 信件系統事件監聽器已設置');
});

// 🔧 頁面可見性處理（模仿生日系統）
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 頁面隱藏時自動關閉信件
        if (letterManager && letterManager.isFullscreen) {
            letterManager.closeLetter();
        }
    }
});

// 🔧 方向變化處理（模仿生日系統）
window.addEventListener('orientationchange', function() {
    if (letterManager && letterManager.isFullscreen) {
        // 方向變化時重新調整置中
        setTimeout(() => {
            letterManager.recenterLetter();
            console.log('📱 方向變化：信件已重新置中');
        }, 300);
    }
});

// 🔧 視窗大小變化處理
window.addEventListener('resize', function() {
    if (letterManager && letterManager.isFullscreen) {
        // 延遲重新置中以避免頻繁調用
        clearTimeout(letterManager._resizeTimeout);
        letterManager._resizeTimeout = setTimeout(() => {
            letterManager.recenterLetter();
            console.log('🖥️ 視窗大小變化：信件已重新置中');
        }, 150);
    }
});

// 🔧 錯誤處理（模仿生日系統）
window.addEventListener('error', function(e) {
    if (letterManager && letterManager.isFullscreen) {
        console.error('💌 信件系統錯誤:', e.error);
        // 發生錯誤時嘗試關閉信件
        try {
            letterManager.closeLetter();
        } catch (closeError) {
            console.error('💌 關閉信件時發生錯誤:', closeError);
        }
    }
});

// 🔧 觸摸設備支援（模仿生日系統）
if ('ontouchstart' in window) {
    document.addEventListener('DOMContentLoaded', function() {
        if (letterManager && letterManager.envelopeContainer) {
            // 為觸摸設備添加特殊樣式
            letterManager.envelopeContainer.style.minWidth = '48px';
            letterManager.envelopeContainer.style.minHeight = '48px';
            
            // 觸摸反饋
            let touchTimer;
            letterManager.envelopeContainer.addEventListener('touchstart', function() {
                touchTimer = setTimeout(() => {
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }, 500);
            });
            
            letterManager.envelopeContainer.addEventListener('touchend', function() {
                clearTimeout(touchTimer);
            });
            
            console.log('💌 觸摸設備支援已啟用');
        }
    });
}

// ===== 🔧 調試和管理函數（模仿生日系統） =====

// 🔧 獲取信件狀態
window.getLetterStatus = function() {
    if (letterManager) {
        const status = letterManager.getState();
        console.log('💌 信件系統狀態:', status);
        return status;
    }
    return { error: '信件系統未初始化' };
};

// 🔧 重新初始化信件系統
window.reinitializeLetter = function() {
    if (letterManager) {
        letterManager.destroy();
        letterManager = new LetterManager();
        console.log('💌 信件系統已重新初始化');
    } else {
        letterManager = new LetterManager();
        console.log('💌 信件系統已初始化');
    }
};

// 🔧 啟用性能模式
window.enableLetterPerformanceMode = function() {
    if (letterManager) {
        letterManager.enablePerformanceMode();
        return true;
    }
    return false;
};

// 🔧 更新信件內容
window.updateLetterContent = function(title, content, signature) {
    if (letterManager) {
        letterManager.updateLetterContent(title, content, signature);
        console.log('💌 信件內容已更新');
        return true;
    }
    return false;
};

console.log('💌 統一信件功能已載入！(置中修復版)');
console.log('🎮 可用指令:');
console.log('  openLetter() - 開啟信件');
console.log('  closeLetter() - 關閉信件');
console.log('  toggleLetter() - 切換信件狀態');
console.log('  recenterLetter() - 重新置中信件');
console.log('  getLetterStatus() - 查看信件狀態');
console.log('  reinitializeLetter() - 重新初始化');
console.log('  enableLetterPerformanceMode() - 啟用性能模式');
console.log('  updateLetterContent(title, content, signature) - 更新內容');
console.log('  🌟 現在信件會正確在螢幕中間置中！');