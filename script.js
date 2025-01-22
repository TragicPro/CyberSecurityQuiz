document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startQuizButton = document.getElementById('start-quiz');
    const themeButton = document.getElementById('theme-button');
    const viewChangelogButton = document.getElementById('view-changelog');
    const changelog = document.getElementById('changelog');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result');

    // Global Variables
    let timerDisplay = null;
    let isQuizActive = false; // Tracks if the quiz is active
    let isDarkMode = false;
    let quizTimer;
    let timeRemaining = 10;
    let currentQuestionIndex = 0;
    let allQuestions = [];
    let answerLog = []; // Track all user responses
    let startTime;
    let correctCount = 0;
    let selectedAnswer = null; // Track selected answer

    // === Initialize Timer Display ===
    if (quizContainer) {
        timerDisplay = document.createElement('div');
        timerDisplay.id = 'progress-bar-container';
        timerDisplay.style.cssText = `width: 100%; height: 20px; background-color: #e0e0e0;`;
        timerDisplay.innerHTML = `<div id="progress-bar" style="width: 100%; height: 100%; background-color: #76c7c0;"></div>`;
        quizContainer.parentNode.insertBefore(timerDisplay, quizContainer);
    }

    // === Event Listeners ===
    if (startQuizButton) {
        startQuizButton.addEventListener('click', startQuiz);
    }

    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
    }

    if (viewChangelogButton && changelog) {
        viewChangelogButton.addEventListener('click', toggleChangelog);
    }

    if (quizContainer) {
        quizContainer.addEventListener('click', (e) => {
            const target = e.target;

            // Ensure the target is a list item
            if (target.tagName === 'LI') {
                // Remove selected class from previously selected option
                const previousSelected = quizContainer.querySelector('li.selected');
                if (previousSelected) {
                    previousSelected.classList.remove('selected');
                }

                // Add selected class to the clicked option
                target.classList.add('selected');
            }
        });
    }

    // === Functions ===
    function startQuiz() {
        // Toggle between starting and stopping the quiz
        if (isQuizActive) {
            stopQuiz(); // If the quiz is active, stop it
            return;
        }

        // Initialize quiz state
        isQuizActive = true;
        startQuizButton.textContent = 'Stop Quiz'; // Change button text to "Stop Quiz"
        startQuizButton.classList.add('stop'); // Add 'stop' styles

        const category = document.getElementById('category').value.replace(/ /g, '_');
        const difficulty = document.getElementById('difficulty').value;

        resultContainer.innerHTML = '';
        quizContainer.innerHTML = '';
        currentQuestionIndex = 0;
        correctCount = 0;
        answerLog = []; // Reset the log
        allQuestions = [];
        startTime = Date.now();
        selectedAnswer = null; // Reset selected answer

        fetchQuestions(category, difficulty);
    }

    function stopQuiz() {
        // Reset the quiz state
        isQuizActive = false;
        clearInterval(quizTimer); // Stop the timer
        quizTimer = null;

        // Display the result box with a custom message
        displayResults(false, 'You stopped the quiz early.');

        // Reset button text
        startQuizButton.textContent = 'Start Quiz';
        startQuizButton.classList.remove('stop'); // Remove 'stop' styles
    }

    function fetchQuestions(category, difficulty) {
        const filePathTemplate = `./questions/${category}_${difficulty}_part_`;
        let part = 1;

        const loadNextPart = () => {
            fetch(`${filePathTemplate}${part}.json`)
                .then(response => {
                    if (!response.ok) throw new Error('No more parts');
                    return response.json();
                })
                .then(data => {
                    allQuestions = allQuestions.concat(data);
                    part++;
                    loadNextPart();
                })
                .catch(() => {
                    if (allQuestions.length === 0) {
                        quizContainer.innerHTML = '<p>No questions available for the selected category and difficulty.</p>';
                    } else {
                        allQuestions = shuffleArray(allQuestions);
                        displayQuestion(currentQuestionIndex);
                        startTimer();
                    }
                });
        };

        loadNextPart();
    }

    function displayQuestion(index) {
        if (index >= 10) { // End the quiz after 10 questions
            displayResults(true);
            return;
        }

        const question = allQuestions[index];
        const randomizedOptions = shuffleArray(question.options);

        quizContainer.innerHTML = `
        <div class="question">
            <p>${index + 1}. ${question.question}</p>
            <ul>
                ${randomizedOptions.map((option, i) => `
                    <li data-index="${i}">
                        ${option}
                    </li>
                `).join('')}
            </ul>
            <button id="submit-answer" disabled>Submit Answer</button> <!-- Start disabled -->
        </div>
    `;

        // Attach event listeners to the options
        const optionElements = quizContainer.querySelectorAll('li');
        optionElements.forEach(option => {
            option.addEventListener('click', function () {
                selectAnswer(option);
            });
        });

        // Attach listener to the submit button
        const submitButton = document.getElementById('submit-answer');
        submitButton.addEventListener('click', validateAnswer);
    }

    function selectAnswer(option) {
        // Remove highlight from all options
        const options = quizContainer.querySelectorAll('li');
        options.forEach(opt => {
            opt.style.backgroundColor = '';
        });

        // Highlight the selected option
        option.style.backgroundColor = '#d1e7ff'; // Change the color of the selected option
        selectedAnswer = option.innerText; // Store the selected answer

        // Enable the submit button
        const submitButton = document.getElementById('submit-answer');
        submitButton.disabled = false;
    }

    function disableSubmitButton() {
        const submitButton = document.getElementById('submit-answer');
        if (submitButton) {
            submitButton.disabled = true;
        }
    }

    function startTimer() {
        timeRemaining = 30; // Reset timer
        updateProgressBar();

        clearInterval(quizTimer); // Clear previous timer
        quizTimer = setInterval(() => {
            timeRemaining--;
            updateProgressBar();

            if (timeRemaining <= 0) {
                clearInterval(quizTimer);

                if (selectedAnswer) {
                    // Automatically submit the highlighted answer
                    validateAnswer(true); // Pass a flag to indicate automatic submission
                } else {
                    // Log as "No answer" if no option is highlighted
                    logAnswer(false, 'No answer');
                    proceedToNextQuestion();
                }
            }
        }, 1000);
    }

    function updateProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        const percentage = (timeRemaining / 30) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.style.backgroundColor = percentage > 50 ? '#76c7c0' : '#ff6347';
    }

    function validateAnswer(isAutoSubmit = false) {
        const submitButton = document.getElementById('submit-answer');
        if (!selectedAnswer && !isAutoSubmit) {
            alert('Please select an answer.');
            return;
        }

        // Disable the submit button to prevent repeated actions
        if (submitButton) {
            submitButton.disabled = true;
        }

        const correctAnswer = allQuestions[currentQuestionIndex].answer;

        clearInterval(quizTimer); // Stop the timer once the answer is processed

        // Compare answers and log the result
        if (selectedAnswer && selectedAnswer.trim() === correctAnswer.trim()) {
            logAnswer(true, selectedAnswer); // Log correct answer
            correctCount++;
        } else {
            logAnswer(false, selectedAnswer || 'No answer'); // Log incorrect or no answer
        }

        proceedToNextQuestion(); // Move to the next question
    }

    function proceedToNextQuestion() {
        // Clear the selected answer
        selectedAnswer = null;

        // Move to the next question
        currentQuestionIndex++;

        if (currentQuestionIndex < 10) {
            displayQuestion(currentQuestionIndex); // Load the next question
            startTimer(); // Restart the timer for the next question
        } else {
            // Stop the quiz automatically after 10 questions
            isQuizActive = false;
            clearInterval(quizTimer); // Stop the timer
            displayResults(true); // Show final results

            // Reset button text and styles
            startQuizButton.textContent = "Start Quiz";
            startQuizButton.classList.remove("stop");
        }
    }


    function logAnswer(isCorrect, userAnswer) {
        const currentQuestion = allQuestions[currentQuestionIndex];
        answerLog.push({
            question: currentQuestion.question,
            correctAnswer: currentQuestion.answer,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
        });
    }

    function displayResults(isWin, message) {
        clearInterval(quizTimer); // Stop the timer
        const endTime = Date.now(); // Record quiz end time
        const totalTime = Math.round((endTime - startTime) / 1000);

        let upliftingMessage;

        if (correctCount >= 10) {
            const messages = [
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
                "You’ve decoded the secrets of cybersecurity like a true pro! 🔓",
                "Perfection! Your skills are sharper than a laser beam. 💥",
                "Your cybersecurity game is in god mode. 🕹️",
                "Wow! You've outsmarted even the sneakiest cyber threats! 🕵️‍♂️",
                "You're a true guardian of the digital world. 🛡️",
                "Incredible! You're like a human firewall. 🔥",
                "Brilliant work! The cybersecurity Hall of Fame is calling you! 🌟",
                "You're not just good; you're encryption-level genius. 🧠",
                "Hats off! You’ve hacked your way to success—in a good way! 🎩",
                "Master level achieved! Time to level up even further. 🎮",
                "You’ve set the cybersecurity standard for everyone else. 🚀",
                "Top-notch work! Hackers don’t stand a chance against you. 💻",
                "Absolute legend! You just raised the bar for cybersecurity enthusiasts. 🏆",
                "You’ve turned this quiz into your playground. 🎢",
                "Flawless performance! You’ve earned all the bragging rights. 👏",
                "Your skillset is like a perfectly patched system—flawless! 🛠️",
                "Epic win! You've proven you're the defender of the digital realm. 🥇",
                "You’ve cracked this quiz like a master codebreaker. 🕵️‍♀️",
                "Digital threats don’t stand a chance against your brilliance. 🛡️",
                "Spectacular! You’re a beacon of hope in the cybersecurity world. 🌟",
                "You're so good, even the quiz wanted to applaud you. 👏",
                "Exceptional work! You're a cybersecurity rockstar! 🎸",
                "You didn’t just pass; you dominated! 💪",
                "You're like the antivirus of the quiz world—unstoppable! 🦠",
                "Phenomenal work! Your knowledge is as strong as end-to-end encryption. 🔒",
                "Your skills are a force of nature in the digital battlefield. 🌪️",
                "You're unstoppable! Keep shining! 🌟",
                "Perfect score! You're a genius! 🏆",
                "Outstanding! You aced it! 💯"
            ];
            upliftingMessage = messages[Math.floor(Math.random() * messages.length)];
        } else if (correctCount >= 8) {
            const messages = [
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
                "Great progress! You’re closer to mastery than you think. 🌈",
                "You're doing well! Keep sharpening those skills. 🛡️",
                "Good effort! A little persistence will take you a long way. 🔑",
                "Your progress is impressive—just keep pushing forward! 🚀",
                "Amazing progress! 🎉",
                "You're doing fantastic! Keep it up! 🚀",
                "So close to perfection! Great work! 🌟"
            ];
            upliftingMessage = messages[Math.floor(Math.random() * messages.length)];
        } else if (correctCount >= 6) {
            const messages = [
                "Great work! You're stacking knowledge like building blocks. 🧱",
                "You're so close! Just a few more tries, and you'll nail it. 🎯",
                "Well done! Every step forward is a step toward greatness. 🥂",
                "You're making strides! Keep up the fantastic work. 🌟",
                "Strong effort! Your skills are growing stronger every day. 💪",
                "You're doing great! Just a little more consistency, and you’ll get there. 📘",
                "Well done! The journey is long, but you’re walking it with confidence. 🌄",
                "You’re picking up momentum—keep going, and you’ll crush it soon. 🏋️",
                "Good work! Each attempt gets you closer to becoming a cybersecurity pro. 💻",
                "Your dedication is showing. Keep at it, and you'll shine! 💡",
                "Great effort! You're only a few steps away from excellence. 🎉",
                "You're doing fantastic! Keep building those skills. 📐",
                "Awesome progress! A bit more practice, and you’ll hit the bullseye. 🎯",
                "You’re growing into a strong cybersecurity enthusiast. Keep it up! 🔒",
                "Good work! You're developing some solid skills. Keep them sharp! ✨",
                "Your focus and effort are paying off. Keep pushing forward! 🚀",
                "Impressive work! You're well on your way to mastering this. 🏆",
                "Good job! You’re laying down the foundation for success. 🏗️",
                "You’re progressing at a steady pace. Stay consistent! 📈",
                "Great effort! You're building a strong cybersecurity toolkit. 🛠️",
                "You're learning fast—keep up the good work! ⚡",
                "You're improving! Just a little more effort, and you’ll get there. 🛡️",
                "You're making solid progress. Stay determined! 🌟",
                "Your persistence is inspiring. Keep working at it! ✨",
                "Well done! The skills you’re learning now will stick with you. 🌍",
                "Good progress! Just a few more tweaks, and you'll master it. 🏆",
                "Great job! Keep going! 💪",
                "You're improving with every step! 👏",
                "Good effort! Stay consistent! 🔥"
            ];
            upliftingMessage = messages[Math.floor(Math.random() * messages.length)];
        } else {
            const messages = [
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
                "Every journey starts with a single step. You’re making progress! 👣",
                "Remember, the hardest climbs lead to the best views. 🏔️",
                "You're building resilience. Every mistake is a lesson learned! 📚",
                "Don't stop now! You're closer to success than you think. ✨",
                "Every attempt brings you closer to your goal. Keep going! 💡",
                "Success is a staircase, not an elevator. You’re climbing steadily! 🚶",
                "It’s okay to fall; just remember to get back up stronger. 💪",
                "Think of each attempt as a step toward mastery. You're on your way! 🎯",
                "Every failure is just another step toward success. Keep at it! 🛠️",
                "You’re in the learning phase, and that’s where greatness begins. 🌟",
                "Setbacks are just setups for comebacks. You've got this! 🔄",
                "Cybersecurity is a marathon, not a sprint. Keep pacing yourself! 🏃",
                "With every answer, you’re debugging your future success. 🔍",
                "Don’t let this stop you. Your persistence is your greatest asset. 🚀",
                "You’re gaining experience points with every try. Level up! 🎮",
                "Small steps lead to big progress. Stay the course! 🗺️",
                "Your effort now will pay off big-time later. Keep it up! 🌟",
                "The best hackers learn from their mistakes. You're in good company! 💻",
                "Each challenge makes you stronger. Keep going! 💥",
                "You're in training for greatness. Don’t stop now! 🥋",
                "Your determination is your superpower. Keep using it! ⚡",
                "You're building skills that will last a lifetime. Don’t give up! 🌐",
                "The road to mastery is paved with practice. Keep traveling it! 🛤️",
                "Great things take time. You’re getting there! 🕒",
                "Even the best started as beginners. You’re in good company! 💼",
                "Failures are lessons in disguise. Embrace them! 📘",
                "You’re crafting your own cybersecurity success story. 📖",
                "Keep practicing—your future self will thank you! 🙌",
                "You’re proving that effort is the key to success. Keep at it! 🔑",
                "Stay curious, keep learning, and you’ll get there! 🔍",
                "Every mistake is proof you’re trying. Keep it up! 🎯",
                "Persistence is your greatest ally. Don’t give up! 💪",
                "You’re closer to your goal than you were yesterday. Keep going! 🌅",
                "Don't give up! 🌟",
                "Every attempt brings progress! 🌈",
                "Failure is the first step to success! 💡"
            ];
            upliftingMessage = messages[Math.floor(Math.random() * messages.length)];
        }

        quizContainer.innerHTML = ''; // Clear the quiz content

        resultContainer.innerHTML = `
            <p>${isWin ? 'Congratulations! You completed the quiz.' : 'Quiz Over!'}</p>
            ${message ? `<p>${message}</p>` : ''}
            <p>Total time: ${totalTime} seconds</p>
            <p>You answered ${correctCount} question(s) correctly.</p>
            <p>${upliftingMessage}</p>
            <button id="toggle-log">Show Answer Log</button>
            <div id="answer-log" style="display: none;">
    <h3>Answer Log:</h3>
    <ul>
        ${answerLog.map((log, index) => `
            <li>
                <strong>${index + 1}. Q:</strong> ${log.question}<br>
                <strong>Your Answer:</strong> ${log.userAnswer}<br>
                <strong>Correct Answer:</strong> ${log.correctAnswer}<br>
                <strong>Status:</strong> <span class="${log.isCorrect ? 'correct' : 'incorrect'}">
                    ${log.isCorrect ? 'Correct ✅' : 'Incorrect ❌'}
                </span>
            </li>
        `).join('')}
    </ul>
</div>

            <button id="try-again">Try Again</button>
        `;

        const toggleLogButton = document.getElementById('toggle-log');
        const answerLogDiv = document.getElementById('answer-log');
        toggleLogButton.addEventListener('click', () => {
            const isLogVisible = answerLogDiv.style.display === 'block';
            answerLogDiv.style.display = isLogVisible ? 'none' : 'block';
            toggleLogButton.textContent = isLogVisible ? 'Show Answer Log' : 'Hide Answer Log';
        });

        const tryAgainButton = document.getElementById('try-again');
        tryAgainButton.addEventListener('click', startQuiz);
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        themeButton.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    }


    function toggleChangelog() {
        changelog.style.display = changelog.style.display === 'none' ? 'block' : 'none';
        viewChangelogButton.textContent = changelog.style.display === 'none' ? 'View Changelog' : 'Hide Changelog';
    }

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }
});
