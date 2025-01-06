document.addEventListener('DOMContentLoaded', () => {
    const startQuizButton = document.getElementById('start-quiz');
    const submitQuizButton = document.getElementById('submit-quiz');

    if (startQuizButton) {
        startQuizButton.addEventListener('click', startQuiz);
    } else {
        console.error('Element with id="start-quiz" not found.');
    }

    if (submitQuizButton) {
        submitQuizButton.addEventListener('click', submitQuiz);
    } else {
        console.error('Element with id="submit-quiz" not found.');
    }
});

function startQuiz() {
    const difficulty = document.getElementById('difficulty').value;

    // Clear the result box
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = '';

    fetchQuestions(difficulty);
}

function fetchQuestions(difficulty) {
    fetch('./questions.json')
        .then(response => response.json())
        .then(data => {
            // Filter questions by selected difficulty
            const filteredQuestions = data.filter(q => q.difficulty === difficulty);

            // Randomly select 5 questions
            const selectedQuestions = getRandomQuestions(filteredQuestions, 5);

            // Display the selected questions
            displayQuestions(selectedQuestions);

            // Store the selected questions globally for grading
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
        quizContainer.innerHTML = '<p>No questions available for the selected difficulty.</p>';
        return;
    }

    questions.forEach((item, index) => {
        // Randomize options
        const randomizedOptions = item.options.sort(() => 0.5 - Math.random());

        // Create question element
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
                    question: window.quizData[index].question,
                    correctAnswer: correctAnswer,
                });
            }
        } else {
            incorrectCount++;
            incorrectQuestions.push({
                question: window.quizData[index].question,
                correctAnswer: correctAnswer,
            });
        }
    });

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `
        <p>You got ${correctCount} question(s) right.</p>
        <p>You got ${incorrectCount} question(s) wrong.</p>
        <div>
            <h3>Incorrect Questions:</h3>
            <ul>
                ${incorrectQuestions.map(q => `
                    <li>${q.question} <br><strong>Correct Answer:</strong> ${q.correctAnswer}</li>
                `).join('')}
            </ul>
        </div>
    `;
}
