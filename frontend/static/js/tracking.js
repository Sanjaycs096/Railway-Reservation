// Railway Reservation & Tracking Platform - Real-time Tracking

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tracking form
    initTrackingForm();
    
    // Initialize tracking map
    initTrackingMap();
    
    // Initialize alert subscription
    initAlertSubscription();
});

// Initialize Tracking Form
function initTrackingForm() {
    const trackingForm = document.getElementById('tracking-form');
    if (!trackingForm) return;
    
    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const trackingType = document.querySelector('input[name="tracking-type"]:checked')?.value;
        const pnrNumber = document.getElementById('pnr-number')?.value;
        const trainNumber = document.getElementById('train-number')?.value;
        
        // Validate form data
        if (trackingType === 'pnr' && !pnrNumber) {
            showTrackingError('Please enter PNR number');
            return;
        } else if (trackingType === 'train' && !trainNumber) {
            showTrackingError('Please enter train number');
            return;
        }
        
        // Track train or booking
        if (trackingType === 'pnr') {
            trackByPNR(pnrNumber);
        } else {
            trackByTrainNumber(trainNumber);
        }
    });
    
    // Toggle between PNR and Train tracking
    const trackingTypes = document.querySelectorAll('input[name="tracking-type"]');
    trackingTypes.forEach(type => {
        type.addEventListener('change', function() {
            const pnrSection = document.getElementById('pnr-section');
            const trainSection = document.getElementById('train-section');
            
            if (this.value === 'pnr') {
                pnrSection.style.display = 'block';
                trainSection.style.display = 'none';
            } else {
                pnrSection.style.display = 'none';
                trainSection.style.display = 'block';
            }
        });
    });
    
    // Select default tracking type
    const defaultType = document.querySelector('input[name="tracking-type"]:checked');
    if (defaultType) {
        const event = new Event('change');
        defaultType.dispatchEvent(event);
    } else if (trackingTypes.length > 0) {
        trackingTypes[0].checked = true;
        const event = new Event('change');
        trackingTypes[0].dispatchEvent(event);
    }
}

// Track by PNR
function trackByPNR(pnrNumber) {
    showTrackingLoading();
    
    // In a real application, this would fetch data from the server
    // For demo purposes, we'll use mock data or local storage
    setTimeout(() => {
        // Check if we have this booking in local storage
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const booking = bookings.find(b => b.pnr == pnrNumber);
        
        if (booking) {
            // Use the booking data to track the train
            trackByTrainNumber(booking.trainNumber, booking);
        } else {
            // Use mock data
            const mockBooking = {
                id: 'BK123456',
                pnr: pnrNumber,
                trainNumber: '12345',
                trainName: 'Express 12345',
                source: 'New Delhi',
                destination: 'Mumbai',
                date: new Date().toISOString().split('T')[0],
                departureTime: '08:00',
                arrivalTime: '16:30',
                status: 'Confirmed',
                passengers: [
                    { name: 'Passenger 1', age: '35', gender: 'Male', seat: 'B1-22' }
                ]
            };
            
            trackByTrainNumber(mockBooking.trainNumber, mockBooking);
        }
    }, 1500);
}

// Track by Train Number
function trackByTrainNumber(trainNumber, bookingData = null) {
    showTrackingLoading();
    
    // In a real application, this would fetch data from the server
    // For demo purposes, we'll use mock data
    setTimeout(() => {
        // Mock train data
        const trainData = {
            trainNumber: trainNumber,
            trainName: bookingData?.trainName || `Train ${trainNumber}`,
            source: bookingData?.source || 'New Delhi',
            destination: bookingData?.destination || 'Mumbai',
            departureTime: bookingData?.departureTime || '08:00',
            arrivalTime: bookingData?.arrivalTime || '16:30',
            currentStation: 'Surat',
            nextStation: 'Vadodara',
            status: 'Running',
            delay: '10 min',
            lastUpdated: new Date().toLocaleTimeString(),
            progress: 65, // Percentage of journey completed
            coordinates: { lat: 21.1702, lng: 72.8311 }, // Surat coordinates
            route: [
                { station: 'New Delhi', arrival: '', departure: '08:00', status: 'departed' },
                { station: 'Mathura', arrival: '09:30', departure: '09:35', status: 'departed' },
                { station: 'Agra', arrival: '10:30', departure: '10:40', status: 'departed' },
                { station: 'Gwalior', arrival: '12:00', departure: '12:10', status: 'departed' },
                { station: 'Jhansi', arrival: '13:30', departure: '13:40', status: 'departed' },
                { station: 'Bhopal', arrival: '15:30', departure: '15:40', status: 'departed' },
                { station: 'Surat', arrival: '19:30', departure: '19:40', status: 'current' },
                { station: 'Vadodara', arrival: '20:45', departure: '20:55', status: 'upcoming' },
                { station: 'Ahmedabad', arrival: '22:00', departure: '22:10', status: 'upcoming' },
                { station: 'Mumbai', arrival: '16:30', departure: '', status: 'upcoming' }
            ]
        };
        
        // Display train tracking information
        displayTrackingInfo(trainData, bookingData);
        
        // Update map with train location
        updateTrackingMap(trainData);
        
        // Hide loading
        hideTrackingLoading();
        
        // Show tracking result
        showTrackingResult();
        
        // Start real-time updates
        startRealTimeUpdates(trainData);
    }, 1500);
}

// Display Tracking Information
function displayTrackingInfo(trainData, bookingData) {
    // Set train information
    document.getElementById('tracking-train-number')?.textContent = trainData.trainNumber;
    document.getElementById('tracking-train-name')?.textContent = trainData.trainName;
    document.getElementById('tracking-route')?.textContent = `${trainData.source} to ${trainData.destination}`;
    document.getElementById('tracking-status')?.textContent = trainData.status;
    document.getElementById('tracking-delay')?.textContent = trainData.delay;
    document.getElementById('tracking-current-station')?.textContent = trainData.currentStation;
    document.getElementById('tracking-next-station')?.textContent = trainData.nextStation;
    document.getElementById('tracking-last-updated')?.textContent = trainData.lastUpdated;
    
    // Set progress bar
    const progressBar = document.getElementById('tracking-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${trainData.progress}%`;
    }
    
    // Set booking information if available
    if (bookingData) {
        const bookingSection = document.getElementById('booking-info-section');
        if (bookingSection) {
            bookingSection.style.display = 'block';
        }
        
        document.getElementById('tracking-booking-id')?.textContent = bookingData.id;
        document.getElementById('tracking-pnr')?.textContent = bookingData.pnr;
        document.getElementById('tracking-booking-status')?.textContent = bookingData.status;
        
        // Display passenger information
        const passengerList = document.getElementById('tracking-passenger-list');
        if (passengerList && bookingData.passengers) {
            passengerList.innerHTML = '';
            
            bookingData.passengers.forEach(passenger => {
                const li = document.createElement('li');
                li.textContent = `${passenger.name} (${passenger.age}, ${passenger.gender}) - Seat: ${passenger.seat}`;
                passengerList.appendChild(li);
            });
        }
    } else {
        const bookingSection = document.getElementById('booking-info-section');
        if (bookingSection) {
            bookingSection.style.display = 'none';
        }
    }
    
    // Display route information
    const routeList = document.getElementById('tracking-route-list');
    if (routeList && trainData.route) {
        routeList.innerHTML = '';
        
        trainData.route.forEach(station => {
            const li = document.createElement('li');
            li.className = `station-item ${station.status}`;
            
            const stationName = document.createElement('div');
            stationName.className = 'station-name';
            stationName.textContent = station.station;
            
            const stationTime = document.createElement('div');
            stationTime.className = 'station-time';
            
            if (station.arrival && station.departure) {
                stationTime.textContent = `${station.arrival} - ${station.departure}`;
            } else if (station.arrival) {
                stationTime.textContent = `Arr: ${station.arrival}`;
            } else if (station.departure) {
                stationTime.textContent = `Dep: ${station.departure}`;
            }
            
            const stationStatus = document.createElement('div');
            stationStatus.className = 'station-status';
            
            if (station.status === 'current') {
                stationStatus.textContent = 'Current';
            } else if (station.status === 'departed') {
                stationStatus.textContent = 'Departed';
            }
            
            li.appendChild(stationName);
            li.appendChild(stationTime);
            li.appendChild(stationStatus);
            
            routeList.appendChild(li);
        });
    }
}

// Initialize Tracking Map
function initTrackingMap() {
    // Check if map container exists
    const mapContainer = document.getElementById('tracking-map');
    if (!mapContainer) return;
    
    // In a real application, this would initialize a map using Google Maps, Mapbox, etc.
    // For demo purposes, we'll create a simple visual representation
    
    // Create a canvas element for the map
    const canvas = document.createElement('canvas');
    canvas.width = mapContainer.clientWidth;
    canvas.height = mapContainer.clientHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.backgroundColor = '#f0f4f8';
    
    // Clear the map container and add the canvas
    mapContainer.innerHTML = '';
    mapContainer.appendChild(canvas);
    
    // Draw a simple map background
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw some map features (simplified)
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // Draw grid lines
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Draw main route line
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, canvas.height / 2);
    ctx.lineTo(canvas.width - 50, canvas.height / 2);
    ctx.stroke();
    
    // Draw station markers
    const stations = [
        { name: 'New Delhi', x: 50, y: canvas.height / 2 },
        { name: 'Mathura', x: canvas.width * 0.15, y: canvas.height / 2 },
        { name: 'Agra', x: canvas.width * 0.25, y: canvas.height / 2 },
        { name: 'Gwalior', x: canvas.width * 0.35, y: canvas.height / 2 },
        { name: 'Jhansi', x: canvas.width * 0.45, y: canvas.height / 2 },
        { name: 'Bhopal', x: canvas.width * 0.55, y: canvas.height / 2 },
        { name: 'Surat', x: canvas.width * 0.65, y: canvas.height / 2 },
        { name: 'Vadodara', x: canvas.width * 0.75, y: canvas.height / 2 },
        { name: 'Ahmedabad', x: canvas.width * 0.85, y: canvas.height / 2 },
        { name: 'Mumbai', x: canvas.width - 50, y: canvas.height / 2 }
    ];
    
    stations.forEach(station => {
        // Draw station marker
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(station.x, station.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw station name
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(station.name, station.x, station.y + 20);
    });
    
    // Store stations data for later use
    mapContainer.dataset.stations = JSON.stringify(stations);
}

// Update Tracking Map
function updateTrackingMap(trainData) {
    // Check if map container exists
    const mapContainer = document.getElementById('tracking-map');
    if (!mapContainer) return;
    
    // Get the canvas
    const canvas = mapContainer.querySelector('canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get stations data
    const stations = JSON.parse(mapContainer.dataset.stations || '[]');
    if (stations.length === 0) return;
    
    // Calculate train position based on progress
    const startX = stations[0].x;
    const endX = stations[stations.length - 1].x;
    const totalDistance = endX - startX;
    const trainX = startX + (totalDistance * trainData.progress / 100);
    
    // Redraw the map
    initTrackingMap();
    
    // Draw train marker
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(trainX, canvas.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw train icon
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🚆', trainX, canvas.height / 2 + 3);
    
    // Draw train info
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(trainData.trainName, trainX, canvas.height / 2 - 15);
    
    // Draw current station highlight
    const currentStation = stations.find(station => station.name === trainData.currentStation);
    if (currentStation) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(currentStation.x, currentStation.y, 8, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Start Real-time Updates
function startRealTimeUpdates(initialData) {
    // In a real application, this would use WebSockets or polling to get updates
    // For demo purposes, we'll simulate updates every 10 seconds
    
    // Store initial data
    let trainData = { ...initialData };
    
    // Update function
    const updateTrainData = () => {
        // Simulate progress update
        trainData.progress = Math.min(100, trainData.progress + 0.5);
        
        // Update last updated time
        trainData.lastUpdated = new Date().toLocaleTimeString();
        
        // Update station if needed
        if (trainData.progress >= 75 && trainData.currentStation === 'Surat') {
            trainData.currentStation = 'Vadodara';
            trainData.nextStation = 'Ahmedabad';
            
            // Update route status
            trainData.route = trainData.route.map(station => {
                if (station.station === 'Surat') {
                    return { ...station, status: 'departed' };
                } else if (station.station === 'Vadodara') {
                    return { ...station, status: 'current' };
                } else {
                    return station;
                }
            });
        }
        
        // Update delay randomly
        if (Math.random() < 0.3) {
            const delayMinutes = parseInt(trainData.delay) + (Math.random() < 0.5 ? 1 : -1);
            trainData.delay = `${Math.max(0, delayMinutes)} min`;
        }
        
        // Display updated information
        displayTrackingInfo(trainData);
        
        // Update map
        updateTrackingMap(trainData);
    };
    
    // Start interval
    const updateInterval = setInterval(updateTrainData, 10000);
    
    // Store interval ID for cleanup
    document.getElementById('tracking-result')?.dataset.updateInterval = updateInterval;
    
    // Add event listener to stop updates when tracking result is hidden
    const trackingForm = document.getElementById('tracking-form');
    if (trackingForm) {
        trackingForm.addEventListener('submit', function() {
            // Clear previous interval
            const trackingResult = document.getElementById('tracking-result');
            if (trackingResult) {
                const previousInterval = trackingResult.dataset.updateInterval;
                if (previousInterval) {
                    clearInterval(previousInterval);
                }
            }
        });
    }
}

// Initialize Alert Subscription
function initAlertSubscription() {
    const alertForm = document.getElementById('alert-form');
    if (!alertForm) return;
    
    alertForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const pnrNumber = document.getElementById('alert-pnr')?.value;
        const phoneNumber = document.getElementById('alert-phone')?.value;
        const email = document.getElementById('alert-email')?.value;
        
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
        
        // Subscribe to alerts
        subscribeToAlerts(pnrNumber, phoneNumber, email);
    });
}

// Subscribe to Alerts
function subscribeToAlerts(pnrNumber, phoneNumber, email) {
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
        
        subscriptions.push({
            pnr: pnrNumber,
            phone: phoneNumber,
            email: email,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('alertSubscriptions', JSON.stringify(subscriptions));
        
        // Show success message
        const alertForm = document.getElementById('alert-form');
        const successMessage = document.createElement('div');
        successMessage.className = 'alert-success';
        successMessage.textContent = 'You have successfully subscribed to alerts for this journey!';
        
        alertForm.innerHTML = '';
        alertForm.appendChild(successMessage);
        
        // Add details
        const details = document.createElement('p');
        details.className = 'alert-details';
        details.innerHTML = `
            <strong>PNR:</strong> ${pnrNumber}<br>
            ${phoneNumber ? `<strong>SMS alerts:</strong> ${phoneNumber}<br>` : ''}
            ${email ? `<strong>Email alerts:</strong> ${email}` : ''}
        `;
        
        alertForm.appendChild(details);
        
        // Add unsubscribe button
        const unsubscribeButton = document.createElement('button');
        unsubscribeButton.type = 'button';
        unsubscribeButton.className = 'btn-secondary';
        unsubscribeButton.textContent = 'Unsubscribe';
        unsubscribeButton.addEventListener('click', function() {
            unsubscribeFromAlerts(pnrNumber);
        });
        
        alertForm.appendChild(unsubscribeButton);
    }, 2000);
}

// Unsubscribe from Alerts
function unsubscribeFromAlerts(pnrNumber) {
    // In a real application, this would send a request to the server
    // For demo purposes, we'll just update local storage
    const subscriptions = JSON.parse(localStorage.getItem('alertSubscriptions')) || [];
    
    const updatedSubscriptions = subscriptions.filter(sub => sub.pnr !== pnrNumber);
    
    localStorage.setItem('alertSubscriptions', JSON.stringify(updatedSubscriptions));
    
    // Show unsubscribed message
    const alertForm = document.getElementById('alert-form');
    if (alertForm) {
        alertForm.innerHTML = `
            <div class="alert-success">You have been unsubscribed from alerts for PNR ${pnrNumber}.</div>
            <button type="button" class="btn-primary" id="resubscribe-btn">Subscribe Again</button>
        `;
        
        // Add event listener to resubscribe button
        const resubscribeButton = document.getElementById('resubscribe-btn');
        if (resubscribeButton) {
            resubscribeButton.addEventListener('click', function() {
                // Reset the alert form
                alertForm.innerHTML = `
                    <div class="form-group">
                        <label for="alert-pnr">PNR Number</label>
                        <input type="text" id="alert-pnr" placeholder="Enter PNR Number" value="${pnrNumber}">
                    </div>
                    <div class="form-group">
                        <label for="alert-phone">Phone Number (for SMS alerts)</label>
                        <input type="tel" id="alert-phone" placeholder="Enter 10-digit phone number">
                    </div>
                    <div class="form-group">
                        <label for="alert-email">Email Address</label>
                        <input type="email" id="alert-email" placeholder="Enter email address">
                    </div>
                    <div class="alert-options">
                        <label><input type="checkbox" checked> Platform changes</label>
                        <label><input type="checkbox" checked> Delays</label>
                        <label><input type="checkbox" checked> Arrival alerts</label>
                    </div>
                    <button type="submit" class="btn-primary">Subscribe to Alerts</button>
                    <div id="alert-error" class="error-message"></div>
                `;
                
                // Reinitialize alert subscription
                initAlertSubscription();
            });
        }
    }
}

// UI Helper Functions
function showTrackingError(message) {
    const errorElement = document.getElementById('tracking-error');
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

function showAlertError(message) {
    const errorElement = document.getElementById('alert-error');
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

function showTrackingLoading() {
    const loadingElement = document.getElementById('tracking-loading');
    const formElement = document.getElementById('tracking-form');
    const resultElement = document.getElementById('tracking-result');
    const errorElement = document.getElementById('tracking-error');
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    
    if (resultElement) {
        resultElement.style.display = 'none';
    }
    
    if (formElement) {
        formElement.classList.add('loading');
    }
}

function hideTrackingLoading() {
    const loadingElement = document.getElementById('tracking-loading');
    const formElement = document.getElementById('tracking-form');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    if (formElement) {
        formElement.classList.remove('loading');
    }
}

function showTrackingResult() {
    const resultElement = document.getElementById('tracking-result');
    
    if (resultElement) {
        resultElement.style.display = 'block';
        
        // Scroll to result
        resultElement.scrollIntoView({ behavior: 'smooth' });
    }
}