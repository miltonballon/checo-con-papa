// Minimal test version without async/await
class MinimalCore {
    constructor() {
        console.log('MinimalCore constructor');
        this.phrases = [];
        this.currentSection = 0;
        this.onSectionChange = null;
    }
    
    loadPhrases() {
        console.log('Loading phrases...');
        fetch('./phrases.json')
            .then(response => response.json())
            .then(data => {
                console.log('Phrases loaded:', data.length, 'sections');
                this.phrases = data;
                if (this.onSectionChange && this.phrases.length > 0) {
                    this.onSectionChange(0, this.phrases[0]);
                }
            })
            .catch(error => {
                console.error('Error loading phrases:', error);
            });
    }
}

class MinimalUI {
    constructor(core) {
        console.log('MinimalUI constructor');
        this.core = core;
        this.core.onSectionChange = (index, section) => this.renderSection(index, section);
        this.core.loadPhrases();
    }
    
    renderSection(index, section) {
        console.log('Rendering section:', index, section);
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <h2>Section ${index + 1}: ${section.section}</h2>
                <p>Found ${section.items.length} phrases</p>
                <div>
                    ${section.items.slice(0, 3).map(phrase => 
                        `<div style="margin: 10px; padding: 10px; border: 1px solid #ccc;">
                            <div><strong>Spanish:</strong> ${phrase[0]}</div>
                            <div><strong>Czech:</strong> ${phrase[1]}</div>
                            <div><strong>Pronunciation:</strong> ${phrase[2]}</div>
                        </div>`
                    ).join('')}
                </div>
            `;
        } else {
            console.error('main-content element not found!');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - creating minimal app');
    const core = new MinimalCore();
    const ui = new MinimalUI(core);
    window.minimalApp = { core, ui };
    console.log('Minimal app created');
});
