document.addEventListener('DOMContentLoaded', function() {
    // 元素選取
    const overlay = document.getElementById('overlay');
    const overlayImg = document.getElementById('overlay-img');
    const filmStrip = document.querySelector('.film-strip');
    const filmContainer = document.querySelector('.film-strip-container');
    const uploadForm = document.querySelector('form[enctype="multipart/form-data"]');
    const fileInput = document.querySelector('input[type="file"]');
    const loadingIndicator = document.getElementById('loading');

    // 全螢幕預覽功能
    function initImagePreview() {
        document.body.addEventListener('click', function(e) {
            const target = e.target;
            if (target.tagName === 'IMG' && target.classList.contains('preview-img')) {
                e.preventDefault();
                showImageOverlay(target.src, target.alt);
            }
        });

        // 點擊覆蓋層關閉
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target === overlayImg) {
                hideImageOverlay();
            }
        });

        // ESC 鍵關閉
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('show')) {
                hideImageOverlay();
            }
        });
    }

    function showImageOverlay(src, alt) {
        overlayImg.src = src;
        overlayImg.alt = alt;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // 防止背景滾動
        
        // 添加淡入效果
        setTimeout(() => {
            overlayImg.style.opacity = '1';
        }, 50);
    }

    function hideImageOverlay() {
        overlayImg.style.opacity = '0';
        setTimeout(() => {
            overlay.classList.remove('show');
            overlayImg.src = '';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // 膠捲動畫控制
    function initFilmStripAnimation() {
        if (!filmStrip || !filmContainer) return;

        let isAnimationPaused = false;
        let animationSpeed = 25; // 秒

        // 懸停暫停動畫
        filmContainer.addEventListener('mouseenter', function() {
            if (!isAnimationPaused) {
                filmStrip.style.animationPlayState = 'paused';
            }
        });

        filmContainer.addEventListener('mouseleave', function() {
            if (!isAnimationPaused) {
                filmStrip.style.animationPlayState = 'running';
            }
        });

        // 點擊膠捲容器切換暫停/播放
        filmContainer.addEventListener('dblclick', function(e) {
            e.preventDefault();
            toggleFilmAnimation();
        });

        function toggleFilmAnimation() {
            isAnimationPaused = !isAnimationPaused;
            filmStrip.style.animationPlayState = isAnimationPaused ? 'paused' : 'running';
            
            // 顯示狀態提示
            showAnimationStatus(isAnimationPaused ? '暫停' : '播放');
        }

        function showAnimationStatus(status) {
            const statusIndicator = document.createElement('div');
            statusIndicator.textContent = `🎬 ${status}`;
            statusIndicator.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 0.8rem 1.5rem;
                border-radius: 25px;
                font-size: 1.1rem;
                z-index: 9999;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            document.body.appendChild(statusIndicator);
            
            setTimeout(() => statusIndicator.style.opacity = '1', 50);
            setTimeout(() => {
                statusIndicator.style.opacity = '0';
                setTimeout(() => document.body.removeChild(statusIndicator), 300);
            }, 1500);
        }

        // 根據圖片數量調整動畫速度
        adjustAnimationSpeed();
    }

    function adjustAnimationSpeed() {
        if (!filmStrip) return;
        
        const frames = filmStrip.querySelectorAll('.frame');
        const frameCount = frames.length / 2; // 因為有重複的框架用於無縫循環
        
        if (frameCount > 0) {
            // 根據圖片數量調整速度，圖片越多速度越慢
            const newSpeed = Math.max(15, frameCount * 3);
            filmStrip.style.animationDuration = `${newSpeed}s`;
        }
    }

    // 文件上傳功能增強
    function initFileUpload() {
        if (!uploadForm || !fileInput) return;

        // 文件拖放功能
        const uploadSection = document.querySelector('.upload-section');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadSection.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadSection.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadSection.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            uploadSection.style.transform = 'scale(1.02)';
            uploadSection.style.borderColor = '#4ecdc4';
            uploadSection.style.backgroundColor = 'rgba(78, 205, 196, 0.1)';
        }

        function unhighlight() {
            uploadSection.style.transform = 'scale(1)';
            uploadSection.style.borderColor = 'rgba(255,255,255,0.2)';
            uploadSection.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }

        uploadSection.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;
            
            // 顯示選中的文件
            showSelectedFiles(files);
        }

        // 文件選擇變化時顯示預覽
        fileInput.addEventListener('change', function(e) {
            showSelectedFiles(e.target.files);
        });

        function showSelectedFiles(files) {
            const fileList = Array.from(files);
            const validFiles = fileList.filter(file => 
                file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB 限制
            );

            if (validFiles.length > 0) {
                showFilePreview(validFiles);
            } else if (fileList.length > 0) {
                showNotification('請選擇有效的圖片文件（小於10MB）', 'warning');
            }
        }

        function showFilePreview(files) {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'file-preview-container';
            previewContainer.style.cssText = `
                margin-top: 1rem;
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                justify-content: center;
            `;

            files.forEach((file, index) => {
                const previewItem = document.createElement('div');
                previewItem.style.cssText = `
                    background: rgba(255,255,255,0.1);
                    padding: 0.5rem;
                    border-radius: 8px;
                    text-align: center;
                    min-width: 100px;
                    max-width: 150px;
                `;

                const fileName = document.createElement('div');
                fileName.textContent = file.name.length > 15 ? 
                    file.name.substring(0, 12) + '...' : file.name;
                fileName.style.cssText = `
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.8);
                    margin-bottom: 0.3rem;
                `;

                const fileSize = document.createElement('div');
                fileSize.textContent = formatFileSize(file.size);
                fileSize.style.cssText = `
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.6);
                `;

                previewItem.appendChild(fileName);
                previewItem.appendChild(fileSize);
                previewContainer.appendChild(previewItem);
            });

            // 移除舊的預覽
            const oldPreview = uploadSection.querySelector('.file-preview-container');
            if (oldPreview) {
                oldPreview.remove();
            }

            uploadSection.appendChild(previewContainer);
        }

        // 表單提交處理
        uploadForm.addEventListener('submit', function(e) {
            if (!fileInput.files || fileInput.files.length === 0) {
                e.preventDefault();
                showNotification('請選擇要上傳的圖片', 'warning');
                return;
            }

            showLoadingIndicator();
        });
    }

    // 工具函數
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showLoadingIndicator() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
            setTimeout(() => {
                loadingIndicator.style.opacity = '1';
            }, 50);
        }
    }

    function hideLoadingIndicator() {
        if (loadingIndicator) {
            loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 300);
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `flash ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 50);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 星空動畫增強
    function initStarAnimation() {
        // 創建額外的星星層
        const starLayers = 3;
        for (let i = 0; i < starLayers; i++) {
            createStarLayer(i);
        }
    }

    function createStarLayer(layerIndex) {
        const starLayer = document.createElement('div');
        starLayer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -${layerIndex + 1};
            background-image: 
                radial-gradient(${1 + layerIndex}px ${1 + layerIndex}px at ${Math.random() * 200}px ${Math.random() * 100}px, #fff, transparent),
                radial-gradient(${1 + layerIndex}px ${1 + layerIndex}px at ${Math.random() * 200}px ${Math.random() * 100}px, rgba(255,255,255,0.8), transparent),
                radial-gradient(${1 + layerIndex}px ${1 + layerIndex}px at ${Math.random() * 200}px ${Math.random() * 100}px, rgba(255,255,255,0.6), transparent);
            background-repeat: repeat;
            background-size: ${200 + layerIndex * 50}px ${100 + layerIndex * 25}px;
            animation: sparkle ${20 + layerIndex * 5}s linear infinite;
        `;
        
        document.body.appendChild(starLayer);
    }

    // 響應式處理
    function initResponsiveHandling() {
        let isTouch = false;

        // 檢測觸控設備
        window.addEventListener('touchstart', function() {
            isTouch = true;
        }, { once: true });

        // 為觸控設備調整行為
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            // 觸控設備上的長按刪除功能
            let touchTimer;
            document.addEventListener('touchstart', function(e) {
                if (e.target.classList.contains('preview-img')) {
                    touchTimer = setTimeout(() => {
                        // 震動反饋（如果支援）
                        if (navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                        // 這裡可以添加長按顯示刪除選項的邏輯
                    }, 800);
                }
            });

            document.addEventListener('touchend', function() {
                clearTimeout(touchTimer);
            });
        }
    }

    // 鍵盤快捷鍵
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // 空格鍵暫停/播放膠捲動畫
            if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
                e.preventDefault();
                const filmContainer = document.querySelector('.film-strip-container');
                if (filmContainer) {
                    filmContainer.dispatchEvent(new Event('dblclick'));
                }
            }
        });
    }

    // 初始化所有功能
    function init() {
        initImagePreview();
        initFilmStripAnimation();
        initFileUpload();
        initStarAnimation();
        initResponsiveHandling();
        initKeyboardShortcuts();

        // 頁面加載完成後隱藏加載指示器
        hideLoadingIndicator();

        console.log('🌟 回憶膠卷已準備就緒！');
    }

    // 執行初始化
    init();

    // 監聽頁面可見性變化，暫停/恢復動畫以節省資源
    document.addEventListener('visibilitychange', function() {
        const filmStrip = document.querySelector('.film-strip');
        if (filmStrip) {
            if (document.hidden) {
                filmStrip.style.animationPlayState = 'paused';
            } else {
                filmStrip.style.animationPlayState = 'running';
            }
        }
    });
});