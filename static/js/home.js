/**
 * 🔧 修復版 home.js - 解決手機平板書籤點擊問題
 * 主要修復：觸摸事件處理、指針事件管理、響應式交互優化
 */

class BookmarkSystem {
    constructor() {
        this.bookContainer = null;
        this.bookmarksContainer = null;
        this.bookmarks = [];
        this.isInitialized = false;
        this.modalManager = null;
        this.soundSystem = null;
        this.isMobile = false;
        this.touchStartTime = 0;
        this.touchStartPosition = { x: 0, y: 0 };
        
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
            // 檢測設備類型
            this.detectDeviceType();
            
            // 獲取DOM元素
            this.bookContainer = document.querySelector('.book-container');
            this.bookmarksContainer = document.querySelector('.bookmarks-container');
            this.bookmarks = document.querySelectorAll('.bookmark');
            
            if (!this.bookContainer || !this.bookmarksContainer) {
                console.warn('📚 書籤容器未找到，稍後重試...');
                setTimeout(() => this.setup(), 500);
                return;
            }
            
            // 🔧 設置初始狀態 - 完全隱藏書籤
            this.setupInitialState();
            this.setupBookmarkStructure();
            this.setupBookmarkEvents();
            this.setupModalSystem();
            this.setupKeyboardNavigation();
            this.setupTouchSupport();
            this.setupAccessibility();
            this.setupSoundSystem();
            
            this.isInitialized = true;
            console.log('📚 書籤系統初始化完成！(修復版 - 觸摸優化)');
            
        } catch (error) {
            console.error('📚 書籤系統初始化失敗:', error);
        }
    }
    
    /**
     * 🔧 檢測設備類型
     */
    detectDeviceType() {
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.isTablet = this.isMobile && window.innerWidth >= 768 && window.innerWidth <= 1024;
        this.isPhone = this.isMobile && window.innerWidth < 768;
        
        console.log(`📱 設備檢測: 手機=${this.isPhone}, 平板=${this.isTablet}, 觸摸設備=${this.isMobile}`);
        
        // 添加設備類型到 body
        if (this.isMobile) {
            document.body.classList.add('touch-device');
            if (this.isPhone) document.body.classList.add('mobile-device');
            if (this.isTablet) document.body.classList.add('tablet-device');
        }
    }
    
    /**
     * 🔧 設置初始狀態 - 書籤完全隱藏在書底下
     */
    setupInitialState() {
        // 🔧 書籤容器預設完全隱藏
        if (this.bookmarksContainer) {
            this.bookmarksContainer.style.right = '-200px'; // 完全隱藏
            this.bookmarksContainer.style.opacity = '0'; // 完全透明
            this.bookmarksContainer.style.zIndex = '1'; // 在書本之下
            this.bookmarksContainer.style.pointerEvents = 'none'; // 預設不可點擊
            this.bookmarksContainer.style.transition = 'right 0.4s ease, opacity 0.4s ease, z-index 0s ease 0.2s';
        }
        
        // 🔧 所有書籤預設狀態
        this.bookmarks.forEach((bookmark, index) => {
            const text = bookmark.querySelector('.bookmark-text');
            const icon = bookmark.querySelector('.bookmark-icon');
            const tab = bookmark.querySelector('.bookmark-tab');
            const badge = bookmark.querySelector('.coming-soon-badge');
            
            // 🔧 文字預設完全隱藏
            if (text) {
                text.style.opacity = '0';
                text.style.transform = 'translateX(-20px)';
                text.style.transition = 'all 0.3s ease 0.1s';
                text.style.zIndex = '10000';
                text.style.position = 'relative';
                text.style.pointerEvents = 'none'; // 預設不可點擊
            }
            
            // 🔧 圖標預設顯示
            if (icon) {
                icon.style.opacity = '1';
                icon.style.transform = 'scale(1)';
                icon.style.zIndex = '9999';
                icon.style.position = 'relative';
            }
            
            // 🔧 書籤標籤設置指針事件
            if (tab) {
                tab.style.pointerEvents = 'auto';
                tab.style.cursor = 'pointer';
            }
            
            // 🔧 徽章預設顯示但跟隨容器透明度
            if (badge) {
                badge.style.opacity = '1';
                badge.style.position = 'absolute';
                badge.style.top = '-8px';
                badge.style.right = '-5px';
                badge.style.transform = 'translateX(0)';
                badge.style.zIndex = '10002';
                badge.style.pointerEvents = 'none'; // 徽章不響應點擊
            }
            
            // 🔧 書籤基本狀態
            bookmark.style.transform = 'translateX(0)';
            bookmark.style.opacity = '0.8';
            bookmark.style.zIndex = '11';
            bookmark.style.position = 'relative';
            bookmark.style.pointerEvents = 'auto'; // 書籤本身可點擊
            bookmark.style.cursor = 'pointer';
            
            console.log(`📑 書籤 ${index + 1} 初始狀態已設置`);
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
            
            // 設置書籤屬性
            bookmark.setAttribute('tabindex', '0');
            bookmark.setAttribute('role', 'button');
            bookmark.setAttribute('aria-label', `書籤: ${bookmark.dataset.bookmarkId}`);
            
            // 🔧 添加觸摸友好的樣式
            if (this.isMobile) {
                bookmark.style.minHeight = '48px'; // 符合 WCAG 觸摸目標大小
                bookmark.style.minWidth = '48px';
                tab.style.minHeight = '48px';
                tab.style.padding = '8px 20px 8px 15px';
            }
            
            console.log(`📑 書籤 ${index + 1} 結構已設置`);
        });
    }
    
    /**
     * 🔧 設置書籤事件 - 優化觸摸支持
     */
    setupBookmarkEvents() {
        // 🔧 書本觸摸/懸停事件
        if (this.bookContainer) {
            if (this.isMobile) {
                // 移動設備：觸摸事件
                this.setupMobileBookEvents();
            } else {
                // 桌面設備：鼠標事件
                this.setupDesktopBookEvents();
            }
        }
        
        // 🔧 書籤個別事件
        this.bookmarks.forEach((bookmark) => {
            const isEnabled = bookmark.dataset.enabled === 'true';
            
            if (this.isMobile) {
                this.setupMobileBookmarkEvents(bookmark, isEnabled);
            } else {
                this.setupDesktopBookmarkEvents(bookmark, isEnabled);
            }
        });
        
        console.log('📑 書籤事件已設置 (觸摸優化版)');
    }
    
    /**
     * 🔧 設置桌面設備書本事件
     */
    setupDesktopBookEvents() {
        this.bookContainer.addEventListener('mouseenter', () => {
            this.showBookmarksContainer();
        });
        
        this.bookContainer.addEventListener('mouseleave', () => {
            this.hideBookmarksContainer();
        });
    }
    
    /**
     * 🔧 設置移動設備書本事件
     */
    setupMobileBookEvents() {
        let bookTouchTimer;
        
        this.bookContainer.addEventListener('touchstart', (e) => {
            clearTimeout(bookTouchTimer);
            this.touchStartTime = Date.now();
            this.touchStartPosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            
            // 短暫觸摸顯示書籤
            bookTouchTimer = setTimeout(() => {
                this.showBookmarksContainer();
                if (navigator.vibrate) navigator.vibrate(50);
            }, 300);
        });
        
        this.bookContainer.addEventListener('touchend', (e) => {
            clearTimeout(bookTouchTimer);
            const touchDuration = Date.now() - this.touchStartTime;
            
            if (touchDuration < 300) {
                // 快速點擊：切換書籤顯示
                if (this.bookmarksContainer.style.opacity === '1') {
                    this.hideBookmarksContainer();
                } else {
                    this.showBookmarksContainer();
                }
            }
        });
        
        this.bookContainer.addEventListener('touchmove', (e) => {
            clearTimeout(bookTouchTimer);
        });
        
        // 點擊書本外部區域隱藏書籤
        document.addEventListener('touchstart', (e) => {
            if (!this.bookContainer.contains(e.target) && 
                !this.bookmarksContainer.contains(e.target)) {
                this.hideBookmarksContainer();
            }
        });
    }
    
    /**
     * 🔧 設置桌面設備書籤事件
     */
    setupDesktopBookmarkEvents(bookmark, isEnabled) {
        // 點擊事件
        bookmark.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleBookmarkClick(bookmark, isEnabled);
        });
        
        // 懸停事件
        bookmark.addEventListener('mouseenter', () => {
            this.handleBookmarkHover(bookmark, true);
            if (this.soundSystem) {
                this.soundSystem.playHoverSound();
            }
        });
        
        bookmark.addEventListener('mouseleave', () => {
            this.handleBookmarkHover(bookmark, false);
        });
        
        // 鍵盤事件
        bookmark.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleBookmarkClick(bookmark, isEnabled);
            }
        });
    }
    
    /**
     * 🔧 設置移動設備書籤事件
     */
    setupMobileBookmarkEvents(bookmark, isEnabled) {
        let touchTimer;
        let touchStartTime;
        let touchStartPos;
        let isLongPress = false;
        
        // 🔧 觸摸開始
        bookmark.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止默認行為
            e.stopPropagation();
            
            touchStartTime = Date.now();
            touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            isLongPress = false;
            
            // 立即顯示視覺反饋
            bookmark.classList.add('touch-active');
            this.handleBookmarkHover(bookmark, true);
            
            // 長按檢測
            touchTimer = setTimeout(() => {
                isLongPress = true;
                if (navigator.vibrate) navigator.vibrate(100);
                console.log('📱 長按檢測到:', bookmark.dataset.bookmarkId);
            }, 500);
            
            console.log('📱 觸摸開始:', bookmark.dataset.bookmarkId);
        });
        
        // 🔧 觸摸移動
        bookmark.addEventListener('touchmove', (e) => {
            if (!touchStartPos) return;
            
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartPos.x);
            const deltaY = Math.abs(touch.clientY - touchStartPos.y);
            
            // 如果移動距離超過閾值，取消觸摸
            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(touchTimer);
                bookmark.classList.remove('touch-active');
                this.handleBookmarkHover(bookmark, false);
                console.log('📱 觸摸移動取消:', bookmark.dataset.bookmarkId);
            }
        });
        
        // 🔧 觸摸結束
        bookmark.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            clearTimeout(touchTimer);
            bookmark.classList.remove('touch-active');
            
            const touchDuration = Date.now() - touchStartTime;
            
            if (!isLongPress && touchDuration < 500) {
                // 短按：執行點擊
                console.log('📱 短按點擊:', bookmark.dataset.bookmarkId);
                this.handleBookmarkClick(bookmark, isEnabled);
                
                // 點擊後短暫保持高亮
                setTimeout(() => {
                    this.handleBookmarkHover(bookmark, false);
                }, 500);
            } else {
                // 長按或其他情況
                this.handleBookmarkHover(bookmark, false);
            }
        });
        
        // 🔧 觸摸取消
        bookmark.addEventListener('touchcancel', (e) => {
            clearTimeout(touchTimer);
            bookmark.classList.remove('touch-active');
            this.handleBookmarkHover(bookmark, false);
            console.log('📱 觸摸取消:', bookmark.dataset.bookmarkId);
        });
        
        // 🔧 為移動設備添加點擊事件作為備用
        bookmark.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📱 備用點擊事件:', bookmark.dataset.bookmarkId);
            this.handleBookmarkClick(bookmark, isEnabled);
        });
    }
    
    /**
     * 🔧 顯示書籤容器
     */
    showBookmarksContainer() {
        if (this.bookmarksContainer) {
            const rightPosition = this.isMobile ? 
                (this.isPhone ? '-40px' : '-60px') : '-80px';
            
            this.bookmarksContainer.style.right = rightPosition;
            this.bookmarksContainer.style.opacity = '1';
            this.bookmarksContainer.style.zIndex = '10';
            this.bookmarksContainer.style.pointerEvents = 'auto';
            this.bookmarksContainer.style.transition = 'right 0.4s ease, opacity 0.4s ease, z-index 0s ease';
        }
        
        // 書本懸停效果
        const book = this.bookContainer.querySelector('.book');
        if (book) {
            book.style.transform = 'translateY(-5px) scale(1.02)';
        }
        
        console.log('📚 書籤容器已顯示 (移動優化)');
    }
    
    /**
     * 🔧 隱藏書籤容器
     */
    hideBookmarksContainer() {
        if (this.bookmarksContainer) {
            this.bookmarksContainer.style.right = '-200px';
            this.bookmarksContainer.style.opacity = '0';
            this.bookmarksContainer.style.transition = 'right 0.4s ease, opacity 0.4s ease, z-index 0s ease 0.2s';
            
            setTimeout(() => {
                if (this.bookmarksContainer) {
                    this.bookmarksContainer.style.zIndex = '1';
                    this.bookmarksContainer.style.pointerEvents = 'none';
                }
            }, 200);
        }
        
        // 恢復書本狀態
        const book = this.bookContainer.querySelector('.book');
        if (book) {
            book.style.transform = '';
        }
        
        // 隱藏所有書籤文字
        this.bookmarks.forEach(bookmark => {
            this.handleBookmarkHover(bookmark, false);
            bookmark.classList.remove('touch-active');
        });
        
        console.log('📚 書籤容器已隱藏');
    }
    
    /**
     * 🔧 處理書籤懸停 - 顯示/隱藏文字
     */
    handleBookmarkHover(bookmark, isHovering) {
        const text = bookmark.querySelector('.bookmark-text');
        const icon = bookmark.querySelector('.bookmark-icon');
        
        if (isHovering) {
            // 懸停進入 - 書籤滑出，顯示文字，最高層級
            const slideDistance = this.isMobile ? 
                (this.isPhone ? '30px' : '40px') : '50px';
            
            bookmark.style.transform = `translateX(${slideDistance})`;
            bookmark.style.opacity = '1';
            bookmark.style.zIndex = '9999';
            bookmark.style.position = 'relative';
            
            if (text) {
                text.style.opacity = '1';
                text.style.transform = 'translateX(0)';
                text.style.zIndex = '10001';
                text.style.position = 'relative';
                text.style.pointerEvents = 'auto';
            }
            
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.filter = 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.9))';
                icon.style.zIndex = '10000';
                icon.style.position = 'relative';
            }
            
            console.log('📑 書籤懸停：文字已顯示', bookmark.dataset.bookmarkId);
        } else {
            // 懸停離開 - 書籤回位，隱藏文字
            bookmark.style.transform = 'translateX(0)';
            bookmark.style.opacity = '0.8';
            bookmark.style.zIndex = '11';
            
            if (text) {
                text.style.opacity = '0';
                text.style.transform = 'translateX(-20px)';
                text.style.zIndex = '10000';
                text.style.pointerEvents = 'none';
            }
            
            if (icon) {
                icon.style.transform = '';
                icon.style.filter = '';
                icon.style.zIndex = '9999';
            }
        }
    }
    
    /**
     * 處理書籤點擊
     */
    handleBookmarkClick(bookmark, isEnabled) {
        const bookmarkId = bookmark.dataset.bookmarkId;
        const title = bookmark.dataset.title || bookmarkId;
        
        console.log(`🔧 書籤點擊處理: ${bookmarkId}, 啟用狀態: ${isEnabled}`);
        
        // 播放點擊音效
        if (this.soundSystem) {
            this.soundSystem.playClickSound();
        }
        
        // 視覺反饋
        this.showClickFeedback(bookmark);
        
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
    }
    
    /**
     * 🔧 顯示點擊反饋
     */
    showClickFeedback(bookmark) {
        // 快速滑出再恢復的動畫
        const originalTransform = bookmark.style.transform;
        const slideDistance = this.isMobile ? '35px' : '55px';
        
        bookmark.style.transform = `translateX(${slideDistance}) scale(0.95)`;
        bookmark.style.transition = 'transform 0.15s ease';
        
        setTimeout(() => {
            bookmark.style.transform = originalTransform;
            bookmark.style.transition = '';
        }, 150);
        
        // 觸覺反饋
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(75);
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
     * 設置鍵盤導航
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
     * 高亮顯示書籤
     */
    highlightBookmark(bookmark) {
        // 先顯示書籤容器
        this.showBookmarksContainer();
        
        // 清除其他高亮
        this.clearHighlight();
        
        // 高亮當前書籤
        bookmark.style.outline = '2px solid var(--gold)';
        bookmark.style.outlineOffset = '2px';
        bookmark.style.transform = 'translateX(50px)';
        bookmark.style.opacity = '1';
        bookmark.style.zIndex = '9999';
        bookmark.style.position = 'relative';
        
        // 顯示文字
        const text = bookmark.querySelector('.bookmark-text');
        if (text) {
            text.style.opacity = '1';
            text.style.transform = 'translateX(0)';
            text.style.zIndex = '10001';
            text.style.position = 'relative';
            text.style.pointerEvents = 'auto';
        }
        
        const icon = bookmark.querySelector('.bookmark-icon');
        if (icon) {
            icon.style.zIndex = '10000';
            icon.style.position = 'relative';
        }
    }
    
    /**
     * 清除高亮
     */
    clearHighlight() {
        this.bookmarks.forEach(bookmark => {
            bookmark.style.outline = '';
            bookmark.style.outlineOffset = '';
            bookmark.style.transform = 'translateX(0)';
            bookmark.style.opacity = '0.8';
            bookmark.style.zIndex = '11';
            
            const text = bookmark.querySelector('.bookmark-text');
            if (text) {
                text.style.opacity = '0';
                text.style.transform = 'translateX(-20px)';
                text.style.zIndex = '10000';
                text.style.pointerEvents = 'none';
            }
            
            const icon = bookmark.querySelector('.bookmark-icon');
            if (icon) {
                icon.style.zIndex = '9999';
            }
        });
    }
    
    /**
     * 🔧 設置觸摸支持 - 增強版
     */
    setupTouchSupport() {
        if (this.isMobile) {
            console.log('👆 移動設備檢測到，啟用觸摸優化');
            
            // 添加觸摸樣式
            const touchStyle = document.createElement('style');
            touchStyle.id = 'touch-device-styles';
            touchStyle.textContent = `
                .touch-device .bookmark {
                    -webkit-tap-highlight-color: transparent;
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    user-select: none;
                }
                
                .touch-device .bookmark.touch-active {
                    background: rgba(255, 215, 0, 0.1);
                    transform: translateX(35px) scale(1.05) !important;
                    opacity: 1 !important;
                    z-index: 9999 !important;
                }
                
                .touch-device .bookmark-tab {
                    min-height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                @media (max-width: 768px) {
                    .touch-device .bookmark {
                        height: 48px;
                    }
                    
                    .touch-device .bookmark-icon {
                        font-size: 1.2rem;
                    }
                }
            `;
            document.head.appendChild(touchStyle);
            
            // 禁用瀏覽器的觸摸滾動彈性效果
            document.addEventListener('touchmove', (e) => {
                if (e.target.closest('.bookmark') || e.target.closest('.bookmarks-container')) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // 處理方向變化
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.detectDeviceType();
                    this.hideBookmarksContainer();
                    console.log('📱 方向變化，重新初始化觸摸支持');
                }, 300);
            });
        }
        
        console.log('👆 觸摸支持已設置');
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
            isTouchDevice: this.isMobile,
            isPhone: this.isPhone,
            isTablet: this.isTablet,
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
        
        // 清除觸摸樣式
        const touchStyles = document.getElementById('touch-device-styles');
        if (touchStyles) {
            touchStyles.remove();
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
    console.log('🚀 開始初始化 InternetCorner 系統 (觸摸優化版)...');
    
    try {
        // 初始化書籤系統
        bookmarkSystem = new BookmarkSystem();
        
        // 用戶首次交互後啟用音效
        const enableAudio = () => {
            if (bookmarkSystem && bookmarkSystem.soundSystem && bookmarkSystem.soundSystem.audioContext) {
                if (bookmarkSystem.soundSystem.audioContext.state === 'suspended') {
                    bookmarkSystem.soundSystem.audioContext.resume();
                }
            }
        };
        
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchend', enableAudio, { once: true });
        
        console.log('✨ InternetCorner 系統初始化完成！(觸摸優化版)');
        
        // 標記頁面已準備就緒
        document.body.classList.add('app-ready');
        
        // 🔧 移動設備特殊處理
        if (bookmarkSystem.isMobile) {
            console.log('📱 移動設備模式已啟用');
            
            // 添加移動設備專用CSS
            const mobileCSS = document.createElement('style');
            mobileCSS.textContent = `
                /* 移動設備專用樣式 */
                .touch-device .book-container {
                    user-select: none;
                    -webkit-user-select: none;
                    -webkit-touch-callout: none;
                }
                
                .touch-device .bookmark {
                    min-height: 48px;
                    min-width: 48px;
                }
                
                .mobile-device .bookmarks-container {
                    width: 180px;
                }
                
                .tablet-device .bookmarks-container {
                    width: 200px;
                }
                
                /* 觸摸反饋 */
                .touch-device .bookmark.touch-active .bookmark-tab {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                /* 防止意外縮放 */
                .touch-device {
                    touch-action: manipulation;
                }
                
                /* 提高觸摸目標 */
                @media (pointer: coarse) {
                    .bookmark {
                        min-height: 52px;
                    }
                    
                    .bookmark-icon {
                        font-size: 1.3rem;
                    }
                }
            `;
            document.head.appendChild(mobileCSS);
        }
        
    } catch (error) {
        console.error('❌ 系統初始化失敗:', error);
        
        // 錯誤回復
        setTimeout(() => {
            console.log('🔄 嘗試恢復系統...');
            try {
                bookmarkSystem = new BookmarkSystem();
            } catch (e) {
                console.error('❌ 系統恢復失敗:', e);
            }
        }, 2000);
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

// 🔧 新增：手動顯示/隱藏書籤的調試函數
window.showBookmarks = function() {
    if (bookmarkSystem) {
        bookmarkSystem.showBookmarksContainer();
        console.log('📚 手動顯示書籤');
    }
};

window.hideBookmarks = function() {
    if (bookmarkSystem) {
        bookmarkSystem.hideBookmarksContainer();
        console.log('📚 手動隱藏書籤');
    }
};

// 🔧 新增：觸摸調試函數
window.debugTouch = function() {
    if (bookmarkSystem) {
        console.log('📱 觸摸調試資訊:', {
            isMobile: bookmarkSystem.isMobile,
            isPhone: bookmarkSystem.isPhone,
            isTablet: bookmarkSystem.isTablet,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            touchPoints: navigator.maxTouchPoints,
            userAgent: navigator.userAgent
        });
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
        // 頁面隱藏時自動隱藏書籤
        if (bookmarkSystem) {
            bookmarkSystem.hideBookmarksContainer();
        }
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
    });
}

// ===== 方向變化處理 =====

window.addEventListener('orientationchange', function() {
    console.log('📱 設備方向已變化');
    setTimeout(() => {
        if (bookmarkSystem) {
            bookmarkSystem.detectDeviceType();
            bookmarkSystem.hideBookmarksContainer();
            console.log('📱 已適應新方向');
        }
    }, 300);
});

// ===== 觸摸性能優化 =====

// 防止移動設備的彈性滾動影響交互
document.addEventListener('touchmove', function(e) {
    // 只在書籤區域防止滾動
    if (e.target.closest('.book-container') || e.target.closest('.bookmarks-container')) {
        e.preventDefault();
    }
}, { passive: false });

console.log('📚 home.js 已完全載入 (觸摸優化版)');
console.log('💡 可用的全域指令:');
console.log('  getBookmarkStatus() - 查看書籤系統狀態');
console.log('  reinitializeBookmarks() - 重新初始化書籤');
console.log('  showComingSoon("功能名稱") - 顯示即將推出提示');
console.log('  toggleSound() - 切換音效開關');
console.log('  setSoundVolume(0.5) - 設定音效音量');
console.log('  showBookmarks() - 手動顯示書籤 (調試用)');
console.log('  hideBookmarks() - 手動隱藏書籤 (調試用)');
console.log('  debugTouch() - 觸摸調試資訊 (調試用)');
console.log('🎉 InternetCorner 準備就緒！(觸摸優化版 - 修復手機平板點擊問題)');