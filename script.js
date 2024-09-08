import { words } from './words.js';

const alphabet = 'abcdefghijklmnñopqrstuvwxyzáéíóú';

let targetWord = '';
let currentWord = '';
let guessedWords = [];
let currentRow = 0;
let gameState = 'playing'; // 'playing', 'won', 'lost'
let statistics = JSON.parse(localStorage.getItem('wordleStats')) || {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
};

function initializeGame() {
    const currentDate = getDateSeed().toString();
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');

    if (lastPlayedDate !== currentDate) {
        // New game for today
        targetWord = selectTargetWord();
        localStorage.setItem('currentTargetWord', targetWord);
        localStorage.setItem('lastPlayedDate', currentDate);
    } else {
        // A game has already been played today
        targetWord = localStorage.getItem('currentTargetWord');
    }

    resetGameState();
    createGameBoard();
    createKeyboard();
    setupEventListeners();
    updateStatsDisplay();
    setupShareButton();

    //console.log(targetWord); // For debugging, remove in production
}

function resetGameState() {
    currentWord = '';
    guessedWords = [];
    currentRow = 0;
    gameState = 'playing';
}

function setupShareButton() {
    const shareButton = document.getElementById('shareButton');
    shareButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        shareResult();
    });
    shareButton.disabled = true;
}


function getDateSeed() {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function selectTargetWord() {
    const seed = getDateSeed();
    return words[seed % words.length];
}

function createGameBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';

    const layout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
        ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
    ];

    layout.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('keyboard-row');
        row.forEach(key => {
            const keyElement = document.createElement('button');
            keyElement.textContent = key;
            keyElement.setAttribute('data-key', key);
            keyElement.classList.add('key');
            if (key === 'Enter' || key === 'Backspace') {
                keyElement.classList.add('wide-key');
            }
            rowElement.appendChild(keyElement);
        });
        keyboard.appendChild(rowElement);
    });

    // Add accent keys
    const accentRow = document.createElement('div');
    accentRow.classList.add('keyboard-row');
    ['á', 'é', 'í', 'ó', 'ú'].forEach(accent => {
        const accentKey = document.createElement('button');
        accentKey.textContent = accent;
        accentKey.setAttribute('data-key', accent);
        accentKey.classList.add('key', 'accent-key');
        accentRow.appendChild(accentKey);
    });
    keyboard.appendChild(accentRow);
}

function setupEventListeners() {
    document.addEventListener('click', handleMouseClick);
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
    document.getElementById('showHelp').addEventListener('click', showHelpModal);
    document.getElementById('showStats').addEventListener('click', showStatsModal);
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', closeModals);
    });
}

function handleMouseClick(e) {
    if (e.target.matches('[data-key]')) {
        handleKeyPress({ key: e.target.getAttribute('data-key') });
    }
}

function handleKeyPress(e) {
    if (gameState !== 'playing') return;

    const key = e.key.toLowerCase();

    if (key === 'backspace' || key === 'delete') {
        deleteLetter();
    } else if (key === 'enter') {
        submitGuess();
    } else if (alphabet.includes(key) && currentWord.length < 5) {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (currentWord.length < 5) {
        currentWord += letter;
        updateGameBoard();
    }
}

function deleteLetter() {
    if (currentWord.length > 0) {
        currentWord = currentWord.slice(0, -1);
        updateGameBoard();
    }
}

function submitGuess() {
    if (currentWord.length !== 5) {
        showMessage('La palabra debe tener 5 letras');
        return;
    }

    if (!words.includes(currentWord)) {
        showMessage('Palabra no válida');
        return;
    }

    checkGuess();
    guessedWords.push(currentWord);
    currentRow++;

    if (currentWord === targetWord) {
        endGame(true);
    } else if (currentRow >= 6) {
        endGame(false);
    } else {
        currentWord = '';
        updateGameBoard();
    }
}

function updateGameBoard() {
    const rows = document.querySelectorAll('.row');
    const currentRowTiles = rows[currentRow].querySelectorAll('.tile');

    currentRowTiles.forEach((tile, index) => {
        if (index < currentWord.length) {
            tile.textContent = currentWord[index];
            tile.classList.add('filled');
        } else {
            tile.textContent = '';
            tile.classList.remove('filled');
        }
        tile.classList.remove('correct', 'present', 'absent');
    });
}

function checkGuess() {
    const rows = document.querySelectorAll('.row');
    const currentRowTiles = rows[currentRow].querySelectorAll('.tile');
    const guessLetters = currentWord.split('');
    const targetLetters = targetWord.split('');

    guessLetters.forEach((letter, index) => {
        currentRowTiles[index].classList.add('flip');
        setTimeout(() => {
            if (letter === targetLetters[index]) {
                currentRowTiles[index].classList.add('correct');
                updateKeyboardKey(letter, 'correct');
            } else if (targetLetters.includes(letter)) {
                currentRowTiles[index].classList.add('present');
                updateKeyboardKey(letter, 'present');
            } else {
                currentRowTiles[index].classList.add('absent');
                updateKeyboardKey(letter, 'absent');
            }
        }, 250 * index);
    });
}

function updateKeyboardKey(letter, state) {
    const key = document.querySelector(`[data-key="${letter}"]`);
    if (key) {
        if (state === 'correct') {
            key.classList.remove('present', 'absent');
            key.classList.add('correct');
        } else if (state === 'present' && !key.classList.contains('correct')) {
            key.classList.remove('absent');
            key.classList.add('present');
        } else if (state === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
            key.classList.add('absent');
        }
    }
}


function updateStatsDisplay() {
    document.getElementById('gamesPlayed').textContent = statistics.gamesPlayed;
    document.getElementById('winPercentage').textContent = 
        statistics.gamesPlayed > 0 
            ? Math.round((statistics.wins / statistics.gamesPlayed) * 100) 
            : 0;
    document.getElementById('currentStreak').textContent = statistics.currentStreak;
    document.getElementById('maxStreak').textContent = statistics.maxStreak;

    const guessDistribution = document.getElementById('guessDistribution');
    guessDistribution.innerHTML = '';
    const maxValue = Math.max(...Object.values(statistics.guessDistribution));

    for (let i = 1; i <= 6; i++) {
        const row = document.createElement('div');
        row.classList.add('graph-container');
        
        const label = document.createElement('div');
        label.textContent = i;
        row.appendChild(label);

        const bar = document.createElement('div');
        bar.classList.add('graph');
        const barFill = document.createElement('div');
        barFill.classList.add('graph-bar');
        const percentage = maxValue > 0 ? (statistics.guessDistribution[i] / maxValue) * 100 : 0;
        barFill.style.width = `${percentage}%`;
        
        const barText = document.createElement('span');
        barText.textContent = statistics.guessDistribution[i];
        
        barFill.appendChild(barText);
        bar.appendChild(barFill);
        row.appendChild(bar);
        
        guessDistribution.appendChild(row);
    }
}

function getPuzzleNumber() {
    const startDate = new Date(2023, 0, 1); // Adjust this to your game's start date
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
}

function generateShareableResult() {
    const puzzleNumber = getPuzzleNumber();
    const solvedIn = gameState === 'won' ? guessedWords.length : 'X';
    
    let result = `PALABRA #${puzzleNumber} ${solvedIn}/6\n\n`;
    
    for (let i = 0; i < guessedWords.length; i++) {
        const word = guessedWords[i];
        for (let j = 0; j < word.length; j++) {
            if (word[j] === targetWord[j]) {
                result += '🟩';
            } else if (targetWord.includes(word[j])) {
                result += '🟨';
            } else {
                result += '⬛';
            }
        }
        result += '\n';
    }
    
    // Add a link to your game
    result += '\nhttps://bhanu9prakash.github.io/palabra'; // Replace with your actual game URL
    
    return result;
}


function endGame(isWin) {
    gameState = isWin ? 'won' : 'lost';
    statistics.gamesPlayed++;
    if (isWin) {
        statistics.wins++;
        statistics.currentStreak++;
        statistics.maxStreak = Math.max(statistics.maxStreak, statistics.currentStreak);
        statistics.guessDistribution[currentRow]++;
        showMessage('¡Felicidades! Has ganado.');        
    } else {
        statistics.currentStreak = 0;
        showMessage(`Game over. La palabra era: ${targetWord}`);
    }
    document.getElementById('shareButton').disabled = false;
    saveStatistics();
    setTimeout(showStatsModal, 1500);
}

function shareResult() {
    const result = generateShareableResult();
    
    // Function to use the fallback copy method
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";  // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showMessage('Resultado copiado al portapapeles');
            } else {
                showMessage('No se pudo copiar. Por favor, copia el resultado manualmente.');
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            showMessage('No se pudo copiar. Por favor, copia el resultado manualmente.');
        }

        document.body.removeChild(textArea);
    }

    // Try to use the Clipboard API, with fallback
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(result);
    } else {
        navigator.clipboard.writeText(result).then(function() {
            showMessage('Resultado copiado al portapapeles');
        }, function(err) {
            console.error('Async: Could not copy text: ', err);
            fallbackCopyTextToClipboard(result);
        });
    }

    document.getElementById('statsModal').style.display = 'block';

}




function showMessage(text) {
    const messageContainer = document.getElementById('messageContainer');
    
    // Remove any existing messages
    while (messageContainer.firstChild) {
        messageContainer.removeChild(messageContainer.firstChild);
    }

    const message = document.createElement('div');
    message.textContent = text;
    message.classList.add('message');
    
    messageContainer.appendChild(message);
    
    // Force a reflow to trigger the animation
    void message.offsetWidth;
    
    message.classList.add('show');
    
    setTimeout(() => {
        message.classList.remove('show');
        // Use requestAnimationFrame to ensure the removal happens in the next frame
        requestAnimationFrame(() => {
            if (message.parentNode === messageContainer) {
                messageContainer.removeChild(message);
            }
        });
    }, 2000);
}



function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function showHelpModal() {
    document.getElementById('helpModal').style.display = 'block';
}

function showStatsModal() {
    updateStatsDisplay();
    document.getElementById('statsModal').style.display = 'block';
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}


function saveStatistics() {
    localStorage.setItem('wordleStats', JSON.stringify(statistics));
}

// On page load, check for saved theme preference
document.addEventListener('DOMContentLoaded', (event) => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

window.addEventListener('load', initializeGame);