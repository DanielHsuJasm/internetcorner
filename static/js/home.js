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
            if (route) {
                handleBookmarkNavigation(route, bookmarkId);
            } else {
                console.error('未找到路由信息:', bookmarkId);
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

console.log('🎮 個別書籤右滑功能已就緒');
console.log('💡 可用指令:');
console.log('  bookmarkManager.enableBookmark("birthday") - 啟用書籤');
console.log('  bookmarkManager.getBookmarkStatus() - 獲取狀態');
console.log('  bookmarkManager.showAllBookmarks() - 預覽所有書籤');
console.log('  bookmarkManager.hideAllBookmarks() - 隱藏所有書籤');
console.log('  resetAllBookmarks() - 重置所有書籤狀態');
console.log('  showComingSoon("測試功能") - 顯示即將推出');
console.log('📖 操作說明:');
console.log('  - 懸停個別書籤：只有該書籤會滑出');
console.log('  - 觸摸設備：輕觸書籤展開，3秒後自動收回');
console.log('  - 鍵盤導航：方向鍵選擇，Enter/Space 激活，ESC 隱藏');
console.log('  - 書本懸停 0.8 秒：預覽所有書籤');