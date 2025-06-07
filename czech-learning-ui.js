// UI management for Czech Learning App
class CzechLearningUI {
    constructor(core) {
        console.log('CzechLearningUI constructor starting...');
        this.core = core;
        
        // Scroll-based header hiding
        this.lastScrollTop = 0;
        this.scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
        this.headerHeight = 0;
        
        // Set up event callbacks
        console.log('Setting up core callbacks...');
        this.setupCoreCallbacks();
        
        console.log('Initializing UI...');
        this.init();
        console.log('CzechLearningUI constructor completed');
    }

    setupCoreCallbacks() {
        this.core.onProgressUpdate = (progress) => this.updateProgressIndicator(progress);
        this.core.onNotification = (message) => this.showNotification(message);
        this.core.onSectionChange = (sectionIndex, sectionData) => this.renderSection(sectionIndex, sectionData);
        this.core.onExamStart = (totalQuestions) => this.renderExamStart(totalQuestions);
        this.core.onQuestionChange = (questionData) => this.renderQuestion(questionData);
        this.core.onExamComplete = (results) => this.renderExamResults(results);
    }

    async init() {
        console.log('CzechLearningUI init starting...');
        try {
            console.log('Initializing core...');
            await this.core.init();
            console.log('Core initialized successfully');
            
            console.log('Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('Setting up scroll header hiding...');
            this.setupScrollHeaderHiding();
            
            console.log('Rendering navigation...');
            this.renderNavigation();
            
            console.log('CzechLearningUI init completed successfully');
        } catch (error) {
            console.error('Error in CzechLearningUI init:', error);
            throw error;
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle) {
            console.error('nav-toggle element not found!');
            return;
        }
        
        if (!navMenu) {
            console.error('nav-menu element not found!');
            return;
        }
        
        console.log('Found nav elements, adding event listeners...');
        
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close navigation when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
        
        console.log('Event listeners set up successfully');
    }

    setupScrollHeaderHiding() {
        console.log('Setting up scroll header hiding...');
        const header = document.querySelector('header');
        const body = document.body;
        
        if (!header) {
            console.error('header element not found!');
            return;
        }
        
        console.log('Found header element, setting up scroll behavior...');
        
        // Get header height for calculations
        this.headerHeight = header.offsetHeight;
        
        // Initialize header as visible
        header.classList.add('header-visible');
        body.classList.add('header-expanded');
        
        // Add click listener to minimize button
        const minimizeButton = document.getElementById('minimize-header');
        if (!minimizeButton) {
            console.error('minimize-header button not found!');
            return;
        }
        
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
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                this.expandHeader();
            });
        }
        
        console.log('Scroll header hiding set up successfully');
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

    renderNavigation() {
        console.log('Rendering navigation...');
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) {
            console.error('nav-menu element not found!');
            return;
        }
        
        navMenu.innerHTML = '';

        const sections = this.core.getAllSections();
        console.log('Got sections:', sections.length);
        
        sections.forEach((section) => {
            const navItem = document.createElement('button');
            navItem.className = 'nav-item';
            navItem.textContent = section.title;
            
            if (section.isUnlocked) {
                navItem.classList.add('unlocked');
                navItem.addEventListener('click', () => {
                    this.core.showSection(section.index);
                    document.getElementById('nav-menu').classList.remove('active');
                });
            } else {
                navItem.classList.add('locked');
            }
            
            if (section.isCurrent) {
                navItem.classList.add('current');
            }
            
            navMenu.appendChild(navItem);
        });

        // Add footer with reset button
        const navFooter = document.createElement('div');
        navFooter.className = 'nav-footer';
        navFooter.innerHTML = `
            <button id="reset-progress" class="reset-button">
                🔄 Reiniciar Progreso
            </button>
        `;
        
        // Add event listener for reset button
        navFooter.querySelector('#reset-progress').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres reiniciar todo el progreso? Esta acción no se puede deshacer.')) {
                this.core.resetProgress();
                this.renderNavigation();
            }
        });
        
        navMenu.appendChild(navFooter);
        console.log('Navigation rendered successfully');
    }

    updateProgressIndicator(progress) {
        const progressIndicator = document.getElementById('progress-indicator');
        if (!progressIndicator) return;
        
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

    renderSection(sectionIndex, sectionData) {
        this.renderNavigation(); // Update navigation to reflect current section
        
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="section-content">
                <h2 class="section-title">${sectionData.section}</h2>
                <div class="phrases-container">
                    ${sectionData.items.map(phrase => this.renderPhraseCard(phrase)).join('')}
                </div>
                <button class="exam-button" id="start-exam-btn">
                    📝 Tomar Examen
                </button>
            </div>
        `;
        
        // Add event listener for exam button
        document.getElementById('start-exam-btn').addEventListener('click', () => {
            this.core.startExam();
        });
        
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

    renderExamStart(totalQuestions) {
        // This method can be used to show a loading state or transition
        // For now, the first question will be shown immediately
    }

    renderQuestion(questionData) {
        const mainContent = document.getElementById('main-content');
        const question = questionData.question;
        
        mainContent.innerHTML = `
            <div class="question-container">
                <div class="question-number">
                    Pregunta ${questionData.questionNumber} de ${questionData.totalQuestions}
                </div>
                ${question.type === 'czech-to-spanish' ? 
                    `<div class="question-audio">
                        <button class="audio-button" data-text="${question.question}">
                            🔊 Volver a escuchar
                        </button>
                    </div>
                    <div class="question-text">¿Qué significa la frase que escuchaste?</div>` : 
                    `<div class="question-text">${question.question}</div>`
                }
                <div class="options-container">
                    ${question.options.map((option, index) => 
                        `<div class="option-button" data-option="${option}">
                            <span class="option-text">${option}</span>
                            ${question.type === 'spanish-to-czech' ? 
                                `<span class="audio-button-inline" data-text="${option}">🔊</span>` : 
                                ''
                            }
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Set up event listeners for options
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const selectedOption = button.getAttribute('data-option');
                this.handleAnswerSelection(selectedOption, question);
            });
        });
        
        // Set up audio button event listeners
        const audioButtons = document.querySelectorAll('.audio-button, .audio-button-inline');
        audioButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = button.getAttribute('data-text');
                this.playAudio(text);
            });
        });
        
        // Auto-play audio for Czech-to-Spanish questions
        if (question.type === 'czech-to-spanish') {
            this.showAutoPlayMessage();
            setTimeout(() => {
                this.playAudio(question.question);
            }, 300);
        }
    }

    showAutoPlayMessage() {
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
        
        // Remove auto-play message after audio starts
        setTimeout(() => {
            autoPlayMessage.style.opacity = '0';
            setTimeout(() => {
                if (autoPlayMessage.parentNode) {
                    autoPlayMessage.parentNode.removeChild(autoPlayMessage);
                }
            }, 300);
        }, 1000);
    }

    handleAnswerSelection(selectedOption, question) {
        // Check if options are already disabled (answer already given)
        const optionButtons = document.querySelectorAll('.option-button');
        const alreadyAnswered = Array.from(optionButtons).some(button => button.classList.contains('disabled'));
        
        if (alreadyAnswered) {
            console.log('Question already answered, ignoring click');
            return;
        }

        const result = this.core.selectAnswer(selectedOption);
        
        // If the core rejected the answer (already answered), don't proceed
        if (!result) {
            console.log('Core rejected answer selection');
            return;
        }
        
        // Auto-play audio for Czech options (spanish-to-czech questions)
        if (question.type === 'spanish-to-czech') {
            this.playAudio(selectedOption);
        }
        
        // Disable all option buttons and show correct/incorrect
        optionButtons.forEach(button => {
            button.classList.add('disabled');
            const optionText = button.getAttribute('data-option');
            
            if (optionText === result.correctAnswer) {
                button.classList.add('correct');
            } else if (optionText === selectedOption && !result.isCorrect) {
                button.classList.add('incorrect');
            }
        });
        
        // Show next button
        const questionContainer = document.querySelector('.question-container');
        const nextButtonText = !result.isLastQuestion ? 'Siguiente Pregunta' : 'Ver Resultados';
        const nextButton = document.createElement('button');
        nextButton.className = 'next-question-button';
        nextButton.textContent = nextButtonText;
        nextButton.addEventListener('click', () => {
            this.core.nextQuestion();
        });
        questionContainer.appendChild(nextButton);
        
        // If answer is correct, automatically advance after 1 second
        if (result.isCorrect) {
            this.showAutoAdvanceMessage();
            
            setTimeout(() => {
                // Check if we're still on the same question (user hasn't clicked button yet)
                const examProgress = this.core.getExamProgress();
                if (this.core.getCurrentQuestion()) {
                    this.core.nextQuestion();
                }
            }, 1000);
        }
    }

    showAutoAdvanceMessage() {
        const questionContainer = document.querySelector('.question-container');
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
    }

    renderExamResults(results) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="exam-results">
                <div class="score ${results.passed ? 'passing' : 'failing'}">
                    ${results.correctAnswers}/${results.totalQuestions} (${results.percentage}%)
                </div>
                <div class="result-message">
                    ${results.passed ? 
                        '¡Excelente! Has aprobado esta lección.' : 
                        'Necesitas practicar más. Intenta de nuevo.'
                    }
                </div>
                <div class="result-buttons">
                    <button class="result-button" id="back-to-practice">
                        Volver a Practicar
                    </button>
                    ${results.canAdvance ? 
                        `<button class="result-button success" id="continue-next">
                            Continuar a la Siguiente Lección
                        </button>` : 
                        ''
                    }
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('back-to-practice').addEventListener('click', () => {
            const currentSection = this.core.getCurrentSection();
            this.core.showSection(currentSection.index);
        });
        
        if (results.canAdvance) {
            document.getElementById('continue-next').addEventListener('click', () => {
                this.core.unlockNextSection();
            });
        }
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
            const audioButtons = document.querySelectorAll('.audio-button, .audio-button-inline');
            const activeButton = Array.from(audioButtons).find(button => 
                button.getAttribute('data-text') === text
            );
            
            if (activeButton) {
                const originalContent = activeButton.innerHTML;
                const originalBackground = activeButton.style.backgroundColor;
                
                activeButton.style.backgroundColor = '#38a169';
                if (activeButton.parentElement.classList.contains('question-audio')) {
                    activeButton.innerHTML = '🔊 Reproduciendo...';
                } else {
                    activeButton.innerHTML = '🔊 Reproduciendo...';
                }
                
                utterance.onend = () => {
                    activeButton.style.backgroundColor = originalBackground || '#48bb78';
                    activeButton.innerHTML = originalContent;
                };
                
                utterance.onerror = () => {
                    activeButton.style.backgroundColor = '#f56565';
                    activeButton.innerHTML = '🔊 Error';
                    setTimeout(() => {
                        activeButton.style.backgroundColor = originalBackground || '#48bb78';
                        activeButton.innerHTML = originalContent;
                    }, 2000);
                };
            }
            
            speechSynthesis.speak(utterance);
        } else {
            alert('Tu navegador no soporta síntesis de voz');
        }
    }
}
