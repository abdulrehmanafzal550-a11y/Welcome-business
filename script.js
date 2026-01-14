// Welcome Business - Main JavaScript File
// ==========================================

// Application Configuration
const CONFIG = {
    TRC20_ADDRESS: "TDVgjumBKBZAG3AdKwnV7q9QJfQUzCEBNJ",
    WHATSAPP_NUMBER: "+1 (862) 484-3253",
    COMPANY_NAME: "Welcome Business",
    MIN_DEPOSIT: 50,
    ADMIN_PASSWORD: "Labbaik785@#$"
};

// ====================
// INITIALIZATION
// ====================
function initApp() {
    console.log(`${CONFIG.COMPANY_NAME} - Initializing application...`);
    
    // Check if localStorage is available
    if (!isLocalStorageAvailable()) {
        console.error("localStorage is not available!");
        showNotification("Warning: Your browser does not support data storage. Some features may not work properly.", "warning");
        return;
    }
    
    // Initialize data structures if they don't exist
    initializeStorage();
    
    // Update current year in footer
    updateCurrentYear();
    
    // Update WhatsApp links
    updateWhatsAppLinks();
    
    // Debug info
    console.log("Application initialized successfully");
    console.log("Config:", CONFIG);
}

// ====================
// STORAGE FUNCTIONS
// ====================
function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

function initializeStorage() {
    // Initialize deposits array
    if (!localStorage.getItem('deposits')) {
        localStorage.setItem('deposits', JSON.stringify([]));
        console.log("Deposits storage initialized");
    }
    
    // Initialize balances array
    if (!localStorage.getItem('balances')) {
        localStorage.setItem('balances', JSON.stringify([]));
        console.log("Balances storage initialized");
    }
    
    // Initialize settings
    if (!localStorage.getItem('settings')) {
        const defaultSettings = {
            trc20Address: CONFIG.TRC20_ADDRESS,
            whatsappNumber: CONFIG.WHATSAPP_NUMBER,
            minDeposit: CONFIG.MIN_DEPOSIT,
            adminPassword: CONFIG.ADMIN_PASSWORD,
            lastBackup: null
        };
        localStorage.setItem('settings', JSON.stringify(defaultSettings));
        console.log("Settings storage initialized");
    }
}

// ====================
// DATA MANAGEMENT
// ====================
function saveDeposit(depositData) {
    try {
        // Validate deposit data
        if (!depositData.name || !depositData.phone || !depositData.amount || !depositData.txid) {
            throw new Error("Incomplete deposit data");
        }
        
        // Add metadata
        depositData.id = 'DEP' + Date.now() + Math.random().toString(36).substr(2, 6);
        depositData.date = new Date().toISOString();
        depositData.status = 'pending';
        depositData.approvedDate = null;
        
        // Get existing deposits
        const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
        
        // Add new deposit
        deposits.push(depositData);
        
        // Save back to localStorage
        localStorage.setItem('deposits', JSON.stringify(deposits));
        
        console.log("Deposit saved successfully:", depositData);
        console.log("Total deposits:", deposits.length);
        
        return {
            success: true,
            depositId: depositData.id,
            message: "Deposit saved successfully"
        };
        
    } catch (error) {
        console.error("Error saving deposit:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

function getUserDeposits(phone) {
    try {
        const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
        return deposits.filter(deposit => deposit.phone === phone);
    } catch (error) {
        console.error("Error getting user deposits:", error);
        return [];
    }
}

function getUserBalance(phone) {
    try {
        const balances = JSON.parse(localStorage.getItem('balances')) || [];
        const userBalance = balances.find(b => b.phone === phone);
        
        if (!userBalance) {
            // Create default balance if user doesn't exist
            return {
                phone: phone,
                totalBalance: 0,
                totalDeposited: 0,
                totalProfit: 0,
                lastUpdated: new Date().toISOString(),
                joinDate: new Date().toISOString()
            };
        }
        
        return userBalance;
    } catch (error) {
        console.error("Error getting user balance:", error);
        return null;
    }
}

function updateUserBalance(phone, amount, name = '', type = 'deposit') {
    try {
        const balances = JSON.parse(localStorage.getItem('balances')) || [];
        let userBalance = balances.find(b => b.phone === phone);
        
        if (!userBalance) {
            // Create new user
            userBalance = {
                phone: phone,
                name: name,
                totalBalance: type === 'deposit' ? amount : 0,
                totalDeposited: type === 'deposit' ? amount : 0,
                totalProfit: type === 'profit' ? amount : 0,
                lastUpdated: new Date().toISOString(),
                joinDate: new Date().toISOString()
            };
            balances.push(userBalance);
        } else {
            // Update existing user
            if (type === 'deposit') {
                userBalance.totalDeposited += amount;
                userBalance.totalBalance += amount;
            } else if (type === 'profit') {
                userBalance.totalProfit += amount;
                userBalance.totalBalance += amount;
            }
            userBalance.lastUpdated = new Date().toISOString();
        }
        
        localStorage.setItem('balances', JSON.stringify(balances));
        
        console.log("User balance updated:", userBalance);
        return userBalance;
        
    } catch (error) {
        console.error("Error updating user balance:", error);
        return null;
    }
}

function approveDeposit(depositId) {
    try {
        const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
        const depositIndex = deposits.findIndex(d => d.id === depositId || d.txid === depositId);
        
        if (depositIndex === -1) {
            throw new Error("Deposit not found");
        }
        
        // Update deposit status
        deposits[depositIndex].status = 'approved';
        deposits[depositIndex].approvedDate = new Date().toISOString();
        
        // Update user balance
        const deposit = deposits[depositIndex];
        updateUserBalance(deposit.phone, deposit.amount, deposit.name, 'deposit');
        
        // Save updated deposits
        localStorage.setItem('deposits', JSON.stringify(deposits));
        
        console.log("Deposit approved:", deposit);
        return {
            success: true,
            deposit: deposit
        };
        
    } catch (error) {
        console.error("Error approving deposit:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ====================
// NOTIFICATION SYSTEM
// ====================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.global-notification').forEach(el => el.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `global-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('global-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'global-notification-styles';
        style.textContent = `
            .global-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
                animation: slideIn 0.3s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .notification-content {
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 15px;
                border-left: 4px solid;
            }
            
            .notification-success {
                border-left-color: #4caf50;
            }
            
            .notification-error {
                border-left-color: #ff4757;
            }
            
            .notification-warning {
                border-left-color: #ffa502;
            }
            
            .notification-info {
                border-left-color: #3498db;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 5px;
                margin-left: auto;
                font-size: 0.9rem;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ====================
// UTILITY FUNCTIONS
// ====================
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text)
        .then(() => showNotification(successMessage, 'success'))
        .catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy', 'error');
        });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

function generateTxid() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let txid = 'TX';
    for (let i = 0; i < 12; i++) {
        txid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return txid;
}

function generateWhatsAppMessage(depositData) {
    const message = `📋 New Deposit Request - ${CONFIG.COMPANY_NAME}\n\n` +
                   `👤 Name: ${depositData.name}\n` +
                   `📞 Phone: ${depositData.phone}\n` +
                   `💰 Amount: $${depositData.amount}\n` +
                   `🆔 TXID: ${depositData.txid}\n` +
                   `📧 Email: ${depositData.email || 'Not provided'}\n\n` +
                   `Please approve this deposit.`;
    
    return encodeURIComponent(message);
}

function updateCurrentYear() {
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

function updateWhatsAppLinks() {
    document.querySelectorAll('.whatsapp-link').forEach(link => {
        if (!link.href.includes('whatsapp.com')) {
            link.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '')}`;
        }
    });
}

// ====================
// DATA EXPORT/BACKUP
// ====================
function exportDataToCSV() {
    try {
        const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
        const balances = JSON.parse(localStorage.getItem('balances')) || [];
        
        let csv = `${CONFIG.COMPANY_NAME} - Data Export\nGenerated: ${new Date().toLocaleString()}\n\n`;
        
        // Deposits Section
        csv += 'DEPOSITS\n';
        csv += 'ID,Name,Phone,Amount,TXID,Date,Status,Approved Date\n';
        deposits.forEach(deposit => {
            csv += `${deposit.id},${deposit.name},${deposit.phone},${deposit.amount},${deposit.txid},` +
                   `${deposit.date},${deposit.status},${deposit.approvedDate || ''}\n`;
        });
        
        csv += '\n\nUSER BALANCES\n';
        csv += 'Name,Phone,Total Deposited,Current Balance,Total Profit,Last Updated\n';
        balances.forEach(balance => {
            csv += `${balance.name || ''},${balance.phone},${balance.totalDeposited},` +
                   `${balance.totalBalance},${balance.totalProfit},${balance.lastUpdated}\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${CONFIG.COMPANY_NAME.toLowerCase().replace(/\s+/g, '-')}-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Error exporting data', 'error');
    }
}

function backupData() {
    try {
        const data = {
            deposits: JSON.parse(localStorage.getItem('deposits')) || [],
            balances: JSON.parse(localStorage.getItem('balances')) || [],
            settings: JSON.parse(localStorage.getItem('settings')) || {},
            backupDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${CONFIG.COMPANY_NAME.toLowerCase().replace(/\s+/g, '-')}-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Backup created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating backup:', error);
        showNotification('Error creating backup', 'error');
    }
}

function loadBackup(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all current data. Continue?')) {
                localStorage.setItem('deposits', JSON.stringify(data.deposits || []));
                localStorage.setItem('balances', JSON.stringify(data.balances || []));
                localStorage.setItem('settings', JSON.stringify(data.settings || {}));
                
                showNotification('Backup restored successfully!', 'success');
                
                // Reload page after 1 second
                setTimeout(() => {
                    if (window.location.pathname.includes('admin.html')) {
                        location.reload();
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Backup load error:', error);
            showNotification('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
}

// ====================
// VALIDATION FUNCTIONS
// ====================
function validateDepositForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!formData.phone || !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
        errors.push('Valid phone number required');
    }
    
    if (!formData.amount || formData.amount < CONFIG.MIN_DEPOSIT) {
        errors.push(`Minimum deposit is $${CONFIG.MIN_DEPOSIT}`);
    }
    
    if (!formData.txid || formData.txid.trim().length < 10) {
        errors.push('Valid transaction ID required');
    }
    
    return errors;
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
}

// ====================
// TEST FUNCTIONS
// ====================
function testDepositSystem() {
    console.log("=== Testing Deposit System ===");
    
    // Test 1: Check localStorage
    console.log("1. localStorage available:", isLocalStorageAvailable());
    
    // Test 2: Add test deposit
    const testDeposit = {
        name: 'Test User',
        phone: '+1234567890',
        amount: 100,
        txid: 'TEST-' + Date.now(),
        email: 'test@example.com'
    };
    
    const result = saveDeposit(testDeposit);
    console.log("2. Test deposit saved:", result);
    
    // Test 3: Get test deposits
    const deposits = getUserDeposits('+1234567890');
    console.log("3. Test deposits retrieved:", deposits.length);
    
    // Test 4: Test notification
    showNotification('System test completed successfully!', 'success');
    
    return result.success;
}

function addTestData() {
    try {
        const testDeposits = [
            {
                id: 'TEST-001',
                name: 'John Smith',
                phone: '+1234567890',
                amount: 500,
                txid: 'TX123456789ABC',
                date: new Date().toISOString(),
                status: 'pending',
                email: 'john@example.com'
            },
            {
                id: 'TEST-002',
                name: 'Emma Johnson',
                phone: '+1987654321',
                amount: 1000,
                txid: 'TX987654321XYZ',
                date: new Date().toISOString(),
                status: 'approved',
                approvedDate: new Date().toISOString(),
                email: 'emma@example.com'
            }
        ];
        
        // Add test balances
        const testBalances = [
            {
                phone: '+1234567890',
                name: 'John Smith',
                totalBalance: 500,
                totalDeposited: 500,
                totalProfit: 0,
                lastUpdated: new Date().toISOString(),
                joinDate: new Date().toISOString()
            },
            {
                phone: '+1987654321',
                name: 'Emma Johnson',
                totalBalance: 1150,
                totalDeposited: 1000,
                totalProfit: 150,
                lastUpdated: new Date().toISOString(),
                joinDate: new Date().toISOString()
            }
        ];
        
        // Save to localStorage
        localStorage.setItem('deposits', JSON.stria);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Backup created successfully!', 'success');
}

// Load Backup
function loadBackup(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all current data. Continue?')) {
                localStorage.setItem('deposits', JSON.stringify(data.deposits || []));
                localStorage.setItem('balances', JSON.stringify(data.balances || []));
                localStorage.setItem('settings', JSON.stringify(data.settings || {}));
                
                showNotification('Backup restored successfully!', 'success');
                
                // Reload page if on admin page
                if (window.location.pathname.includes('admin.html')) {
                    setTimeout(() => location.reload(), 1000);
                }
            }
        } catch (error) {
            showNotification('Invalid backup file', 'error');
            console.error('Backup load error:', error);
        }
    };
    reader.readAsText(file);
}

// Validate Deposit Form
function validateDepositForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!formData.phone || !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
        errors.push('Valid phone number required');
    }
    
    if (!formData.amount || formData.amount < CONFIG.MIN_DEPOSIT) {
        errors.push(`Minimum deposit is $${CONFIG.MIN_DEPOSIT}`);
    }
    
    if (!formData.txid || formData.txid.trim().length < 10) {
        errors.push('Valid transaction ID required');
    }
    
    return errors;
}

// Page Load Initialization
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    
    // Auto-fill TRC20 address on deposit page
    const trc20Element = document.getElementById('trc20Address');
    if (trc20Element) {
        trc20Element.textContent = CONFIG.TRC20_ADDRESS;
    }
    
    // Auto-fill WhatsApp number
    document.querySelectorAll('.whatsapp-number').forEach(el => {
        el.textContent = CONFIG.WHATSAPP_NUMBER;
    });
    
    // Set minimum deposit amount
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.min = CONFIG.MIN_DEPOSIT;
        amountInput.placeholder = `Min: $${CONFIG.MIN_DEPOSIT}`;
    }
});

// Global helper functions
window.copyAddress = function() {
    copyToClipboard(CONFIG.TRC20_ADDRESS, 'TRC20 address copied!');
};

window.openWhatsApp = function(message = '') {
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '')}`;
    if (message) {
        window.open(`${url}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
        window.open(url, '_blank');
    }
};

console.log(`${CONFIG.COMPANY_NAME} - JavaScript loaded`);

