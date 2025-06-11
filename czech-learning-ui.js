// UI management for Czech Learning App
class CzechLearningUI {
    constructor(core) {
        console.log('CzechLearningUI constructor starting...');
        this.core = core;
        this.recordingTimeout = null;
        
        // Scroll-based header hiding
        this.lastScrollTop = 0;
        this.scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
        this.headerHeight = 0;
        this.isMinimized = false; // Track if header is minimized (manual or automatic)
        
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
        this.core.onPronunciationResult = (result) => this.handlePronunciationResult(result);
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
            
            console.log('Updating student greeting...');
            this.updateStudentGreeting();
            
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
            this.isMinimized = true; // Mark as minimized
            this.minimizeHeader();
        });
        
        // Add click listener to minimized header
        header.addEventListener('click', (e) => {
            if (header.classList.contains('header-minimized')) {
                // Reset minimization flag and show full header
                this.isMinimized = false;
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
                    if (scrollDelta > 0 && currentScrollTop > this.headerHeight && !header.classList.contains('header-minimized')) {
                        // Scrolling down and past header height - minimize header (only if not already minimized)
                        this.isMinimized = true; // Mark as minimized
                        this.minimizeHeader();
                    } else if ((scrollDelta < 0 || currentScrollTop <= 50) && !this.isMinimized) {
                        // Scrolling up or near top - show full header (only if not minimized)
                        this.expandHeader();
                    }
                    
                    this.lastScrollTop = currentScrollTop;
                }
                
                scrollTimeout = null;
            }, 10); // Small delay for throttling
        };
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Also show full header when navigation is opened (only if not minimized)
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                if (!this.isMinimized) {
                    this.expandHeader();
                }
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
        
        // Set personalized minimized content
        const studentName = window.app ? window.app.getStudentName() : 'Estudiante';
        header.setAttribute('data-minimized-text', `🇨🇿 ${studentName} está aprendiendo Checo - Toca para ver tu progreso`);
    }

    expandHeader() {
        const header = document.querySelector('header');
        const body = document.body;
        
        header.classList.remove('header-minimized');
        header.classList.add('header-visible');
        body.classList.add('header-expanded');
    }

    updateStudentGreeting() {
        const greetingElement = document.getElementById('student-greeting');
        if (greetingElement && window.app) {
            const studentName = window.app.getStudentName();
            const greetings = [
                `¡Hola ${studentName}! 👋`,
                `¡Bienvenido ${studentName}! 🌟`,
                `¡Hola ${studentName}! Vamos a aprender checo 📚`,
                `¡Hola ${studentName}! ¿Listo para practicar? 🎯`
            ];
            
            // Use a greeting based on the day of the week to add variety
            const dayIndex = new Date().getDay();
            const greetingIndex = dayIndex % greetings.length;
            greetingElement.textContent = greetings[greetingIndex];
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
        
        const studentName = window.app ? window.app.getStudentName() : 'Estudiante';
        
        progressIndicator.innerHTML = `
            <div>
                Progreso de ${studentName}: Lección ${progress.currentSection} de ${progress.totalSections} • 
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
        const canTakeExam = this.core.canTakeExam();
        const studentName = window.app ? window.app.getStudentName() : 'Estudiante';
        
        mainContent.innerHTML = `
            <div class="section-content">
                <h2 class="section-title">${sectionData.section}</h2>
                <div class="phrases-container">
                    ${sectionData.items.map((phrase, index) => this.renderPhraseCard(phrase, index)).join('')}
                </div>
                <div class="exam-requirements">
                    ${!canTakeExam ? 
                        `<div class="requirement-message">⚠️ ${studentName}, debes lograr una pronunciación de al menos 90% en todas las frases para poder tomar el examen.</div>` : 
                        `<div class="requirement-message success">✅ ¡Excelente, ${studentName}! Has completado todos los requisitos de pronunciación.</div>`
                    }
                </div>
                <button class="exam-button" id="start-exam-btn" ${!canTakeExam ? 'disabled' : ''}>
                    📝 Tomar Examen
                </button>
            </div>
        `;
        
        // Add event listener for exam button
        const examButton = document.getElementById('start-exam-btn');
        console.log('=== EXAM BUTTON DEBUG ===');
        console.log('Exam button found:', !!examButton);
        console.log('Can take exam:', canTakeExam);
        console.log('Button disabled:', examButton ? examButton.disabled : 'N/A');
        console.log('========================');
        
        if (examButton) {
            examButton.addEventListener('click', () => {
                console.log('=== EXAM BUTTON CLICKED ===');
                console.log('Can take exam at click time:', this.core.canTakeExam());
                console.log('Starting exam...');
                console.log('==========================');
                
                if (this.core.canTakeExam()) {
                    this.core.startExam();
                } else {
                    console.log('Exam not allowed - requirements not met');
                    const studentName = window.app ? window.app.getStudentName() : 'Estudiante';
                    this.showNotification(`${studentName}, debes completar todos los requisitos de pronunciación primero.`);
                }
            });
        } else {
            console.error('Exam button not found in DOM!');
        }
        
        this.setupAudioButtons();
        this.setupPronunciationButtons();
    }

    renderPhraseCard(phrase, phraseIndex) {
        const [spanish, czech, pronunciation] = phrase;
        const pronunciationScore = this.core.getPronunciationScore(this.core.currentSection, phraseIndex);
        const scoreClass = pronunciationScore >= 90 ? 'excellent' : pronunciationScore >= 70 ? 'good' : pronunciationScore > 0 ? 'needs-improvement' : 'not-attempted';
        
        return `
            <div class="phrase-card" data-phrase-index="${phraseIndex}">
                <div class="phrase-spanish">${spanish}</div>
                <div class="phrase-czech">${czech}</div>
                <div class="phrase-pronunciation">${pronunciation}</div>
                <div class="phrase-controls">
                    <button class="audio-button" data-text="${czech}">
                        🔊 Escuchar
                    </button>
                    <button class="pronunciation-button" data-phrase-index="${phraseIndex}" ${this.core.isRecording ? 'disabled' : ''}>
                        🎤 Pronunciar
                    </button>
                    <div class="pronunciation-score ${scoreClass}">
                        ${pronunciationScore > 0 ? `${pronunciationScore}%` : 'Sin intentar'}
                    </div>
                </div>
            </div>
        `;
    }

    setupAudioButtons() {
        const audioButtons = document.querySelectorAll('.audio-button');
        audioButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Prevent audio if pronunciation is active
                if (this.core.isRecording) {
                    const studentName = window.app ? window.app.getStudentName() : 'Estudiante';
                    this.showNotification(`${studentName}, espera a terminar la pronunciación antes de escuchar el audio.`);
                    return;
                }
                
                const text = button.getAttribute('data-text');
                this.playAudio(text);
            });
        });
    }

    setupPronunciationButtons() {
        const pronunciationButtons = document.querySelectorAll('.pronunciation-button');
        pronunciationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const phraseIndex = parseInt(button.getAttribute('data-phrase-index'));
                this.startPronunciation(phraseIndex, button);
            });
        });
    }

    // Method to disable/enable audio buttons during pronunciation recording
    setAudioButtonsDisabledState(disabled) {
        const audioButtons = document.querySelectorAll('.audio-button, .audio-button-inline');
        audioButtons.forEach(button => {
            if (disabled) {
                button.classList.add('disabled-during-recording');
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
                button.style.pointerEvents = 'none';
            } else {
                button.classList.remove('disabled-during-recording');
                button.style.opacity = '';
                button.style.cursor = '';
                button.style.pointerEvents = '';
            }
        });
    }

    startPronunciation(phraseIndex, button) {
        if (this.core.isRecording) {
            console.log('Ya hay una grabación en progreso');
            return;
        }

        console.log('Iniciando pronunciación para frase:', phraseIndex);
        
        // Update button state
        button.disabled = true;
        button.innerHTML = '🎤 Grabando...';
        button.classList.add('recording');
        
        // Disable all other pronunciation buttons
        const allButtons = document.querySelectorAll('.pronunciation-button');
        allButtons.forEach(btn => btn.disabled = true);
        
        // Disable and visually indicate audio buttons are blocked
        this.setAudioButtonsDisabledState(true);
        
        this.core.startPronunciation(this.core.currentSection, phraseIndex);
        
        // Auto-stop recording after 5 seconds
        this.recordingTimeout = setTimeout(() => {
            if (this.core.isRecording && this.core.recognition) {
                console.log('Auto-stopping recording after 5 seconds');
                this.core.recognition.stop();
                
                // If no result was detected, show timeout message
                setTimeout(() => {
                    if (this.core.isRecording) {
                        this.core.isRecording = false;
                        this.handlePronunciationResult({
                            error: true,
                            message: 'Tiempo de grabación agotado. Intenta hablar más claro.'
                        });
                    }
                }, 500);
            }
        }, 5000);
    }

    handlePronunciationResult(result) {
        // Clear any active recording timeout
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
            this.recordingTimeout = null;
        }
        
        // Re-enable all pronunciation buttons
        const allButtons = document.querySelectorAll('.pronunciation-button');
        allButtons.forEach(btn => {
            btn.disabled = false;
            btn.innerHTML = '🎤 Pronunciar';
            btn.classList.remove('recording');
        });

        // Re-enable audio buttons
        this.setAudioButtonsDisabledState(false);
        
        if (result.error) {
            this.showNotification(result.message);
            return;
        }
        
        // Update the score display for this phrase
        const phraseCard = document.querySelector(`[data-phrase-index="${result.phraseIndex}"]`);
        if (phraseCard) {
            const scoreElement = phraseCard.querySelector('.pronunciation-score');
            const scoreClass = result.accuracy >= 90 ? 'excellent' : result.accuracy >= 70 ? 'good' : 'needs-improvement';
            
            scoreElement.className = `pronunciation-score ${scoreClass}`;
            scoreElement.textContent = `${result.accuracy}%`;
        }
        
        // Show feedback message
        const confidenceInfo = result.confidence ? ` (Confianza: ${result.confidence.toFixed(1)}%)` : '';
        const studentName = window.app ? window.app.getStudentName() : 'Estudiante';
        
        const feedbackMessage = result.accuracy >= 90 ? 
            `¡Excelente pronunciación, ${studentName}! 🌟` : 
            result.accuracy >= 70 ? 
            `Buena pronunciación, ${studentName}. ¡Sigue practicando! 💪` : 
            `Sigue intentando, ${studentName}. ¡Tú puedes! 🎯`;
            
        this.showNotification(`${feedbackMessage} (${result.accuracy}%)${confidenceInfo}`);
        
        console.log('=== PRONUNCIATION RESULT UI ===');
        console.log('📊 Accuracy:', result.accuracy + '%');
        console.log('🎤 Transcript:', result.transcript);
        console.log('🎯 Target:', result.target);
        if (result.confidence) {
            console.log('📈 Speech confidence:', result.confidence.toFixed(1) + '%');
        }
        console.log('===============================');
        // Check if exam button should be enabled
        setTimeout(() => {
            const canTakeExam = this.core.canTakeExam();
            const examButton = document.getElementById('start-exam-btn');
            const requirementMessage = document.querySelector('.requirement-message');
            const studentName = window.app ? window.app.getStudentName() : 'Estudiante';
            
            if (examButton) {
                examButton.disabled = !canTakeExam;
            }
            
            if (requirementMessage) {
                if (canTakeExam) {
                    requirementMessage.className = 'requirement-message success';
                    requirementMessage.innerHTML = `✅ ¡Excelente, ${studentName}! Has completado todos los requisitos de pronunciación.`;
                } else {
                    requirementMessage.className = 'requirement-message';
                    requirementMessage.innerHTML = `⚠️ ${studentName}, debes lograr una pronunciación de al menos 90% en todas las frases para poder tomar el examen.`;
                }
            }
        }, 100);
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
            setTimeout(() => {
                this.playAudio(question.question);
            }, 300);
        }
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
        
        // Check if we're in debug mode (questions parameter detected)
        const urlParams = new URLSearchParams(window.location.search);
        const isDebugMode = urlParams.get('questions') !== null;
        
        // Use "MODO DEBUG" if in debug mode, otherwise use real student name
        const studentName = isDebugMode ? 'MODO DEBUG' : (window.app ? window.app.getStudentName() : 'Estudiante');
        
        if (results.passed) {
            // Certificate design for passed exam
            mainContent.innerHTML = `
                <div class="certificate-container">
                    <div class="certificate">
                        <div class="certificate-border">
                            <div class="certificate-content">
                                <div class="certificate-header">
                                    <div class="certificate-seal">🏆</div>
                                    <h1 class="certificate-title">Certificado de Aprobación</h1>
                                    <div class="certificate-subtitle">Aprende Checo con Papá</div>
                                </div>
                                
                                <div class="certificate-body">
                                    <p class="certificate-text">Se certifica que</p>
                                    <h2 class="certificate-student-name">${studentName}</h2>
                                    <p class="certificate-text">ha completado exitosamente la lección</p>
                                    <h3 class="certificate-lesson">"${results.lessonName}"</h3>
                                    <p class="certificate-achievement">
                                        con una calificación de <span class="certificate-score">${results.percentage}%</span>
                                        <br>
                                        (${results.correctAnswers}/${results.totalQuestions} respuestas correctas)
                                    </p>
                                </div>
                                
                                <div class="certificate-footer">
                                    <div class="certificate-date">
                                        <div class="certificate-date-label">Fecha de Aprobación</div>
                                        <div class="certificate-date-value">${results.examDate}</div>
                                    </div>
                                </div>
                                
                                <div class="certificate-decorations">
                                    <div class="certificate-star star-1">⭐</div>
                                    <div class="certificate-star star-2">⭐</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="certificate-actions">
                        <button class="certificate-button" id="back-to-practice">
                            📚 Volver a Practicar
                        </button>
                        ${results.canAdvance ? 
                            `<button class="certificate-button primary" id="continue-next">
                                🚀 Continuar a la Siguiente Lección
                            </button>` : 
                            ''
                        }
                    </div>
                </div>
            `;
        } else {
            // Regular failure screen
            const feedback = `Para aprobar necesitas 90% de aciertos o más. Obtuviste ${results.percentage}% con ${results.incorrectAnswers} errores. ¡Sigue practicando!`;
            
            mainContent.innerHTML = `
                <div class="exam-results">
                    <h2 class="lesson-title">${results.lessonName}</h2>
                    <div class="exam-date">${results.examDate}</div>
                    
                    <div class="result-summary">
                        ${studentName}, lograste ${results.correctAnswers}/${results.totalQuestions} (${results.percentage}%).
                    </div>
                    
                    <div class="feedback failure">
                        ${feedback}
                    </div>
                    
                    <div class="result-buttons">
                        <button class="result-button" id="back-to-practice">
                            Volver a Practicar
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Add event listeners
        document.getElementById('back-to-practice').addEventListener('click', () => {
            const currentSection = this.core.getCurrentSection();
            this.core.showSection(currentSection.index);
        });
        
        if (results.canAdvance) {
            const continueButton = document.getElementById('continue-next');
            if (continueButton) {
                continueButton.addEventListener('click', () => {
                    this.core.unlockNextSection();
                });
            }
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
