document.addEventListener('DOMContentLoaded', () => {
    const startQuizButton = document.getElementById('start-quiz');
    const submitQuizButton = document.getElementById('submit-quiz');
    const themeButton = document.getElementById('theme-button');
    const resultContainer = document.getElementById('result');
    let isDarkMode = false;

    if (startQuizButton) startQuizButton.addEventListener('click', startQuiz);
    if (submitQuizButton) submitQuizButton.addEventListener('click', submitQuiz);
    if (themeButton) themeButton.addEventListener('click', toggleTheme);

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode');
        themeButton.textContent = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
});

function startQuiz() {
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    document.getElementById('result').innerHTML = '';
    fetchQuestions(category, difficulty);
}

function fetchQuestions(category, difficulty) {
    fetch('./questions.json')
        .then(response => response.json())
        .then(data => {
            const filteredQuestions = data.filter(q => q.category === category && q.difficulty === difficulty);
            const selectedQuestions = getRandomQuestions(filteredQuestions, 10);
            displayQuestions(selectedQuestions);
            window.quizData = selectedQuestions;
        })
        .catch(error => console.error('Error loading questions:', error));
}

function getRandomQuestions(array, count) {
    return array.sort(() => 0.5 - Math.random()).slice(0, count);
}

function displayQuestions(questions) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';
    if (questions.length === 0) {
        quizContainer.innerHTML = '<p>No questions available for the selected category and difficulty.</p>';
        return;
    }
    questions.forEach((item, index) => {
        const options = item.options.sort(() => 0.5 - Math.random());
        const questionHTML = `
            <div class="question" data-index="${index}">
                <p>${index + 1}. ${item.question}</p>
                <ul>
                    ${options.map(option => `
                        <li>
                            <label>
                                <input type="radio" name="q${index}" value="${option}">
                                ${option}
                            </label>
                        </li>
                    `).join('')}
                </ul>
            </div>`;
        quizContainer.innerHTML += questionHTML;
    });
}

function submitQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    const questions = document.querySelectorAll('.question');
    let correctCount = 0, incorrectCount = 0;
    const incorrectQuestions = [];
    questions.forEach((question, index) => {
        const selectedOption = question.querySelector(`input[name="q${index}"]:checked`);
        const correctAnswer = window.quizData[index].answer;
        if (selectedOption) {
            if (selectedOption.value === correctAnswer) correctCount++;
            else incorrectQuestions.push({ number: index + 1, question: window.quizData[index].question, correctAnswer });
        } else {
            incorrectQuestions.push({ number: index + 1, question: window.quizData[index].question, correctAnswer });
        }
    });
    incorrectCount = incorrectQuestions.length;
    displayResults(correctCount, incorrectCount, incorrectQuestions);
}

function displayResults(correctCount, incorrectCount, incorrectQuestions) {
    const resultContainer = document.getElementById('result');
    const feedbackMessages = {
        high: ["Amazing! You’re a cybersecurity superstar! 🌟", "Fantastic! You're on your way to mastery! 🏆"],
        medium: ["Good job! Keep it up! You're doing great! 🚀", "Almost there! A bit more practice, and you’re golden! 🔐"],
        low: ["Don't worry, it's a learning process! 🌱", "Keep going; every expert started somewhere! 💪"]
    };
    const scoreCategory = correctCount >= 8 ? 'high' : correctCount >= 4 ? 'medium' : 'low';
    const feedbackMessage = feedbackMessages[scoreCategory][Math.floor(Math.random() * feedbackMessages[scoreCategory].length)];

    resultContainer.innerHTML = `
        <div>
            <h2>${feedbackMessage}</h2>
            <p>You answered ${correctCount} question(s) correctly and ${incorrectCount} incorrectly.</p>
            <button id="show-incorrect" style="margin: 10px;">Show Incorrect Answers</button>
            <button id="try-again" style="margin: 10px;">Try Again</button>
        </div>
        <div id="incorrect-container" style="display: none;">
            <h3>Incorrect Questions:</h3>
            <ul>
                ${incorrectQuestions.map(q => `
                    <li>
                        <strong>Q${q.number}:</strong> ${q.question}<br>
                        <em>Correct Answer:</em> ${q.correctAnswer}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    document.getElementById('show-incorrect').addEventListener('click', () => {
        document.getElementById('incorrect-container').style.display = 'block';
    });

    document.getElementById('try-again').addEventListener('click', () => {
        startQuiz();
    });
}
