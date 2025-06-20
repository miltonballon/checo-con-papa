// Celebration effects for Czech Learning App
console.log('🎉 celebration-effects.js cargado');

class CelebrationEffects {
    constructor() {
        this.effectsContainer = null;
        this.setupEffectsContainer();
    }

    setupEffectsContainer() {
        // Create a container for all celebration effects
        this.effectsContainer = document.createElement('div');
        this.effectsContainer.className = 'celebration-effects-container';
        this.effectsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 10000;
            overflow: hidden;
        `;
        document.body.appendChild(this.effectsContainer);
    }

    // Main function to play a random celebration effect
    playCelebration(type = 'random') {
        // Define available effects
        const effects = [
            this.createConfetti,
            this.createFireworks,
            this.createSparkles,
            this.createEmojiBurst,
            this.createColoredText
        ];

        // Choose an effect based on type
        if (type === 'random') {
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            randomEffect.call(this);
        } else if (type === 'exam') {
            // For exam enabled, play confetti
            this.createConfetti();
        } else if (type === 'streak') {
            // For pronunciation streak, play a more subtle effect
            const streakEffects = [this.createSparkles, this.createEmojiBurst, this.createColoredText];
            const randomStreakEffect = streakEffects[Math.floor(Math.random() * streakEffects.length)];
            randomStreakEffect.call(this);
        } else if (type === 'examStreak') {
            // For exam answer streak, play fireworks
            this.createFireworks();
        } else if (type === 'examPassed') {
            // For passing an exam, play a big celebration
            this.createConfetti();
            setTimeout(() => {
                this.createFireworks();
            }, 500);
            setTimeout(() => {
                this.createEmojiBurst();
            }, 1000);
        }

        // Play a celebration sound
        this.playCelebrationSound(type);
    }

    // 1. Confetti effect
    createConfetti() {
        const confettiCount = 150;
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            const size = Math.random() * 10 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            confetti.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                top: -${size}px;
                left: ${Math.random() * 100}vw;
                opacity: ${Math.random() * 0.7 + 0.3};
                transform: rotate(${Math.random() * 360}deg);
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                z-index: 10000;
                pointer-events: none;
                animation: confetti-fall ${Math.random() * 3 + 2}s ease-in-out forwards;
            `;
            
            this.effectsContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti.parentNode === this.effectsContainer) {
                    this.effectsContainer.removeChild(confetti);
                }
            }, 5000);
        }
        
        // Add the animation to document if it doesn't exist
        if (!document.getElementById('confetti-animation')) {
            const style = document.createElement('style');
            style.id = 'confetti-animation';
            style.innerHTML = `
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(${window.innerHeight}px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 2. Fireworks effect
    createFireworks() {
        const fireworksCount = 5;
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        
        for (let i = 0; i < fireworksCount; i++) {
            // Create the firework
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = 10 + Math.random() * 80; // Keep within viewport
                
                firework.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: ${left}vw;
                    width: 5px;
                    height: 5px;
                    background-color: ${color};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    animation: firework-rise ${Math.random() * 0.5 + 1}s ease-out forwards;
                `;
                
                this.effectsContainer.appendChild(firework);
                
                // When the firework reaches its peak, explode
                setTimeout(() => {
                    if (firework.parentNode === this.effectsContainer) {
                        this.effectsContainer.removeChild(firework);
                        this.createFireworkExplosion(left, color);
                    }
                }, (Math.random() * 0.5 + 1) * 1000);
            }, i * 300); // Stagger the fireworks
        }
        
        // Add the animations if they don't exist
        if (!document.getElementById('firework-animations')) {
            const style = document.createElement('style');
            style.id = 'firework-animations';
            style.innerHTML = `
                @keyframes firework-rise {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(${-Math.random() * 60 - 20}vh) scale(0.8);
                        opacity: 0.8;
                    }
                }
                
                @keyframes firework-particle {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(
                            var(--translateX), 
                            var(--translateY)
                        ) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Helper for fireworks explosion
    createFireworkExplosion(left, color) {
        const particles = 30;
        const explosionTop = 20 + Math.random() * 40; // Random height for explosion
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            
            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = Math.random() * 100 + 50; // Random distance
            const translateX = Math.cos(angle) * distance;
            const translateY = Math.sin(angle) * distance;
            
            particle.style.cssText = `
                position: absolute;
                top: ${explosionTop}vh;
                left: ${left}vw;
                width: ${Math.random() * 5 + 2}px;
                height: ${Math.random() * 5 + 2}px;
                background-color: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                --translateX: ${translateX}px;
                --translateY: ${translateY}px;
                animation: firework-particle ${Math.random() * 0.8 + 0.7}s ease-out forwards;
            `;
            
            this.effectsContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode === this.effectsContainer) {
                    this.effectsContainer.removeChild(particle);
                }
            }, 2000);
        }
    }

    // 3. Sparkles effect (more subtle)
    createSparkles() {
        const sparkleCount = 20;
        const colors = ['#FFD700', '#FFFACD', '#FFEC8B', '#FFF8DC', '#FFFFE0'];
        
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                
                const size = Math.random() * 15 + 5;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                // Position around the central area of the screen
                const top = 30 + Math.random() * 40;
                const left = 30 + Math.random() * 40;
                
                sparkle.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background-color: ${color};
                    top: ${top}vh;
                    left: ${left}vw;
                    opacity: 0;
                    border-radius: 50%;
                    filter: blur(1px);
                    box-shadow: 0 0 ${size/2}px ${color};
                    pointer-events: none;
                    z-index: 10000;
                    animation: sparkle-pulse ${Math.random() * 1 + 1.5}s ease-in-out forwards;
                `;
                
                this.effectsContainer.appendChild(sparkle);
                
                // Remove sparkle after animation
                setTimeout(() => {
                    if (sparkle.parentNode === this.effectsContainer) {
                        this.effectsContainer.removeChild(sparkle);
                    }
                }, 2500);
            }, i * 100); // Stagger the sparkles
        }
        
        // Add the animation if it doesn't exist
        if (!document.getElementById('sparkle-animation')) {
            const style = document.createElement('style');
            style.id = 'sparkle-animation';
            style.innerHTML = `
                @keyframes sparkle-pulse {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 4. Emoji burst effect
    createEmojiBurst() {
        const emojiCount = 15;
        const emojis = ['🎉', '🎊', '👏', '🌟', '✨', '💯', '🔥', '👍', '🇨🇿']; // Czech flag included
        
        for (let i = 0; i < emojiCount; i++) {
            const emoji = document.createElement('div');
            emoji.className = 'emoji-burst';
            
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const size = Math.random() * 20 + 20;
            
            // Start from center of screen
            emoji.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                font-size: ${size}px;
                pointer-events: none;
                z-index: 10000;
                transform: translate(-50%, -50%);
                animation: emoji-burst ${Math.random() * 1 + 1.5}s ease-out forwards;
            `;
            emoji.textContent = randomEmoji;
            
            this.effectsContainer.appendChild(emoji);
            
            // Remove emoji after animation
            setTimeout(() => {
                if (emoji.parentNode === this.effectsContainer) {
                    this.effectsContainer.removeChild(emoji);
                }
            }, 2500);
        }
        
        // Add the animation if it doesn't exist
        if (!document.getElementById('emoji-animation')) {
            const style = document.createElement('style');
            style.id = 'emoji-animation';
            style.innerHTML = `
                @keyframes emoji-burst {
                    0% {
                        transform: translate(-50%, -50%) scale(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    100% {
                        transform: 
                            translate(
                                calc(-50% + ${Math.random() * 400 - 200}px), 
                                calc(-50% + ${Math.random() * 400 - 200}px)
                            ) 
                            scale(1) 
                            rotate(${Math.random() * 360}deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 5. Colored text effect
    createColoredText() {
        const messages = [
            '¡Excelente!', 
            '¡Buen trabajo!', 
            '¡Fantástico!', 
            '¡Sigue así!', 
            '¡Increíble!',
            '¡Vynikající!', // Excellent in Czech
            '¡Skvělé!' // Great in Czech
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        const textElement = document.createElement('div');
        textElement.className = 'colored-text';
        
        textElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            white-space: nowrap;
            pointer-events: none;
            animation: colored-text-animation 2s ease-in-out forwards;
        `;
        
        // Split the message into spans for individual letters
        textElement.innerHTML = message.split('').map(letter => 
            `<span style="
                display: inline-block;
                animation: letter-animation ${Math.random() * 0.5 + 0.5}s ease-in-out forwards ${Math.random() * 0.5}s;
                opacity: 0;
                transform: translateY(20px);
                color: hsl(${Math.random() * 360}, 80%, 60%);
            ">${letter}</span>`
        ).join('');
        
        this.effectsContainer.appendChild(textElement);
        
        // Remove text after animation
        setTimeout(() => {
            if (textElement.parentNode === this.effectsContainer) {
                this.effectsContainer.removeChild(textElement);
            }
        }, 3000);
        
        // Add the animations if they don't exist
        if (!document.getElementById('text-animations')) {
            const style = document.createElement('style');
            style.id = 'text-animations';
            style.innerHTML = `
                @keyframes colored-text-animation {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                
                @keyframes letter-animation {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Play celebration sound effects
    playCelebrationSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Set appropriate volume based on celebration type
            let volume = 0.3;
            if (type === 'streak' || type === 'examStreak') {
                volume = 0.2; // Lower volume for streak celebrations
            } else if (type === 'examPassed') {
                volume = 0.4; // Higher volume for passing exam
            }
            
            // Select appropriate sound effect based on celebration type
            if (type === 'exam') {
                // More elaborate sound for exam celebration
                this.playFanfareSound(audioContext, volume);
            } else if (type === 'examPassed') {
                // Grand fanfare for passing an exam
                this.playGrandFanfare(audioContext, volume);
            } else if (type === 'examStreak') {
                // Special sound for exam streak
                this.playExamStreakSound(audioContext, volume);
            } else {
                // Simpler sound for pronunciation streaks or random
                this.playSuccessSound(audioContext, volume);
            }
        } catch (error) {
            console.log('Audio not supported or failed:', error);
        }
    }
    
    // Special sound for exam answer streaks
    playExamStreakSound(audioContext, volume = 0.2) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // More exciting sound for correct exam answers
        oscillator.type = 'triangle';
        
        const startTime = audioContext.currentTime;
        oscillator.frequency.setValueAtTime(600, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(900, startTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(700, startTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
    }
    
    // Grand fanfare for passing an exam
    playGrandFanfare(audioContext, volume = 0.4) {
        // Play multiple notes in sequence
        const playNote = (frequency, startTime, duration, type = 'sine') => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, startTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        // Epic triumphant fanfare
        const currentTime = audioContext.currentTime;
        
        // First phrase - ascending
        playNote(392, currentTime, 0.15, 'triangle');      // G4
        playNote(493.88, currentTime + 0.15, 0.15, 'triangle'); // B4
        playNote(587.33, currentTime + 0.3, 0.3, 'triangle');  // D5
        
        // Second phrase - more triumphant
        playNote(783.99, currentTime + 0.7, 0.2, 'triangle');  // G5
        playNote(880, currentTime + 0.9, 0.2, 'triangle');     // A5
        playNote(987.77, currentTime + 1.1, 0.3, 'triangle');  // B5
        playNote(1174.66, currentTime + 1.4, 0.6, 'triangle'); // D6 (longer)
        
        // Add bass notes for richness
        playNote(196, currentTime, 0.3, 'sine');       // G3 (bass)
        playNote(196, currentTime + 0.7, 0.3, 'sine'); // G3 (bass)
        playNote(196, currentTime + 1.4, 0.6, 'sine'); // G3 (bass)
    }
    
    // Simple success sound
    playSuccessSound(audioContext, volume = 0.3) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        
        // Play a quick ascending pattern
        const startTime = audioContext.currentTime;
        oscillator.frequency.setValueAtTime(500, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, startTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(1000, startTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
    }
    
    // More elaborate fanfare sound
    playFanfareSound(audioContext, volume = 0.3) {
        // Play multiple notes in sequence
        const playNote = (frequency, startTime, duration, type = 'sine') => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, startTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        // Triumphant fanfare
        const currentTime = audioContext.currentTime;
        const notes = [
            { freq: 523.25, time: 0, duration: 0.2 },     // C5
            { freq: 659.25, time: 0.1, duration: 0.2 },   // E5
            { freq: 783.99, time: 0.2, duration: 0.2 },   // G5
            { freq: 1046.5, time: 0.3, duration: 0.4 },   // C6 (longer)
        ];
        
        // Play the notes
        notes.forEach(note => {
            playNote(note.freq, currentTime + note.time, note.duration);
        });
    }
}

// Export the class
window.CelebrationEffects = CelebrationEffects;
