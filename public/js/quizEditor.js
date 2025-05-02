document.addEventListener('DOMContentLoaded', function() {
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('addQuestion');
    const quizForm = document.getElementById('quizForm');
    const questionsJSON = document.getElementById('questionsJSON');
    
    let questionCount = 0;
    
    // Add initial question
    addQuestion();
    
    // Add question button click handler
    addQuestionBtn.addEventListener('click', addQuestion);
    
    // Form submit handler
    quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect all questions and options
        const questions = [];
        
        document.querySelectorAll('.question-item').forEach(questionItem => {
            const questionText = questionItem.querySelector('.question-text').value;
            const options = [];
            
            questionItem.querySelectorAll('.option-item').forEach(optionItem => {
                const optionText = optionItem.querySelector('.option-text').value;
                const isCorrect = optionItem.querySelector('.is-correct').checked;
                
                options.push({
                    text: optionText,
                    isCorrect: isCorrect
                });
            });
            
            const timeLimit = parseInt(questionItem.querySelector('.time-limit').value) || 30;
            
            questions.push({
                question: questionText,
                options: options,
                timeLimit: timeLimit
            });
        });
        
        // Check if there's at least one question
        if (questions.length === 0) {
            alert('Please add at least one question to your quiz.');
            return;
        }
        
        // Check if each question has a text
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].question.trim()) {
                alert(`Question ${i+1} cannot be empty.`);
                return;
            }
            
            // Check if each question has at least 2 options
            if (questions[i].options.length < 2) {
                alert(`Question ${i+1} must have at least 2 options.`);
                return;
            }
            
            // Check if each question has at least one correct answer
            if (!questions[i].options.some(option => option.isCorrect)) {
                alert(`Question ${i+1} must have at least one correct answer.`);
                return;
            }
        }
        
        // Set the JSON data
        questionsJSON.value = JSON.stringify(questions);
        
        // Submit the form
        quizForm.submit();
    });
    
    // Function to add a new question
    function addQuestion() {
        questionCount++;
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <button type="button" class="remove-question">&times;</button>
            <div class="form-group">
                <label>Question ${questionCount}</label>
                <input type="text" class="question-text" placeholder="Enter your question" required>
            </div>
            
            <div class="form-group">
                <label>Time Limit (seconds)</label>
                <input type="number" class="time-limit" min="5" max="120" value="30" required>
            </div>
            
            <div class="options-container">
                <label>Options</label>
                <!-- Options will be added here -->
            </div>
            
            <button type="button" class="add-option btn secondary-btn">Add Option</button>
        `;
        
        questionsContainer.appendChild(questionDiv);
        
        // Add initial options (minimum 2)
        const optionsContainer = questionDiv.querySelector('.options-container');
        addOption(optionsContainer);
        addOption(optionsContainer);
        
        // Set up event listeners
        questionDiv.querySelector('.remove-question').addEventListener('click', function() {
            if (document.querySelectorAll('.question-item').length > 1) {
                questionDiv.remove();
            } else {
                alert('You need at least one question in your quiz.');
            }
        });
        
        questionDiv.querySelector('.add-option').addEventListener('click', function() {
            addOption(optionsContainer);
        });
    }
    
    // Function to add a new option to a question
    function addOption(container) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        optionDiv.innerHTML = `
            <input type="text" class="option-text" placeholder="Option text" required>
            <label>
                <input type="checkbox" class="is-correct"> Correct
            </label>
            <button type="button" class="remove-option">&times;</button>
        `;
        
        container.appendChild(optionDiv);
        
        // Set up remove option button
        optionDiv.querySelector('.remove-option').addEventListener('click', function() {
            if (container.querySelectorAll('.option-item').length > 2) {
                optionDiv.remove();
            } else {
                alert('Each question must have at least 2 options.');
            }
        });
    }
});