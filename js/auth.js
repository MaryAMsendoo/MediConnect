// auth.js - Authentication and User Management

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.initializeAuth();
    }

    initializeAuth() {
        this.checkExistingSession();
        this.initializeAdmin();
    }

    // Create a default admin user
    initializeAdmin() {
        const users = this.getUsers();
        const adminExists = users.find(user => user.email === 'admin@VitaHealth.com');
        
        if (!adminExists) {
            const adminUser = {
                id: 1,
                name: 'System Admin',
                email: 'admin@VitaHealth.com',
                password: 'admin123',
                userType: 'admin',
                createdAt: new Date().toISOString()
            };
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    checkExistingSession() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            this.currentUser = JSON.parse(currentUser);
            this.redirectToDashboard(this.currentUser.userType);
        }
    }

    // Register new user (always as patient)
    register(userData) {
        const users = this.getUsers();
        
        if (users.find(user => user.email === userData.email)) {
            return { success: false, message: 'Email already exists' };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            userType: 'patient',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.login(userData.email, userData.password);
        return { success: true, message: 'Registration successful' };
    }

    // Login user
    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.redirectToDashboard(user.userType);
            return { success: true, message: 'Login successful' };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    }

    // Admin function to add doctors
    addDoctor(doctorData) {
        if (this.currentUser?.userType !== 'admin') {
            return { success: false, message: 'Unauthorized' };
        }

        const users = this.getUsers();
        
        if (users.find(user => user.email === doctorData.email)) {
            return { success: false, message: 'Email already exists' };
        }

        const newDoctor = {
            id: Date.now(),
            ...doctorData,
            userType: 'doctor',
            createdAt: new Date().toISOString(),
            addedBy: this.currentUser.id
        };

        users.push(newDoctor);
        localStorage.setItem('users', JSON.stringify(users));
        
        return { success: true, message: 'Doctor added successfully' };
    }

    // Get all users (admin function)
    getAllUsers() {
        if (this.currentUser?.userType !== 'admin') {
            return [];
        }
        return this.getUsers();
    }

    // Get users by type
    getUsersByType(userType) {
        if (this.currentUser?.userType !== 'admin') {
            return [];
        }
        const users = this.getUsers();
        return users.filter(user => user.userType === userType);
    }

    redirectToDashboard(userType) {
        switch(userType) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'doctor':
                window.location.href = 'doctor-dashboard.html';
                break;
            case 'patient':
            default:
                window.location.href = 'patient-dashboard.html';
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    protectRoute() {
        if (!this.isAuthenticated()) {
            window.location.href = 'signin.html';
            return false;
        }
        return true;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'signin.html';
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Form Validation Class
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateName(name) {
        return name.trim().length >= 2;
    }

    static validateConfirmPassword(password, confirmPassword) {
        return password === confirmPassword;
    }

    static validateTerms(termsChecked) {
        return termsChecked;
    }
}

// Utility Functions - Make them globally available
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
        element.style.display = 'block';
    }
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.classList.add('hidden');
        element.style.display = 'none';
    }
}

function showMessage(elementId, message, isError = true) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        if (isError) {
            element.className = 'text-red-500 text-sm mt-2';
        } else {
            element.className = 'text-green-500 text-sm mt-2';
        }
        element.classList.remove('hidden');
        element.style.display = 'block';
        
        setTimeout(() => {
            element.classList.add('hidden');
            element.style.display = 'none';
        }, 5000);
    }
}

// Make functions globally available
window.clearError = clearError;
window.showError = showError;
window.showMessage = showMessage;
window.FormValidator = FormValidator;
window.auth = auth;