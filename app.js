// filepath: /Users/milton/Source/checo-con-papa/app.js
// Main application entry point
class CzechLearningApp {
    constructor() {
        console.log('Creating CzechLearningApp...');
        try {
            console.log('Creating CzechLearningCore...');
            this.core = new CzechLearningCore();
            console.log('Core created successfully');
            
            console.log('Creating CzechLearningUI...');
            this.ui = new CzechLearningUI(this.core);
            console.log('UI created successfully');
            console.log('CzechLearningApp initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    try {
        window.app = new CzechLearningApp();
        console.log('App initialized and attached to window');
    } catch (error) {
        console.error('Error creating app:', error);
    }
});