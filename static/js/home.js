document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 數位回憶書主畫面已載入');
    
    initBookInteractions();
    initBookmarkClickHandlers();
    initIndividualBookmarkEffects(); // 新的個別書籤效果
    initKeyboardNavigation();
    initAccessibility();
});

/**
 * 初始化個別書籤右滑效果
 */
function initIndividualBookmarkEffects() {
    const bookmarks = document.querySelectorAll('.bookmark');
    
    if (!bookmarks.length) return;
    
    bookmarks.forEach((bookmark, index) => {
        const isEnabled = bookmark.dataset.enabled === 'true';
        
        // 滑鼠進入事件 - 只顯示當前書籤
        bookmark.addEventListener('mouseenter', function() {
            // 隱藏其他書籤
            bookmarks.forEach(otherBookmark => {
                if (otherBookmark !== bookmark) {
                    otherBookmark.style.opacity = '0.05';
                    otherBookmark.style.transition = 'opacity 0.3s ease';
                }
            });
            
            // 當前書籤完全顯示
            this.style.transform = 'translateX(0)';
            this.style.opacity = '1';
            this.style.zIndex = '20';
            this.style.boxShadow = '-5px 0 20px rgba(0, 0, 0, 0.3)';
            
            if (isEnabled) {
                console.log(`📑 個別懸停: ${bookmark.dataset.bookmarkId}`);
            }
            
            // 播放懸停音效
            playHoverSound();
        });
        
        // 滑鼠離開事件 - 恢復所有書籤
        bookmark.addEventListener('mouseleave', function() {
            // 恢復其他書籤的透明度
            bookmarks.forEach(otherBookmark => {
                otherBookmark.style.opacity = '';
                otherBookmark.style.transition = '';
            });
            
            // 當前書籤回到隱藏狀態
            this.style.transform = '';
            this.style.opacity = '';
            this.style.zIndex = '';
            this.style.boxShadow = '';
        });
        
        // 觸摸設備特殊處理
        bookmark.addEventListener('touchstart', function(e) {
            // 防止快速重複觸發
            if (this.classList.contains('touch-active')) return;
            
            e.preventDefault(); // 防止意外觸發其他事件
            
            this.classList.add('touch-active');
            
            // 觸摸時隱藏其他書籤
            bookmarks.forEach(otherBookmark => {
                if (otherBookmark !== bookmark) {
                    otherBookmark.style.opacity = '0.05';
                    otherBookmark.style.transform = 'translateX(190px)';
                }
            });
            
            // 當前書籤完全顯示
            this.style.transform = 'translateX(0)';
            this.style.opacity = '1';
            this.style.zIndex = '20';
            this.style.boxShadow = '-5px 0 20px rgba(0, 0, 0, 0.3)';
            
            // 觸摸震動反饋
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // 記錄觸摸開始時間
            this.touchStartTime = Date.now();
            
            // 3秒後自動恢復
            setTimeout(() => {
                if (this.classList.contains('touch-active')) {
                    this.classList.remove('touch-active');
                    resetAllBookmarks();
                }
            }, 3000);
        }, { passive: false });
        
        // 觸摸結束處理
        bookmark.addEventListener('touchend', function(e) {
            // 延遲一點再處理，避免與點擊事件衝突
            setTimeout(() => {
                if (!this.classList.contains('touch-active')) return;
                
                // 檢查是否是點擊意圖（快速觸摸）
                const touchDuration = Date.now() - (this.touchStartTime || 0);
                if (touchDuration < 200) {
                    // 快速觸摸，視為點擊
                    this.click();
                }
                
                this.classList.remove('touch-active');
            }, 100);
        });
        
        // 焦點事件（鍵盤導航）
        bookmark.addEventListener('focus', function() {
            this.style.transform = 'translateX(0)';
            this.style.opacity = '1';
            this.style.zIndex = '20';
            this.style.outline = '2px solid var(--gold)';
            this.style.outlineOffset = '2px';
            
            // 其他書籤淡化
            bookmarks.forEach(otherBookmark => {
                if (otherBookmark !== bookmark) {
                    otherBookmark.style.opacity = '0.1';
                }
            });
        });
        
        bookmark.addEventListener('blur', function() {
            this.style.transform = '';
            this.style.opacity = '';
            this.style.zIndex = '';
            this.style.outline = '';
            this.style.outlineOffset = '';
            
            // 恢復其他書籤
            bookmarks.forEach(otherBookmark => {
                otherBookmark.style.opacity = '';
            });
        });
    });
    
    // 全域點擊事件 - 重置所有書籤狀態
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.bookmark') && !e.target.closest('.book')) {
            resetAllBookmarks();
        }
    });
    
    // 書本懸停預覽效果（可選）
    initBookPreviewEffect();
    
    console.log('📖 個別書籤右滑效果已啟用');
}

/**
 * 重置所有書籤狀態
 */
function resetAllBookmarks() {
    const bookmarks = document.querySelectorAll('.bookmark');
    bookmarks.forEach(bookmark => {
        bookmark.classList.remove('touch-active');
        bookmark.style.transform = '';
        bookmark.style.opacity = '';
        bookmark.style.zIndex = '';
        bookmark.style.boxShadow = '';
        bookmark.style.transition = '';
    });
}

/**
 * 初始化書本預覽效果
 */
function initBookPreviewEffect() {
    const book = document.querySelector('.book');
    const bookmarks = document.querySelectorAll('.bookmark');
    let previewTimeout;
    
    if (!book || !bookmarks.length) return;
    
    book.addEventListener('mouseenter', function() {
        // 懸停800ms後顯示所有書籤預覽
        previewTimeout = setTimeout(() => {
            playBookmarkSequenceAnimation();
        }, 800);
    });
    
    book.addEventListener('mouseleave', function() {
        clearTimeout(previewTimeout);
        // 快速隱藏所有書籤
        resetAllBookmarks();
    });
}

/**
 * 書籤序列動畫
 */
function playBookmarkSequenceAnimation() {
    const bookmarks = document.querySelectorAll('.bookmark');
    
    bookmarks.forEach((bookmark, index) => {
        setTimeout(() => {
            bookmark.style.transform = 'translateX(0)';
            bookmark.style.opacity = '1';
            bookmark.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                bookmark.style.transform = '';
                bookmark.style.opacity = '';
                bookmark.style.transition = '';
            }, 800 + index * 50);
        }, index * 100);
    });
}

/**
 * 播放懸停音效
 */
function playHoverSound() {
    try {
        if (window.audioContext && window.audioContext.state === 'running') {
            const oscillator = window.audioContext.createOscillator();
            const gainNode = window.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(window.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, window.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, window.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.05, window.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioContext.currentTime + 0.1);
            
            oscillator.start(window.audioContext.currentTime);
            oscillator.stop(window.audioContext.currentTime + 0.1);
        }
    } catch (e) {
        // 音效播放失敗時靜默處理
    }
}

/**
 * 初始化音效系統
 */
function initAudioSystem() {
    if (!window.audioContext) {
        try {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // 不支援 Web Audio API
        }
    }
}

/**
 * 初始化書籤點擊處理器
 */
function initBookmarkClickHandlers() {
    const bookmarksContainer = document.querySelector('.bookmarks-container');
    
    if (!bookmarksContainer) return;
    
    // 使用事件委託處理所有書籤點擊
    bookmarksContainer.addEventListener('click', function(e) {
        const bookmark = e.target.closest('.bookmark');
        if (!bookmark) return;
        
        e.preventDefault();
        
        const isEnabled = bookmark.dataset.enabled === 'true';
        const bookmarkId = bookmark.dataset.bookmarkId;
        
        if (isEnabled) {
            // 啟用的書籤 - 導航到頁面
            const route = bookmark.dataset.route;
            if (route && route !== '#') {
                handleBookmarkNavigation(route, bookmarkId);
            } else {
                console.log('書籤路由未設定或為 #，顯示即將推出');
                const title = bookmark.dataset.title || bookmarkId;
                handleComingSoonBookmark(title, bookmarkId);
            }
        } else {
            // 未啟用的書籤 - 顯示即將推出
            const title = bookmark.dataset.title || bookmark.dataset.bookmarkTitle;
            handleComingSoonBookmark(title, bookmarkId);
        }
    });
}

/**
 * 處理已啟用書籤的導航
 */
function handleBookmarkNavigation(route, bookmarkId) {
    console.log(`📑 導航到書籤: ${bookmarkId} -> ${route}`);
    
    // 添加點擊動畫
    const bookmark = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
    if (bookmark) {
        bookmark.style.transform = 'translateX(-15px) scale(0.95)';
        setTimeout(() => {
            bookmark.style.transform = '';
        }, 150);
    }
    
    // 顯示載入動畫並導航
    showLoadingAnimation();
    
    setTimeout(() => {
        try {
            window.location.href = route;
        } catch (error) {
            console.error('導航錯誤:', error);
            hideLoadingAnimation();
            showNotification('導航失敗，請重試', 'error');
        }
    }, 300);
}

/**
 * 處理未啟用書籤
 */
function handleComingSoonBookmark(title, bookmarkId) {
    console.log(`🚧 即將推出功能: ${title}`);
    
    // 添加搖擺動畫
    const bookmark = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
    if (bookmark) {
        bookmark.style.animation = 'bookmarkShake 0.5s ease-in-out';
        setTimeout(() => {
            bookmark.style.animation = '';
        }, 500);
    }
    
    // 顯示即將推出模態框
    showComingSoon(title || '新功能');
}

/**
 * 初始化書本互動效果
 */
function initBookInteractions() {
    const book = document.querySelector('.book');
    
    if (!book) return;
    
    book.addEventListener('click', function() {
        console.log('📖 書本被點擊了');
    });
    
    book.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    book.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
}

/**
 * 增強鍵盤導航
 */
function initKeyboardNavigation() {
    const bookmarks = document.querySelectorAll('.bookmark[data-enabled="true"]');
    let currentIndex = -1;
    
    bookmarks.forEach((bookmark, index) => {
        bookmark.setAttribute('tabindex', '0');
        bookmark.setAttribute('role', 'button');
        bookmark.setAttribute('aria-label', `書籤: ${bookmark.dataset.bookmarkId}`);
        
        // 鍵盤事件
        bookmark.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (bookmarks.length === 0) return;
        
        switch(e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % bookmarks.length;
                bookmarks[currentIndex].focus();
                break;
                
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? bookmarks.length - 1 : currentIndex - 1;
                bookmarks[currentIndex].focus();
                break;
                
            case 'Home':
                e.preventDefault();
                currentIndex = 0;
                bookmarks[currentIndex].focus();
                break;
                
            case 'End':
                e.preventDefault();
                currentIndex = bookmarks.length - 1;
                bookmarks[currentIndex].focus();
                break;
                
            case 'Escape':
                document.activeElement.blur();
                currentIndex = -1;
                // 重置所有書籤狀態
                resetAllBookmarks();
                break;
        }
    });
}

/**
 * 初始化無障礙功能
 */
function initAccessibility() {
    const book = document.querySelector('.book');
    if (book) {
        book.setAttribute('role', 'button');
        book.setAttribute('aria-label', '數位回憶書');
        book.setAttribute('tabindex', '0');
    }
    
    // 檢查用戶的動畫偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 用戶首次交互後初始化音效
    document.addEventListener('click', initAudioSystem, { once: true });
    document.addEventListener('touchstart', initAudioSystem, { once: true });
}

/**
 * 安全的字符串處理函數
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 顯示通知消息
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // 添加樣式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        background: ${getNotificationColor(type)};
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
}

/**
 * 獲取通知圖標
 */
function getNotificationIcon(type) {
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
function getNotificationColor(type) {
    const colors = {
        'info': 'rgba(59, 130, 246, 0.9)',
        'success': 'rgba(34, 197, 94, 0.9)',
        'warning': 'rgba(251, 191, 36, 0.9)',
        'error': 'rgba(239, 68, 68, 0.9)'
    };
    return colors[type] || colors.info;
}

/**
 * 顯示即將推出提示
 */
function showComingSoon(featureName) {
    const modal = document.getElementById('coming-soon-modal');
    const featureNameElement = document.getElementById('feature-name');
    
    if (modal && featureNameElement) {
        featureNameElement.textContent = `${featureName} - 即將推出！`;
        modal.style.display = 'block';
        
        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.focus();
        }
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeComingSoonModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
}

/**
 * 關閉即將推出提示框
 */
function closeComingSoonModal() {
    const modal = document.getElementById('coming-soon-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 顯示載入動畫
 */
function showLoadingAnimation() {
    let loadingOverlay = document.getElementById('loading-overlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
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
        
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes bookmarkShake {
                    0%, 100% { transform: translateX(-10px) scale(1.05) rotate(0deg); }
                    25% { transform: translateX(-10px) scale(1.05) rotate(-2deg); }
                    75% { transform: translateX(-10px) scale(1.05) rotate(2deg); }
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    margin-left: auto;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .notification-close:hover {
                    opacity: 0.7;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loadingOverlay);
    } else {
        loadingOverlay.style.display = 'flex';
    }
}

/**
 * 隱藏載入動畫
 */
function hideLoadingAnimation() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * 書籤管理器類
 */
class BookmarkManager {
    constructor() {
        this.bookmarks = document.querySelectorAll('.bookmark');
        this.activeBookmark = null;
    }
    
    enableBookmark(bookmarkId) {
        const bookmark = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
        if (bookmark) {
            bookmark.dataset.enabled = 'true';
            bookmark.style.opacity = '1';
            
            const badge = bookmark.querySelector('.coming-soon-badge');
            if (badge) {
                badge.remove();
            }
            
            console.log(`✅ 書籤 ${bookmarkId} 已啟用`);
        }
    }
    
    disableBookmark(bookmarkId) {
        const bookmark = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
        if (bookmark) {
            bookmark.dataset.enabled = 'false';
            bookmark.style.opacity = '0.7';
            console.log(`❌ 書籤 ${bookmarkId} 已禁用`);
        }
    }
    
    getBookmarkStatus() {
        const status = {};
        this.bookmarks.forEach(bookmark => {
            const id = bookmark.dataset.bookmarkId;
            const enabled = bookmark.dataset.enabled === 'true';
            status[id] = enabled;
        });
        return status;
    }
    
    showAllBookmarks() {
        playBookmarkSequenceAnimation();
    }
    
    hideAllBookmarks() {
        resetAllBookmarks();
    }
}

// 創建全域實例
window.bookmarkManager = new BookmarkManager();

// 點擊模態框背景關閉
document.addEventListener('click', function(e) {
    const modal = document.getElementById('coming-soon-modal');
    if (e.target === modal) {
        closeComingSoonModal();
    }
});

// 導出函數到全域作用域（向後兼容）
window.navigateToPage = function(url) {
    handleBookmarkNavigation(url, 'unknown');
};
window.showComingSoon = showComingSoon;
window.closeComingSoonModal = closeComingSoonModal;
window.showLoadingAnimation = showLoadingAnimation;
window.hideLoadingAnimation = hideLoadingAnimation;
window.playBookmarkSequenceAnimation = playBookmarkSequenceAnimation;
window.resetAllBookmarks = resetAllBookmarks;

// 舊的函數名稱向後兼容
window.initBookmarkHoverEffects = initIndividualBookmarkEffects;


/**
 * 強化版書籤修復 - 確保鮮豔顏色且完全不透過
 */
function applyEnhancedBookmarkFixes() {
    console.log('🔧 應用強化版書籤修復...');
    
    const bookmarks = document.querySelectorAll('.bookmark');
    
    // 更鮮豔的顏色配置
    const vibrantColors = {
        '1': '#FF4757', // 鮮豔紅色
        '2': '#2ED573', // 鮮豔綠色
        '3': '#3742FA', // 鮮豔藍色
        '4': '#2F3542', // 深灰色
        '5': '#FFA502', // 鮮豔橙色
        '6': '#A4B0BE', // 淺藍灰
        '7': '#FF3838', // 亮紅色
        '8': '#8B5CF6'  // 紫色
    };
    
    bookmarks.forEach((bookmark, index) => {
        const tab = bookmark.querySelector('.bookmark-tab');
        const icon = bookmark.querySelector('.bookmark-icon');
        const text = bookmark.querySelector('.bookmark-text');
        const badge = bookmark.querySelector('.coming-soon-badge');
        
        if (!tab || !icon || !text) {
            console.warn(`書籤 ${index} 結構不完整`);
            return;
        }
        
        // 🔧 強制設定超高層級
        bookmark.style.cssText += `
            z-index: 45 !important;
            isolation: isolate !important;
        `;
        
        // 🔧 確定書籤顏色類別
        let colorIndex = '1'; // 預設
        for (let i = 1; i <= 8; i++) {
            if (tab.classList.contains(`bookmark-color-${i}`)) {
                colorIndex = i.toString();
                break;
            }
        }
        
        // 🔧 強制應用鮮豔背景色
        const vibrantColor = vibrantColors[colorIndex];
        tab.style.cssText += `
            background: ${vibrantColor} !important;
            background-color: ${vibrantColor} !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            mix-blend-mode: normal !important;
            filter: none !important;
            opacity: 1 !important;
            contain: layout style paint !important;
            transform: translateZ(0) !important;
        `;
        
        // 🔧 創建多層背景保護
        removeExistingBackgroundLayers(tab);
        createBackgroundLayers(tab, vibrantColor);
        
        // 🔧 圖標強化定位
        icon.style.cssText += `
            position: absolute !important;
            right: 15px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            font-size: 1.8rem !important;
            z-index: 60 !important;
            color: rgba(255, 255, 255, 0.9) !important;
            filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) !important;
        `;
        
        // 🔧 文字內容設定
        text.style.cssText += `
            max-width: calc(100% - 70px) !important;
            z-index: 55 !important;
        `;
        
        // 🔧 徽章設定
        if (badge) {
            badge.style.cssText += `
                right: 50px !important;
                z-index: 65 !important;
                background: rgba(255, 165, 0, 1) !important;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8) !important;
            `;
        }
        
        console.log(`📑 書籤 ${index} 已應用顏色: ${vibrantColor}`);
    });
    
    // 🔧 確保容器層級
    const bookContainer = document.querySelector('.book-container');
    const bookmarksContainer = document.querySelector('.bookmarks-container');
    const book = document.querySelector('.book');
    const bookCover = document.querySelector('.book-cover');
    
    if (bookContainer) {
        bookContainer.style.cssText += `
            z-index: 1 !important;
            overflow: visible !important;
        `;
    }
    
    if (book) {
        book.style.cssText += `z-index: 2 !important;`;
    }
    
    if (bookCover) {
        bookCover.style.cssText += `z-index: 1 !important;`;
    }
    
    if (bookmarksContainer) {
        bookmarksContainer.style.cssText += `
            z-index: 50 !important;
            pointer-events: auto !important;
        `;
    }
    
    console.log('✅ 強化版書籤修復完成');
}

/**
 * 移除現有的背景保護層
 */
function removeExistingBackgroundLayers(element) {
    const existingLayers = element.querySelectorAll('.bookmark-bg-layer');
    existingLayers.forEach(layer => layer.remove());
}

/**
 * 創建多層背景保護
 */
function createBackgroundLayers(element, color) {
    // 創建第一層背景保護
    const layer1 = document.createElement('div');
    layer1.className = 'bookmark-bg-layer';
    layer1.style.cssText = `
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: ${color} !important;
        z-index: -1 !important;
        pointer-events: none !important;
    `;
    
    // 創建第二層背景保護
    const layer2 = document.createElement('div');
    layer2.className = 'bookmark-bg-layer';
    layer2.style.cssText = `
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: ${color} !important;
        z-index: -2 !important;
        pointer-events: none !important;
    `;
    
    element.appendChild(layer1);
    element.appendChild(layer2);
}

/**
 * 增強懸停效果
 */
function enhanceHoverEffects() {
    const bookmarks = document.querySelectorAll('.bookmark');
    
    bookmarks.forEach(bookmark => {
        const icon = bookmark.querySelector('.bookmark-icon');
        const text = bookmark.querySelector('.bookmark-text');
        const tab = bookmark.querySelector('.bookmark-tab');
        
        bookmark.addEventListener('mouseenter', function() {
            // 圖標效果
            if (icon) {
                icon.style.cssText += `
                    transform: translateY(-50%) scale(1.2) !important;
                    filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.9)) !important;
                `;
            }
            
            // 文字效果
            if (text) {
                text.style.cssText += `
                    opacity: 1 !important;
                    transform: translateX(0) !important;
                `;
            }
            
            // 書籤標籤亮度效果
            if (tab) {
                tab.style.cssText += `
                    filter: brightness(1.05) saturate(1.1) !important;
                `;
            }
            
            // 提升層級
            this.style.cssText += `
                z-index: 100 !important;
            `;
        });
        
        bookmark.addEventListener('mouseleave', function() {
            // 恢復圖標
            if (icon) {
                icon.style.transform = 'translateY(-50%) !important';
                icon.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) !important';
            }
            
            // 恢復文字
            if (text) {
                text.style.opacity = '';
                text.style.transform = '';
            }
            
            // 恢復書籤標籤
            if (tab) {
                tab.style.filter = '';
            }
            
            // 恢復層級
            this.style.zIndex = '45';
        });
    });
}

/**
 * 強制顏色修復（緊急修復函數）
 */
function forceColorFix() {
    console.log('🚨 執行緊急顏色修復...');
    
    const vibrantColors = {
        '1': '#FF4757',
        '2': '#2ED573', 
        '3': '#3742FA',
        '4': '#2F3542',
        '5': '#FFA502',
        '6': '#A4B0BE',
        '7': '#FF3838',
        '8': '#8B5CF6'
    };
    
    document.querySelectorAll('.bookmark-tab').forEach((tab, index) => {
        // 強制移除所有可能的透明效果
        tab.style.cssText = `
            background: ${vibrantColors[(index % 8) + 1]} !important;
            background-color: ${vibrantColors[(index % 8) + 1]} !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            mix-blend-mode: normal !important;
            filter: none !important;
            opacity: 1 !important;
            z-index: 50 !important;
            position: relative !important;
            border-radius: 25px 0 0 25px !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            padding: 8px 55px 8px 15px !important;
            box-shadow: -3px 2px 15px rgba(0, 0, 0, 0.4) !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
        `;
        
        console.log(`🎨 強制修復書籤 ${index}: ${vibrantColors[(index % 8) + 1]}`);
    });
}

/**
 * 檢查書籤顯示狀態
 */
function checkBookmarkStatus() {
    const bookmarks = document.querySelectorAll('.bookmark');
    console.log('📊 書籤狀態檢查:');
    
    bookmarks.forEach((bookmark, index) => {
        const tab = bookmark.querySelector('.bookmark-tab');
        const icon = bookmark.querySelector('.bookmark-icon');
        
        if (tab) {
            const computedStyle = window.getComputedStyle(tab);
            const backgroundColor = computedStyle.backgroundColor;
            const zIndex = computedStyle.zIndex;
            const opacity = computedStyle.opacity;
            
            console.log(`書籤 ${index + 1}:`, {
                backgroundColor,
                zIndex,
                opacity,
                position: computedStyle.position
            });
        }
        
        if (icon) {
            const iconStyle = window.getComputedStyle(icon);
            console.log(`圖標 ${index + 1}:`, {
                position: iconStyle.position,
                right: iconStyle.right,
                zIndex: iconStyle.zIndex
            });
        }
    });
}

/**
 * 一鍵修復所有問題
 */
function fixAllBookmarkIssues() {
    console.log('🔧 執行完整書籤修復流程...');
    
    // 步驟 1: 基礎修復
    applyEnhancedBookmarkFixes();
    
    // 步驟 2: 強制顏色修復
    setTimeout(() => {
        forceColorFix();
    }, 100);
    
    // 步驟 3: 增強效果
    setTimeout(() => {
        enhanceHoverEffects();
    }, 200);
    
    // 步驟 4: 最終檢查
    setTimeout(() => {
        checkBookmarkStatus();
        console.log('✅ 完整修復流程完成！');
    }, 500);
}

// 在現有的 DOMContentLoaded 事件中添加強化修復
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 啟動強化版書籤修復系統...');
    
    // 立即執行基礎修復
    setTimeout(() => {
        applyEnhancedBookmarkFixes();
        enhanceHoverEffects();
    }, 100);
    
    // 延遲執行強制修復（確保所有樣式已載入）
    setTimeout(() => {
        forceColorFix();
    }, 300);
    
    // 最終確保修復
    setTimeout(() => {
        applyEnhancedBookmarkFixes();
        console.log('✅ 強化版書籤修復完成！');
    }, 500);
});

// 頁面完全載入後的最終修復
window.addEventListener('load', function() {
    setTimeout(() => {
        fixAllBookmarkIssues();
    }, 200);
});

// 導出修復函數供調試使用
window.applyEnhancedBookmarkFixes = applyEnhancedBookmarkFixes;
window.forceColorFix = forceColorFix;
window.fixAllBookmarkIssues = fixAllBookmarkIssues;
window.checkBookmarkStatus = checkBookmarkStatus;
window.enhanceHoverEffects = enhanceHoverEffects;

console.log('🔧 強化版書籤修復系統已整合到 home.js');
console.log('💡 可用的調試指令:');
console.log('  fixAllBookmarkIssues() - 一鍵修復所有問題');
console.log('  forceColorFix() - 強制修復顏色');
console.log('  checkBookmarkStatus() - 檢查書籤狀態');
console.log('  applyEnhancedBookmarkFixes() - 基礎修復');

// 添加鍵盤快速修復功能（開發用）
document.addEventListener('keydown', function(e) {
    // Ctrl + Shift + F = 強制修復
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        console.log('🔧 鍵盤快速修復觸發！');
        fixAllBookmarkIssues();
    }
    
    // Ctrl + Shift + C = 檢查狀態
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        checkBookmarkStatus();
    }
});

// 監聽窗口大小變化，重新應用修復
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('🔧 窗口大小改變，重新應用修復...');
        applyEnhancedBookmarkFixes();
        forceColorFix();
    }, 250);
});

// ===== 書籤修復代碼結束 =====




/**
 * 模態框管理類
 */
class ModalManager {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.init();
    }
    
    init() {
        this.modal = document.getElementById('coming-soon-modal');
        if (!this.modal) {
            console.warn('模態框元素未找到');
            return;
        }
        
        this.setupEventListeners();
        this.fixModalStructure();
        console.log('✅ 模態框管理器已初始化');
    }
    
    /**
     * 修復模態框結構
     */
    fixModalStructure() {
        if (!this.modal) return;
        
        // 🔧 確保模態框有正確的屬性
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.setAttribute('tabindex', '-1');
        
        // 🔧 確保模態框有正確的樣式
        this.modal.style.cssText += `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 99999 !important;
            display: none !important;
        `;
        
        // 🔧 確保內容容器正確
        const content = this.modal.querySelector('.modal-content');
        if (content) {
            content.style.cssText += `
                position: relative !important;
                margin: 0 !important;
                transform: translateZ(0) !important;
            `;
        }
        
        // 🔧 確保按鈕正確
        const buttons = this.modal.querySelectorAll('.modal-buttons button');
        buttons.forEach(button => {
            button.style.cssText += `
                position: relative !important;
                z-index: 1 !important;
                cursor: pointer !important;
            `;
            
            // 確保按鈕有點擊事件
            if (!button.onclick && !button.hasAttribute('onclick')) {
                button.addEventListener('click', () => this.close());
            }
        });
    }
    
    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        if (!this.modal) return;
        
        // 🔧 點擊背景關閉
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // 🔧 ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // 🔧 處理所有關閉按鈕
        const closeButtons = this.modal.querySelectorAll('button, [data-dismiss="modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.close());
        });
    }
    
    /**
     * 顯示模態框
     */
    show(title = '即將推出！', message = '這個功能正在努力開發中，請耐心等待！', icon = '🚧') {
        if (!this.modal) {
            console.error('模態框未找到，無法顯示');
            return;
        }
        
        console.log(`📢 顯示模態框: ${title}`);
        
        // 🔧 更新內容
        this.updateContent(title, message, icon);
        
        // 🔧 防止背景滾動
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // 🔧 顯示模態框
        this.modal.style.display = 'flex';
        this.modal.setAttribute('aria-hidden', 'false');
        
        // 🔧 觸發顯示動畫
        setTimeout(() => {
            this.modal.classList.add('show');
        }, 10);
        
        // 🔧 聚焦到模態框
        setTimeout(() => {
            const firstButton = this.modal.querySelector('.modal-buttons button');
            if (firstButton) {
                firstButton.focus();
            } else {
                this.modal.focus();
            }
        }, 100);
        
        this.isOpen = true;
        
        // 🔧 觸發自定義事件
        this.dispatchEvent('modal:show', { title, message, icon });
    }
    
    /**
     * 關閉模態框
     */
    close() {
        if (!this.modal || !this.isOpen) return;
        
        console.log('📢 關閉模態框');
        
        // 🔧 添加淡出動畫
        this.modal.classList.add('fade-out');
        this.modal.classList.remove('show');
        
        // 🔧 延遲隱藏
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modal.setAttribute('aria-hidden', 'true');
            this.modal.classList.remove('fade-out');
            
            // 🔧 恢復背景滾動
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            
            // 🔧 恢復焦點
            document.body.focus();
            
            this.isOpen = false;
            
            // 🔧 觸發自定義事件
            this.dispatchEvent('modal:close');
        }, 300);
    }
    
    /**
     * 更新模態框內容
     */
    updateContent(title, message, icon) {
        const titleElement = this.modal.querySelector('#feature-name') || this.modal.querySelector('h3');
        const messageElement = this.modal.querySelector('p');
        const iconElement = this.modal.querySelector('.modal-icon');
        
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        if (iconElement) {
            iconElement.textContent = icon;
        }
    }
    
    /**
     * 觸發自定義事件
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: { modalManager: this, ...detail },
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 檢查模態框狀態
     */
    getStatus() {
        return {
            isOpen: this.isOpen,
            element: this.modal,
            display: this.modal ? window.getComputedStyle(this.modal).display : 'none',
            zIndex: this.modal ? window.getComputedStyle(this.modal).zIndex : 'auto'
        };
    }
    
    /**
     * 強制修復模態框
     */
    forceRepair() {
        console.log('🔧 強制修復模態框...');
        
        if (!this.modal) {
            console.error('模態框元素不存在，無法修復');
            return;
        }
        
        // 🔧 重置所有樣式
        this.modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 99999 !important;
            background-color: rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(5px) !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
        `;
        
        const content = this.modal.querySelector('.modal-content');
        if (content) {
            content.style.cssText = `
                background: linear-gradient(145deg, #ffffff, #f8f9fa) !important;
                padding: 2.5rem !important;
                border-radius: 20px !important;
                width: 90% !important;
                max-width: 450px !important;
                text-align: center !important;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4) !important;
                position: relative !important;
                border: 2px solid rgba(255, 215, 0, 0.3) !important;
            `;
        }
        
        this.fixModalStructure();
        console.log('✅ 模態框強制修復完成');
    }
}

/**
 * 創建全域模態框管理器實例
 */
let modalManager = null;

/**
 * 初始化模態框系統
 */
function initModalSystem() {
    modalManager = new ModalManager();
    
    // 🔧 等待 DOM 元素確實存在
    if (!modalManager.modal) {
        setTimeout(() => {
            modalManager = new ModalManager();
        }, 500);
    }
}

/**
 * 顯示即將推出提示（兼容舊函數）
 */
function showComingSoon(featureName = '新功能') {
    if (!modalManager) {
        initModalSystem();
        setTimeout(() => showComingSoon(featureName), 100);
        return;
    }
    
    const title = `${featureName} - 即將推出！`;
    const message = '這個功能正在努力開發中，請耐心等待！';
    modalManager.show(title, message, '🚧');
}

/**
 * 關閉模態框（兼容舊函數）
 */
function closeComingSoonModal() {
    if (modalManager) {
        modalManager.close();
    }
}

/**
 * 檢查模態框狀態
 */
function checkModalStatus() {
    if (modalManager) {
        const status = modalManager.getStatus();
        console.log('📊 模態框狀態:', status);
        return status;
    }
    return { error: '模態框管理器未初始化' };
}

/**
 * 強制修復模態框
 */
function fixModal() {
    if (modalManager) {
        modalManager.forceRepair();
    } else {
        console.log('🔧 重新初始化模態框系統...');
        initModalSystem();
        setTimeout(() => {
            if (modalManager) {
                modalManager.forceRepair();
            }
        }, 200);
    }
}

// 🔧 在 DOMContentLoaded 事件中初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 初始化模態框系統...');
    setTimeout(initModalSystem, 100);
});

// 🔧 頁面完全載入後再次確保
window.addEventListener('load', function() {
    setTimeout(() => {
        if (!modalManager || !modalManager.modal) {
            console.log('🔧 頁面載入完成，重新初始化模態框...');
            initModalSystem();
        }
    }, 200);
});

// 🔧 導出函數到全域作用域
window.modalManager = modalManager;
window.showComingSoon = showComingSoon;
window.closeComingSoonModal = closeComingSoonModal;
window.checkModalStatus = checkModalStatus;
window.fixModal = fixModal;
window.initModalSystem = initModalSystem;

// 🔧 點擊模態框背景關閉（全域事件）
document.addEventListener('click', function(e) {
    const modal = document.getElementById('coming-soon-modal');
    if (e.target === modal && modalManager) {
        modalManager.close();
    }
});

// 🔧 鍵盤快捷鍵（調試用）
document.addEventListener('keydown', function(e) {
    // Ctrl + Shift + M = 檢查模態框狀態
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        checkModalStatus();
    }
    
    // Ctrl + Shift + R = 修復模態框
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        fixModal();
    }
});

console.log('🔧 模態框修復系統已載入');
console.log('💡 可用的調試指令:');
console.log('  showComingSoon("測試功能") - 顯示模態框');
console.log('  closeComingSoonModal() - 關閉模態框');
console.log('  checkModalStatus() - 檢查狀態');
console.log('  fixModal() - 強制修復');
console.log('  modalManager.forceRepair() - 深度修復');
console.log('🎮 鍵盤快捷鍵:');
console.log('  Ctrl + Shift + M - 檢查模態框狀態');
console.log('  Ctrl + Shift + R - 修復模態框');

// ===== 模態框修復代碼結束 =====