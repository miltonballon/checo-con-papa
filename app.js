class CzechLearningApp {
    constructor() {
        this.phrases = [];
        this.currentSection = 0;
        this.unlockedSections = [0]; // First lesson is always unlocked
        this.currentQuestion = 0;
        this.examQuestions = [];
        this.examAnswers = [];
        this.examMode = false;
        this.examType = null; // 'spanish-to-czech' or 'czech-to-spanish'
        
        // Scroll-based header hiding
        this.lastScrollTop = 0;
        this.scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
        this.headerHeight = 0;
        
        // Load progress from localStorage
        this.loadProgress();
        
        this.init();
    }

    async init() {
        await this.loadPhrases();
        
        // Validate current lesson after phrases are loaded
        if (this.currentSection >= this.phrases.length) {
            this.currentSection = this.phrases.length - 1;
        }
        
        // Validate unlocked lessons
        this.unlockedSections = this.unlockedSections.filter(section => section < this.phrases.length);
        if (this.unlockedSections.length === 0) {
            this.unlockedSections = [0];
        }
        
        this.setupEventListeners();
        this.setupScrollHeaderHiding();
        this.renderNavigation();
        // Show the lesson where the user left off
        this.showSection(this.currentSection);
    }

    loadProgress() {
        try {
            const savedProgress = localStorage.getItem('czechLearningProgress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                this.currentSection = progress.currentSection || 0;
                this.unlockedSections = progress.unlockedSections || [0];
                
                // Ensure current section is valid and doesn't exceed available sections
                if (this.currentSection < 0) {
                    this.currentSection = 0;
                }
                
                // Ensure first lesson is always unlocked
                if (!this.unlockedSections.includes(0)) {
                    this.unlockedSections.push(0);
                }
                
                console.log('Progreso cargado desde localStorage:', progress);
                
                // Show a brief welcome back message if there's saved progress
                if (progress.lastUpdated) {
                    const lastDate = new Date(progress.lastUpdated);
                    const now = new Date();
                    const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
                    
                    setTimeout(() => {
                        const message = daysDiff === 0 ? 
                            '¡Bienvenida de vuelta! Continuando donde lo dejaste...' :
                            `¡Bienvenida de vuelta! Han pasado ${daysDiff} día${daysDiff > 1 ? 's' : ''} desde tu última sesión.`;
                        
                        this.showNotification(message);
                    }, 1000);
                }
            } else {
                console.log('No se encontró progreso guardado. Comenzando desde el inicio.');
            }
        } catch (error) {
            console.error('Error loading progress from localStorage:', error);
            // Reset to defaults if there's an error
            this.currentSection = 0;
            this.unlockedSections = [0];
        }
    }

    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    saveProgress() {
        try {
            const progress = {
                currentSection: this.currentSection,
                unlockedSections: this.unlockedSections,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('czechLearningProgress', JSON.stringify(progress));
            console.log('Progress saved:', progress);
        } catch (error) {
            console.error('Error saving progress to localStorage:', error);
        }
    }

    async loadPhrases() {
        try {
            const response = await fetch('./phrases.json');
            this.phrases = await response.json();
        } catch (error) {
            console.error('Error loading phrases:', error);
        }
    }

    setupEventListeners() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close navigation when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    setupScrollHeaderHiding() {
        const header = document.querySelector('header');
        const body = document.body;
        
        // Get header height for calculations
        this.headerHeight = header.offsetHeight;
        
        // Initialize header as visible
        header.classList.add('header-visible');
        body.classList.add('header-expanded');
        
        // Add click listener to minimize button
        const minimizeButton = document.getElementById('minimize-header');
        minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent header click event
            this.minimizeHeader();
        });
        
        // Add click listener to minimized header
        header.addEventListener('click', (e) => {
            if (header.classList.contains('header-minimized')) {
                // Scroll to top and show full header
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.expandHeader();
            }
        });
        
        // Throttled scroll handler for better performance
        let scrollTimeout;
        
        const handleScroll = () => {
            if (scrollTimeout) {
                return;
            }
            
            scrollTimeout = setTimeout(() => {
                const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Calculate scroll direction and distance
                const scrollDelta = currentScrollTop - this.lastScrollTop;
                
                // Only act if we've scrolled more than the threshold
                if (Math.abs(scrollDelta) > this.scrollThreshold) {
                    if (scrollDelta > 0 && currentScrollTop > this.headerHeight) {
                        // Scrolling down and past header height - minimize header
                        this.minimizeHeader();
                    } else if (scrollDelta < 0 || currentScrollTop <= 50) {
                        // Scrolling up or near top - show full header
                        this.expandHeader();
                    }
                    
                    this.lastScrollTop = currentScrollTop;
                }
                
                scrollTimeout = null;
            }, 10); // Small delay for throttling
        };
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Also show full header when navigation is opened
        const navToggle = document.getElementById('nav-toggle');
        navToggle.addEventListener('click', () => {
            this.expandHeader();
        });
    }

    minimizeHeader() {
        const header = document.querySelector('header');
        const body = document.body;
        
        header.classList.remove('header-visible');
        header.classList.add('header-minimized');
        body.classList.remove('header-expanded');
    }

    expandHeader() {
        const header = document.querySelector('header');
        const body = document.body;
        
        header.classList.remove('header-minimized');
        header.classList.add('header-visible');
        body.classList.add('header-expanded');
    }

    renderNavigation() {
        const navMenu = document.getElementById('nav-menu');
        const existingFooter = navMenu.querySelector('.nav-footer');
        navMenu.innerHTML = '';

        this.phrases.forEach((section, index) => {
            const navItem = document.createElement('button');
            navItem.className = 'nav-item';
            navItem.textContent = section.section;
            
            if (this.unlockedSections.includes(index)) {
                navItem.classList.add('unlocked');
                navItem.addEventListener('click', () => {
                    this.currentSection = index;
                    this.saveProgress(); // Save when switching sections
                    this.showSection(index);
                    document.getElementById('nav-menu').classList.remove('active');
                });
            } else {
                navItem.classList.add('locked');
            }
            
            if (index === this.currentSection) {
                navItem.classList.add('current');
            }
            
            navMenu.appendChild(navItem);
        });

        // Add footer with reset button
        const navFooter = document.createElement('div');
        navFooter.className = 'nav-footer';
        navFooter.innerHTML = `
            <button id="reset-progress" class="reset-button" onclick="app.resetProgress()">
                🔄 Reiniciar Progreso
            </button>
        `;
        navMenu.appendChild(navFooter);

        // Update progress indicator
        this.updateProgressIndicator();
    }

    updateProgressIndicator() {
        const progressIndicator = document.getElementById('progress-indicator');
        const progress = this.getProgressSummary();
        
        progressIndicator.innerHTML = `
            <div>
                Lección ${progress.currentSection} de ${progress.totalSections} • 
                ${progress.completedSections} completadas (${progress.progressPercentage}%)
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.progressPercentage}%"></div>
            </div>
        `;
    }

    showSection(sectionIndex) {
        if (!this.unlockedSections.includes(sectionIndex)) return;
        
        this.currentSection = sectionIndex;
        this.examMode = false;
        this.saveProgress(); // Save when entering a section
        this.renderNavigation();
        
        const mainContent = document.getElementById('main-content');
        const section = this.phrases[sectionIndex];
        
        mainContent.innerHTML = `
            <div class="section-content">
                <h2 class="section-title">${section.section}</h2>
                <div class="phrases-container">
                    ${section.items.map(phrase => this.renderPhraseCard(phrase)).join('')}
                </div>
                <button class="exam-button" onclick="app.startExam()">
                    📝 Tomar Examen
                </button>
            </div>
        `;
        
        this.setupAudioButtons();
    }

    renderPhraseCard(phrase) {
        const [spanish, czech, pronunciation] = phrase;
        return `
            <div class="phrase-card">
                <div class="phrase-spanish">${spanish}</div>
                <div class="phrase-czech">${czech}</div>
                <div class="phrase-pronunciation">${pronunciation}</div>
                <button class="audio-button" data-text="${czech}">
                    🔊 Escuchar
                </button>
            </div>
        `;
    }

    setupAudioButtons() {
        const audioButtons = document.querySelectorAll('.audio-button');
        audioButtons.forEach(button => {
            button.addEventListener('click', () => {
                const text = button.getAttribute('data-text');
                this.playAudio(text);
            });
        });
    }

    playAudio(text) {
        // Use Web Speech API for text-to-speech
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'cs-CZ'; // Czech language
            utterance.rate = 0.8; // Slightly slower for learning
            
            // Add visual feedback during audio playback
            const audioButtons = document.querySelectorAll('.audio-button');
            audioButtons.forEach(button => {
                if (button.getAttribute('onclick') && button.getAttribute('onclick').includes(text)) {
                    button.style.backgroundColor = '#38a169';
                    button.innerHTML = '🔊 Reproduciendo...';
                }
            });
            
            utterance.onend = () => {
                // Reset button appearance when audio finishes
                audioButtons.forEach(button => {
                    if (button.getAttribute('onclick') && button.getAttribute('onclick').includes(text)) {
                        button.style.backgroundColor = '#48bb78';
                        // Check if it's the main question audio button or option button
                        if (button.parentElement.classList.contains('question-audio')) {
                            button.innerHTML = '🔊 Volver a escuchar';
                        } else {
                            button.innerHTML = '🔊';
                        }
                    }
                });
            };
            
            utterance.onerror = () => {
                // Reset button appearance on error
                audioButtons.forEach(button => {
                    if (button.getAttribute('onclick') && button.getAttribute('onclick').includes(text)) {
                        button.style.backgroundColor = '#f56565';
                        button.innerHTML = '🔊 Error';
                        setTimeout(() => {
                            button.style.backgroundColor = '#48bb78';
                            if (button.parentElement.classList.contains('question-audio')) {
                                button.innerHTML = '🔊 Volver a escuchar';
                            } else {
                                button.innerHTML = '🔊';
                            }
                        }, 2000);
                    }
                });
            };
            
            speechSynthesis.speak(utterance);
        } else {
            alert('Tu navegador no soporta síntesis de voz');
        }
    }

    startExam() {
        this.examMode = true;
        this.generateExamQuestions();
        this.currentQuestion = 0;
        this.examAnswers = [];
        this.showQuestion();
    }

    generateExamQuestions() {
        const currentSectionPhrases = this.phrases[this.currentSection].items;
        this.examQuestions = [];
        
        // Generate Spanish to Czech questions
        currentSectionPhrases.forEach(phrase => {
            this.examQuestions.push({
                type: 'spanish-to-czech',
                question: phrase[0], // Spanish
                correct: phrase[1], // Czech
                options: this.generateOptions(phrase[1], currentSectionPhrases, 1) // Czech options
            });
        });
        
        // Generate Czech to Spanish questions
        currentSectionPhrases.forEach(phrase => {
            this.examQuestions.push({
                type: 'czech-to-spanish',
                question: phrase[1], // Czech
                correct: phrase[0], // Spanish
                options: this.generateOptions(phrase[0], currentSectionPhrases, 0) // Spanish options
            });
        });
        
        // Shuffle questions
        this.examQuestions = this.shuffleArray(this.examQuestions);
    }

    generateOptions(correct, allPhrases, languageIndex) {
        const options = [correct];
        const otherPhrases = allPhrases.filter(phrase => phrase[languageIndex] !== correct);
        
        // Add 3 random incorrect options
        while (options.length < 4 && otherPhrases.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherPhrases.length);
            const randomPhrase = otherPhrases.splice(randomIndex, 1)[0];
            options.push(randomPhrase[languageIndex]);
        }
        
        return this.shuffleArray(options);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    showQuestion() {
        const mainContent = document.getElementById('main-content');
        const question = this.examQuestions[this.currentQuestion];
        
        mainContent.innerHTML = `
            <div class="question-container">
                <div class="question-number">
                    Pregunta ${this.currentQuestion + 1} de ${this.examQuestions.length}
                </div>
                ${question.type === 'czech-to-spanish' ? 
                    `<div class="question-audio">
                        <button class="audio-button" onclick="app.playAudio('${question.question}')">
                            🔊 Volver a escuchar
                        </button>
                    </div>
                    <div class="question-text">¿Qué significa la frase que escuchaste?</div>` : 
                    `<div class="question-text">${question.question}</div>`
                }
                <div class="options-container">
                    ${question.options.map((option, index) => 
                        `<div class="option-button" data-option="${option}" onclick="app.selectAnswer('${option}')">
                            <span class="option-text">${option}</span>
                            ${question.type === 'spanish-to-czech' ? 
                                `<span class="audio-button-inline" onclick="event.stopPropagation(); app.playAudio('${option}')">🔊</span>` : 
                                ''
                            }
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Auto-play audio for Czech-to-Spanish questions
        if (question.type === 'czech-to-spanish') {
            // Add auto-play indicator
            const autoPlayMessage = document.createElement('div');
            autoPlayMessage.className = 'auto-play-message';
            autoPlayMessage.innerHTML = '🎵 Reproduciendo automáticamente...';
            autoPlayMessage.style.cssText = `
                text-align: center;
                color: #667eea;
                font-weight: bold;
                margin-bottom: 1rem;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const questionContainer = document.querySelector('.question-container');
            const questionAudio = questionContainer.querySelector('.question-audio');
            questionContainer.insertBefore(autoPlayMessage, questionAudio);
            
            // Fade in the message
            setTimeout(() => {
                autoPlayMessage.style.opacity = '1';
            }, 100);
            
            // Small delay to ensure the DOM is ready, then play audio
            setTimeout(() => {
                this.playAudio(question.question);
                // Remove auto-play message after audio starts
                setTimeout(() => {
                    autoPlayMessage.style.opacity = '0';
                    setTimeout(() => {
                        if (autoPlayMessage.parentNode) {
                            autoPlayMessage.parentNode.removeChild(autoPlayMessage);
                        }
                    }, 300);
                }, 1000);
            }, 300);
        }
    }

    selectAnswer(selectedOption) {
        const question = this.examQuestions[this.currentQuestion];
        const isCorrect = selectedOption === question.correct;
        
        // Auto-play audio for Czech options (spanish-to-czech questions)
        if (question.type === 'spanish-to-czech') {
            this.playAudio(selectedOption);
        }
        
        this.examAnswers.push({
            question: this.currentQuestion,
            selected: selectedOption,
            correct: question.correct,
            isCorrect: isCorrect
        });
        
        // Disable all option buttons and show correct/incorrect
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.classList.add('disabled');
            const optionText = button.getAttribute('data-option');
            
            if (optionText === question.correct) {
                button.classList.add('correct');
            } else if (optionText === selectedOption && !isCorrect) {
                button.classList.add('incorrect');
            }
        });
        
        // Show next button
        const questionContainer = document.querySelector('.question-container');
        const nextButtonText = this.currentQuestion < this.examQuestions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados';
        questionContainer.innerHTML += `
            <button class="next-question-button" onclick="app.nextQuestion()">
                ${nextButtonText}
            </button>
        `;
        
        // If answer is correct, automatically advance after 1 second
        if (isCorrect) {
            // Add auto-advance indicator
            const autoAdvanceMessage = document.createElement('div');
            autoAdvanceMessage.className = 'auto-advance-message';
            autoAdvanceMessage.innerHTML = '✅ ¡Correcto! Avanzando automáticamente...';
            autoAdvanceMessage.style.cssText = `
                text-align: center;
                color: #48bb78;
                font-weight: bold;
                margin-top: 1rem;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            questionContainer.appendChild(autoAdvanceMessage);
            
            // Fade in the message
            setTimeout(() => {
                autoAdvanceMessage.style.opacity = '1';
            }, 100);
            
            setTimeout(() => {
                // Check if we're still on the same question (user hasn't clicked button yet)
                if (this.currentQuestion === this.examAnswers.length - 1) {
                    this.nextQuestion();
                }
            }, 1000);
        }
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.examQuestions.length) {
            this.showQuestion();
        } else {
            this.showExamResults();
        }
    }

    showExamResults() {
        const correctAnswers = this.examAnswers.filter(answer => answer.isCorrect).length;
        const totalQuestions = this.examQuestions.length;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = percentage >= 80; // Need 80% to pass
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="exam-results">
                <div class="score ${passed ? 'passing' : 'failing'}">
                    ${correctAnswers}/${totalQuestions} (${percentage}%)
                </div>
                <div class="result-message">
                    ${passed ? 
                        '¡Excelente! Has aprobado esta lección.' : 
                        'Necesitas practicar más. Intenta de nuevo.'
                    }
                </div>
                <div class="result-buttons">
                    <button class="result-button" onclick="app.showSection(${this.currentSection})">
                        Volver a Practicar
                    </button>
                    ${passed && this.currentSection < this.phrases.length - 1 ? 
                        `<button class="result-button success" onclick="app.unlockNextSection()">
                            Continuar a la Siguiente Lección
                        </button>` : 
                        ''
                    }
                </div>
            </div>
        `;
        
        if (passed && !this.unlockedSections.includes(this.currentSection + 1)) {
            this.unlockedSections.push(this.currentSection + 1);
            this.saveProgress(); // Save when unlocking new section
        }
    }

    unlockNextSection() {
        this.currentSection++;
        this.saveProgress(); // Save when advancing to next section
        this.showSection(this.currentSection);
    }

    // Method to reset progress (useful for testing or starting over)
    resetProgress() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo el progreso? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('czechLearningProgress');
            this.currentSection = 0;
            this.unlockedSections = [0];
            this.renderNavigation();
            this.showSection(0);
            alert('Progreso reiniciado correctamente.');
        }
    }

    // Method to get progress summary
    getProgressSummary() {
        const totalSections = this.phrases.length;
        const completedSections = this.unlockedSections.length - 1; // Subtract 1 because first section starts unlocked
        const progressPercentage = Math.round((completedSections / totalSections) * 100);
        
        return {
            totalSections,
            completedSections,
            progressPercentage,
            currentSection: this.currentSection + 1 // +1 for display (1-based indexing)
        };
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CzechLearningApp();
});
