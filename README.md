# Palabra - Spanish Wordle Clone

Palabra is a Spanish version of the popular word-guessing game Wordle. Players have six attempts to guess a five-letter word, with color-coded feedback for each guess.

https://bhanu9prakash.github.io/palabra/

![image](https://github.com/user-attachments/assets/2c32101b-e645-49a7-95aa-6fb441d0bca9)


## Features

- Daily Spanish word puzzle
- Color-coded feedback (green for correct letter and position, yellow for correct letter but wrong position, gray for incorrect letter)
- On-screen keyboard
- Statistics tracking
- Dark mode toggle
- Shareable results

## Files

- `index.html`: The main HTML file containing the game structure
- `script.js`: The JavaScript file containing the game logic
- `style.css`: The CSS file for styling the game
- `words.js`: A list of valid Spanish five-letter words

## How to Play

1. Open `index.html` in a web browser
2. Guess a five-letter Spanish word
3. Submit your guess using the on-screen keyboard or your device's keyboard
4. Use the color-coded feedback to inform your next guess
5. Try to guess the word within six attempts

## Customizing for Other Languages

To customize this game for other languages, follow these steps:

1. Update the word list:
   - Open `words.js`
   - Replace the `words` array with a list of valid five-letter words in your target language

2. Modify the keyboard layout:
   - Open `script.js`
   - Locate the `createKeyboard()` function
   - Update the `layout` array to match the keyboard layout of your target language
   - Add or remove accent keys as needed in the `accentRow`

3. Update game text:
   - Open `index.html`
   - Replace all text content with translations in your target language
   - Update the `<title>` tag to reflect the new game name

4. Adjust CSS for language-specific characters:
   - Open `style.css`
   - Modify the `.key` class to accommodate longer or shorter character widths if necessary

5. Update game logic for language-specific rules:
   - Open `script.js`
   - Modify the `checkGuess()` function if your language has any special rules for letter matching
   - Update the `selectTargetWord()` function if you need a different method for selecting daily words

6. Localize messages:
   - In `script.js`, update all message strings (e.g., "La palabra debe tener 5 letras") to your target language

7. Adjust statistics and sharing text:
   - Update the `updateStatsDisplay()` and `generateShareableResult()` functions in `script.js` to use localized text

8. Test thoroughly:
   - Make sure all game mechanics work correctly with the new language
   - Check for any display issues with language-specific characters

By following these steps, you can adapt the Palabra game to work with any language that uses five-letter words and a similar alphabet structure.


## Acknowledgements

This project is inspired by the original Wordle game created by Josh Wardle.
