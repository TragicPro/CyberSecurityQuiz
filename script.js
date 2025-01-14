document.addEventListener('DOMContentLoaded', () => {
    const startQuizButton = document.getElementById('start-quiz');
    const submitQuizButton = document.getElementById('submit-quiz');
    const themeButton = document.getElementById('theme-button');
    let isDarkMode = false;
    let quizStarted = false; // Ensure this tracks the quiz state

    // Initially disable the Submit button
    submitQuizButton.disabled = true;

    // Start Quiz Button
    if (startQuizButton) {
        startQuizButton.addEventListener('click', () => {
            startQuiz();
            quizStarted = true; // Set quizStarted to true when quiz starts
            submitQuizButton.disabled = false; // Enable Submit button
        });
    } else {
        console.error('Start Quiz button not found.');
    }

    // Submit Quiz Button
    if (submitQuizButton) {
        submitQuizButton.addEventListener('click', () => {
            if (quizStarted) {
                submitQuiz(); // Only allow submitting if quiz has started
            } else {
                alert('Please start the quiz before submitting your answers.');
            }
        });
    } else {
        console.error('Submit Quiz button not found.');
    }

    // Theme Switcher
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
    } else {
        console.error('Theme Switch button not found.');
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeButton.textContent = 'Switch to Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            themeButton.textContent = 'Switch to Dark Mode';
        }
    }
});

function startQuiz() {
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = ''; // Clear previous results

    fetchQuestions(category, difficulty);
}

function fetchQuestions(category, difficulty) {
    fetch('./questions.json')
        .then(response => response.json())
        .then(data => {
            const filteredQuestions = data.filter(
                q => q.category === category && q.difficulty === difficulty
            );

            const selectedQuestions = getRandomQuestions(filteredQuestions, 10);
            displayQuestions(selectedQuestions);
            window.quizData = selectedQuestions;
        })
        .catch(error => console.error('Error loading questions:', error));
}

function getRandomQuestions(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayQuestions(questions) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = ''; // Clear previous questions

    if (questions.length === 0) {
        quizContainer.innerHTML = '<p>No questions available for the selected category and difficulty.</p>';
        return;
    }

    questions.forEach((item, index) => {
        const randomizedOptions = item.options.sort(() => 0.5 - Math.random());

        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <p>${index + 1}. ${item.question}</p>
            <ul>
                ${randomizedOptions.map(option => `
                    <li>
                        <label>
                            <input type="radio" name="q${index}" value="${option}">
                            ${option}
                        </label>
                    </li>
                `).join('')}
            </ul>
        `;
        quizContainer.appendChild(questionElement);
    });
}

function submitQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    const questions = quizContainer.getElementsByClassName('question');
    let correctCount = 0;
    let incorrectCount = 0;
    const incorrectQuestions = [];

    Array.from(questions).forEach((question, index) => {
        const selectedOption = question.querySelector(`input[name="q${index}"]:checked`);
        const correctAnswer = window.quizData[index].answer;

        if (selectedOption) {
            if (selectedOption.value === correctAnswer) {
                correctCount++;
            } else {
                incorrectCount++;
                incorrectQuestions.push({
                    questionNumber: index + 1,
                    question: window.quizData[index].question,
                    correctAnswer: correctAnswer,
                });
            }
        } else {
            incorrectCount++;
            incorrectQuestions.push({
                questionNumber: index + 1,
                question: window.quizData[index].question,
                correctAnswer: correctAnswer,
            });
        }
    });

    displayResults(correctCount, incorrectCount, incorrectQuestions);
}

function displayResults(correctCount, incorrectCount, incorrectQuestions) {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = '';

    // Provide motivational feedback messages
    const feedbackMessages = {
        high: [
            "You're a cybersecurity master!",
            "Amazing performance! Hackers beware!",
            "Outstanding work! You’re a cyber ninja!",
            "You crushed it! 🎉 Your cybersecurity skills are sharp!",
            "Legendary! Are you sure you're not a cybersecurity pro already? 🔒",
            "Fantastic job! Hackers are trembling at your knowledge! 💪",
            "Unstoppable! You're the cybersecurity hero we all need. 🦸",
            "10/10! You’re practically unhackable! 🔐",
            "You just breached the wall of awesomeness! 🎯",
            "Your skills are firewalls against ignorance! 🔥",
            "You're the encryption key to cybersecurity mastery! 🚀",
            "Elite-level skills detected! Are you even human? 🤖",
            "Flawless victory! You're a digital samurai! 🥷",
            "Your knowledge is like a zero-day exploit—unstoppable! 🛡️",
            "Hackers are crying right now. You're unbeatable! 😎",
        ],
        medium: [
            "Good job! Keep practicing, and you'll ace it next time.",
            "You're on the right track! Keep going.",
            "Not bad! A little more effort will get you to the top.",
            "Great effort! A bit more practice, and you'll dominate. 🛠️",
            "Well done! You’re on the right path to mastery. 🌟",
            "Solid work! Keep at it; your skills are leveling up! 📈",
            "Not bad! Remember: every expert started as a beginner. 🚀",
            "You’re getting there! Cybersecurity mastery is within reach. 🏗️",
            "Your effort shows great potential. Keep studying! 💡",
            "You're a few firewall rules away from perfection! 🔥",
            "Good job! You're building a strong foundation. 💪",
            "Cybersecurity is no easy feat, but you're handling it well! 🌍",
            "Nice effort! Just a little more, and you're there! ✨",
        ],
        low: [
            "It’s okay; learning is part of the journey!",
            "Don't worry! Every expert started where you are now.",
            "Mistakes are opportunities to grow. Try again!",
            "Hey, even Edison failed 1,000 times before the lightbulb! 💡",
            "Think of this as debugging—try again and learn! 🛠️",
            "Don’t worry, this is just a warm-up. 🔥",
            "Keep going! Cybersecurity takes time, but you're on the way. 🏋️",
            "Mistakes are proof you’re trying—don't stop now! 🌟",
            "It's okay! Every expert started exactly where you are. 🚀",
            "Learning curves are tough, but so worth it. Keep climbing! 📈",
            "Failures are just stepping stones to success. Keep moving! 🧗",
            "This is just the first round. Victory is in sight! 🥇",
            "Even pros fail sometimes. You're doing great! 🧑‍💻",
            "Every click, every answer—you're getting better! 🚀",
            "Cybersecurity is tough, but so are you! 💪",
        ]
    };

    let scoreCategory = correctCount >= 8 ? 'high' :
        correctCount >= 4 ? 'medium' : 'low';

    const randomFeedback = feedbackMessages[scoreCategory][Math.floor(Math.random() * feedbackMessages[scoreCategory].length)];

    resultContainer.innerHTML = `
        <p>${randomFeedback}</p>
        <p>You got ${correctCount} question(s) correct and ${incorrectCount} wrong.</p>
        ${incorrectQuestions.length > 0 ? `
            <button id="show-wrong-answers">Show Incorrect Questions</button>
            <ul id="wrong-answers" style="display: none;">
                ${incorrectQuestions.map(q => `
                    <li>Q${q.questionNumber}: ${q.question}<br><strong>Correct Answer:</strong> ${q.correctAnswer}</li>
                `).join('')}
            </ul>
        ` : ''}
        <button id="try-again">Try Again</button>
    `;

    const showWrongAnswersButton = document.getElementById('show-wrong-answers');
    if (showWrongAnswersButton) {
        showWrongAnswersButton.addEventListener('click', () => {
            const wrongAnswers = document.getElementById('wrong-answers');
            wrongAnswers.style.display = wrongAnswers.style.display === 'none' ? 'block' : 'none';
        });
    }

    const tryAgainButton = document.getElementById('try-again');
    if (tryAgainButton) {
        tryAgainButton.addEventListener('click', () => {
            window.scrollTo(0, 0);
            quizStarted = false; // Reset the quiz state
            startQuiz();
        });
    }
}
