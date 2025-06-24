/**
 * 🔧 完整修復版 home.js - 書籤往右滑出系統
 * 主要修復：書籤從書的右邊往右滑出，預設幾乎完全隱藏，文字不被書本擋住
 */

class BookmarkSystem {
    constructor() {
        this.bookContainer = null;
        this.bookmarksContainer = null;
        this.bookmarks = [];
        this.isInitialized = false;
        this.modalManager = null;
        this.soundSystem = null;
        
        this.init();
    }
    
    /**
     * 初始化系統
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * 設置所有功能
     */
    setup() {
        try {
            // 獲取DOM元素
            this.bookContainer = document.querySelector('.book-container');
            this.bookmarksContainer = document.querySelector('.bookmarks-container');
            this.bookmarks = document.querySelectorAll('.bookmark');
            
            if (!this.bookContainer || !this.bookmarksContainer) {
                console.warn('📚 書籤容器未找到，稍後重試...');
                setTimeout(() => this.setup(), 500);
                return;
            }
            
            // 🔧 確保書籤預設狀態和層級正確
            this.setupBookmarkInitialStates();
            this.setupBookmarkStructure();
            this.setupBookmarkEvents();
            this.setupModalSystem();
            this.setupKeyboardNavigation();
            this.setupTouchSupport();
            this.setupAccessibility();
            this.setupSoundSystem();
            
            this.isInitialized = true;
            console.log('📚 書籤系統初始化完成！(完整修復版)');
            
        } catch (error) {
            console.error('📚 書籤系統初始化失敗:', error);
        }
    }
    
    /**
     * 🔧 設置書籤預設狀態和層級
     */
    setupBookmarkInitialStates() {
        // 確保書籤容器預設位置正確
        if (this.bookmarksContainer) {
            this.bookmarksContainer.style.right = '-150px'; // 隱藏大部分
            this.bookmarksContainer.style.zIndex = '10'; // 容器層級
        }
        
        // 確保所有書籤預設狀態和層級正確
        this.bookmarks.forEach((bookmark, index) => {
            const text = bookmark.querySelector('.bookmark-text');
            const icon = bookmark.querySelector('.bookmark-icon');
            
            if (text) {
                text.style.opacity = '0';
                text.style.transform = 'translateX(-10px)';
                text.style.transition = 'all 0.3s ease 0.1s';
                text.style.zIndex = '10000'; // 🔧 文字層級
                text.style.position = 'relative'; // 🔧 確保 z-index 生效
            }
            
            if (icon) {
                icon.style.opacity = '1';
                icon.style.transform = 'scale(1)';
                icon.style.zIndex = '9999'; // 🔧 圖標層級
                icon.style.position = 'relative'; // 🔧 確保 z-index 生效
            }
            
            // 🔧 書籤基本層級和位置
            bookmark.style.transform = 'translateX(0)';
            bookmark.style.opacity = '0.9';
            bookmark.style.zIndex = '11'; // 🔧 書籤基本層級
            bookmark.style.position = 'relative'; // 🔧 確保 z-index 生效
            
            console.log(`📑 書籤 ${index + 1} 預設狀態和層級已設置`);
        });
    }
    
    /**
     * 設置書籤結構
     */
    setupBookmarkStructure() {
        this.bookmarks.forEach((bookmark, index) => {
            // 確保每個書籤都有正確的結構
            const tab = bookmark.querySelector('.bookmark-tab');
            const icon = bookmark.querySelector('.bookmark-icon');
            const text = bookmark.querySelector('.bookmark-text');
            
            if (!tab || !icon || !text) {
                console.warn(`📑 書籤 ${index} 結構不完整`);
                return;
            }
            
            // 重新組織內容結構
            if (!tab.querySelector('.bookmark-content')) {
                const content = document.createElement('div');
                content.className = 'bookmark-content';
                
                // 移動現有內容到新容器
                content.appendChild(text.cloneNode(true));
                content.appendChild(icon.cloneNode(true));
                
                // 清空tab並添加新結構
                tab.innerHTML = '';
                tab.appendChild(content);
                
                // 如果有徽章，移動到正確位置
                const badge = bookmark.querySelector('.coming-soon-badge');
                if (badge) {
                    bookmark.appendChild(badge.cloneNode(true));
                }
            }
            
            // 設置書籤屬性
            bookmark.setAttribute('tabindex', '0');
            bookmark.setAttribute('role', 'button');
            bookmark.setAttribute('aria-label', `書籤: ${bookmark.dataset.bookmarkId}`);
            
            console.log(`📑 書籤 ${index + 1} 結構已設置`);
        });
    }
    
    /**
     * 🔧 設置書籤事件
     */
    setupBookmarkEvents() {
        this.bookmarks.forEach((bookmark) => {
            const isEnabled = bookmark.dataset.enabled === 'true';
            
            // 點擊事件
            bookmark.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBookmarkClick(bookmark, isEnabled);
            });
            
            // 🔧 懸停事件 - 往右滑出並顯示文字，設置最高層級
            bookmark.addEventListener('mouseenter', () => {
                this.handleBookmarkHover(bookmark, true);
                if (this.soundSystem) {
                    this.soundSystem.playHoverSound();
                }
            });
            
            bookmark.addEventListener('mouseleave', () => {
                this.handleBookmarkHover(bookmark, false);
            });
            
            // 🔧 觸摸事件 - 含層級處理
            let touchTimeout;
            bookmark.addEventListener('touchstart', (e) => {
                e.preventDefault();
                bookmark.classList.add('touch-active');
                this.handleBookmarkHover(bookmark, true);
                
                // 🔧 觸摸時立即設置最高層級
                bookmark.style.zIndex = '9999';
                bookmark.style.position = 'relative';
                
                const text = bookmark.querySelector('.bookmark-text');
                if (text) {
                    text.style.zIndex = '10001';
                    text.style.position = 'relative';
                }
                
                const icon = bookmark.querySelector('.bookmark-icon');
                if (icon) {
                    icon.style.zIndex = '10000';
                    icon.style.position = 'relative';
                }
                
                // 觸摸震動反饋
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                clearTimeout(touchTimeout);
                touchTimeout = setTimeout(() => {
                    bookmark.classList.remove('touch-active');
                    this.handleBookmarkHover(bookmark, false);
                }, 3000);
            });
            
            bookmark.addEventListener('touchend', () => {
                clearTimeout(touchTimeout);
            });
            
            // 鍵盤事件
            bookmark.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleBookmarkClick(bookmark, isEnabled);
                }
            });
        });
        
        // 🔧 書本懸停事件 - 書籤容器從右邊往右移
        if (this.bookContainer) {
            this.bookContainer.addEventListener('mouseenter', () => {
                this.handleBookHover(true);
            });
            
            this.bookContainer.addEventListener('mouseleave', () => {
                this.handleBookHover(false);
            });
        }
        
        console.log('📑 書籤事件已設置 (完整修復版)');
    }
    
    /**
     * 🔧 處理書本懸停
     */
    handleBookHover(isHovering) {
        const book = this.bookContainer.querySelector('.book');
        
        if (isHovering) {
            // 書本懸停效果
            if (book) {
                book.style.transform = 'translateY(-5px) scale(1.02)';
            }
            // 🔧 書籤容器從右邊往右移露出更多
            if (this.bookmarksContainer) {
                this.bookmarksContainer.style.right = '-80px';
            }
        } else {
            // 恢復書本狀態
            if (book) {
                book.style.transform = '';
            }
            // 🔧 書籤容器回到隱藏狀態
            if (this.bookmarksContainer) {
                this.bookmarksContainer.style.right = '-150px';
            }
        }
    }
    
    /**
     * 處理書籤點擊
     */
    handleBookmarkClick(bookmark, isEnabled) {
        const bookmarkId = bookmark.dataset.bookmarkId;
        const title = bookmark.dataset.title || bookmarkId;
        
        // 播放點擊音效
        if (this.soundSystem) {
            this.soundSystem.playClickSound();
        }
        
        if (isEnabled) {
            const route = bookmark.dataset.route;
            if (route && route !== '#') {
                this.navigateToBookmark(route, bookmarkId);
            } else {
                this.showComingSoon(title);
            }
        } else {
            this.showComingSoon(title);
        }
        
        // 🔧 點擊動畫 - 快速往右再恢復
        bookmark.style.transform = 'translateX(55px) scale(0.95)';
        bookmark.style.transition = 'transform 0.15s ease';
        
        setTimeout(() => {
            bookmark.style.transform = '';
            bookmark.style.transition = '';
        }, 150);
        
        console.log(`📑 書籤點擊: ${bookmarkId}`);
    }
    
    /**
     * 🔧 最關鍵修復：處理書籤懸停 - 確保層級最高
     */
    handleBookmarkHover(bookmark, isHovering) {
        const text = bookmark.querySelector('.bookmark-text');
        const icon = bookmark.querySelector('.bookmark-icon');
        
        if (isHovering) {
            // 🔧 懸停進入 - 設置最高層級
            bookmark.style.transform = 'translateX(50px)';
            bookmark.style.opacity = '1';
            bookmark.style.zIndex = '9999'; /* 🔧 最高層級 */
            bookmark.style.position = 'relative'; /* 🔧 確保 z-index 生效 */
            
            if (text) {
                text.style.opacity = '1';
                text.style.transform = 'translateX(0)';
                text.style.zIndex = '10001'; /* 🔧 文字層級最高 */
                text.style.position = 'relative'; /* 🔧 確保 z-index 生效 */
            }
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.filter = 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.9))';
                icon.style.zIndex = '10000'; /* 🔧 圖標高層級 */
                icon.style.position = 'relative'; /* 🔧 確保 z-index 生效 */
            }
            
            console.log('📑 書籤懸停：層級已設為最高', bookmark.dataset.bookmarkId);
        } else {
            // 🔧 懸停離開 - 回到正常層級
            bookmark.style.transform = 'translateX(0)';
            bookmark.style.opacity = '0.9';
            bookmark.style.zIndex = '11'; /* 🔧 回到正常層級 */
            
            if (text) {
                text.style.opacity = '0';
                text.style.transform = 'translateX(-10px)';
                text.style.zIndex = '10000'; /* 🔧 回到正常層級 */
            }
            if (icon) {
                icon.style.transform = '';
                icon.style.filter = '';
                icon.style.zIndex = '9999'; /* 🔧 回到正常層級 */
            }
        }
    }
    
    /**
     * 導航到書籤頁面
     */
    navigateToBookmark(route, bookmarkId) {
        console.log(`🧭 導航到: ${route}`);
        
        // 顯示載入動畫
        this.showLoadingAnimation();
        
        // 延遲導航以顯示動畫
        setTimeout(() => {
            try {
                window.location.href = route;
            } catch (error) {
                console.error('導航錯誤:', error);
                this.hideLoadingAnimation();
                this.showNotification('導航失敗，請重試', 'error');
            }
        }, 300);
    }
    
    /**
     * 設置模態框系統
     */
    setupModalSystem() {
        this.modalManager = new ModalManager();
        console.log('📋 模態框系統已設置');
    }
    
    /**
     * 設置音效系統
     */
    setupSoundSystem() {
        this.soundSystem = new SoundSystem();
        console.log('🔊 音效系統已設置');
    }
    
    /**
     * 🔧 設置鍵盤導航
     */
    setupKeyboardNavigation() {
        let currentIndex = -1;
        const enabledBookmarks = Array.from(this.bookmarks).filter(
            bookmark => bookmark.dataset.enabled === 'true'
        );
        
        document.addEventListener('keydown', (e) => {
            if (enabledBookmarks.length === 0) return;
            
            // 如果模態框開啟，不處理導航
            if (this.modalManager && this.modalManager.isOpen) return;
            
            switch(e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % enabledBookmarks.length;
                    enabledBookmarks[currentIndex].focus();
                    this.highlightBookmark(enabledBookmarks[currentIndex]);
                    break;
                    
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    currentIndex = currentIndex <= 0 ? enabledBookmarks.length - 1 : currentIndex - 1;
                    enabledBookmarks[currentIndex].focus();
                    this.highlightBookmark(enabledBookmarks[currentIndex]);
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    currentIndex = 0;
                    enabledBookmarks[currentIndex].focus();
                    this.highlightBookmark(enabledBookmarks[currentIndex]);
                    break;
                    
                case 'End':
                    e.preventDefault();
                    currentIndex = enabledBookmarks.length - 1;
                    enabledBookmarks[currentIndex].focus();
                    this.highlightBookmark(enabledBookmarks[currentIndex]);
                    break;
                    
                case 'Escape':
                    document.activeElement.blur();
                    currentIndex = -1;
                    this.clearHighlight();
                    break;
            }
        });
        
        console.log('⌨️ 鍵盤導航已設置');
    }
    
    /**
     * 🔧 高亮顯示書籤 - 確保層級最高
     */
    highlightBookmark(bookmark) {
        // 清除其他高亮
        this.clearHighlight();
        
        // 🔧 高亮當前書籤（最高層級）
        bookmark.style.outline = '2px solid var(--gold)';
        bookmark.style.outlineOffset = '2px';
        bookmark.style.transform = 'translateX(50px)';
        bookmark.style.opacity = '1';
        bookmark.style.zIndex = '9999'; /* 🔧 最高層級 */
        bookmark.style.position = 'relative'; /* 🔧 確保 z-index 生效 */
        
        // 顯示文字並設置最高層級
        const text = bookmark.querySelector('.bookmark-text');
        if (text) {
            text.style.opacity = '1';
            text.style.transform = 'translateX(0)';
            text.style.zIndex = '10001'; /* 🔧 文字層級最高 */
            text.style.position = 'relative'; /* 🔧 確保 z-index 生效 */
        }
        
        const icon = bookmark.querySelector('.bookmark-icon');
        if (icon) {
            icon.style.zIndex = '10000'; /* 🔧 圖標高層級 */
            icon.style.position = 'relative'; /* 🔧 確保 z-index 生效 */
        }
    }
    
    /**
     * 🔧 清除高亮 - 恢復正常層級
     */
    clearHighlight() {
        this.bookmarks.forEach(bookmark => {
            bookmark.style.outline = '';
            bookmark.style.outlineOffset = '';
            bookmark.style.transform = 'translateX(0)';
            bookmark.style.opacity = '0.9';
            bookmark.style.zIndex = '11'; /* 🔧 回到正常層級 */
            
            const text = bookmark.querySelector('.bookmark-text');
            if (text) {
                text.style.opacity = '0';
                text.style.transform = 'translateX(-10px)';
                text.style.zIndex = '10000'; /* 🔧 回到正常層級 */
            }
            
            const icon = bookmark.querySelector('.bookmark-icon');
            if (icon) {
                icon.style.zIndex = '9999'; /* 🔧 回到正常層級 */
            }
        });
    }
    
    /**
     * 🔧 設置觸摸支持（含層級處理）
     */
    setupTouchSupport() {
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            // 觸摸手勢支持
            let touchStartX = 0;
            let touchStartY = 0;
            
            this.bookContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });
            
            this.bookContainer.addEventListener('touchmove', (e) => {
                if (!touchStartX || !touchStartY) return;
                
                const touchEndX = e.touches[0].clientX;
                const touchEndY = e.touches[0].clientY;
                
                const diffX = touchStartX - touchEndX;
                const diffY = touchStartY - touchEndY;
                
                // 🔧 檢測右滑手勢（顯示書籤）
                if (Math.abs(diffX) > Math.abs(diffY) && diffX < -50) {
                    this.handleSwipeRight();
                }
                // 檢測左滑手勢（隱藏書籤）
                else if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
                    this.handleSwipeLeft();
                }
            });
            
            console.log('👆 觸摸支持已設置（含層級處理）');
        }
    }
    
    /**
     * 🔧 處理右滑手勢
     */
    handleSwipeRight() {
        // 右滑時顯示書籤
        this.bookmarksContainer.style.transition = 'right 0.3s ease';
        this.bookmarksContainer.style.right = '-60px';
        
        setTimeout(() => {
            this.bookmarksContainer.style.transition = '';
            this.bookmarksContainer.style.right = '';
        }, 2000);
    }
    
    /**
     * 🔧 處理左滑手勢
     */
    handleSwipeLeft() {
        // 左滑時完全隱藏書籤
        this.bookmarksContainer.style.transition = 'right 0.3s ease';
        this.bookmarksContainer.style.right = '-200px';
        
        setTimeout(() => {
            this.bookmarksContainer.style.transition = '';
            this.bookmarksContainer.style.right = '';
        }, 2000);
    }
    
    /**
     * 設置無障礙功能
     */
    setupAccessibility() {
        // 檢查動畫偏好
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
            console.log('♿ 已啟用減少動畫模式');
        }
        
        // 監聽偏好變化
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        });
        
        // 設置ARIA live region用於動態通知
        this.createAriaLiveRegion();
        
        console.log('♿ 無障礙功能已設置');
    }
    
    /**
     * 創建ARIA live region
     */
    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.id = 'aria-live-region';
        
        document.body.appendChild(liveRegion);
    }
    
    /**
     * 通知螢幕閱讀器
     */
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    /**
     * 顯示即將推出提示
     */
    showComingSoon(featureName) {
        if (this.modalManager) {
            this.modalManager.show(
                `${featureName} - 即將推出！`,
                '這個功能正在努力開發中，請耐心等待！',
                '🚧'
            );
            
            // 通知螢幕閱讀器
            this.announceToScreenReader(`${featureName}功能即將推出`);
        } else {
            alert(`${featureName} - 即將推出！`);
        }
    }
    
    /**
     * 顯示載入動畫
     */
    showLoadingAnimation() {
        let loadingOverlay = document.getElementById('loading-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.setAttribute('role', 'status');
            loadingOverlay.setAttribute('aria-label', '載入中');
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner">⭐</div>
                    <p>載入中...</p>
                </div>
            `;
            
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(5px);
            `;
            
            const loadingContent = loadingOverlay.querySelector('.loading-content');
            loadingContent.style.cssText = `
                text-align: center;
                color: white;
            `;
            
            const spinner = loadingOverlay.querySelector('.loading-spinner');
            spinner.style.cssText = `
                font-size: 3rem;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            `;
            
            // 添加旋轉動畫
            if (!document.querySelector('#loading-styles')) {
                const style = document.createElement('style');
                style.id = 'loading-styles';
                style.textContent = `
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(loadingOverlay);
        } else {
            loadingOverlay.style.display = 'flex';
        }
        
        // 通知螢幕閱讀器
        this.announceToScreenReader('正在載入頁面');
    }
    
    /**
     * 隱藏載入動畫
     */
    hideLoadingAnimation() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    /**
     * 顯示通知
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon" aria-hidden="true">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${this.escapeHtml(message)}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()" aria-label="關閉通知">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 顯示動畫
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 50);
        
        // 自動消失
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // 通知螢幕閱讀器
        this.announceToScreenReader(message);
    }
    
    /**
     * 獲取通知圖標
     */
    getNotificationIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || icons.info;
    }
    
    /**
     * 獲取通知顏色
     */
    getNotificationColor(type) {
        const colors = {
            'info': 'rgba(59, 130, 246, 0.9)',
            'success': 'rgba(34, 197, 94, 0.9)',
            'warning': 'rgba(251, 191, 36, 0.9)',
            'error': 'rgba(239, 68, 68, 0.9)'
        };
        return colors[type] || colors.info;
    }
    
    /**
     * 安全的HTML轉義
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 獲取系統狀態
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            bookmarksCount: this.bookmarks.length,
            enabledBookmarks: Array.from(this.bookmarks).filter(
                bookmark => bookmark.dataset.enabled === 'true'
            ).length,
            hasModalManager: !!this.modalManager,
            hasSoundSystem: !!this.soundSystem,
            isTouchDevice: 'ontouchstart' in window,
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }
    
    /**
     * 重新初始化系統
     */
    reinitialize() {
        console.log('🔄 重新初始化書籤系統...');
        this.isInitialized = false;
        this.clearHighlight();
        this.setup();
    }
    
    /**
     * 銷毀系統
     */
    destroy() {
        console.log('🗑️ 銷毀書籤系統...');
        
        // 清除事件監聽器
        this.bookmarks.forEach(bookmark => {
            bookmark.replaceWith(bookmark.cloneNode(true));
        });
        
        // 清除其他資源
        this.clearHighlight();
        
        if (this.modalManager) {
            this.modalManager.destroy();
        }
        
        if (this.soundSystem) {
            this.soundSystem.destroy();
        }
        
        this.isInitialized = false;
    }
}

/**
 * 模態框管理器
 */
class ModalManager {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.focusableElements = [];
        this.lastFocusedElement = null;
        this.init();
    }
    
    init() {
        this.modal = document.getElementById('coming-soon-modal');
        if (!this.modal) {
            console.warn('模態框元素未找到');
            return;
        }
        
        this.setupEventListeners();
        this.setupFocusManagement();
        console.log('📋 模態框管理器已初始化');
    }
    
    setupEventListeners() {
        if (!this.modal) return;
        
        // 點擊背景關閉
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // 處理關閉按鈕
        const closeButtons = this.modal.querySelectorAll('button, [data-dismiss="modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.close());
        });
    }
    
    setupFocusManagement() {
        if (!this.modal) return;
        
        // 獲取可聚焦元素
        const focusableSelectors = [
            'button',
            '[href]',
            'input',
            'select',
            'textarea',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');
        
        this.focusableElements = Array.from(this.modal.querySelectorAll(focusableSelectors));
        
        // Tab 鍵循環聚焦
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.isOpen) {
                this.handleTabKey(e);
            }
        });
    }
    
    handleTabKey(e) {
        if (this.focusableElements.length === 0) return;
        
        const firstElement = this.focusableElements[0];
        const lastElement = this.focusableElements[this.focusableElements.length - 1];
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    show(title = '即將推出！', message = '這個功能正在努力開發中，請耐心等待！', icon = '🚧') {
        if (!this.modal) {
            console.error('模態框未找到，無法顯示');
            return;
        }
        
        // 保存當前聚焦元素
        this.lastFocusedElement = document.activeElement;
        
        // 更新內容
        this.updateContent(title, message, icon);
        
        // 防止背景滾動
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // 顯示模態框
        this.modal.classList.add('show');
        this.modal.style.display = 'flex';
        this.modal.setAttribute('aria-hidden', 'false');
        
        // 聚焦到第一個可聚焦元素
        setTimeout(() => {
            if (this.focusableElements.length > 0) {
                this.focusableElements[0].focus();
            } else {
                this.modal.focus();
            }
        }, 100);
        
        this.isOpen = true;
        console.log(`📢 顯示模態框: ${title}`);
    }
    
    close() {
        if (!this.modal || !this.isOpen) return;
        
        // 添加淡出動畫
        this.modal.classList.add('fade-out');
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modal.classList.remove('show', 'fade-out');
            this.modal.setAttribute('aria-hidden', 'true');
            
            // 恢復背景滾動
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            
            // 恢復焦點
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }
            
            this.isOpen = false;
        }, 300);
        
        console.log('📢 關閉模態框');
    }
    
    updateContent(title, message, icon) {
        const titleElement = this.modal.querySelector('#modal-title') || this.modal.querySelector('h3');
        const messageElement = this.modal.querySelector('#modal-description') || this.modal.querySelector('p');
        const iconElement = this.modal.querySelector('.modal-icon');
        
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        if (iconElement) iconElement.textContent = icon;
    }
    
    destroy() {
        if (this.isOpen) {
            this.close();
        }
        this.modal = null;
        this.focusableElements = [];
        this.lastFocusedElement = null;
    }
}

/**
 * 音效系統
 */
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.volume = 0.1;
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
            console.log('🔊 音效系統已初始化');
        } catch (e) {
            console.warn('🔇 音效系統不可用');
        }
    }
    
    playHoverSound() {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            // 靜默處理音效錯誤
        }
    }
    
    playClickSound() {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(this.volume * 1.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (e) {
            // 靜默處理音效錯誤
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    enable() {
        this.enabled = true;
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    disable() {
        this.enabled = false;
    }
    
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.enabled = false;
    }
}

// ===== 主程序入口 =====

// 全域變數
let bookmarkSystem = null;

// 初始化所有系統
function initializeApp() {
    console.log('🚀 開始初始化 InternetCorner 系統...');
    
    try {
        // 初始化書籤系統
        bookmarkSystem = new BookmarkSystem();
        
        // 用戶首次交互後啟用音效
        document.addEventListener('click', () => {
            if (bookmarkSystem && bookmarkSystem.soundSystem && bookmarkSystem.soundSystem.audioContext) {
                if (bookmarkSystem.soundSystem.audioContext.state === 'suspended') {
                    bookmarkSystem.soundSystem.audioContext.resume();
                }
            }
        }, { once: true });
        
        console.log('✨ InternetCorner 系統初始化完成！(完整修復版)');
        
        // 標記頁面已準備就緒
        document.body.classList.add('app-ready');
        
    } catch (error) {
        console.error('❌ 系統初始化失敗:', error);
    }
}

// DOM 載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ===== 全域API和向後兼容 =====

// 導出到全域作用域
window.bookmarkSystem = bookmarkSystem;

// 向後兼容的函數
window.showComingSoon = function(featureName) {
    if (bookmarkSystem && bookmarkSystem.modalManager) {
        bookmarkSystem.showComingSoon(featureName);
    } else {
        alert(`${featureName} - 即將推出！`);
    }
};

window.closeComingSoonModal = function() {
    if (bookmarkSystem && bookmarkSystem.modalManager) {
        bookmarkSystem.modalManager.close();
    }
};

// 調試和管理函數
window.getBookmarkStatus = function() {
    if (bookmarkSystem) {
        const status = bookmarkSystem.getStatus();
        console.log('📊 書籤系統狀態:', status);
        return status;
    }
    return { error: '書籤系統未初始化' };
};

window.reinitializeBookmarks = function() {
    if (bookmarkSystem) {
        bookmarkSystem.reinitialize();
    } else {
        console.warn('書籤系統未初始化');
    }
};

window.toggleSound = function(enabled) {
    if (bookmarkSystem && bookmarkSystem.soundSystem) {
        if (enabled !== undefined) {
            enabled ? bookmarkSystem.soundSystem.enable() : bookmarkSystem.soundSystem.disable();
        } else {
            bookmarkSystem.soundSystem.enabled = !bookmarkSystem.soundSystem.enabled;
        }
        console.log(`🔊 音效已${bookmarkSystem.soundSystem.enabled ? '啟用' : '停用'}`);
        return bookmarkSystem.soundSystem.enabled;
    }
    return false;
};

window.setSoundVolume = function(volume) {
    if (bookmarkSystem && bookmarkSystem.soundSystem) {
        bookmarkSystem.soundSystem.setVolume(volume);
        console.log(`🔊 音量設定為: ${volume}`);
    }
};

// ===== 頁面卸載處理 =====

window.addEventListener('beforeunload', function() {
    console.log('📄 頁面即將卸載，清理資源...');
    
    if (bookmarkSystem) {
        bookmarkSystem.destroy();
    }
});

// ===== 頁面可見性處理 =====

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('👁️ 頁面已隱藏');
    } else {
        console.log('👁️ 頁面已顯示');
        if (bookmarkSystem && !bookmarkSystem.isInitialized) {
            bookmarkSystem.reinitialize();
        }
    }
});

// ===== 網路狀態處理 =====

if ('navigator' in window && 'onLine' in navigator) {
    window.addEventListener('online', function() {
        console.log('🌐 網路已連接');
        if (bookmarkSystem) {
            bookmarkSystem.showNotification('網路連接已恢復', 'success');
        }
    });
    
    window.addEventListener('offline', function() {
        console.log('🚫 網路已斷線');
        if (bookmarkSystem) {
            bookmarkSystem.showNotification('網路連接已中斷', 'warning');
        }
    }
    );
}

console.log('📚 home.js 已完全載入 (完整修復版)');
console.log('💡 可用的全域指令:');
console.log('  getBookmarkStatus() - 查看書籤系統狀態');
console.log('  reinitializeBookmarks() - 重新初始化書籤');
console.log('  showComingSoon("功能名稱") - 顯示即將推出提示');
console.log('  toggleSound() - 切換音效開關');
console.log('  setSoundVolume(0.5) - 設定音效音量');
console.log('🎉 InternetCorner 準備就緒！(完整修復版 - 書籤往右滑出，文字不被擋住)');