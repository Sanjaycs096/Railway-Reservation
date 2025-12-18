// Railway Reservation & Tracking Platform - Payment Processing

document.addEventListener('DOMContentLoaded', function() {
    // Initialize payment form
    initPaymentForm();
    
    // Initialize payment methods
    initPaymentMethods();
});

// Initialize Payment Form
function initPaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    if (!paymentForm) return;
    
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
        const cardNumber = document.getElementById('card-number')?.value;
        const cardName = document.getElementById('card-name')?.value;
        const cardExpiry = document.getElementById('card-expiry')?.value;
        const cardCvv = document.getElementById('card-cvv')?.value;
        const upiId = document.getElementById('upi-id')?.value;
        
        // Validate form data based on payment method
        if (paymentMethod === 'card') {
            if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
                showPaymentError('Please fill in all card details');
                return;
            }
            
            if (!validateCardNumber(cardNumber)) {
                showPaymentError('Invalid card number');
                return;
            }
            
            if (!validateCardExpiry(cardExpiry)) {
                showPaymentError('Invalid expiry date (MM/YY)');
                return;
            }
            
            if (!validateCardCvv(cardCvv)) {
                showPaymentError('Invalid CVV');
                return;
            }
        } else if (paymentMethod === 'upi') {
            if (!upiId) {
                showPaymentError('Please enter UPI ID');
                return;
            }
            
            if (!validateUpiId(upiId)) {
                showPaymentError('Invalid UPI ID format');
                return;
            }
        } else if (paymentMethod === 'netbanking') {
            const bank = document.getElementById('bank-select')?.value;
            if (!bank || bank === 'select') {
                showPaymentError('Please select a bank');
                return;
            }
        } else {
            showPaymentError('Please select a payment method');
            return;
        }
        
        // Process payment
        processPayment(paymentMethod);
    });
}

// Initialize Payment Methods
function initPaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const paymentSections = document.querySelectorAll('.payment-method-section');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all payment sections
            paymentSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected payment section
            const selectedSection = document.getElementById(`${this.value}-section`);
            if (selectedSection) {
                selectedSection.style.display = 'block';
            }
        });
    });
    
    // Select default payment method
    const defaultMethod = document.querySelector('input[name="payment-method"]:checked');
    if (defaultMethod) {
        const event = new Event('change');
        defaultMethod.dispatchEvent(event);
    } else if (paymentMethods.length > 0) {
        paymentMethods[0].checked = true;
        const event = new Event('change');
        paymentMethods[0].dispatchEvent(event);
    }
}

// Process Payment
function processPayment(paymentMethod) {
    // Show loading state
    showPaymentProcessing();
    
    // In a real application, this would send payment data to the server
    // For demo purposes, we'll simulate a payment process
    setTimeout(() => {
        // 90% success rate for demo
        const success = Math.random() < 0.9;
        
        if (success) {
            showPaymentSuccess();
            
            // In a real application, this would redirect to a confirmation page
            // or update the booking status
            setTimeout(() => {
                const bookingConfirmModal = document.getElementById('booking-confirm-modal');
                if (bookingConfirmModal) {
                    // Hide payment modal
                    const paymentModal = document.getElementById('payment-modal');
                    if (paymentModal) {
                        paymentModal.style.display = 'none';
                    }
                    
                    // Show booking confirmation modal
                    bookingConfirmModal.style.display = 'block';
                    
                    // Generate booking details
                    generateBookingDetails();
                }
            }, 1500);
        } else {
            showPaymentError('Payment failed. Please try again.');
        }
    }, 2000);
}

// Generate Booking Details
function generateBookingDetails() {
    const bookingId = 'BK' + Math.floor(100000 + Math.random() * 900000);
    const pnrNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    
    // Get booking details from session storage or data attributes
    const trainName = sessionStorage.getItem('selectedTrainName') || 'Express 12345';
    const trainNumber = sessionStorage.getItem('selectedTrainNumber') || '12345';
    const source = sessionStorage.getItem('selectedSource') || 'New Delhi';
    const destination = sessionStorage.getItem('selectedDestination') || 'Mumbai';
    const date = sessionStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];
    const passengers = JSON.parse(sessionStorage.getItem('passengers')) || [
        { name: 'Passenger 1', age: '35', gender: 'Male', seat: 'B1-22' }
    ];
    const amount = sessionStorage.getItem('totalAmount') || '₹1,250';
    
    // Set booking details in confirmation modal
    document.getElementById('booking-id')?.textContent = bookingId;
    document.getElementById('pnr-number')?.textContent = pnrNumber;
    document.getElementById('booking-train')?.textContent = `${trainName} (${trainNumber})`;
    document.getElementById('booking-route')?.textContent = `${source} to ${destination}`;
    document.getElementById('booking-date')?.textContent = formatDate(date);
    document.getElementById('booking-amount')?.textContent = amount;
    
    // Generate passenger list
    const passengerList = document.getElementById('passenger-list');
    if (passengerList) {
        passengerList.innerHTML = '';
        
        passengers.forEach(passenger => {
            const li = document.createElement('li');
            li.textContent = `${passenger.name} (${passenger.age}, ${passenger.gender}) - Seat: ${passenger.seat}`;
            passengerList.appendChild(li);
        });
    }
    
    // Store booking details for tracking
    storeBookingForTracking(bookingId, pnrNumber, trainNumber, date);
}

// Store Booking For Tracking
function storeBookingForTracking(bookingId, pnrNumber, trainNumber, date) {
    // In a real application, this would be stored in a database
    // For demo purposes, we'll store it in local storage
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    bookings.push({
        id: bookingId,
        pnr: pnrNumber,
        trainNumber: trainNumber,
        date: date,
        status: 'Confirmed'
    });
    
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Validation Functions
function validateCardNumber(cardNumber) {
    // Remove spaces and dashes
    const number = cardNumber.replace(/[\s-]/g, '');
    
    // Check if the number is 16 digits
    if (!/^\d{16}$/.test(number)) {
        return false;
    }
    
    // Luhn algorithm for card number validation
    let sum = 0;
    let double = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i));
        
        // Double every second digit
        if (double) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        double = !double;
    }
    
    // The number is valid if the sum is a multiple of 10
    return sum % 10 === 0;
}

function validateCardExpiry(expiry) {
    // Check format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return false;
    }
    
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last two digits of year
    const currentMonth = currentDate.getMonth() + 1; // January is 0
    
    // Convert to numbers
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);
    
    // Check if month is valid
    if (expiryMonth < 1 || expiryMonth > 12) {
        return false;
    }
    
    // Check if the card is expired
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        return false;
    }
    
    return true;
}

function validateCardCvv(cvv) {
    // CVV should be 3 or 4 digits
    return /^\d{3,4}$/.test(cvv);
}

function validateUpiId(upiId) {
    // UPI ID format: username@provider
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId);
}

// UI Helper Functions
function showPaymentError(message) {
    const errorElement = document.getElementById('payment-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

function showPaymentProcessing() {
    const processingElement = document.getElementById('payment-processing');
    const formElement = document.getElementById('payment-form');
    const errorElement = document.getElementById('payment-error');
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    if (processingElement) {
        processingElement.style.display = 'block';
    }
    
    if (formElement) {
        formElement.classList.add('processing');
    }
}

function showPaymentSuccess() {
    const processingElement = document.getElementById('payment-processing');
    const successElement = document.getElementById('payment-success');
    const formElement = document.getElementById('payment-form');
    
    if (processingElement) {
        processingElement.style.display = 'none';
    }
    
    if (successElement) {
        successElement.style.display = 'block';
    }
    
    if (formElement) {
        formElement.classList.remove('processing');
        formElement.classList.add('success');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format card number as user types
const cardNumberInput = document.getElementById('card-number');
if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
        // Remove non-digit characters
        let value = this.value.replace(/\D/g, '');
        
        // Add a space after every 4 digits
        value = value.replace(/(.{4})/g, '$1 ').trim();
        
        // Update the input value
        this.value = value;
    });
}

// Format expiry date as user types
const cardExpiryInput = document.getElementById('card-expiry');
if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', function(e) {
        // Remove non-digit characters
        let value = this.value.replace(/\D/g, '');
        
        // Add a slash after the first 2 digits
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        
        // Limit to MM/YY format
        if (value.length > 5) {
            value = value.substring(0, 5);
        }
        
        // Update the input value
        this.value = value;
    });
}

// Download Ticket Button
const downloadTicketBtn = document.getElementById('download-ticket');
if (downloadTicketBtn) {
    downloadTicketBtn.addEventListener('click', function() {
        // In a real application, this would generate a PDF ticket
        // For demo purposes, we'll just show an alert
        alert('Ticket download functionality will be implemented with the backend.');
    });
}

// Send Ticket Email Button
const sendEmailBtn = document.getElementById('send-email');
if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', function() {
        // In a real application, this would send an email with the ticket
        // For demo purposes, we'll just show an alert
        alert('Email functionality will be implemented with the backend.');
    });
}

// Close Booking Confirmation Modal
const closeConfirmBtn = document.querySelector('#booking-confirm-modal .close');
if (closeConfirmBtn) {
    closeConfirmBtn.addEventListener('click', function() {
        const modal = document.getElementById('booking-confirm-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // In a real application, this would redirect to the home page or booking history
        // For demo purposes, we'll just reload the page
        window.location.reload();
    });
}