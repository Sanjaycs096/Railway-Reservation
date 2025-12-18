// Railway Reservation & Tracking Platform - Alerts System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize alert subscription form
    initAlertForm();
    
    // Initialize alert notifications
    initAlertNotifications();
});

// Initialize Alert Form
function initAlertForm() {
    const alertForm = document.getElementById('alert-form');
    if (!alertForm) return;
    
    alertForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const pnrNumber = document.getElementById('alert-pnr')?.value;
        const phoneNumber = document.getElementById('alert-phone')?.value;
        const email = document.getElementById('alert-email')?.value;
        
        // Get alert types
        const alertTypes = [];
        document.querySelectorAll('.alert-options input[type="checkbox"]:checked').forEach(checkbox => {
            alertTypes.push(checkbox.value || checkbox.name);
        });
        
        // Validate form data
        if (!pnrNumber) {
            showAlertError('Please enter PNR number');
            return;
        }
        
        if (!phoneNumber && !email) {
            showAlertError('Please enter at least one contact method');
            return;
        }
        
        if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
            showAlertError('Please enter a valid 10-digit phone number');
            return;
        }
        
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAlertError('Please enter a valid email address');
            return;
        }
        
        // Create alert subscription
        createAlertSubscription(pnrNumber, phoneNumber, email, alertTypes);
    });
}

// Create Alert Subscription
function createAlertSubscription(pnrNumber, phoneNumber, email, alertTypes) {
    // Show loading state
    const alertButton = document.querySelector('#alert-form button[type="submit"]');
    if (alertButton) {
        alertButton.disabled = true;
        alertButton.innerHTML = '<span class="spinner"></span> Subscribing...';
    }
    
    // In a real application, this would send data to the server
    // For demo purposes, we'll simulate a subscription process
    setTimeout(() => {
        // Store subscription in local storage
        const subscriptions = JSON.parse(localStorage.getItem('alertSubscriptions')) || [];
        
        const newSubscription = {
            id: generateUniqueId(),
            pnr: pnrNumber,
            phone: phoneNumber,
            email: email,
            alertTypes: alertTypes.length > 0 ? alertTypes : ['delay', 'platform_change', 'arrival'],
            createdAt: new Date().toISOString()
        };
        
        subscriptions.push(newSubscription);
        localStorage.setItem('alertSubscriptions', JSON.stringify(subscriptions));
        
        // Show success message
        showAlertSuccess(newSubscription);
    }, 2000);
}

// Show Alert Success
function showAlertSuccess(subscription) {
    const alertForm = document.getElementById('alert-form');
    if (!alertForm) return;
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'alert-success';
    successMessage.textContent = 'You have successfully subscribed to alerts for this journey!';
    
    // Clear form and add success message
    alertForm.innerHTML = '';
    alertForm.appendChild(successMessage);
    
    // Add subscription details
    const details = document.createElement('div');
    details.className = 'alert-details';
    details.innerHTML = `
        <p><strong>PNR:</strong> ${subscription.pnr}</p>
        ${subscription.phone ? `<p><strong>SMS alerts:</strong> ${subscription.phone}</p>` : ''}
        ${subscription.email ? `<p><strong>Email alerts:</strong> ${subscription.email}</p>` : ''}
        <p><strong>Alert types:</strong> ${subscription.alertTypes.join(', ')}</p>
    `;
    
    alertForm.appendChild(details);
    
    // Add unsubscribe button
    const unsubscribeButton = document.createElement('button');
    unsubscribeButton.type = 'button';
    unsubscribeButton.className = 'btn-secondary';
    unsubscribeButton.textContent = 'Unsubscribe';
    unsubscribeButton.addEventListener('click', function() {
        unsubscribeFromAlerts(subscription.id);
    });
    
    alertForm.appendChild(unsubscribeButton);
}

// Unsubscribe from Alerts
function unsubscribeFromAlerts(subscriptionId) {
    // Get subscriptions from local storage
    const subscriptions = JSON.parse(localStorage.getItem('alertSubscriptions')) || [];
    
    // Find subscription
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) return;
    
    // Remove subscription
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
    localStorage.setItem('alertSubscriptions', JSON.stringify(updatedSubscriptions));
    
    // Show unsubscribed message
    const alertForm = document.getElementById('alert-form');
    if (!alertForm) return;
    
    alertForm.innerHTML = `
        <div class="alert-success">You have been unsubscribed from alerts for PNR ${subscription.pnr}.</div>
        <button type="button" class="btn-primary" id="resubscribe-btn">Subscribe Again</button>
    `;
    
    // Add event listener to resubscribe button
    const resubscribeButton = document.getElementById('resubscribe-btn');
    if (resubscribeButton) {
        resubscribeButton.addEventListener('click', function() {
            resetAlertForm(subscription);
        });
    }
}

// Reset Alert Form
function resetAlertForm(subscription = null) {
    const alertForm = document.getElementById('alert-form');
    if (!alertForm) return;
    
    alertForm.innerHTML = `
        <div class="form-group">
            <label for="alert-pnr">PNR Number</label>
            <input type="text" id="alert-pnr" placeholder="Enter PNR Number" value="${subscription ? subscription.pnr : ''}">
        </div>
        <div class="form-group">
            <label for="alert-phone">Phone Number (for SMS alerts)</label>
            <input type="tel" id="alert-phone" placeholder="Enter 10-digit phone number" value="${subscription ? subscription.phone : ''}">
        </div>
        <div class="form-group">
            <label for="alert-email">Email Address</label>
            <input type="email" id="alert-email" placeholder="Enter email address" value="${subscription ? subscription.email : ''}">
        </div>
        <div class="alert-options">
            <label><input type="checkbox" name="platform_change" value="platform_change" checked> Platform changes</label>
            <label><input type="checkbox" name="delay" value="delay" checked> Delays</label>
            <label><input type="checkbox" name="arrival" value="arrival" checked> Arrival alerts</label>
        </div>
        <button type="submit" class="btn-primary">Subscribe to Alerts</button>
        <div id="alert-error" class="error-message"></div>
    `;
    
    // Reinitialize alert form
    initAlertForm();
}

// Initialize Alert Notifications
function initAlertNotifications() {
    // Check if notifications container exists
    const notificationsContainer = document.getElementById('alert-notifications');
    if (!notificationsContainer) return;
    
    // In a real application, this would use WebSockets or polling to get real-time alerts
    // For demo purposes, we'll simulate alerts
    
    // Get subscriptions from local storage
    const subscriptions = JSON.parse(localStorage.getItem('alertSubscriptions')) || [];
    
    if (subscriptions.length === 0) {
        // No subscriptions, show empty state
        notificationsContainer.innerHTML = `
            <div class="empty-state">
                <p>You don't have any active alert subscriptions.</p>
                <p>Subscribe to alerts to receive updates about your journey.</p>
            </div>
        `;
        return;
    }
    
    // Show subscriptions
    notificationsContainer.innerHTML = `
        <h3>Your Alert Subscriptions</h3>
        <div class="alert-list" id="alert-list"></div>
    `;
    
    const alertList = document.getElementById('alert-list');
    if (!alertList) return;
    
    // Add subscriptions to list
    subscriptions.forEach(subscription => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <div class="alert-item-header">
                <h4>PNR: ${subscription.pnr}</h4>
                <span class="alert-date">${formatDate(subscription.createdAt)}</span>
            </div>
            <div class="alert-item-body">
                ${subscription.phone ? `<p><strong>SMS alerts:</strong> ${subscription.phone}</p>` : ''}
                ${subscription.email ? `<p><strong>Email alerts:</strong> ${subscription.email}</p>` : ''}
                <p><strong>Alert types:</strong> ${subscription.alertTypes.join(', ')}</p>
            </div>
            <div class="alert-item-footer">
                <button type="button" class="btn-text unsubscribe-btn" data-id="${subscription.id}">Unsubscribe</button>
            </div>
        `;
        
        alertList.appendChild(alertItem);
    });
    
    // Add event listeners to unsubscribe buttons
    document.querySelectorAll('.unsubscribe-btn').forEach(button => {
        button.addEventListener('click', function() {
            const subscriptionId = this.dataset.id;
            unsubscribeFromAlerts(subscriptionId);
            
            // Remove alert item from list
            const alertItem = this.closest('.alert-item');
            if (alertItem) {
                alertItem.remove();
            }
            
            // Check if list is empty
            if (alertList.children.length === 0) {
                initAlertNotifications();
            }
        });
    });
    
    // Simulate new alerts
    simulateNewAlerts();
}

// Simulate New Alerts
function simulateNewAlerts() {
    // Get subscriptions from local storage
    const subscriptions = JSON.parse(localStorage.getItem('alertSubscriptions')) || [];
    
    if (subscriptions.length === 0) return;
    
    // Get random subscription
    const subscription = subscriptions[Math.floor(Math.random() * subscriptions.length)];
    
    // Create mock alerts
    const mockAlerts = [
        {
            type: 'delay',
            message: 'Your train is running 15 minutes late.',
            timestamp: new Date().toISOString()
        },
        {
            type: 'platform_change',
            message: 'Platform changed from 3 to 5 for your train.',
            timestamp: new Date().toISOString()
        },
        {
            type: 'arrival',
            message: 'Your train will arrive at the destination in 30 minutes.',
            timestamp: new Date().toISOString()
        }
    ];
    
    // Filter alerts based on subscription alert types
    const relevantAlerts = mockAlerts.filter(alert => subscription.alertTypes.includes(alert.type));
    
    if (relevantAlerts.length === 0) return;
    
    // Get random alert
    const randomAlert = relevantAlerts[Math.floor(Math.random() * relevantAlerts.length)];
    
    // Show alert notification after random delay (between 30-60 seconds)
    const delay = Math.floor(Math.random() * 30000) + 30000;
    
    setTimeout(() => {
        showAlertNotification(subscription.pnr, randomAlert);
        
        // Schedule next alert
        simulateNewAlerts();
    }, delay);
}

// Show Alert Notification
function showAlertNotification(pnr, alert) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${alert.type}`;
    notification.innerHTML = `
        <div class="notification-header">
            <h4>${getAlertTypeLabel(alert.type)}</h4>
            <button type="button" class="close-btn">&times;</button>
        </div>
        <div class="notification-body">
            <p><strong>PNR:</strong> ${pnr}</p>
            <p>${alert.message}</p>
        </div>
        <div class="notification-footer">
            <span class="notification-time">${formatTime(alert.timestamp)}</span>
        </div>
    `;
    
    // Add notification to container
    const notificationsContainer = document.getElementById('notifications-container');
    if (notificationsContainer) {
        notificationsContainer.appendChild(notification);
        
        // Add event listener to close button
        const closeButton = notification.querySelector('.close-btn');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                notification.remove();
            });
        }
        
        // Auto-remove notification after 10 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 10000);
    }
    
    // Play notification sound
    playNotificationSound();
    
    // Add to alerts history
    addToAlertsHistory(pnr, alert);
}

// Add to Alerts History
function addToAlertsHistory(pnr, alert) {
    // Get alerts history from local storage
    const alertsHistory = JSON.parse(localStorage.getItem('alertsHistory')) || [];
    
    // Add new alert
    alertsHistory.push({
        id: generateUniqueId(),
        pnr: pnr,
        type: alert.type,
        message: alert.message,
        timestamp: alert.timestamp,
        read: false
    });
    
    // Limit history to 50 items
    if (alertsHistory.length > 50) {
        alertsHistory.shift();
    }
    
    // Save to local storage
    localStorage.setItem('alertsHistory', JSON.stringify(alertsHistory));
    
    // Update alerts count
    updateAlertsCount();
}

// Update Alerts Count
function updateAlertsCount() {
    // Get alerts history from local storage
    const alertsHistory = JSON.parse(localStorage.getItem('alertsHistory')) || [];
    
    // Count unread alerts
    const unreadCount = alertsHistory.filter(alert => !alert.read).length;
    
    // Update count in UI
    const alertsCountElement = document.getElementById('alerts-count');
    if (alertsCountElement) {
        alertsCountElement.textContent = unreadCount;
        alertsCountElement.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Play Notification Sound
function playNotificationSound() {
    // Create audio element
    const audio = new Audio();
    audio.src = '../sounds/notification.mp3';
    audio.volume = 0.5;
    
    // Play sound
    audio.play().catch(error => {
        console.log('Error playing notification sound:', error);
    });
}

// Helper Functions
function showAlertError(message) {
    const errorElement = document.getElementById('alert-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getAlertTypeLabel(type) {
    switch (type) {
        case 'delay':
            return 'Delay Alert';
        case 'platform_change':
            return 'Platform Change';
        case 'arrival':
            return 'Arrival Alert';
        default:
            return 'Alert';
    }
}