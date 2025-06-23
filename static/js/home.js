/**
 * 主畫面交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 數位回憶書主畫面已載入');
    
    initBookInteractions();
    initBookmarkHoverEffects();
    initKeyboardNavigation();
    initAccessibility();
});

/**
 * 初始化書本互動效果
 */
function initBookInteractions() {
    const book = document.querySelector('.book');
    
    if (!book) return;
    
    // 書本點擊效果
    book.addEventListener('click', function() {
        // 未來可以添加開書動畫
        console.log('📖 書本被點擊了');
    });
    
    // 書本懸停效果
    book.addEventListener('mouseenter', function() {
        // 可以添加一些微妙的動畫
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
        
        // 懸停音效（如果需要）
        bookmark.addEventListener('mouseenter', function() {
            // 可以添加懸停音效
            if (isEnabled) {
                console.log(`📑 懸停在書籤: ${bookmark.dataset.bookmarkId}`);
            }
        });
        
        // 書籤點擊動畫
        bookmark.addEventListener('click', function(e) {
            if (!isEnabled) {
                e.preventDefault();
                // 搖擺效果表示未啟用
                this.style.animation = 'bookmarkShake 0.5s ease-in-out';
                setTimeout(() => {
                    this.style.animation = '';
                }, 500);
            } else {
                // 點擊縮放效果
                this.style.transform = 'translateX(-15px) scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });
    
    // 添加搖擺動畫 CSS
    if (!document.querySelector('#bookmark-animations')) {
        const style = document.createElement('style');
        style.id = 'bookmark-animations';
        style.textContent = `
            @keyframes bookmarkShake {
                0%, 100% { transform: translateX(-10px) scale(1.05) rotate(0deg); }
                25% { transform: translateX(-10px) scale(1.05) rotate(-2deg); }
                75% { transform: translateX(-10px) scale(1.05) rotate(2deg); }
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
    
    // 使書籤可獲得焦點
    bookmarks.forEach((bookmark, index) => {
        bookmark.setAttribute('tabindex', '0');
        bookmark.setAttribute('role', 'button');
        bookmark.setAttribute('aria-label', `書籤: ${bookmark.dataset.bookmarkId}`);
    });
    
    // 鍵盤事件處理
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
                
            case 'Enter':
            case ' ':
                if (e.target.classList.contains('bookmark')) {
                    e.preventDefault();
                    e.target.click();
                }
                break;
                
            case 'Escape':
                // 移除所有焦點
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
    // 為書本添加 ARIA 標籤
    const book = document.querySelector('.book');
    if (book) {
        book.setAttribute('role', 'button');
        book.setAttribute('aria-label', '數位回憶書');
        book.setAttribute('tabindex', '0');
    }
    
    // 檢查用戶的動畫偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        // 禁用動畫
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
 * 導航到指定頁面
 */
function navigateToPage(url) {
    // 添加載入動畫
    showLoadingAnimation();
    
    // 延遲導航以顯示動畫
    setTimeout(() => {
        window.location.href = url;
    }, 300);
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
        
        // 焦點管理
        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.focus();
        }
        
        // ESC 鍵關閉
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
    // 創建載入遮罩
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner">⭐</div>
            <p>載入中...</p>
        </div>
    `;
    
    // 載入樣式
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
}

/**
 * 書籤管理器類
 */
class BookmarkManager {
    constructor() {
        this.bookmarks = document.querySelectorAll('.bookmark');
        this.activeBookmark = null;
    }
    
    /**
     * 啟用書籤
     */
    enableBookmark(bookmarkId) {
        const bookmark = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
        if (bookmark) {
            bookmark.dataset.enabled = 'true';
            bookmark.style.opacity = '1';
            
            // 移除即將推出徽章
            const badge = bookmark.querySelector('.coming-soon-badge');
            if (badge) {
                badge.remove();
            }
            
            console.log(`✅ 書籤 ${bookmarkId} 已啟用`);
        }
    }
    
    /**
     * 禁用書籤
     */
    disableBookmark(bookmarkId) {
        const bookmark = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
        if (bookmark) {
            bookmark.dataset.enabled = 'false';
            bookmark.style.opacity = '0.7';
            console.log(`❌ 書籤 ${bookmarkId} 已禁用`);
        }
    }
    
    /**
     * 獲取書籤狀態
     */
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

// 創建全域書籤管理器實例
window.bookmarkManager = new BookmarkManager();

// 點擊模態框背景關閉
document.addEventListener('click', function(e) {
    const modal = document.getElementById('coming-soon-modal');
    if (e.target === modal) {
        closeComingSoonModal();
    }
});

// 導出函數到全域作用域
window.navigateToPage = navigateToPage;
window.showComingSoon = showComingSoon;
window.closeComingSoonModal = closeComingSoonModal;

console.log('🎮 主畫面交互功能已就緒');
console.log('💡 可用指令:');
console.log('  bookmarkManager.enableBookmark("diary") - 啟用書籤');
console.log('  bookmarkManager.getBookmarkStatus() - 獲取狀態');
console.log('  showComingSoon("測試功能") - 顯示即將推出');