// Welcome Business - Main JavaScript File
// ==========================================

// Application Configuration
const CONFIG = {
    TRC20_ADDRESS: "TDVgjumBKBZAG3AdKwnV7q9QJfQUzCEBNJ",
    WHATSAPP_NUMBER: "+1 (862) 484-3253",
    COMPANY_NAME: "Welcome Business",
    MIN_DEPOSIT: 50,
    ADMIN_PASSWORD: "welcome123"
};

// Initialize Application
function initApp() {
    console.log(`${CONFIG.COMPANY_NAME} - Initializing...`);
    
    // Initialize localStorage if empty
    if (!localStorage.getItem('deposits')) {
        localStorage.setItem('deposits', JSON.stringify([]));
        console.log('Deposits storage initialized');
    }
    
    if (!localStorage.getItem('balances')) {
        localStorage.setItem('balances', JSON.stringify([]));
        console.log('Balances storage initialized');
    }
    
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({
            address: CONFIG.TRC20_ADDRESS,
            whatsapp: CONFIG.WHATSAPP_NUMBER,
            minDeposit: CONFIG.MIN_DEPOSIT
        }));
    }
    
    // Update current year in footer
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
    
    // Update WhatsApp links
    document.querySelectorAll('.whatsapp-link').forEach(link => {
        link.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '')}`;
    });
}

// Show Notification Message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                               type === 'error' ? 'exclamation-circle' : 
                               type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }
            
            .notification-content {
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .notification-success {
                border-left: 4px solid #4caf50;
            }
            
            .notification-error {
                border-left: 4px solid #ff4757;
            }
            
            .notification-warning {
                border-left: 4px solid #ffa502;
            }
            
            .notification-info {
                border-left: 4px solid #3498db;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 5px;
                margin-left: auto;
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

// Copy Text to Clipboard
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text)
        .then(() => showNotification(successMessage, 'success'))
        .catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy', 'error');
        });
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Generate Transaction ID
function generateTxid() {
    return 'TX' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Save Deposit Request
function saveDepositRequest(depositData) {
    const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
    
    // Add metadata
    depositData.id = 'DEP' + Date.now();
    depositData.date = new Date().toISOString();
    depositData.status = 'pending';
    
    deposits.push(depositData);
    localStorage.setItem('deposits', JSON.stringify(deposits));
    
    return depositData;
}

// Get User Deposits
function getUserDeposits(phone) {
    const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
    return deposits.filter(deposit => deposit.phone === phone);
}

// Get User Balance
function getUserBalance(phone) {
    const balances = JSON.parse(localStorage.getItem('balances')) || [];
    const userBalance = balances.find(b => b.phone === phone);
    
    if (!userBalance) {
        return {
            phone: phone,
            totalBalance: 0,
            totalDeposited: 0,
            totalProfit: 0,
            lastUpdated: new Date().toISOString()
        };
    }
    
    return userBalance;
}

// Update User Balance
function updateUserBalance(phone, amount, name = '', type = 'deposit') {
    const balances = JSON.parse(localStorage.getItem('balances')) || [];
    
    let userBalance = balances.find(b => b.phone === phone);
    
    if (!userBalance) {
        userBalance = {
            phone: phone,
            name: name,
            totalBalance: amount,
            totalDeposited: type === 'deposit' ? amount : 0,
            totalProfit: type === 'profit' ? amount : 0,
            lastUpdated: new Date().toISOString(),
            joinDate: new Date().toISOString()
        };
        balances.push(userBalance);
    } else {
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
    return userBalance;
}

// Generate WhatsApp Message
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

// Export Data to CSV
function exportDataToCSV() {
    const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
    const balances = JSON.parse(localStorage.getItem('balances')) || [];
    
    let csv = 'Welcome Business - Data Export\n\n';
    
    // Deposits Section
    csv += 'DEPOSITS\n';
    csv += 'ID,Name,Phone,Amount,TXID,Date,Status,Approved Date\n';
    deposits.forEach(deposit => {
        csv += `${deposit.id},${deposit.name},${deposit.phone},${deposit.amount},${deposit.txid},` +
               `${deposit.date},${deposit.status},${deposit.approvedDate || ''}\n`;
    });
    
    csv += '\n\nBALANCES\n';
    csv += 'Name,Phone,Total Deposited,Current Balance,Total Profit,Last Updated\n';
    balances.forEach(balance => {
        csv += `${balance.name || ''},${balance.phone},${balance.totalDeposited},` +
               `${balance.totalBalance},${balance.totalProfit},${balance.lastUpdated}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `welcome-business-backup-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

// Backup Data
function backupData() {
    const data = {
        deposits: JSON.parse(localStorage.getItem('deposits')) || [],
        balances: JSON.parse(localStorage.getItem('balances')) || [],
        settings: JSON.parse(localStorage.getItem('settings')) || {},
        backupDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
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

