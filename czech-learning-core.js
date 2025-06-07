// Core application logic for Czech Learning App
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
        
        // Event callbacks - will be set by UI layer
        this.onProgressUpdate = null;
        this.onNotification = null;
        this.onSectionChange = null;
        this.onExamStart = null;
        this.onQuestionChange = null;
        this.onExamComplete = null;
        
        // Load progress from localStorage
        console.log('Loading progress...');
        this.loadProgress();
        console.log('CzechLearningCore constructor completed');
    }

    async init() {
        console.log('CzechLearningCore init starting...');
        try {
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
        } catch (error) {
            console.error('Error loading progress from localStorage:', error);
            // Reset to defaults if there's an error
            this.currentSection = 0;
            this.unlockedSections = [0];
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
            const response = await fetch('./phrases.json');
            this.phrases = await response.json();
        } catch (error) {
            console.error('Error loading phrases:', error);
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
        this.examMode = true;
        this.generateExamQuestions();
        this.currentQuestion = 0;
        this.examAnswers = [];
        
        if (this.onExamStart) {
            this.onExamStart(this.examQuestions.length);
        }
        
        this.showNextQuestion();
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

    showNextQuestion() {
        if (this.currentQuestion < this.examQuestions.length) {
            const question = this.examQuestions[this.currentQuestion];
            
            if (this.onQuestionChange) {
                this.onQuestionChange({
                    questionNumber: this.currentQuestion + 1,
                    totalQuestions: this.examQuestions.length,
                    question: question
                });
            }
        }
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
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = percentage >= 80; // Need 80% to pass
        
        // Unlock next section if passed
        if (passed && !this.unlockedSections.includes(this.currentSection + 1) && this.currentSection < this.phrases.length - 1) {
            this.unlockedSections.push(this.currentSection + 1);
            this.saveProgress();
        }
        
        const results = {
            correctAnswers,
            totalQuestions,
            percentage,
            passed,
            canAdvance: passed && this.currentSection < this.phrases.length - 1
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
        this.currentSection = 0;
        this.unlockedSections = [0];
        this.examMode = false;
        this.examQuestions = [];
        this.examAnswers = [];
        this.currentQuestion = 0;
        
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
}
