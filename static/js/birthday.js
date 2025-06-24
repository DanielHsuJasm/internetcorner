document.addEventListener('DOMContentLoaded', function() {
    // 元素獲取
    const photoModal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const modalYear = document.getElementById('modal-year');
    const modalDescription = document.getElementById('modal-description');
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const birthdayCard = document.querySelector('.birthday-card-container');
    const birthdayMessage = document.querySelector('.birthday-message');

    // 設定當前年份
    const currentYear = new Date().getFullYear();
    const yearInput = document.getElementById('birthday-year');
    if (yearInput && !yearInput.value) {
        yearInput.value = currentYear;
    }

    // 生日卡片功能
    if (birthdayCard && birthdayMessage) {
        let isCardOpen = false;

        birthdayCard.addEventListener('click', function(e) {
            if (!isCardOpen && e.target === birthdayCard || e.target.closest('.birthday-card')) {
                openBirthdayCard();
            } else if (isCardOpen && e.target === birthdayCard) {
                closeBirthdayCard();
            }
        });

        // 鍵盤支援
        birthdayCard.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isCardOpen) {
                    openBirthdayCard();
                }
            }
        });

        // ESC 鍵關閉
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isCardOpen) {
                closeBirthdayCard();
            }
        });

        function openBirthdayCard() {
            isCardOpen = true;
            birthdayCard.classList.add('fullscreen');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                birthdayMessage.classList.add('show');
                birthdayMessage.setAttribute('tabindex', '-1');
                birthdayMessage.focus();
            }, 300);

            console.log('🎂 生日卡片已打開');
        }

        function closeBirthdayCard() {
            isCardOpen = false;
            birthdayMessage.classList.remove('show');
            
            setTimeout(() => {
                birthdayCard.classList.remove('fullscreen');
                document.body.style.overflow = '';
                birthdayCard.focus();
            }, 300);

            console.log('🎂 生日卡片已關閉');
        }
    }

    // 照片模態框功能
    window.showPhotoModal = function(img) {
        const photoCard = img.closest('.photo-card');
        const year = photoCard.dataset.year;
        const description = photoCard.querySelector('.photo-description')?.textContent || '';
        
        modalImage.src = img.src;
        modalImage.alt = img.alt;
        modalYear.textContent = year + '年';
        modalDescription.textContent = description;
        
        photoModal.classList.add('show');
        photoModal.setAttribute('tabindex', '-1');
        photoModal.focus();
        document.body.style.overflow = 'hidden';
        
        console.log(`📸 顯示照片: ${year}年`);
    };

    window.closePhotoModal = function() {
        photoModal.classList.remove('show');
        modalImage.src = '';
        document.body.style.overflow = '';
        
        console.log('📸 關閉照片模態框');
    };

    // 模態框點擊事件
    if (photoModal) {
        photoModal.addEventListener('click', function(e) {
            if (e.target === photoModal) {
                closePhotoModal();
            }
        });

        // ESC 鍵關閉照片模態框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && photoModal.classList.contains('show')) {
                closePhotoModal();
            }
        });
    }

    // 文件上傳處理
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            showSelectedFiles(e.target.files);
        });

        // 拖拽上傳
        const uploadSection = document.querySelector('.upload-section');
        if (uploadSection) {
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
                uploadSection.style.borderColor = 'var(--birthday-accent)';
                uploadSection.style.background = 'rgba(255, 215, 0, 0.1)';
            }

            function unhighlight() {
                uploadSection.style.transform = 'scale(1)';
                uploadSection.style.borderColor = 'var(--birthday-secondary)';
                uploadSection.style.background = 'var(--birthday-card)';
            }

            uploadSection.addEventListener('drop', handleDrop, false);

            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                // 更新文件輸入
                const dataTransfer = new DataTransfer();
                for (let i = 0; i < files.length; i++) {
                    dataTransfer.items.add(files[i]);
                }
                fileInput.files = dataTransfer.files;
                
                showSelectedFiles(dataTransfer.files);
            }
        }
    }

    function showSelectedFiles(files) {
        const fileList = Array.from(files);
        const validFiles = fileList.filter(file => 
            file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
        );

        if (validFiles.length > 0) {
            showFilePreview(validFiles);
        } else if (fileList.length > 0) {
            showNotification('請選擇有效的圖片文件（小於10MB）', 'warning');
        }
    }

    function showFilePreview(files) {
        const uploadSection = document.querySelector('.upload-section');
        let previewContainer = uploadSection.querySelector('.file-preview-container');
        
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'file-preview-container';
            previewContainer.style.cssText = `
                margin-top: 1.5rem;
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                justify-content: center;
                padding: 1rem;
                background: rgba(255, 105, 180, 0.05);
                border-radius: 15px;
                border: 2px dashed var(--birthday-primary);
            `;
            uploadSection.appendChild(previewContainer);
        }

        previewContainer.innerHTML = '';

        files.forEach(file => {
            const previewItem = document.createElement('div');
            previewItem.style.cssText = `
                background: var(--birthday-card);
                padding: 1rem;
                border-radius: 10px;
                text-align: center;
                min-width: 120px;
                max-width: 150px;
                border: 2px solid var(--birthday-secondary);
                box-shadow: 0 2px 10px var(--birthday-shadow);
            `;

            const fileName = document.createElement('div');
            fileName.textContent = file.name.length > 15 ? 
                file.name.substring(0, 12) + '...' : file.name;
            fileName.style.cssText = `
                font-size: 0.8rem;
                color: var(--text-dark);
                font-weight: 500;
                margin-bottom: 0.5rem;
            `;

            const fileSize = document.createElement('div');
            fileSize.textContent = formatFileSize(file.size);
            fileSize.style.cssText = `
                font-size: 0.7rem;
                color: var(--birthday-primary);
                opacity: 0.8;
            `;

            const fileIcon = document.createElement('div');
            fileIcon.textContent = '📸';
            fileIcon.style.cssText = `
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
            `;

            previewItem.appendChild(fileIcon);
            previewItem.appendChild(fileName);
            previewItem.appendChild(fileSize);
            previewContainer.appendChild(previewItem);
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 表單提交處理
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            if (!fileInput.files || fileInput.files.length === 0) {
                e.preventDefault();
                showNotification('請選擇要上傳的生日照片', 'warning');
                return;
            }

            // 顯示上傳中狀態
            const uploadButton = uploadForm.querySelector('.upload-button');
            if (uploadButton) {
                uploadButton.disabled = true;
                uploadButton.innerHTML = '<span>🎂 上傳中...</span>';
            }

            console.log('🎂 開始上傳生日照片');
        });
    }

    // 通知系統
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
        }, 4000);
    }

    // 響應式處理
    function handleResize() {
        const gallery = document.querySelector('.birthday-gallery');
        if (gallery) {
            const cards = gallery.querySelectorAll('.photo-card');
            cards.forEach(card => {
                card.style.transition = 'all 0.3s ease';
            });
        }
    }

    window.addEventListener('resize', handleResize);

    // 觸摸設備支援
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // 為照片添加觸摸支援
        const photos = document.querySelectorAll('.birthday-photo');
        photos.forEach(photo => {
            let touchTimer;
            
            photo.addEventListener('touchstart', function() {
                touchTimer = setTimeout(() => {
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }, 500);
            });
            
            photo.addEventListener('touchend', function() {
                clearTimeout(touchTimer);
            });