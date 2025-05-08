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
        
        // Add this line to set isPublic based on the visibility dropdown
        document.querySelector('input[name="isPublic"]').value = 
            document.getElementById('visibility').value === 'public';
        
        // Submit the form
        quizForm.submit();
    });
    
    // Function to add a new question
    function addQuestion() {
        questionCount++;
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        
        // Create question content with conditional remove button
        questionDiv.innerHTML = `
            ${questionCount > 1 ? '<button type="button" class="remove-question">&times;</button>' : ''}
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
            
            <button type="button" class="add-option btn add-btn">Add Option</button>
        `;
        
        questionsContainer.appendChild(questionDiv);
        
        // Add event listener for remove button only if it exists
        const removeButton = questionDiv.querySelector('.remove-question');
        if (removeButton) {
            removeButton.addEventListener('click', function() {
                if (document.querySelectorAll('.question-item').length > 1) {
                    questionDiv.remove();
                    updateQuestionNumbers(); // Add this function to update numbering
                }
            });
        }
        
        // Add initial options (minimum 2)
        const optionsContainer = questionDiv.querySelector('.options-container');
        addOption(optionsContainer, true);  // First option is initial
        addOption(optionsContainer, true);  // Second option is initial
        
        // Set up event listeners
        questionDiv.querySelector('.add-option').addEventListener('click', function() {
            addOption(optionsContainer);
        });
    }
    
    // Updated addOption function that correctly handles initial options
    function addOption(container, isInitial = false) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        
        // Mark initial options with a data attribute for later identification
        if (isInitial) {
            optionDiv.dataset.initial = 'true';
        }
        
        // Use consistent HTML but add a class for initial options
        optionDiv.innerHTML = `
            <input type="text" class="option-text" placeholder="Option text" required>
            <div class="is-correct-container">
                <label class="is-correct-label">
                    <input type="checkbox" class="is-correct">
                    <span class="correct-circle"></span>
                </label>
            </div>
            <button type="button" class="remove-option ${isInitial ? 'hidden-button' : ''}">&times;</button>
        `;
        
        container.appendChild(optionDiv);
        
        // Only add click handler if it's not an initial option
        if (!isInitial) {
            const removeButton = optionDiv.querySelector('.remove-option');
            removeButton.addEventListener('click', function() {
                if (container.querySelectorAll('.option-item').length > 2) {
                    optionDiv.remove();
                } else {
                    alert('Each question must have at least 2 options.');
                }
            });
        }
    }
    
    // Improved function to update option delete buttons visibility
    function updateOptionDeleteButtons(container) {
        const optionItems = container.querySelectorAll('.option-item');
        const totalOptions = optionItems.length;
        
        // Show delete buttons only when we have more than 2 options
        if (totalOptions > 2) {
            // Show all delete buttons when we have more than 2 options
            optionItems.forEach(item => {
                const deleteBtn = item.querySelector('.remove-option');
                deleteBtn.style.display = 'flex';
            });
        } else {
            // Hide all delete buttons when we only have 2 options
            optionItems.forEach(item => {
                const deleteBtn = item.querySelector('.remove-option');
                deleteBtn.style.display = 'none';
            });
        }
    }
    
    // Add this new function to update question numbers and check for first question
    function updateQuestionNumbers() {
        const questions = document.querySelectorAll('.question-item');
        questions.forEach((question, index) => {
            // Update the question number in the label
            const label = question.querySelector('.form-group label');
            if (label && label.textContent.includes('Question')) {
                label.textContent = `Question ${index + 1}`;
            }
            
            // Show/hide remove button based on position
            const removeBtn = question.querySelector('.remove-question');
            if (index === 0) {
                // First question should not have a remove button
                if (removeBtn) removeBtn.style.display = 'none';
            } else {
                // Other questions should have a remove button
                if (removeBtn) removeBtn.style.display = 'block';
            }
        });
    }
});