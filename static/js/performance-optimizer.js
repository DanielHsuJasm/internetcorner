/**
 * 性能優化腳本
 * 自動檢測設備性能並調整網站特效
 */

(function() {
    'use strict';
    
    class PerformanceOptimizer {
        constructor() {
            this.performanceLevel = 'high'; // high, medium, low
            this.init();
        }
        
        init() {
            this.detectPerformance();
            this.applyOptimizations();
            console.log(`🚀 性能等級: ${this.performanceLevel}`);
        }
        
        detectPerformance() {
            let score = 100;
            
            // 檢測硬體核心數
            if (navigator.hardwareConcurrency) {
                if (navigator.hardwareConcurrency <= 2) score -= 30;
                else if (navigator.hardwareConcurrency <= 4) score -= 15;
            }
            
            // 檢測設備記憶體
            if (navigator.deviceMemory) {
                if (navigator.deviceMemory <= 2) score -= 25;
                else if (navigator.deviceMemory <= 4) score -= 10;
            }
            
            // 檢測螢幕尺寸（小螢幕通常是移動設備）
            if (window.innerWidth <= 768) score -= 20;
            if (window.innerHeight <= 600) score -= 10;
            
            // 檢測是否為觸控設備
            if ('ontouchstart' in window) score -= 15;
            
            // 檢測網路連線
            if (navigator.connection) {
                const conn = navigator.connection;
                if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
                    score -= 30;
                } else if (conn.effectiveType === '3g') {
                    score -= 15;
                }
                
                if (conn.saveData) score -= 20;
            }
            
            // 檢測電池狀態
            if (navigator.getBattery) {
                navigator.getBattery().then(battery => {
                    if (battery.level < 0.2) {
                        this.performanceLevel = 'low';
                        this.applyOptimizations();
                    }
                });
            }
            
            // 檢測 User Agent（簡單的設備檢測）
            const ua = navigator.userAgent.toLowerCase();
            if (ua.includes('android') && !ua.includes('chrome')) score -= 15;
            if (ua.includes('iphone') || ua.includes('ipad')) {
                // iOS 設備通常性能較好，但要節約電量
                score -= 5;
            }
            
            // 設定性能等級
            if (score >= 70) {
                this.performanceLevel = 'high';
            } else if (score >= 40) {
                this.performanceLevel = 'medium';
            } else {
                this.performanceLevel = 'low';
            }
        }
        
        applyOptimizations() {
            const body = document.body;
            
            // 移除現有的性能類別
            body.classList.remove('perf-high', 'perf-medium', 'perf-low');
            
            // 添加對應的性能類別
            body.classList.add(`perf-${this.performanceLevel}`);
            
            switch (this.performanceLevel) {
                case 'low':
                    this.applyLowPerformanceMode();
                    break;
                case 'medium':
                    this.applyMediumPerformanceMode();
                    break;
                case 'high':
                    this.applyHighPerformanceMode();
                    break;
            }
        }
        
        applyLowPerformanceMode() {
            console.log('🔧 啟用低性能模式');
            
            // 停用所有動畫
            const style = document.createElement('style');
            style.textContent = `
                .perf-low * {
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-delay: 0s !important;
                }
                
                .perf-low .film-strip {
                    animation: none !important;
                }
                
                .perf-low header h1 {
                    animation: none !important;
                }
                
                .perf-low .envelope:hover {
                    transform: none !important;
                }
                
                .perf-low .frame:hover,
                .perf-low .frame img:hover {
                    transform: none !important;
                }
                
                .perf-low .film-strip-container {
                    transform: none !important;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3) !important;
                }
                
                .perf-low .upload-button:hover {
                    transform: none !important;
                }
            `;
            document.head.appendChild(style);
            
            // 停用星空動畫
            const starCanvas = document.getElementById('star-canvas');
            if (starCanvas) {
                starCanvas.style.display = 'none';
            }
            
            // 禁用膠卷懸停效果
            setTimeout(() => {
                const filmContainer = document.querySelector('.film-strip-container');
                if (filmContainer) {
                    filmContainer.style.pointerEvents = 'none';
                }
            }, 1000);
        }
        
        applyMediumPerformanceMode() {
            console.log('⚡ 啟用中等性能模式');
            
            const style = document.createElement('style');
            style.textContent = `
                .perf-medium .film-strip-container {
                    transform: none !important;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.4) !important;
                }
                
                .perf-medium header h1 {
                    animation-duration: 6s !important;
                }
                
                .perf-medium .frame:hover {
                    transform: scale(1.01) !important;
                }
                
                .perf-medium .frame img:hover {
                    transform: scale(1.02) !important;
                }
                
                .perf-medium .envelope {
                    transform: none !important;
                }
                
                .perf-medium .envelope:hover {
                    transform: scale(1.05) !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        applyHighPerformanceMode() {
            console.log('🔥 啟用高性能模式');
            // 保持所有特效
        }
        
        // 動態性能監控
        startPerformanceMonitoring() {
            let frameCount = 0;
            let lastTime = performance.now();
            
            const monitor = () => {
                frameCount++;
                const currentTime = performance.now();
                
                if (currentTime - lastTime > 5000) { // 每5秒檢查
                    const fps = frameCount / ((currentTime - lastTime) / 1000);
                    
                    if (fps < 15 && this.performanceLevel !== 'low') {
                        console.log('📉 檢測到性能下降，降低性能等級');
                        this.performanceLevel = 'low';
                        this.applyOptimizations();
                    }
                    
                    frameCount = 0;
                    lastTime = currentTime;
                }
                
                requestAnimationFrame(monitor);
            };
            
            requestAnimationFrame(monitor);
        }
        
        // 電池狀態監控
        monitorBattery() {
            if ('getBattery' in navigator) {
                navigator.getBattery().then(battery => {
                    battery.addEventListener('levelchange', () => {
                        if (battery.level < 0.15 && this.performanceLevel !== 'low') {
                            console.log('🔋 電量不足，切換至省電模式');
                            this.performanceLevel = 'low';
                            this.applyOptimizations();
                        }
                    });
                    
                    battery.addEventListener('chargingchange', () => {
                        if (battery.charging && this.performanceLevel === 'low') {
                            console.log('🔌 開始充電，恢復性能模式');
                            this.detectPerformance();
                            this.applyOptimizations();
                        }
                    });
                });
            }
        }
        
        // 網路狀態監控
        monitorConnection() {
            if ('connection' in navigator) {
                navigator.connection.addEventListener('change', () => {
                    const conn = navigator.connection;
                    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
                        if (this.performanceLevel !== 'low') {
                            console.log('📶 網路連線緩慢，降低性能');
                            this.performanceLevel = 'low';
                            this.applyOptimizations();
                        }
                    }
                });
            }
        }
        
        // 提供手動切換性能模式的接口
        setPerformanceLevel(level) {
            if (['low', 'medium', 'high'].includes(level)) {
                this.performanceLevel = level;
                this.applyOptimizations();
                console.log(`🎛️ 手動設定性能等級: ${level}`);
            }
        }
    }
    
    // 創建全域實例
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // DOM 載入完成後啟動監控
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceOptimizer.startPerformanceMonitoring();
        window.performanceOptimizer.monitorBattery();
        window.performanceOptimizer.monitorConnection();
    });
    
    // 提供控制台快速切換指令
    if (typeof window !== 'undefined') {
        window.setPerformance = (level) => {
            window.performanceOptimizer.setPerformanceLevel(level);
        };
        
        console.log('💡 提示：可使用 setPerformance("low"|"medium"|"high") 手動調整性能');
    }
})();