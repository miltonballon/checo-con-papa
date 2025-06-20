// Core application logic for Czech Learning App
console.log('📋 czech-learning-core.js cargado');

class CzechLearningCore {
    constructor() {
        console.log('CzechLearningCore constructor starting...');
        this.phrases = [];
        this.currentSection = 0;
        this.unlockedSections = [0]; // First lesson is always unlocked
        this.currentQuestion = 0;
        this.examQuestions = [];
        this.examAnswers = [];
        this.examMode = false;
        this.examType = null; // 'spanish-to-czech' or 'czech-to-spanish'
        
        // Configuration - will be loaded from config.json
        this.config = null;
        
        // Pronunciation tracking
        this.pronunciationScores = {}; // sectionIndex -> { phraseIndex: score }
        this.recognition = null;
        this.isRecording = false;
        
        // Event callbacks - will be set by UI layer
        this.onProgressUpdate = null;
        this.onNotification = null;
        this.onSectionChange = null;
        this.onExamStart = null;
        this.onQuestionChange = null;
        this.onExamComplete = null;
        this.onPronunciationResult = null;
        
        // Load progress from localStorage
        console.log('Loading progress...');
        this.loadProgress();
        console.log('CzechLearningCore constructor completed');
    }

    async init() {
        console.log('CzechLearningCore init starting...');
        try {
            console.log('Loading configuration...');
            await this.loadConfig();
            console.log('Configuration loaded successfully');
            
            console.log('Loading phrases...');
            await this.loadPhrases();
            console.log('Phrases loaded:', this.phrases.length, 'sections');
            
            // Validate current lesson after phrases are loaded
            if (this.currentSection >= this.phrases.length) {
                this.currentSection = this.phrases.length - 1;
            }
            
            // Validate unlocked lessons
            this.unlockedSections = this.unlockedSections.filter(section => section < this.phrases.length);
            if (this.unlockedSections.length === 0) {
                this.unlockedSections = [0];
            }
            
            // Notify UI of initial state
            console.log('Notifying UI of progress update...');
            if (this.onProgressUpdate) {
                this.onProgressUpdate(this.getProgressSummary());
            }
            
            console.log('Notifying UI of section change...');
            if (this.onSectionChange) {
                this.onSectionChange(this.currentSection, this.phrases[this.currentSection]);
            }
            
            console.log('CzechLearningCore init completed successfully');
        } catch (error) {
            console.error('Error in CzechLearningCore init:', error);
            throw error;
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status}`);
            }
            this.config = await response.json();
            console.log('Configuration loaded:', this.config);
        } catch (error) {
            console.warn('Failed to load config.json, using default values:', error);
            // Fallback to default configuration
            this.config = {
                pronunciation: {
                    thresholds: {
                        excellent: 89,
                        good: 70,
                        needsImprovement: 0
                    },
                    examRequirement: 89,
                    timeout: 5000,
                    language: "cs-CZ"
                },
                exam: {
                    passingPercentage: 90,
                    questionsPerSection: 10
                },
                ui: {
                    autoAdvanceDelay: 1000,
                    notificationDuration: 4000
                }
            };
        }
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
                if (progress.lastUpdated && this.onNotification) {
                    const lastDate = new Date(progress.lastUpdated);
                    const now = new Date();
                    const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
                    
                    setTimeout(() => {
                        const message = daysDiff === 0 ? 
                            '¡Bienvenida de vuelta! Continuando donde lo dejaste...' :
                            `¡Bienvenida de vuelta! Han pasado ${daysDiff} día${daysDiff > 1 ? 's' : ''} desde tu última sesión.`;
                        
                        this.onNotification(message);
                    }, 1000);
                }
            } else {
                console.log('No se encontró progreso guardado. Comenzando desde el inicio.');
            }
            
            // Load pronunciation progress separately
            this.loadPronunciationProgress();
        } catch (error) {
            console.error('Error loading progress from localStorage:', error);
            // Reset to defaults if there's an error
            this.currentSection = 0;
            this.unlockedSections = [0];
            this.pronunciationScores = {};
        }
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
            
            // Notify UI of progress update
            if (this.onProgressUpdate) {
                this.onProgressUpdate(this.getProgressSummary());
            }
        } catch (error) {
            console.error('Error saving progress to localStorage:', error);
        }
    }

    async loadPhrases() {
        try {
            const timestamp = Date.now();
            const response = await fetch(`./phrases.json?v=${timestamp}`);
            this.phrases = await response.json();
        } catch (error) {
            console.error('Error loading phrases:', error);
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('./config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading configuration:', error);
        }
    }

    // Section management
    showSection(sectionIndex) {
        if (!this.unlockedSections.includes(sectionIndex)) return false;
        
        this.currentSection = sectionIndex;
        this.examMode = false;
        this.saveProgress();
        
        const section = this.phrases[sectionIndex];
        
        if (this.onSectionChange) {
            this.onSectionChange(sectionIndex, section);
        }
        
        return true;
    }

    isSectionUnlocked(sectionIndex) {
        return this.unlockedSections.includes(sectionIndex);
    }

    getCurrentSection() {
        return {
            index: this.currentSection,
            data: this.phrases[this.currentSection] || null
        };
    }

    getAllSections() {
        return this.phrases.map((section, index) => ({
            index,
            title: section.section,
            isUnlocked: this.unlockedSections.includes(index),
            isCurrent: index === this.currentSection
        }));
    }

    // Exam management
    startExam() {
        console.log('=== STARTING EXAM ===');
        console.log('Current section:', this.currentSection);
        console.log('Can take exam:', this.canTakeExam());
        console.log('Exam mode before:', this.examMode);
        
        this.examMode = true;
        console.log('Exam mode set to:', this.examMode);
        
        console.log('Generating exam questions...');
        this.generateExamQuestions();
        console.log('Generated questions:', this.examQuestions.length);
        
        this.currentQuestion = 0;
        this.examAnswers = [];
        
        console.log('Calling onExamStart callback...');
        if (this.onExamStart) {
            this.onExamStart(this.examQuestions.length);
        } else {
            console.error('onExamStart callback not set!');
        }
        
        console.log('Showing first question...');
        this.showNextQuestion();
        console.log('===================');
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
        
        // Check for URL parameter to limit questions (for testing)
        const urlParams = new URLSearchParams(window.location.search);
        const questionsParam = urlParams.get('questions');
        
        if (questionsParam) {
            const questionsCount = parseInt(questionsParam, 10);
            console.log('=== QUESTIONS PARAMETER DETECTED ===');
            console.log('Original questions count:', this.examQuestions.length);
            console.log('Requested questions count:', questionsParam);
            console.log('Parsed questions count:', questionsCount);
            
            // Only limit if it's a valid positive number
            if (!isNaN(questionsCount) && questionsCount > 0) {
                const originalCount = this.examQuestions.length;
                this.examQuestions = this.examQuestions.slice(0, questionsCount);
                console.log('Limited questions to:', this.examQuestions.length);
                console.log('Reduced from', originalCount, 'to', this.examQuestions.length, 'questions');
            } else {
                console.log('Invalid questions parameter, using all questions');
            }
            console.log('===================================');
        }
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

    showNextQuestion() {
        console.log('=== SHOW NEXT QUESTION ===');
        console.log('Current question index:', this.currentQuestion);
        console.log('Total questions:', this.examQuestions.length);
        
        if (this.currentQuestion < this.examQuestions.length) {
            const question = this.examQuestions[this.currentQuestion];
            console.log('Question to show:', question);
            
            if (this.onQuestionChange) {
                console.log('Calling onQuestionChange callback...');
                this.onQuestionChange({
                    questionNumber: this.currentQuestion + 1,
                    totalQuestions: this.examQuestions.length,
                    question: question
                });
            } else {
                console.error('onQuestionChange callback not set!');
            }
        } else {
            console.log('No more questions to show');
        }
        console.log('=========================');
    }

    selectAnswer(selectedOption) {
        // Check if this question has already been answered
        const existingAnswer = this.examAnswers.find(answer => answer.question === this.currentQuestion);
        if (existingAnswer) {
            console.log('Question already answered, ignoring new selection');
            return null; // Return null to indicate the answer was rejected
        }

        const question = this.examQuestions[this.currentQuestion];
        const isCorrect = selectedOption === question.correct;
        
        this.examAnswers.push({
            question: this.currentQuestion,
            selected: selectedOption,
            correct: question.correct,
            isCorrect: isCorrect
        });
        
        return {
            isCorrect,
            correctAnswer: question.correct,
            isLastQuestion: this.currentQuestion >= this.examQuestions.length - 1
        };
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.examQuestions.length) {
            this.showNextQuestion();
            return false; // Not finished
        } else {
            this.finishExam();
            return true; // Exam finished
        }
    }

    finishExam() {
        const correctAnswers = this.examAnswers.filter(answer => answer.isCorrect).length;
        const totalQuestions = this.examQuestions.length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        console.log('=== EXAM FINISH DEBUG ===');
        console.log('Total questions generated:', totalQuestions);
        console.log('Total answers recorded:', this.examAnswers.length);
        console.log('Correct answers:', correctAnswers);
        console.log('Incorrect answers calculated:', incorrectAnswers);
        console.log('Percentage:', percentage + '%');
        console.log('Exam answers:', this.examAnswers);
        console.log('========================');
        
        // Passing criteria: Only 90% or more correct answers
        const passedByPercentage = percentage >= 90;
        const passed = passedByPercentage;
        
        // Unlock next section if passed
        if (passed && !this.unlockedSections.includes(this.currentSection + 1) && this.currentSection < this.phrases.length - 1) {
            this.unlockedSections.push(this.currentSection + 1);
            this.saveProgress();
        }
        
        // Get lesson name and exam date
        const lessonName = this.phrases[this.currentSection].section;
        const examDate = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const results = {
            correctAnswers,
            incorrectAnswers,
            totalQuestions,
            percentage,
            passed,
            passedByPercentage,
            canAdvance: passed && this.currentSection < this.phrases.length - 1,
            lessonName,
            examDate
        };
        
        if (this.onExamComplete) {
            this.onExamComplete(results);
        }
        
        return results;
    }

    // Check if current question has been answered
    isCurrentQuestionAnswered() {
        return this.examAnswers.some(answer => answer.question === this.currentQuestion);
    }

    // Progress management
    unlockNextSection() {
        if (this.currentSection < this.phrases.length - 1) {
            this.currentSection++;
            this.saveProgress();
            this.showSection(this.currentSection);
            return true;
        }
        return false;
    }

    resetProgress() {
        localStorage.removeItem('czechLearningProgress');
        localStorage.removeItem('czechLearningPronunciation');
        this.currentSection = 0;
        this.unlockedSections = [0];
        this.examMode = false;
        this.examQuestions = [];
        this.examAnswers = [];
        this.currentQuestion = 0;
        this.pronunciationScores = {};
        
        if (this.onProgressUpdate) {
            this.onProgressUpdate(this.getProgressSummary());
        }
        
        if (this.onSectionChange) {
            this.onSectionChange(this.currentSection, this.phrases[this.currentSection]);
        }
    }

    getProgressSummary() {
        const totalSections = this.phrases.length;
        const completedSections = this.unlockedSections.length - 1;
        const progressPercentage = Math.round((completedSections / totalSections) * 100);
        
        return {
            totalSections,
            completedSections,
            progressPercentage,
            currentSection: this.currentSection + 1,
            unlockedSections: [...this.unlockedSections]
        };
    }

    // Current exam state getters
    getCurrentQuestion() {
        if (this.examMode && this.currentQuestion < this.examQuestions.length) {
            return this.examQuestions[this.currentQuestion];
        }
        return null;
    }

    getExamProgress() {
        return {
            currentQuestion: this.currentQuestion + 1,
            totalQuestions: this.examQuestions.length,
            isExamMode: this.examMode
        };
    }

    // Pronunciation methods
    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = this.config?.pronunciation?.language || 'cs-CZ';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            this.recognition.continuous = false;
            
            this.recognition.onresult = (event) => {
                console.log('=== SPEECH RECOGNITION RESULT ===');
                console.log('Raw event results:', event.results);
                
                const result = event.results[0][0];
                const transcript = result.transcript.toLowerCase().trim();
                const confidence = result.confidence || 0;
                
                console.log('🎤 Transcript:', transcript);
                console.log('📊 Confidence:', (confidence * 100).toFixed(1) + '%');
                console.log('🔍 Is final:', event.results[0].isFinal);
                
                // Log all alternatives if available
                if (event.results[0].length > 1) {
                    console.log('📝 Alternatives:');
                    for (let i = 0; i < event.results[0].length; i++) {
                        const alt = event.results[0][i];
                        console.log(`  ${i + 1}. "${alt.transcript}" (${((alt.confidence || 0) * 100).toFixed(1)}%)`);
                    }
                }
                
                console.log('================================');
                this.processPronunciationResult(transcript, confidence);
            };
            
            this.recognition.onerror = (event) => {
                console.error('=== SPEECH RECOGNITION ERROR ===');
                console.error('Error type:', event.error);
                console.error('Error message:', event.message || 'No message available');
                console.error('Error details:', event);
                console.error('================================');
                
                this.isRecording = false;
                if (this.onPronunciationResult) {
                    this.onPronunciationResult({
                        error: true,
                        message: `Error en el reconocimiento de voz: ${event.error}`
                    });
                }
            };
            
            this.recognition.onstart = () => {
                console.log('=== SPEECH RECOGNITION STARTED ===');
                console.log('Language:', this.recognition.lang);
                console.log('Continuous:', this.recognition.continuous);
                console.log('Interim results:', this.recognition.interimResults);
                console.log('Max alternatives:', this.recognition.maxAlternatives);
                console.log('=================================');
            };
            
            this.recognition.onend = () => {
                console.log('=== SPEECH RECOGNITION ENDED ===');
                console.log('Recording state before end:', this.isRecording);
                console.log('================================');
                
                // If we were recording but no result was processed (timeout case)
                if (this.isRecording) {
                    this.isRecording = false;
                    console.log('Recognition ended due to timeout, notifying UI...');
                    
                    // Notify UI that recording has ended without a result
                    if (this.onPronunciationResult) {
                        this.onPronunciationResult({
                            error: true,
                            message: 'Tiempo de grabación agotado. Intenta hablar más claro.',
                            isTimeout: true
                        });
                    }
                } else {
                    this.isRecording = false;
                }
            };
            
            return true;
        }
        return false;
    }

    startPronunciation(sectionIndex, phraseIndex) {
        console.log('=== STARTING PRONUNCIATION ===');
        console.log('Core: startPronunciation called with:', sectionIndex, phraseIndex);
        
        const phrase = this.phrases[sectionIndex].items[phraseIndex];
        const targetText = phrase[1]; // Czech text
        console.log('🎯 Target phrase to pronounce:', targetText);
        console.log('📖 Spanish translation:', phrase[0]);
        console.log('🔤 Pronunciation guide:', phrase[2]);
        
        if (!this.recognition) {
            console.log('Recognition not initialized, initializing...');
            if (!this.initializeSpeechRecognition()) {
                console.log('Failed to initialize speech recognition');
                if (this.onPronunciationResult) {
                    this.onPronunciationResult({
                        error: true,
                        message: 'Tu navegador no soporta reconocimiento de voz'
                    });
                }
                return;
            }
        }
        
        this.currentPronunciationPhrase = { sectionIndex, phraseIndex };
        this.isRecording = true;
        
        console.log('✅ Starting speech recognition...');
        console.log('=============================');
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.isRecording = false;
            if (this.onPronunciationResult) {
                this.onPronunciationResult({
                    error: true,
                    message: 'Error al iniciar el reconocimiento de voz'
                });
            }
        }
    }

    processPronunciationResult(transcript, confidence = 0) {
        console.log('=== PROCESSING PRONUNCIATION ===');
        
        // Ensure recording state is properly reset
        this.isRecording = false;
        
        const { sectionIndex, phraseIndex } = this.currentPronunciationPhrase;
        const phrase = this.phrases[sectionIndex].items[phraseIndex];
        const primaryTarget = phrase[1].toLowerCase().trim(); // Czech text
        const alternativeTarget = phrase[3] ? phrase[3].toLowerCase().trim() : null; // Alternative text (4th element)
        
        console.log('🎯 Primary target text:', primaryTarget);
        if (alternativeTarget) {
            console.log('🎯 Alternative target text:', alternativeTarget);
        }
        console.log('🎤 Recognized text:', transcript);
        console.log('📊 Speech confidence:', (confidence * 100).toFixed(1) + '%');
        
        // Calculate pronunciation accuracy combining text similarity and speech recognition confidence
        const accuracy = this.calculatePronunciationAccuracy(transcript, primaryTarget, confidence, alternativeTarget);
        
        console.log('🔍 Calculated accuracy:', accuracy + '%');
        console.log('===============================');
        
        // Store the score
        if (!this.pronunciationScores[sectionIndex]) {
            this.pronunciationScores[sectionIndex] = {};
        }
        this.pronunciationScores[sectionIndex][phraseIndex] = accuracy;
        
        // Save to localStorage
        this.savePronunciationProgress();
        
        if (this.onPronunciationResult) {
            this.onPronunciationResult({
                accuracy,
                transcript,
                target: primaryTarget,
                alternativeTarget: alternativeTarget,
                confidence: confidence * 100,
                sectionIndex,
                phraseIndex
            });
        }
    }

    calculatePronunciationAccuracy(transcript, target, confidence = 0, alternativeTarget = null) {
        console.log('--- ACCURACY CALCULATION ---');
        console.log('Input transcript (raw):', transcript);
        console.log('Primary target text (raw):', target);
        if (alternativeTarget) {
            console.log('Alternative target text (raw):', alternativeTarget);
        }
        console.log('Speech confidence:', (confidence * 100).toFixed(1) + '%');
        
        // Remove punctuation from transcript
        const cleanTranscript = this.removePunctuation(transcript);
        console.log('Input transcript (clean):', cleanTranscript);
        
        // Calculate accuracy for primary target
        const primaryAccuracy = this.calculateTextSimilarity(cleanTranscript, target);
        console.log('Primary target accuracy:', primaryAccuracy.toFixed(3));
        
        let bestTextSimilarity = primaryAccuracy;
        let bestTarget = target;
        
        // If alternative target exists, calculate its accuracy too
        if (alternativeTarget) {
            const alternativeAccuracy = this.calculateTextSimilarity(cleanTranscript, alternativeTarget);
            console.log('Alternative target accuracy:', alternativeAccuracy.toFixed(3));
            
            // Use the better similarity score
            if (alternativeAccuracy > primaryAccuracy) {
                bestTextSimilarity = alternativeAccuracy;
                bestTarget = alternativeTarget;
                console.log('Using alternative target as best match');
            } else {
                console.log('Using primary target as best match');
            }
        }
        
        console.log('Best text similarity (0-1):', bestTextSimilarity.toFixed(3));
        console.log('Best matching target:', bestTarget);
        
        // Combine text similarity with speech recognition confidence
        // Weight: 70% text similarity, 30% speech confidence
        const textWeight = 0.7;
        const confidenceWeight = 0.3;
        
        const combinedScore = (bestTextSimilarity * textWeight) + (confidence * confidenceWeight);
        console.log('Combined score (0-1):', combinedScore.toFixed(3));
        
        const accuracy = Math.max(0, Math.round(combinedScore * 100));
        console.log('Final accuracy:', accuracy + '%');
        console.log('  - Text similarity contribution:', Math.round(bestTextSimilarity * textWeight * 100) + '%');
        console.log('  - Confidence contribution:', Math.round(confidence * confidenceWeight * 100) + '%');
        console.log('---------------------------');
        
        return accuracy;
    }

    calculateTextSimilarity(cleanTranscript, target) {
        // Remove punctuation from target
        const cleanTarget = this.removePunctuation(target);
        
        // Calculate text similarity using Levenshtein distance
        const maxLength = Math.max(cleanTranscript.length, cleanTarget.length);
        
        if (maxLength === 0) {
            return 1.0; // Both strings empty, perfect match
        }
        
        const distance = this.levenshteinDistance(cleanTranscript, cleanTarget);
        return Math.max(0, ((maxLength - distance) / maxLength));
    }

    removePunctuation(text) {
        // Remove common punctuation marks and normalize whitespace
        return text
            .replace(/[.,!?;:()[\]{}""''„"‚'`~@#$%^&*+=<>\/\\|_-]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
            .trim(); // Remove leading/trailing whitespace
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    getPronunciationScore(sectionIndex, phraseIndex) {
        return this.pronunciationScores[sectionIndex]?.[phraseIndex] || 0;
    }

    getSectionPronunciationAverage(sectionIndex) {
        const scores = this.pronunciationScores[sectionIndex];
        if (!scores) return 0;
        
        const sectionPhrases = this.phrases[sectionIndex].items;
        let total = 0;
        let count = 0;
        
        for (let i = 0; i < sectionPhrases.length; i++) {
            if (scores[i] !== undefined) {
                total += scores[i];
                count++;
            }
        }
        
        return count > 0 ? Math.round(total / count) : 0;
    }

    canTakeExam() {
        // Check for URL parameter to bypass pronunciation requirements (for testing)
        const urlParams = new URLSearchParams(window.location.search);
        const questionsParam = urlParams.get('questions');
        
        if (questionsParam) {
            const questionsCount = parseInt(questionsParam, 10);
            if (!isNaN(questionsCount) && questionsCount > 0) {
                console.log('=== TEST MODE DETECTED ===');
                console.log('Bypassing pronunciation requirements due to questions parameter');
                console.log('============================');
                return true; // Allow exam for testing purposes
            }
        }
        
        const sectionPhrases = this.phrases[this.currentSection].items;
        const scores = this.pronunciationScores[this.currentSection] || {};
        
        // Get pronunciation requirement from config
        const requiredScore = this.config?.pronunciation?.examRequirement || 89;
        
        // Check if all phrases have pronunciation scores >= required threshold
        for (let i = 0; i < sectionPhrases.length; i++) {
            const score = scores[i] || 0;
            if (score < requiredScore) {
                return false;
            }
        }
        
        return true;
    }

    savePronunciationProgress() {
        try {
            localStorage.setItem('czechLearningPronunciation', JSON.stringify(this.pronunciationScores));
        } catch (error) {
            console.error('Error saving pronunciation progress:', error);
        }
    }

    loadPronunciationProgress() {
        try {
            const saved = localStorage.getItem('czechLearningPronunciation');
            if (saved) {
                this.pronunciationScores = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading pronunciation progress:', error);
            this.pronunciationScores = {};
        }
    }

    // Get configuration values
    getConfig() {
        return this.config;
    }

    getPronunciationThresholds() {
        return this.config?.pronunciation?.thresholds || {
            excellent: 89,
            good: 70,
            needsImprovement: 0
        };
    }

    getPronunciationExamRequirement() {
        return this.config?.pronunciation?.examRequirement || 89;
    }
}
