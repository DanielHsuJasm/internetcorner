document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 數位回憶書主畫面已載入');
    
    initBookInteractions();
    initBookmarkClickHandlers(); // 新增：專門處理書籤點擊
    initBookmarkHoverEffects();
    initKeyboardNavigation();
    initAccessibility();
});

/**
 * 初始化書籤點擊處理器（修復版）
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
 * 處理未啟用書籤的即將推出提示
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
 * 初始化書本互動效果
 */
function initBookInteractions() {
    const book = document.querySelector('.book');
    
    if (!book) return;
    
    book.addEventListener('click', function() {
        console.log('📖 書本被點擊了');
        // 未來可以添加開書動畫
    });
    
    book.addEventListener('mouseenter', function() {
        this.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1.05)';
    });
    
    book.addEventListener('mouseleave', function() {
        this.style.transform = 'rotateX(5deg) rotateY(-5deg) scale(1)';
    });
}

/**
 * 初始化書籤懸停效果
 */
function initBookmarkHoverEffects() {
    const bookmarks = document.querySelectorAll('.bookmark');
    
    bookmarks.forEach((bookmark, index) => {
        const isEnabled = bookmark.dataset.enabled === 'true';
        
        bookmark.addEventListener('mouseenter', function() {
            if (isEnabled) {
                console.log(`📑 懸停在書籤: ${bookmark.dataset.bookmarkId}`);
            }
        });
        
        // 觸摸設備的處理
        bookmark.addEventListener('touchstart', function(e) {
            // 防止在動畫期間重複觸發
            if (this.classList.contains('touching')) return;
            
            this.classList.add('touching');
            setTimeout(() => {
                this.classList.remove('touching');
            }, 300);
        }, { passive: true });
    });
    
    // 添加搖擺動畫 CSS（如果不存在）
    if (!document.querySelector('#bookmark-animations')) {
        const style = document.createElement('style');
        style.id = 'bookmark-animations';
        style.textContent = `
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
}

/**
 * 初始化鍵盤導航
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
                this.click(); // 觸發點擊事件，會被事件委託處理
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (bookmarks.length === 0) return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % bookmarks.length;
                bookmarks[currentIndex].focus();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? bookmarks.length - 1 : currentIndex - 1;
                bookmarks[currentIndex].focus();
                break;
                
            case 'Escape':
                document.activeElement.blur();
                currentIndex = -1;
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
}

/**
 * 導航到指定頁面（向後兼容）
 */
function navigateToPage(url) {
    handleBookmarkNavigation(url, 'unknown');
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
 * 書籤管理器類（保持不變）
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
window.navigateToPage = navigateToPage;
window.showComingSoon = showComingSoon;
window.closeComingSoonModal = closeComingSoonModal;
window.showLoadingAnimation = showLoadingAnimation;
window.hideLoadingAnimation = hideLoadingAnimation;

console.log('🎮 修復後的主畫面交互功能已就緒');
console.log('💡 可用指令:');
console.log('  bookmarkManager.enableBookmark("birthday") - 啟用書籤');
console.log('  bookmarkManager.getBookmarkStatus() - 獲取狀態');
console.log('  showComingSoon("測試功能") - 顯示即將推出');