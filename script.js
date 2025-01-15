document.addEventListener('DOMContentLoaded', () => {
    const startQuizButton = document.getElementById('start-quiz');
    const submitQuizButton = document.getElementById('submit-quiz');
    const themeButton = document.getElementById('theme-button');
    const viewChangelogButton = document.getElementById('view-changelog');
    const changelog = document.getElementById('changelog');
    let isDarkMode = false;
    let quizStarted = false; // Tracks the quiz state

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
        themeButton.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                themeButton.textContent = 'Switch to Light Mode';
            } else {
                document.body.classList.remove('dark-mode');
                themeButton.textContent = 'Switch to Dark Mode';
            }
        });
    }

    // Changelog Interactivity
    if (viewChangelogButton && changelog) {
        viewChangelogButton.addEventListener('click', () => {
            if (changelog.style.display === 'none') {
                changelog.style.display = 'block';
                viewChangelogButton.textContent = 'Hide Changelog';
            } else {
                changelog.style.display = 'none';
                viewChangelogButton.textContent = 'View Changelog';
            }
        });
    } else {
        console.error('Changelog elements not found.');
    }
});

function startQuiz() {
    const category = document.getElementById('category').value.replace(/ /g, '_');
    const difficulty = document.getElementById('difficulty').value;

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = ''; // Clear previous results

    fetchQuestions(category, difficulty);
}

function fetchQuestions(category, difficulty) {
    const baseFileName = `${category}_${difficulty}`;
    const filePathTemplate = `./questions/${baseFileName}_part_`;
    let part = 1;
    let allQuestions = [];

    function loadNextPart() {
        const filePath = `${filePathTemplate}${part}.json`;
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    console.log(`No more parts found: ${filePath}`); // Friendly message
                    throw new Error('No more parts');
                }
                return response.json();
            })
            .then(data => {
                allQuestions = allQuestions.concat(data);
                part++;
                loadNextPart(); // Load the next part
            })
            .catch(() => {
                // No more parts to load
                if (allQuestions.length === 0) {
                    console.error('No questions loaded. Please check your files.');
                } else {
                    displayQuestions(getRandomQuestions(allQuestions, 10));
                    window.quizData = allQuestions;
                }
            });
    

    }

    loadNextPart(); // Start loading files
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
            "Great progress! You’re closer to mastery than you think. 🌈",
            "You're doing well! Keep sharpening those skills. 🛡️",
            "Good effort! A little persistence will take you a long way. 🔑",
            "Your progress is impressive—just keep pushing forward! 🚀",
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
