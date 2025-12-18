// Admin Console JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar navigation
    initSidebar();
    
    // Initialize modals
    initModals();
    
    // Initialize charts
    initCharts();
    
    // Initialize form submissions
    initForms();
});

// Sidebar Navigation
function initSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section');
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    
    // Handle sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(link => {
                link.parentElement.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the corresponding section
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
            
            // Close sidebar on mobile after navigation
            if (window.innerWidth < 992) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Toggle sidebar on mobile
    toggleSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 992 && 
            !sidebar.contains(e.target) && 
            !toggleSidebar.contains(e.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
}

// Modal Handling
function initModals() {
    // Add Train Modal
    const addTrainBtn = document.getElementById('addTrainBtn');
    const addTrainModal = document.getElementById('addTrainModal');
    const addTrainClose = addTrainModal.querySelector('.close');
    
    // Create Alert Modal
    const createAlertBtn = document.getElementById('createAlertBtn');
    const createAlertModal = document.getElementById('createAlertModal');
    const createAlertClose = createAlertModal.querySelector('.close');
    
    // Open Add Train Modal
    if (addTrainBtn) {
        addTrainBtn.addEventListener('click', function() {
            addTrainModal.style.display = 'block';
        });
    }
    
    // Close Add Train Modal
    if (addTrainClose) {
        addTrainClose.addEventListener('click', function() {
            addTrainModal.style.display = 'none';
        });
    }
    
    // Open Create Alert Modal
    if (createAlertBtn) {
        createAlertBtn.addEventListener('click', function() {
            createAlertModal.style.display = 'block';
        });
    }
    
    // Close Create Alert Modal
    if (createAlertClose) {
        createAlertClose.addEventListener('click', function() {
            createAlertModal.style.display = 'none';
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === addTrainModal) {
            addTrainModal.style.display = 'none';
        }
        if (e.target === createAlertModal) {
            createAlertModal.style.display = 'none';
        }
    });
}

// Charts Initialization
function initCharts() {
    // Booking Chart
    const bookingChartEl = document.getElementById('bookingChart');
    if (bookingChartEl) {
        const bookingChart = new Chart(bookingChartEl, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Bookings',
                    data: [1200, 1900, 2300, 2800, 2400, 2700, 3000, 3200, 3500, 3700, 4000, 4200],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Occupancy Chart
    const occupancyChartEl = document.getElementById('occupancyChart');
    if (occupancyChartEl) {
        const occupancyChart = new Chart(occupancyChartEl, {
            type: 'bar',
            data: {
                labels: ['Delhi Express', 'Mumbai Superfast', 'Chennai Mail', 'Kolkata Express', 'Bangalore Special'],
                datasets: [{
                    label: 'Occupancy Rate (%)',
                    data: [85, 72, 90, 65, 78],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(46, 204, 113, 0.7)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(155, 89, 182, 1)',
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// Form Submissions
function initForms() {
    // Add Train Form
    const addTrainForm = document.getElementById('addTrainForm');
    if (addTrainForm) {
        addTrainForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const trainNumber = document.getElementById('trainNumber').value;
            const trainName = document.getElementById('trainName').value;
            const trainSource = document.getElementById('trainSource').value;
            const trainDestination = document.getElementById('trainDestination').value;
            const departureTime = document.getElementById('departureTime').value;
            const arrivalTime = document.getElementById('arrivalTime').value;
            const totalSeats = document.getElementById('totalSeats').value;
            const trainStatus = document.getElementById('trainStatus').value;
            
            // Validate form data
            if (!trainNumber || !trainName || !trainSource || !trainDestination || !departureTime || !arrivalTime || !totalSeats) {
                alert('Please fill in all required fields');
                return;
            }
            
            // In a real application, you would send this data to the server
            console.log('Adding train:', {
                trainNumber,
                trainName,
                trainSource,
                trainDestination,
                departureTime,
                arrivalTime,
                totalSeats,
                trainStatus
            });
            
            // Mock success - add to table
            addTrainToTable({
                trainNumber,
                trainName,
                trainSource,
                trainDestination,
                departureTime,
                arrivalTime,
                status: trainStatus
            });
            
            // Close modal and reset form
            document.getElementById('addTrainModal').style.display = 'none';
            addTrainForm.reset();
        });
    }
    
    // Create Alert Form
    const createAlertForm = document.getElementById('createAlertForm');
    if (createAlertForm) {
        createAlertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const alertMessage = document.getElementById('alertMessage').value;
            const alertType = document.getElementById('alertType').value;
            const alertTrain = document.getElementById('alertTrain').value;
            const sendToApp = document.getElementById('sendToApp').checked;
            const sendToDisplay = document.getElementById('sendToDisplay').checked;
            const sendToPlatform = document.getElementById('sendToPlatform').checked;
            
            // Validate form data
            if (!alertMessage || !alertType) {
                alert('Please fill in all required fields');
                return;
            }
            
            // In a real application, you would send this data to the server
            console.log('Creating alert:', {
                alertMessage,
                alertType,
                alertTrain,
                sendTo: {
                    app: sendToApp,
                    display: sendToDisplay,
                    platform: sendToPlatform
                }
            });
            
            // Mock success - add to table
            addAlertToTable({
                id: 'AL' + Math.floor(Math.random() * 100000),
                message: alertMessage,
                type: alertType,
                train: alertTrain ? getTrainNameById(alertTrain) : '-',
                createdAt: new Date().toLocaleString()
            });
            
            // Close modal and reset form
            document.getElementById('createAlertModal').style.display = 'none';
            createAlertForm.reset();
        });
    }
    
    // Settings Forms
    const settingsForms = document.querySelectorAll('#settings form');
    settingsForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, you would send the form data to the server
            console.log('Saving settings for:', form.id);
            
            // Mock success
            alert('Settings saved successfully!');
        });
    });
}

// Helper Functions
function addTrainToTable(train) {
    const table = document.getElementById('trainsTable');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${train.trainNumber}</td>
        <td>${train.trainName}</td>
        <td>${train.trainSource}</td>
        <td>${train.trainDestination}</td>
        <td>${formatTime(train.departureTime)}</td>
        <td>${formatTime(train.arrivalTime)}</td>
        <td><span class="status ${train.status}">${capitalizeFirstLetter(train.status)}</span></td>
        <td>
            <button class="btn-icon"><i class="fas fa-edit"></i></button>
            <button class="btn-icon"><i class="fas fa-trash"></i></button>
            <button class="btn-icon"><i class="fas fa-bell"></i></button>
        </td>
    `;
    
    tbody.prepend(row);
}

function addAlertToTable(alert) {
    const table = document.getElementById('alertsTable');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${alert.id}</td>
        <td>${alert.message}</td>
        <td><span class="alert-type ${alert.type}">${formatAlertType(alert.type)}</span></td>
        <td>${alert.train}</td>
        <td>${alert.createdAt}</td>
        <td>
            <button class="btn-icon"><i class="fas fa-edit"></i></button>
            <button class="btn-icon"><i class="fas fa-trash"></i></button>
            <button class="btn-icon"><i class="fas fa-paper-plane"></i></button>
        </td>
    `;
    
    tbody.prepend(row);
}

function formatTime(time) {
    if (!time) return '';
    
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatAlertType(type) {
    return type.split('_').map(capitalizeFirstLetter).join(' ');
}

function getTrainNameById(id) {
    const trains = {
        '12345': 'Delhi Express (12345)',
        '54321': 'Mumbai Superfast (54321)',
        '67890': 'Chennai Mail (67890)'
    };
    
    return trains[id] || id;
}

// Logout Functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // In a real application, you would handle logout logic here
        console.log('Logging out...');
        
        // Redirect to login page
        // window.location.href = 'login.html';
        alert('Logout functionality will be implemented in the backend.');
    });
}