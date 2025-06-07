// filepath: /Users/milton/Source/checo-con-papa/app.js
// Main application entry point
class CzechLearningApp {
    constructor() {
        this.core = new CzechLearningCore();
        this.ui = new CzechLearningUI(this.core);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CzechLearningApp();
});
