// Get quiz data from the data attribute
const quizDataElement = document.getElementById('quiz-data');
const quizData = JSON.parse(decodeURIComponent(quizDataElement.dataset.quiz));

document.addEventListener('DOMContentLoaded', function() {
    // Quiz state variables
    let currentQuestionIndex = 0;
    let score = 0;
    let timer = null;
    let timeLeft = 0;
    
    // DOM elements
    const startScreen = document.getElementById('start-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultsScreen = document.getElementById('results-screen');
    const startButton = document.getElementById('start-quiz');
    const restartButton = document.getElementById('restart-quiz');
    const questionText = document.getElementById('question-text');
    const optionsList = document.getElementById('options-list');
    const currentQuestionDisplay = document.getElementById('current-question');
    const timeRemainingDisplay = document.getElementById('time-remaining');
    const finalScoreDisplay = document.getElementById('final-score');
    const scorePercentDisplay = document.getElementById('score-percent');
    const timerFill = document.querySelector('.timer-fill');
    const progressFill = document.querySelector('.progress-fill');
    
    // Event listeners
    startButton.addEventListener('click', startQuiz);
    restartButton.addEventListener('click', startQuiz);
    
    // Start the quiz
    function startQuiz() {
        // Reset state
        currentQuestionIndex = 0;
        score = 0;
        
        // Show question screen, hide others
        startScreen.classList.remove('active');
        resultsScreen.classList.remove('active');
        questionScreen.classList.add('active');
        
        // Load first question
        loadQuestion(currentQuestionIndex);
        
        // Update progress bar
        updateProgress();
    }
    
    // Load a question
    function loadQuestion(index) {
        // Get current question
        const question = quizData.questions[index];
        
        // Set question text
        questionText.textContent = question.question;
        
        // Update question number display
        currentQuestionDisplay.textContent = index + 1;
        
        // Clear previous options
        optionsList.innerHTML = '';
        
        // Add options
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option.text;
            optionElement.dataset.index = optionIndex;
            optionElement.addEventListener('click', () => selectOption(optionIndex));
            optionsList.appendChild(optionElement);
        });
        
        // Set and start timer
        timeLeft = question.timeLimit || 30;
        timeRemainingDisplay.textContent = timeLeft;
        
        // Reset timer bar
        timerFill.style.width = '100%';
        
        // Clear previous timer
        if (timer) clearInterval(timer);
        
        // Start new timer
        timer = setInterval(() => {
            timeLeft--;
            timeRemainingDisplay.textContent = timeLeft;
            
            // Update timer bar
            const percentage = (timeLeft / (question.timeLimit || 30)) * 100;
            timerFill.style.width = `${percentage}%`;
            
            if (timeLeft <= 5) {
                timerFill.classList.add('low-time');
            } else {
                timerFill.classList.remove('low-time');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                moveToNextQuestion();
            }
        }, 1000);
    }
    
    // Handle option selection
    function selectOption(optionIndex) {
        clearInterval(timer);
        
        const question = quizData.questions[currentQuestionIndex];
        const selectedOption = question.options[optionIndex];
        
        // Highlight options
        const optionElements = optionsList.querySelectorAll('.option');
        
        optionElements.forEach((element, index) => {
            if (index === optionIndex) {
                element.classList.add('selected');
            }
            
            if (question.options[index].isCorrect) {
                element.classList.add('correct');
            } else if (index === optionIndex) {
                element.classList.add('incorrect');
            }
        });
        
        // Update score if correct
        if (selectedOption.isCorrect) {
            score++;
        }
        
        // Move to next question after delay
        setTimeout(moveToNextQuestion, 1500);
    }
    
    // Move to the next question or end quiz
    function moveToNextQuestion() {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < quizData.questions.length) {
            loadQuestion(currentQuestionIndex);
            updateProgress();
        } else {
            endQuiz();
        }
    }
    
    // Update progress bar
    function updateProgress() {
        const percentage = (currentQuestionIndex / quizData.questions.length) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    // End the quiz and show results
    function endQuiz() {
        // Hide question screen, show results
        questionScreen.classList.remove('active');
        resultsScreen.classList.add('active');
        
        // Update score displays
        finalScoreDisplay.textContent = score;
        const percentage = Math.round((score / quizData.questions.length) * 100);
        scorePercentDisplay.textContent = percentage;
        
        // Clear any running timer
        if (timer) clearInterval(timer);
    }
});