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

    // 🎂 生日日期欄位相關元素
    const birthdayDateInput = document.getElementById('birthday-date');
    const exampleItems = document.querySelectorAll('.example-item');
    const dateContainer = document.querySelector('.date-input-container');

    // 設定當前年份
    const currentYear = new Date().getFullYear();
    const yearInput = document.getElementById('birthday-year');
    if (yearInput && !yearInput.value) {
        yearInput.value = currentYear;
    }

    // ===== 🎂 生日日期欄位功能 =====
    function initBirthdayDateField() {
        if (!birthdayDateInput || !exampleItems.length || !dateContainer) {
            console.warn('生日日期欄位元素未找到');
            return;
        }

        // 快速選擇示例日期
        exampleItems.forEach(item => {
            item.addEventListener('click', function() {
                const date = this.getAttribute('data-date');
                birthdayDateInput.value = date;
                birthdayDateInput.focus();
                
                // 添加選中效果
                exampleItems.forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                
                // 驗證輸入
                validateDateInput();
                
                console.log(`📅 快速選擇日期: ${date}`);
            });
        });

        // 日期格式化和驗證
        birthdayDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, ''); // 只保留數字
            
            if (value.length >= 2) {
                // 自動添加 "-" 分隔符
                value = value.substring(0, 2) + '-' + value.substring(2, 4);
            }
            
            e.target.value = value;
            validateDateInput();
        });

        // 鍵盤事件處理
        birthdayDateInput.addEventListener('keydown', function(e) {
            // 允許的按鍵：數字、退格、刪除、Tab、方向鍵
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            const isNumber = e.key >= '0' && e.key <= '9';
            
            if (!isNumber && !allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        });

        // 失焦驗證
        birthdayDateInput.addEventListener('blur', function() {
            validateDateInput();
        });

        // 驗證日期輸入
        function validateDateInput() {
            const value = birthdayDateInput.value;
            const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
            
            if (value === '') {
                setInputState('normal');
                return;
            }
            
            if (dateRegex.test(value)) {
                const [month, day] = value.split('-').map(Number);
                
                // 檢查月份和日期的有效性
                if (isValidDate(month, day)) {
                    setInputState('valid');
                    updateSelectedExample(value);
                } else {
                    setInputState('invalid');
                }
            } else {
                setInputState('invalid');
            }
        }

        // 檢查日期有效性
        function isValidDate(month, day) {
            const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return day <= daysInMonth[month - 1];
        }

        // 設置輸入框狀態
        function setInputState(state) {
            const container = dateContainer;
            container.classList.remove('valid', 'invalid', 'normal');
            container.classList.add(state);
            
            if (state === 'valid') {
                console.log('✅ 日期格式正確');
            } else if (state === 'invalid') {
                console.log('❌ 日期格式錯誤');
            }
        }

        // 更新選中的示例
        function updateSelectedExample(value) {
            exampleItems.forEach(item => {
                item.classList.remove('selected');
                if (item.getAttribute('data-date') === value) {
                    item.classList.add('selected');
                }
            });
        }

        // 懸停效果
        exampleItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });

        console.log('📅 生日日期欄位已初始化');
    }

    // ===== 生日卡片功能 =====
    function initBirthdayCard() {
        if (!birthdayCard || !birthdayMessage) {
            console.warn('生日卡片元素未找到');
            return;
        }

        let isCardOpen = false;

        birthdayCard.addEventListener('click', function(e) {
            if (!isCardOpen && (e.target === birthdayCard || e.target.closest('.birthday-card'))) {
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

        console.log('🎂 生日卡片功能已初始化');
    }

    // ===== 照片模態框功能 =====
    function initPhotoModal() {
        if (!photoModal || !modalImage) {
            console.warn('照片模態框元素未找到');
            return;
        }

        // 全域函數：顯示照片模態框
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

        // 全域函數：關閉照片模態框
        window.closePhotoModal = function() {
            photoModal.classList.remove('show');
            modalImage.src = '';
            document.body.style.overflow = '';
            
            console.log('📸 關閉照片模態框');
        };

        // 模態框點擊事件
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

        console.log('📸 照片模態框功能已初始化');
    }

    // ===== 文件上傳處理 =====
    function initFileUpload() {
        if (!fileInput || !uploadForm) {
            console.warn('上傳相關元素未找到');
            return;
        }

        const uploadSection = document.querySelector('.upload-section');

        fileInput.addEventListener('change', function(e) {
            showSelectedFiles(e.target.files);
        });

        // 拖拽上傳
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

            console.log(`📁 顯示 ${files.length} 個文件預覽`);
        }

        // 表單提交處理
        uploadForm.addEventListener('submit', function(e) {
            if (!fileInput.files || fileInput.files.length === 0) {
                e.preventDefault();
                showNotification('請選擇要上傳的生日照片', 'warning');
                return;
            }

            // 驗證生日日期
            if (birthdayDateInput && birthdayDateInput.value) {
                const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
                if (!dateRegex.test(birthdayDateInput.value)) {
                    e.preventDefault();
                    showNotification('請輸入正確的生日日期格式 (MM-DD)', 'error');
                    return;
                }
            }

            // 顯示上傳中狀態
            const uploadButton = uploadForm.querySelector('.upload-button');
            if (uploadButton) {
                uploadButton.disabled = true;
                uploadButton.innerHTML = '<span>🎂 上傳中...</span>';
            }

            console.log('🎂 開始上傳生日照片');
        });

        console.log('📁 文件上傳功能已初始化');
    }

    // ===== 輔助函數 =====
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

        console.log(`📢 通知: ${message} (${type})`);
    }

    // ===== 響應式處理 =====
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

    // ===== 觸摸設備支援 =====
    function initTouchSupport() {
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
                
                // 雙擊支援
                let lastTap = 0;
                photo.addEventListener('touchend', function(e) {
                    const currentTime = new Date().getTime();
                    const tapLength = currentTime - lastTap;
                    
                    if (tapLength < 500 && tapLength > 0) {
                        // 雙擊事件
                        e.preventDefault();
                        showPhotoModal(this);
                    }
                    lastTap = currentTime;
                });
            });

            console.log('👆 觸摸設備支援已啟用');
        }
    }

    // ===== 年份篩選增強 =====
    function initYearFilters() {
        const yearFilters = document.querySelectorAll('.year-filter');
        
        yearFilters.forEach(filter => {
            filter.addEventListener('click', function(e) {
                // 移除所有 active 類
                yearFilters.forEach(f => f.classList.remove('active'));
                
                // 添加 active 類到當前點擊的篩選器
                this.classList.add('active');
                
                // 可以添加載入動畫
                showLoadingAnimation();
                
                // 延遲跳轉以顯示動畫
                setTimeout(() => {
                    window.location.href = this.href;
                }, 200);
                
                e.preventDefault();
            });
        });

        console.log('📅 年份篩選功能已初始化');
    }

    // ===== 載入動畫 =====
    function showLoadingAnimation() {
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 105, 180, 0.9);
            color: white;
            padding: 1rem 2rem;
            border-radius: 15px;
            font-size: 1.1rem;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        loadingDiv.innerHTML = '<span>🎂</span> 載入中...';
        document.body.appendChild(loadingDiv);
        
        setTimeout(() => {
            if (document.body.contains(loadingDiv)) {
                document.body.removeChild(loadingDiv);
            }
        }, 3000);
    }

    // ===== 生日特效 =====
    function createBirthdayEffect() {
        // 創建生日特效（例如飄落的彩色紙屑）
        const colors = ['#FF69B4', '#FFB6C1', '#FFD700', '#FF4500', '#32CD32', '#1E90FF'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.textContent = ['🎉', '🎊', '🎈', '🌟', '✨'][Math.floor(Math.random() * 5)];
                confetti.style.cssText = `
                    position: fixed;
                    top: -50px;
                    left: ${Math.random() * 100}%;
                    font-size: ${Math.random() * 20 + 15}px;
                    z-index: 1000;
                    pointer-events: none;
                    animation: confetti-fall 3s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (document.body.contains(confetti)) {
                        document.body.removeChild(confetti);
                    }
                }, 3000);
            }, i * 100);
        }
    }

    // ===== 生日祝福動態效果 =====
    function animateBirthdayMessage() {
        const messages = [
            '🎂 生日快樂！',
            '🎉 願所有美好都如期而至！',
            '🌟 祝你天天開心！',
            '🎈 歲歲平安，年年有今日！'
        ];
        
        let messageIndex = 0;
        const messageElement = document.querySelector('.birthday-message h3');
        
        if (messageElement) {
            setInterval(() => {
                messageElement.style.opacity = '0';
                setTimeout(() => {
                    messageElement.textContent = messages[messageIndex];
                    messageElement.style.opacity = '1';
                    messageIndex = (messageIndex + 1) % messages.length;
                }, 300);
            }, 4000);
        }
    }

    // ===== 生日音效（可選） =====
    function playBirthdaySound() {
        try {
            // 創建簡單的生日音效
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 生日快樂歌的簡單旋律
            const notes = [
                { frequency: 261.63, duration: 0.5 }, // C
                { frequency: 261.63, duration: 0.25 }, // C
                { frequency: 293.66, duration: 0.75 }, // D
                { frequency: 261.63, duration: 0.75 }, // C
                { frequency: 349.23, duration: 0.75 }, // F
                { frequency: 329.63, duration: 1.5 }   // E
            ];
            
            let currentTime = audioContext.currentTime;
            
            notes.forEach(note => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(note.frequency, currentTime);
                gain.gain.setValueAtTime(0.1, currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
                
                osc.start(currentTime);
                osc.stop(currentTime + note.duration);
                
                currentTime += note.duration;
            });
        } catch (error) {
            console.log('音效播放失敗:', error);
        }
    }

    // ===== 初始化特效 =====
    function initBirthdayEffects() {
        // 如果是生日月份，自動播放特效
        const currentMonth = new Date().getMonth() + 1;
        const currentDay = new Date().getDate();
        
        // 假設生日是6月26日（可以根據實際情況修改）
        if (currentMonth === 6 && currentDay === 26) {
            setTimeout(() => {
                createBirthdayEffect();
                playBirthdaySound();
                showNotification('🎉 今天是你的生日！生日快樂！', 'success');
            }, 1000);
        }
        
        // 啟動動態祝福消息
        animateBirthdayMessage();

        console.log('🎊 生日特效系統已初始化');
    }

    // ===== 快捷鍵支援 =====
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + U 快速上傳
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                if (fileInput) {
                    fileInput.click();
                }
            }
            
            // Ctrl/Cmd + E 觸發生日特效
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                createBirthdayEffect();
            }
        });

        console.log('⌨️ 快捷鍵支援已啟用');
    }

    // ===== 性能優化：懶加載圖片 =====
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));

            console.log('🖼️ 圖片懶加載已啟用');
        }
    }

    // ===== 錯誤處理 =====
    function setupErrorHandling() {
        window.addEventListener('error', function(e) {
            console.error('🚨 頁面錯誤:', e.error);
            showNotification('頁面發生錯誤，請重新整理頁面', 'error');
        });

        window.addEventListener('unhandledrejection', function(e) {
            console.error('🚨 未處理的 Promise 錯誤:', e.reason);
        });

        console.log('🛡️ 錯誤處理已設置');
    }

    // ===== 添加彩色紙屑動畫 CSS =====
    function addConfettiStyles() {
        if (!document.querySelector('#confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(-50px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===== 主初始化函數 =====
    function initializeAll() {
        try {
            // 初始化各個功能模組
            initBirthdayDateField();    // 🎂 生日日期欄位
            initBirthdayCard();         // 🎂 生日卡片
            initPhotoModal();           // 📸 照片模態框
            initFileUpload();           // 📁 文件上傳
            initTouchSupport();         // 👆 觸摸支援
            initYearFilters();          // 📅 年份篩選
            initBirthdayEffects();      // 🎊 生日特效
            initKeyboardShortcuts();    // ⌨️ 快捷鍵
            setupLazyLoading();         // 🖼️ 懶加載
            setupErrorHandling();       // 🛡️ 錯誤處理
            addConfettiStyles();        // 🎨 動畫樣式

            console.log('🎂 生日頁面已完全載入！');
            console.log('💡 可用快捷鍵: Ctrl+U (上傳), Ctrl+E (特效)');
            
        } catch (error) {
            console.error('❌ 初始化過程中發生錯誤:', error);
            showNotification('頁面初始化失敗，某些功能可能無法正常使用', 'error');
        }
    }

    // ===== 開始初始化 =====
    initializeAll();

    // ===== 調試功能（開發模式） =====
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // 開發模式下的調試函數
        window.birthdayDebug = {
            triggerEffect: createBirthdayEffect,
            playSound: playBirthdaySound,
            showNotification: showNotification,
            testDateValidation: function(date) {
                birthdayDateInput.value = date;
                birthdayDateInput.dispatchEvent(new Event('input'));
                console.log(`測試日期: ${date}`);
            }
        };

        console.log('🔧 開發模式調試功能已啟用');
        console.log('💡 調試指令: birthdayDebug.triggerEffect(), birthdayDebug.playSound(), etc.');
    }
});