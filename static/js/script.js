document.addEventListener('DOMContentLoaded', function() {
    // 通用元素
    const overlay = document.getElementById('overlay');
    const overlayImg = document.getElementById('overlay-img');
    const filmStrip = document.querySelector('.film-strip');
    const filmContainer = document.querySelector('.film-strip-container');
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const loadingIndicator = document.getElementById('loading');

    /* ---------- 全螢幕預覽 ---------- */
    function initImagePreview() {
        const previewSection = document.querySelector('.preview-section');
        if (!previewSection) return;
        
        previewSection.addEventListener('click', function(e) {
            const target = e.target;
            if (target.tagName === 'IMG' && target.classList.contains('preview-img')) {
                e.preventDefault();
                showImageOverlay(target.src, target.alt);
            }
        });
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target === overlayImg) {
                hideImageOverlay();
            }
        });
        
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
        document.body.style.overflow = 'hidden';
        
        // 如果信封是全螢幕狀態，先隱藏它
        if (window.letterManager && window.letterManager.isFullscreen) {
            const envelopeContainer = document.querySelector('.envelope-container');
            if (envelopeContainer) {
                envelopeContainer.style.visibility = 'hidden';
            }
        }
        
        overlay.setAttribute('tabindex', '-1');
        overlay.focus();
        
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
            
            // 恢復信封顯示
            const envelopeContainer = document.querySelector('.envelope-container');
            if (envelopeContainer) {
                envelopeContainer.style.visibility = '';
            }
            
            document.body.focus();
        }, 300);
    }

    /* ---------- 膠卷動畫 ---------- */
    function initFilmStripAnimation() {
        if (!filmStrip || !filmContainer) return;
        
        let isAnimationPaused = false;
        let wasPausedManually = false;
        
        function adjustAnimationSpeed() {
            const frames = filmStrip.querySelectorAll('.frame');
            const frameCount = frames.length / 2;
            if (frameCount > 0) {
                const newSpeed = Math.max(15, frameCount * 3);
                filmStrip.style.animationDuration = `${newSpeed}s`;
            }
        }
        
        adjustAnimationSpeed();
        
        filmContainer.addEventListener('mouseenter', function() {
            if (!isAnimationPaused) filmStrip.style.animationPlayState = 'paused';
        });
        
        filmContainer.addEventListener('mouseleave', function() {
            if (!isAnimationPaused) filmStrip.style.animationPlayState = 'running';
        });
        
        filmContainer.addEventListener('dblclick', function(e) {
            e.preventDefault();
            toggleFilmAnimation();
        });
        
        function toggleFilmAnimation() {
            isAnimationPaused = !isAnimationPaused;
            filmStrip.style.animationPlayState = isAnimationPaused ? 'paused' : 'running';
            wasPausedManually = isAnimationPaused;
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
        
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                filmStrip.style.animationPlayState = 'paused';
            } else {
                if (!wasPausedManually) {
                    filmStrip.style.animationPlayState = 'running';
                }
            }
        });
    }

    /* ---------- 上傳管理 ---------- */
    function initFileUpload() {
        if (!uploadForm || !fileInput) return;
        
        const uploadSection = document.querySelector('.upload-section');
        
        ['dragenter','dragover','dragleave','drop'].forEach(evt => {
            uploadSection.addEventListener(evt, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault(); 
            e.stopPropagation();
        }
        
        ['dragenter','dragover'].forEach(evt => {
            uploadSection.addEventListener(evt, highlight, false);
        });
        
        ['dragleave','drop'].forEach(evt => {
            uploadSection.addEventListener(evt, unhighlight, false);
        });
        
        function highlight() {
            uploadSection.style.transform = 'scale(1.02)';
            uploadSection.style.borderColor = '#4ecdc4';
            uploadSection.style.backgroundColor = 'rgba(78,205,196,0.1)';
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
            const dataTransfer = new DataTransfer();
            for (let i=0; i<files.length; i++) dataTransfer.items.add(files[i]);
            fileInput.files = dataTransfer.files;
            showSelectedFiles(dataTransfer.files);
        }
        
        fileInput.addEventListener('change', function(e) {
            showSelectedFiles(e.target.files);
        });
        
        function showSelectedFiles(files) {
            const fileList = Array.from(files);
            const validFiles = fileList.filter(file => file.type.startsWith('image/') && file.size <= 10*1024*1024);
            
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
            
            files.forEach(file => {
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
                fileName.textContent = file.name.length > 15 ? file.name.substring(0,12) + '...' : file.name;
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
            
            const old = uploadSection.querySelector('.file-preview-container');
            if (old) old.remove();
            uploadSection.appendChild(previewContainer);
        }
        
        uploadForm.addEventListener('submit', function(e) {
            if (!fileInput.files || fileInput.files.length === 0) {
                e.preventDefault();
                showNotification('請選擇要上傳的圖片', 'warning');
                return;
            }
            showLoadingIndicator();
        });
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes','KB','MB','GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k,i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function showLoadingIndicator() {
        if (loadingIndicator) loadingIndicator.classList.add('show');
    }
    
    function hideLoadingIndicator() {
        if (loadingIndicator) loadingIndicator.classList.remove('show');
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
                if (document.body.contains(notification)) document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /* ---------- Responsive & keyboard ---------- */
    function initResponsiveHandling() {
        window.addEventListener('touchstart', function(){}, {once: true});
        
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            let touchTimer;
            
            document.addEventListener('touchstart', function(e) {
                if (e.target.classList.contains('preview-img')) {
                    touchTimer = setTimeout(() => {
                        if (navigator.vibrate) navigator.vibrate(50);
                    }, 800);
                }
            });
            
            document.addEventListener('touchend', function() { 
                clearTimeout(touchTimer); 
            });
        }
    }
    
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
                e.preventDefault();
                const filmContainer = document.querySelector('.film-strip-container');
                if (filmContainer) filmContainer.dispatchEvent(new Event('dblclick'));
            }
        });
    }

    /* ---------- 信件功能事件監聽 ---------- */
    function initLetterIntegration() {
        // 監聽信件開啟/關閉事件
        document.addEventListener('letter:opened', function(e) {
            console.log('📬 信件已開啟');
            // 可以在這裡添加額外的邏輯，比如暫停動畫等
        });
        
        document.addEventListener('letter:closed', function(e) {
            console.log('📭 信件已關閉');
            // 可以在這裡添加額外的邏輯
        });
    }

    // 初始化所有功能
    function init() {
        initImagePreview();
        initFilmStripAnimation();
        initFileUpload();
        initResponsiveHandling();
        initKeyboardShortcuts();
        initLetterIntegration();
        hideLoadingIndicator();
        console.log('🌟 回憶膠卷主要功能已準備就緒！');
    }
    
    init();
});