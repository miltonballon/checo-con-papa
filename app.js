// filepath: /Users/milton/Source/checo-con-papa/app.js
// Main application entry point
console.log('🚀 app.js cargado');
console.log('📊 Estado del DOM al cargar app.js:', document.readyState);
console.log('🔍 Verificando clases disponibles:');
console.log('  - CzechLearningCore disponible:', typeof CzechLearningCore !== 'undefined');
console.log('  - CzechLearningUI disponible:', typeof CzechLearningUI !== 'undefined');

class CzechLearningApp {
    constructor() {
        console.log('Creating CzechLearningApp...');
        try {
            // Check for student name first
            this.checkStudentName().then(() => {
                console.log('Creating CzechLearningCore...');
                this.core = new CzechLearningCore();
                console.log('Core created successfully');
                
                console.log('Creating CzechLearningUI...');
                this.ui = new CzechLearningUI(this.core);
                console.log('UI created successfully');
                console.log('CzechLearningApp initialized successfully');
            });
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    async checkStudentName() {
        const studentName = localStorage.getItem('czechLearning_studentName');
        
        if (!studentName) {
            const name = await this.promptForStudentName();
            if (name && name.trim()) {
                localStorage.setItem('czechLearning_studentName', name.trim());
                console.log('Student name saved:', name.trim());
            }
        } else {
            console.log('Welcome back,', studentName);
        }
    }

    promptForStudentName() {
        return new Promise((resolve) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'student-name-overlay';
            overlay.innerHTML = `
                <div class="student-name-modal">
                    <h2>¡Bienvenido! 🎓</h2>
                    <p>Para personalizar tu experiencia de aprendizaje, por favor ingresa tu nombre:</p>
                    <input type="text" id="student-name-input" placeholder="Tu nombre..." maxlength="50">
                    <div class="modal-buttons">
                        <button id="continue-btn" disabled>Continuar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            const input = document.getElementById('student-name-input');
            const continueBtn = document.getElementById('continue-btn');
            
            // Enable continue button when text is entered
            input.addEventListener('input', () => {
                continueBtn.disabled = input.value.trim().length === 0;
            });
            
            // Handle continue button click
            continueBtn.addEventListener('click', () => {
                const name = input.value.trim();
                if (name) {
                    document.body.removeChild(overlay);
                    resolve(name);
                }
            });
            
            // Handle Enter key
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    continueBtn.click();
                }
            });
            
            // Focus on input
            setTimeout(() => input.focus(), 100);
        });
    }

    getStudentName() {
        return localStorage.getItem('czechLearning_studentName') || 'Estudiante';
    }
}

// Initialize the application when the DOM is loaded
function initializeApp() {
    console.log('🔄 Iniciando aplicación...');
    console.log('📊 Estado del DOM:', document.readyState);
    console.log('🔍 Verificando dependencias:');
    console.log('  - CzechLearningCore:', typeof CzechLearningCore !== 'undefined');
    console.log('  - CzechLearningUI:', typeof CzechLearningUI !== 'undefined');
    
    if (typeof CzechLearningCore === 'undefined') {
        console.error('❌ CzechLearningCore no está disponible');
        return;
    }
    
    if (typeof CzechLearningUI === 'undefined') {
        console.error('❌ CzechLearningUI no está disponible');
        return;
    }
    
    try {
        console.log('✅ Creando instancia de CzechLearningApp...');
        window.app = new CzechLearningApp();
        console.log('🎉 App inicializada y disponible en window.app');
    } catch (error) {
        console.error('💥 Error creando la app:', error);
    }
}

// Check if DOM is already loaded or wait for it
if (document.readyState === 'loading') {
    console.log('DOM is still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded via event listener, initializing app...');
        initializeApp();
    });
} else {
    console.log('DOM already loaded, initializing app immediately...');
    initializeApp();
}