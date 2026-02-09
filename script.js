// ====================
// CONFIGURATION
// ====================
const CONFIG = {
    PLATFORM_FEES: {
        'shopee': 5.5,
        'tiktok': 8.0,
        'lazada': 7.0
    },
    STORAGE_KEYS: {
        HISTORY: 'profitcalc_history',
        SETTINGS: 'profitcalc_settings',
        EMAIL_SUBSCRIBED: 'profitcalc_email_subscribed'
    }
};

// ====================
// DOM ELEMENTS
// ====================
const elements = {
    // Inputs
    costPrice: document.getElementById('costPrice'),
    platformFee: document.getElementById('platformFee'),
    shippingFee: document.getElementById('shippingFee'),
    adsCost: document.getElementById('adsCost'),
    sellingPrice: document.getElementById('sellingPrice'),
    desiredProfit: document.getElementById('desiredProfit'),
    
    // Buttons
    calculateBtn: document.getElementById('calculateBtn'),
    calculatePriceBtn: document.getElementById('calculatePriceBtn'),
    resetBtn: document.getElementById('resetBtn'),
    copyBtn: document.getElementById('copyBtn'),
    saveBtn: document.getElementById('saveBtn'),
    shareBtn: document.getElementById('shareBtn'),
    exportBtn: document.getElementById('exportBtn'),
    subscribeBtn: document.getElementById('subscribeBtn'),
    feedbackBtn: document.getElementById('feedbackBtn'),
    submitFeedback: document.getElementById('submitFeedback'),
    
    // Platform buttons
    platformBtns: document.querySelectorAll('.platform-btn'),
    
    // Toggles
    advancedToggle: document.getElementById('advancedToggle'),
    advancedOptions: document.getElementById('advancedOptions'),
    
    // Results
    totalCost: document.getElementById('totalCost'),
    profitPerOrder: document.getElementById('profitPerOrder'),
    profitPercentage: document.getElementById('profitPercentage'),
    profitMargin: document.getElementById('profitMargin'),
    profitStatus: document.getElementById('profitStatus'),
    suggestionsContent: document.getElementById('suggestionsContent'),
    
    // Chart
    costBar: document.getElementById('costBar'),
    platformBar: document.getElementById('platformBar'),
    shippingBar: document.getElementById('shippingBar'),
    adsBar: document.getElementById('adsBar'),
    costValue: document.getElementById('costValue'),
    platformValue: document.getElementById('platformValue'),
    shippingValue: document.getElementById('shippingValue'),
    adsValue: document.getElementById('adsValue'),
    
    // Modal & Toast
    donateModal: document.getElementById('donateModal'),
    feedbackModal: document.getElementById('feedbackModal'),
    feedbackText: document.getElementById('feedbackText'),
    feedbackEmail: document.getElementById('feedbackEmail'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    closeModalBtns: document.querySelectorAll('.close-modal'),
    
    // Other
    subscribeEmail: document.getElementById('subscribeEmail'),
    mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
    navLinks: document.querySelector('.nav-links')
};

// ====================
// UTILITY FUNCTIONS
// ====================

/**
 * Format currency VND
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format percentage
 */
function formatPercent(value, decimals = 1) {
    return value.toFixed(decimals) + '%';
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const colorMap = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    const icon = elements.toast.querySelector('i');
    icon.className = iconMap[type] || iconMap.success;
    elements.toast.style.background = colorMap[type] || colorMap.success;
    elements.toastMessage.textContent = message;
    
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        showToast('Lỗi lưu dữ liệu', 'error');
        return false;
    }
}

/**
 * Load data from localStorage
 */
function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Storage error:', error);
        return null;
    }
}

// ====================
// CALCULATION FUNCTIONS
// ====================

/**
 * Calculate all profit metrics
 */
function calculateProfit() {
    try {
        // Get and validate inputs
        const costPrice = parseFloat(elements.costPrice.value) || 0;
        const platformFeePercent = parseFloat(elements.platformFee.value) || 0;
        const shippingFee = parseFloat(elements.shippingFee.value) || 0;
        const adsCost = parseFloat(elements.adsCost.value) || 0;
        const sellingPrice = parseFloat(elements.sellingPrice.value) || 0;
        
        // Validation
        if (costPrice < 0 || platformFeePercent < 0 || platformFeePercent > 100 || 
            shippingFee < 0 || adsCost < 0 || sellingPrice < 0) {
            showToast('Vui lòng nhập giá trị hợp lệ', 'error');
            return null;
        }
        
        if (sellingPrice <= 0) {
            showToast('Vui lòng nhập giá bán', 'error');
            return null;
        }
        
        // Calculate costs
        const platformFee = sellingPrice * (platformFeePercent / 100);
        const totalCost = costPrice + platformFee + shippingFee + adsCost;
        
        // Calculate profits
        const profitPerOrder = sellingPrice - totalCost;
        const profitPercentage = (profitPerOrder / sellingPrice) * 100;
        const profitMargin = totalCost > 0 ? (profitPerOrder / totalCost) * 100 : 0;
        
        // Calculate cost breakdown percentages
        const totalForBreakdown = totalCost || 1;
        const costPercentage = (costPrice / totalForBreakdown) * 100;
        const platformPercentage = (platformFee / totalForBreakdown) * 100;
        const shippingPercentage = (shippingFee / totalForBreakdown) * 100;
        const adsPercentage = (adsCost / totalForBreakdown) * 100;
        
        return {
            // Inputs
            costPrice,
            platformFeePercent,
            shippingFee,
            adsCost,
            sellingPrice,
            
            // Calculations
            platformFee,
            totalCost,
            profitPerOrder,
            profitPercentage,
            profitMargin,
            
            // Breakdown
            costPercentage,
            platformPercentage,
            shippingPercentage,
            adsPercentage,
            
            // Metadata
            timestamp: new Date().toISOString(),
            id: generateId()
        };
        
    } catch (error) {
        console.error('Calculation error:', error);
        showToast('Lỗi tính toán', 'error');
        return null;
    }
}

/**
 * Calculate suggested selling price
 */
function calculateSuggestedPrice() {
    const costPrice = parseFloat(elements.costPrice.value) || 0;
    const platformFeePercent = parseFloat(elements.platformFee.value) || 0;
    const shippingFee = parseFloat(elements.shippingFee.value) || 0;
    const adsCost = parseFloat(elements.adsCost.value) || 0;
    const desiredProfit = parseFloat(elements.desiredProfit.value) || 0;
    
    if (!costPrice || costPrice <= 0) {
        showToast('Vui lòng nhập giá nhập', 'error');
        return;
    }
    
    if (desiredProfit < 0 || desiredProfit > 100) {
        showToast('Mức lãi phải từ 0-100%', 'error');
        return;
    }
    
    // Formula: Selling Price = Fixed Costs / (1 - Desired Profit % - Platform Fee %)
    const desiredProfitDecimal = desiredProfit / 100;
    const platformFeeDecimal = platformFeePercent / 100;
    
    // Fixed costs
    const fixedCosts = costPrice + shippingFee + adsCost;
    
    // Calculate suggested price
    const denominator = 1 - desiredProfitDecimal - platformFeeDecimal;
    
    if (denominator <= 0) {
        showToast('Không thể tính với mức lãi và phí sàn này', 'error');
        return;
    }
    
    const suggestedPrice = fixedCosts / denominator;
    
    if (suggestedPrice <= 0 || !isFinite(suggestedPrice)) {
        showToast('Không thể tính giá với thông số hiện tại', 'error');
        return;
    }
    
    // Round to nearest 1000
    elements.sellingPrice.value = Math.round(suggestedPrice / 1000) * 1000;
    
    // Recalculate and show results
    const results = calculateProfit();
    if (results) {
        updateResults(results);
        showToast(`Đã tính giá bán đề xuất: ${formatCurrency(suggestedPrice)}`, 'success');
    }
}

// ====================
// UI UPDATE FUNCTIONS
// ====================

/**
 * Update UI with calculation results
 */
function updateResults(results) {
    if (!results) return;
    
    // Update main results
    elements.totalCost.textContent = formatCurrency(results.totalCost);
    elements.profitPerOrder.textContent = formatCurrency(results.profitPerOrder);
    elements.profitPercentage.textContent = formatPercent(results.profitPercentage);
    elements.profitMargin.textContent = formatPercent(results.profitMargin);
    
    // Update profit status
    updateProfitStatus(results.profitPercentage);
    
    // Update cost breakdown chart
    updateCostBreakdown(results);
    
    // Update suggestions
    updateSuggestions(results);
}

/**
 * Update profit status display
 */
function updateProfitStatus(profitPercentage) {
    const status = elements.profitStatus;
    let statusData;
    
    if (profitPercentage >= 30) {
        statusData = {
            className: 'high-profit',
            icon: 'fas fa-crown',
            title: '🎉 LÃI SIÊU CAO',
            description: 'Mức lợi nhuận xuất sắc! Sản phẩm có sức cạnh tranh rất tốt.'
        };
    } else if (profitPercentage >= 20) {
        statusData = {
            className: 'high-profit',
            icon: 'fas fa-chart-line',
            title: '✅ LÃI CAO',
            description: 'Mức lợi nhuận rất tốt và bền vững cho kinh doanh online.'
        };
    } else if (profitPercentage >= 10) {
        statusData = {
            className: 'medium-profit',
            icon: 'fas fa-check-circle',
            title: '📊 LÃI ỔN ĐỊNH',
            description: 'Mức lợi nhuận an toàn, phù hợp để duy trì kinh doanh lâu dài.'
        };
    } else if (profitPercentage > 0) {
        statusData = {
            className: 'low-profit',
            icon: 'fas fa-exclamation-triangle',
            title: '⚠️ LÃI THẤP',
            description: 'Sản phẩm có lãi nhưng rất mỏng, rủi ro cao khi có biến động.'
        };
    } else if (profitPercentage === 0) {
        statusData = {
            className: 'breakeven',
            icon: 'fas fa-balance-scale',
            title: '⚖️ HÒA VỐN',
            description: 'Bạn không lỗ nhưng cũng không lãi. Cần điều chỉnh ngay.'
        };
    } else {
        statusData = {
            className: 'loss',
            icon: 'fas fa-times-circle',
            title: '🔴 ĐANG LỖ',
            description: 'Bạn đang bán dưới giá vốn! Cần điều chỉnh KHẨN CẤP.'
        };
    }
    
    // Update status element
    status.className = `profit-status ${statusData.className}`;
    status.innerHTML = `
        <div class="status-icon">
            <i class="${statusData.icon}"></i>
        </div>
        <div class="status-content">
            <h4>${statusData.title}</h4>
            <p>${statusData.description}</p>
        </div>
    `;
}

/**
 * Update cost breakdown chart
 */
function updateCostBreakdown(results) {
    // Update bar widths
    elements.costBar.style.width = results.costPercentage + '%';
    elements.platformBar.style.width = results.platformPercentage + '%';
    elements.shippingBar.style.width = results.shippingPercentage + '%';
    elements.adsBar.style.width = results.adsPercentage + '%';
    
    // Update percentages
    elements.costValue.textContent = formatPercent(results.costPercentage);
    elements.platformValue.textContent = formatPercent(results.platformPercentage);
    elements.shippingValue.textContent = formatPercent(results.shippingPercentage);
    elements.adsValue.textContent = formatPercent(results.adsPercentage);
}

/**
 * Generate and update suggestions
 */
function updateSuggestions(results) {
    let suggestionsHTML = '';
    
    if (results.profitPercentage >= 30) {
        suggestionsHTML = `
            <p><strong>Khuyến nghị:</strong></p>
            <ul>
                <li>✅ <strong>Mở rộng quy mô:</strong> Tăng ngân sách quảng cáo để chiếm thị phần</li>
                <li>✅ <strong>Đa dạng hóa:</strong> Tìm thêm sản phẩm cùng phân khúc</li>
                <li>✅ <strong>Đầu tư branding:</strong> Xây dựng thương hiệu để tăng giá trị sản phẩm</li>
                <li>✅ <strong>Kênh bán đa dạng:</strong> Mở rộng sang TikTok, Facebook, Website</li>
            </ul>
        `;
    } else if (results.profitPercentage >= 20) {
        suggestionsHTML = `
            <p><strong>Khuyến nghị:</strong></p>
            <ul>
                <li>✅ Có thể tăng ngân sách quảng cáo lên 20-30% mà vẫn đảm bảo lãi</li>
                <li>✅ Tối ưu vận chuyển: Đàm phán với đơn vị ship để giảm 10-15% phí</li>
                <li>✅ Tạo combo sản phẩm để tăng giá trị đơn hàng trung bình</li>
                <li>✅ Xem xét chạy flash sale để thu hút khách hàng mới</li>
            </ul>
        `;
    } else if (results.profitPercentage >= 10) {
        suggestionsHTML = `
            <p><strong>Khuyến nghị tối ưu:</strong></p>
            <ul>
                <li>🔍 <strong>Giảm giá vốn:</strong> Thương lượng với nhà cung cấp để có giá tốt hơn</li>
                <li>🔍 <strong>Tối ưu phí sàn:</strong> Tham gia chương trình giảm phí cho seller VIP</li>
                <li>🔍 <strong>Tăng hiệu quả quảng cáo:</strong> Tối ưu targeting để giảm CPC</li>
                <li>🔍 <strong>Bán kèm phụ kiện:</strong> Tăng doanh thu phụ trội</li>
            </ul>
        `;
    } else if (results.profitPercentage > 0) {
        suggestionsHTML = `
            <p><strong>Cần hành động ngay:</strong></p>
            <ul>
                <li>🚨 <strong>Đánh giá lại giá bán:</strong> Có thể tăng giá 5-10% nếu thị trường chấp nhận</li>
                <li>🚨 <strong>Tìm nguồn hàng mới:</strong> Tìm nhà cung cấp có giá tốt hơn ít nhất 10%</li>
                <li>🚨 <strong>Giảm phí vận chuyển:</strong> Đóng gói gọn hơn, đàm phán giá ship</li>
                <li>🚨 <strong>Tối ưu quảng cáo:</strong> Tập trung vào kênh có ROI cao nhất</li>
            </ul>
        `;
    } else if (results.profitPercentage === 0) {
        suggestionsHTML = `
            <p><strong>Hành động cần thiết:</strong></p>
            <ul>
                <li>📈 <strong>Tăng giá bán:</strong> Thử tăng 5-10% và theo dõi phản ứng thị trường</li>
                <li>📈 <strong>Giảm chi phí:</strong> Ưu tiên giảm phí vận chuyển và quảng cáo</li>
                <li>📈 <strong>Tạo giá trị gia tăng:</strong> Thêm dịch vụ hậu mãi, tặng quà</li>
                <li>📈 <strong>Đánh giá chiến lược:</strong> Sản phẩm này chỉ nên giữ nếu có mục đích dẫn dắt khách hàng</li>
            </ul>
        `;
    } else {
        suggestionsHTML = `
            <p><strong>HÀNH ĐỘNG KHẨN CẤP:</strong></p>
            <ul>
                <li>🆘 <strong>DỪNG BÁN NGAY:</strong> Ngừng quảng cáo và nhận đơn hàng mới</li>
                <li>🆘 <strong>Điều chỉnh giá:</strong> Tính lại toàn bộ chi phí và đặt giá mới</li>
                <li>🆘 <strong>Tìm nguồn hàng khẩn:</strong> Liên hệ 3-5 nhà cung cấp mới ngay</li>
                <li>🆘 <strong>Đánh giá lại toàn bộ:</strong> Có nên tiếp tục sản phẩm này không?</li>
            </ul>
        `;
    }
    
    // Add cost analysis
    suggestionsHTML += `
        <p><strong>Phân tích chi phí:</strong></p>
        <ul>
            <li>📌 Giá vốn: ${formatPercent(results.costPercentage)}</li>
            <li>📌 Phí sàn: ${formatPercent(results.platformPercentage)}</li>
            <li>📌 Vận chuyển: ${formatPercent(results.shippingPercentage)}</li>
            <li>📌 Quảng cáo: ${formatPercent(results.adsPercentage)}</li>
        </ul>
    `;
    
    elements.suggestionsContent.innerHTML = suggestionsHTML;
}

// ====================
// DATA MANAGEMENT
// ====================

/**
 * Copy results to clipboard
 */
async function copyResultsToClipboard() {
    const results = calculateProfit();
    if (!results) return;
    
    const text = `
💰 KẾT QUẢ TÍNH TOÁN LỢI NHUẬN - ProfitCalc 💰

📦 THÔNG SỐ SẢN PHẨM:
• Giá nhập: ${formatCurrency(results.costPrice)}
• Giá bán: ${formatCurrency(results.sellingPrice)}
• Phí sàn: ${results.platformFeePercent}%
• Phí vận chuyển: ${formatCurrency(results.shippingFee)}
• CP Quảng cáo/đơn: ${formatCurrency(results.adsCost)}

📊 KẾT QUẢ TÍNH TOÁN:
• Tổng chi phí: ${formatCurrency(results.totalCost)}
• Lợi nhuận/đơn: ${formatCurrency(results.profitPerOrder)}
• Tỷ suất lợi nhuận: ${formatPercent(results.profitPercentage)}
• Biên lợi nhuận: ${formatPercent(results.profitMargin)}

👉 Tính toán bởi ProfitCalc - https://yourusername.github.io/profit-calc
    `;
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('✅ Đã sao chép kết quả vào clipboard!', 'success');
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('❌ Không thể sao chép, vui lòng thử lại', 'error');
    }
}

/**
 * Save calculation to history
 */
function saveCalculation() {
    const results = calculateProfit();
    if (!results) return;
    
    const calculation = {
        ...results,
        savedAt: new Date().toLocaleString('vi-VN'),
        note: ''
    };
    
    // Get existing history
    let history = loadFromStorage(CONFIG.STORAGE_KEYS.HISTORY) || [];
    
    // Add new calculation
    history.unshift(calculation);
    
    // Keep only last 20 calculations
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // Save to storage
    if (saveToStorage(CONFIG.STORAGE_KEYS.HISTORY, history)) {
        // Update save button badge
        elements.saveBtn.innerHTML = `<i class="far fa-save"></i> Đã lưu (${history.length})`;
        showToast('✅ Đã lưu vào lịch sử!', 'success');
    }
}

/**
 * Share results
 */
function shareResults() {
    const results = calculateProfit();
    if (!results) return;
    
    const shareText = `Tôi vừa tính lợi nhuận bán hàng với ProfitCalc: Lãi ${formatPercent(results.profitPercentage)}/đơn!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Kết quả tính lợi nhuận - ProfitCalc',
            text: shareText,
            url: shareUrl
        }).catch(error => {
            console.log('Sharing cancelled or failed:', error);
        });
    } else {
        // Fallback: Copy link
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
            .then(() => {
                showToast('✅ Đã copy link chia sẻ!', 'success');
            });
    }
}

/**
 * Reset calculator
 */
function resetCalculator() {
    // Clear inputs
    elements.costPrice.value = '';
    elements.platformFee.value = '';
    elements.shippingFee.value = '';
    elements.adsCost.value = '';
    elements.sellingPrice.value = '';
    elements.desiredProfit.value = 20;
    
    // Reset platform buttons
    elements.platformBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    elements.platformBtns[0].classList.add('active');
    elements.platformFee.value = CONFIG.PLATFORM_FEES.shopee;
    
    // Reset results
    elements.totalCost.textContent = '0 ₫';
    elements.profitPerOrder.textContent = '0 ₫';
    elements.profitPercentage.textContent = '0%';
    elements.profitMargin.textContent = '0%';
    
    // Reset chart
    updateCostBreakdown({
        costPercentage: 0,
        platformPercentage: 0,
        shippingPercentage: 0,
        adsPercentage: 0
    });
    
    // Reset suggestions
    elements.suggestionsContent.innerHTML = `
        <p>Nhập thông số và bấm "Tính toán lợi nhuận" để xem kết quả</p>
    `;
    
    // Reset profit status
    elements.profitStatus.className = 'profit-status';
    elements.profitStatus.innerHTML = `
        <div class="status-icon">
            <i class="fas fa-info-circle"></i>
        </div>
        <div class="status-content">
            <h4>Chưa có dữ liệu</h4>
            <p>Vui lòng nhập thông số sản phẩm</p>
        </div>
    `;
    
    showToast('🔄 Đã đặt lại tất cả thông số!', 'info');
}

/**
 * Export to PDF (placeholder)
 */
function exportToPDF() {
    showToast('📄 Tính năng xuất PDF đang phát triển', 'info');
}

// ====================
// MODAL FUNCTIONS
// ====================

/**
 * Show donation modal
 */
function showDonateModal() {
    if (elements.donateModal) {
        elements.donateModal.classList.add('show');
    }
}

/**
 * Show feedback modal
 */
function showFeedbackModal() {
    if (elements.feedbackModal) {
        elements.feedbackModal.classList.add('show');
    }
}

/**
 * Hide all modals
 */
function hideModals() {
    if (elements.donateModal) {
        elements.donateModal.classList.remove('show');
    }
    if (elements.feedbackModal) {
        elements.feedbackModal.classList.remove('show');
    }
}

/**
 * Submit feedback
 */
function submitFeedback() {
    const feedback = elements.feedbackText.value.trim();
    const email = elements.feedbackEmail.value.trim();
    
    if (!feedback) {
        showToast('Vui lòng nhập nội dung góp ý', 'error');
        return;
    }
    
    if (email && !validateEmail(email)) {
        showToast('Email không hợp lệ', 'error');
        return;
    }
    
    // Save feedback locally
    const feedbacks = loadFromStorage('profitcalc_feedbacks') || [];
    feedbacks.push({
        feedback,
        email: email || 'anonymous',
        submittedAt: new Date().toISOString()
    });
    
    saveToStorage('profitcalc_feedbacks', feedbacks);
    
    hideModals();
    showToast('🙏 Cảm ơn phản hồi của bạn!', 'success');
}

// ====================
// EMAIL SUBSCRIPTION
// ====================

/**
 * Handle email subscription
 */
function handleSubscribe() {
    const email = elements.subscribeEmail.value.trim();
    
    if (!email) {
        showToast('Vui lòng nhập email', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Email không hợp lệ', 'error');
        return;
    }
    
    const subscriptions = loadFromStorage('profitcalc_subscriptions') || [];
    subscriptions.push({
        email,
        subscribedAt: new Date().toISOString(),
        source: 'footer'
    });
    
    saveToStorage('profitcalc_subscriptions', subscriptions);
    saveToStorage(CONFIG.STORAGE_KEYS.EMAIL_SUBSCRIBED, true);
    
    elements.subscribeEmail.value = '';
    showToast('🎉 Cảm ơn bạn đã đăng ký!', 'success');
}

// ====================
// INITIALIZATION
// ====================

/**
 * Initialize calculator with saved data
 */
function initializeCalculator() {
    // Load saved settings
    const settings = loadFromStorage(CONFIG.STORAGE_KEYS.SETTINGS);
    if (settings) {
        if (settings.costPrice) elements.costPrice.value = settings.costPrice;
        if (settings.platformFee) elements.platformFee.value = settings.platformFee;
        if (settings.shippingFee) elements.shippingFee.value = settings.shippingFee;
        if (settings.adsCost) elements.adsCost.value = settings.adsCost;
        if (settings.sellingPrice) elements.sellingPrice.value = settings.sellingPrice;
    }
    
    // Load history badge
    const history = loadFromStorage(CONFIG.STORAGE_KEYS.HISTORY) || [];
    if (history.length > 0) {
        elements.saveBtn.innerHTML = `<i class="far fa-save"></i> Đã lưu (${history.length})`;
    }
    
    // Auto-calculate if all fields are filled
    if (elements.costPrice.value && elements.sellingPrice.value) {
        const results = calculateProfit();
        if (results) {
            updateResults(results);
        }
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Calculation
    elements.calculateBtn.addEventListener('click', () => {
        const results = calculateProfit();
        if (results) updateResults(results);
    });
    
    elements.calculatePriceBtn.addEventListener('click', calculateSuggestedPrice);
    
    // Platform buttons
    elements.platformBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const fee = btn.getAttribute('data-fee');
            elements.platformFee.value = fee;
            
            // Update active state
            elements.platformBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Advanced toggle
    elements.advancedToggle.addEventListener('click', () => {
        const isVisible = elements.advancedOptions.style.display === 'block';
        elements.advancedOptions.style.display = isVisible ? 'none' : 'block';
        
        const icon = elements.advancedToggle.querySelector('.fa-chevron-down');
        if (icon) {
            icon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    });
    
    // Action buttons
    elements.resetBtn.addEventListener('click', resetCalculator);
    elements.copyBtn.addEventListener('click', copyResultsToClipboard);
    elements.saveBtn.addEventListener('click', saveCalculation);
    elements.shareBtn.addEventListener('click', shareResults);
    elements.exportBtn.addEventListener('click', exportToPDF);
    
    // Email subscription
    if (elements.subscribeBtn) {
        elements.subscribeBtn.addEventListener('click', handleSubscribe);
        elements.subscribeEmail?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubscribe();
        });
    }
    
    // Feedback system
    if (elements.feedbackBtn) {
        elements.feedbackBtn.addEventListener('click', showFeedbackModal);
    }
    
    if (elements.submitFeedback) {
        elements.submitFeedback.addEventListener('click', submitFeedback);
    }
    
    // Donation modal buttons
    const copyBankBtn = document.querySelector('.copy-bank-btn');
    if (copyBankBtn) {
        copyBankBtn.addEventListener('click', () => {
            const bankInfo = `Ngân hàng: Vietcombank\nSTK: 0123456789\nChủ TK: NGUYEN VAN A\nNội dung: UNGHO PROFITCALC`;
            navigator.clipboard.writeText(bankInfo)
                .then(() => showToast('✅ Đã sao chép thông tin ngân hàng!', 'success'));
        });
    }
    
    const paypalBtn = document.querySelector('.paypal-btn');
    if (paypalBtn) {
        paypalBtn.addEventListener('click', () => {
            showToast('📤 Đang chuyển hướng đến PayPal...', 'info');
            setTimeout(() => {
                window.open('https://paypal.com', '_blank');
            }, 1000);
        });
    }
    
    // Close modals
    elements.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', hideModals);
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModals();
        }
    });
    
    // Mobile menu
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.navLinks.classList.toggle('show');
            elements.mobileMenuBtn.innerHTML = elements.navLinks.classList.contains('show') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!elements.mobileMenuBtn.contains(e.target) && 
                !elements.navLinks.contains(e.target)) {
                elements.navLinks.classList.remove('show');
                elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                // Close mobile menu if open
                if (elements.navLinks) {
                    elements.navLinks.classList.remove('show');
                    elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
                
                // Smooth scroll
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL hash
                if (targetId !== '#') {
                    history.pushState(null, null, targetId);
                }
            }
        });
    });
    
    // Auto-save on input change
    const inputs = [elements.costPrice, elements.platformFee, elements.shippingFee, 
                   elements.adsCost, elements.sellingPrice];
    
    inputs.forEach(input => {
        input?.addEventListener('blur', () => {
            const settings = {
                costPrice: elements.costPrice.value,
                platformFee: elements.platformFee.value,
                shippingFee: elements.shippingFee.value,
                adsCost: elements.adsCost.value,
                sellingPrice: elements.sellingPrice.value
            };
            saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, settings);
        });
        
        // Auto-calculate on Enter
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.calculateBtn.click();
            }
        });
    });
    
    // Format numbers on blur
    [elements.costPrice, elements.shippingFee, elements.adsCost, elements.sellingPrice]
        .forEach(input => {
            input?.addEventListener('blur', function() {
                if (this.value) {
                    const value = parseFloat(this.value.replace(/[^0-9]/g, ''));
                    if (!isNaN(value)) {
                        this.value = Math.round(value / 1000) * 1000;
                    }
                }
            });
        });
}

/**
 * Check for update
 */
function checkForUpdate() {
    const lastVersion = loadFromStorage('profitcalc_version');
    const currentVersion = '1.0.0';
    
    if (lastVersion !== currentVersion) {
        console.log(`Updated to version ${currentVersion}`);
        saveToStorage('profitcalc_version', currentVersion);
        
        if (lastVersion) {
            setTimeout(() => {
                showToast(`🆕 Đã cập nhật phiên bản ${currentVersion}`, 'info');
            }, 2000);
        }
    }
}

/**
 * Animate stats in donate section
 */
function animateStats() {
    const stats = document.querySelectorAll('.donate-stat h4');
    stats.forEach(stat => {
        const targetValue = parseInt(stat.textContent);
        let currentValue = 0;
        const increment = targetValue / 50;
        const interval = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                stat.textContent = targetValue + '+';
                clearInterval(interval);
            } else {
                stat.textContent = Math.floor(currentValue) + '+';
            }
        }, 30);
    });
}

// ====================
// MAIN INITIALIZATION
// ====================

/**
 * Initialize everything when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ProfitCalc initialized');
    
    // Initialize components
    initializeCalculator();
    setupEventListeners();
    checkForUpdate();
    
    // Animate stats when donate section comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const donateCTASection = document.querySelector('.donate-cta-section');
    if (donateCTASection) {
        observer.observe(donateCTASection);
    }
    
    // Show welcome message for first-time visitors
    if (!loadFromStorage('profitcalc_welcome_shown')) {
        setTimeout(() => {
            showToast('🎉 Chào mừng đến với ProfitCalc!', 'info');
            saveToStorage('profitcalc_welcome_shown', true);
        }, 1000);
    }
});

/**
 * Error handling
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e);
});

// ====================
// PWA SUPPORT
// ====================

/**
 * Check if app is installed
 */
window.addEventListener('appinstalled', () => {
    console.log('App installed');
});

/**
 * Show install prompt
 */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    setTimeout(() => {
        showInstallPrompt();
    }, 5000);
});

function showInstallPrompt() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then(choiceResult => {
            deferredPrompt = null;
        });
    }
}

// ====================
// OFFLINE SUPPORT
// ====================

/**
 * Check online status
 */
window.addEventListener('online', () => {
    showToast('✅ Đã kết nối lại internet', 'success');
});

window.addEventListener('offline', () => {
    showToast('⚠️ Mất kết nối internet. Một số tính năng có thể bị hạn chế.', 'warning');
});

// ====================
// SERVICE WORKER REGISTRATION
// ====================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}