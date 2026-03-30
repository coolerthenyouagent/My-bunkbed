const GITHUB_API = 'https://api.github.com/repos/coolerthenyouagent/My-bunkbed/contents/notes';
const GITHUB_RAW = 'https://raw.githubusercontent.com/coolerthenyouagent/My-bunkbed/main/notes';

let allNotes = [];

async function loadNotes() {
    try {
        const response = await fetch(GITHUB_API);
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.log('No notes directory found');
            return;
        }

        allNotes = [];
        const txtFiles = data.filter(file => file.name.endsWith('.txt'));

        for (const file of txtFiles) {
            const contentResponse = await fetch(`${GITHUB_RAW}/${file.name}`);
            const content = await contentResponse.text();
            allNotes.push({
                name: file.name.replace('.txt', ''),
                content: content,
                url: file.html_url
            });
        }

        displayNotes();
    } catch (error) {
        console.error('Error loading notes:', error);
        const container = document.getElementById('notesContainer');
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white;">Add .txt files to the /notes folder to display them here.</p>';
    }
}

function displayNotes() {
    const container = document.getElementById('notesContainer');
    
    if (allNotes.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white;">No notes yet. Add .txt files to the /notes folder!</p>';
        return;
    }

    container.innerHTML = allNotes.map((note, index) => `
        <div class="note-card" onclick="showModal('${index}')">
            <h3>${escapeHtml(note.name)}</h3>
            <p>${escapeHtml(note.content)}</p>
        </div>
    `).join('');
}

function showModal(index) {
    const note = allNotes[index];
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${escapeHtml(note.name)}</h2>
            <p>${escapeHtml(note.content)}</p>
            <a href="${note.url}" target="_blank" style="color: #667eea; text-decoration: none; margin-top: 15px; display: block;">View on GitHub</a>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setInterval(loadNotes, 10000);
});