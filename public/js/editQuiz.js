document.addEventListener('DOMContentLoaded', function() {
    // Check if we have quiz data and are in edit mode
    if (typeof quizData !== 'undefined') {
        const questionsContainer = document.getElementById('questions-container');
        
        // Clear any automatically added questions (from quizEditor.js)
        questionsContainer.innerHTML = '';
        
        // Load each existing question
        quizData.questions.forEach((question, index) => {
            addExistingQuestion(question, index);
        });
        
        // Update form submission to handle edit case
        document.getElementById('quizForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Use the same question collection logic that's in quizEditor.js
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
            
            // Validation checks
            if (questions.length === 0) {
                alert('Please add at least one question to your quiz.');
                return;
            }
            
            for (let i = 0; i < questions.length; i++) {
                if (!questions[i].question.trim()) {
                    alert(`Question ${i+1} cannot be empty.`);
                    return;
                }
                
                if (questions[i].options.length < 2) {
                    alert(`Question ${i+1} must have at least 2 options.`);
                    return;
                }
                
                if (!questions[i].options.some(option => option.isCorrect)) {
                    alert(`Question ${i+1} must have at least one correct answer.`);
                    return;
                }
            }
            
            // Set the JSON data
            document.getElementById('questionsJSON').value = JSON.stringify(questions);
            
            // Set isPublic based on visibility dropdown
            document.querySelector('input[name="isPublic"]').value = 
                document.getElementById('visibility').value === 'public';
            
            // Submit the form
            this.submit();
        });
    }
    
    // Function to add an existing question with its options
    function addExistingQuestion(questionData, index) {
        const questionCount = index + 1;
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        
        // Create question content with conditional remove button
        questionDiv.innerHTML = `
            ${questionCount > 1 ? '<button type="button" class="remove-question">&times;</button>' : ''}
            <div class="form-group">
                <label>Question ${questionCount}</label>
                <input type="text" class="question-text" placeholder="Enter your question" value="${escapeHtml(questionData.question)}" required>
            </div>
            
            <div class="form-group">
                <label>Time Limit (seconds)</label>
                <input type="number" class="time-limit" min="5" max="120" value="${questionData.timeLimit || 30}" required>
            </div>
            
            <div class="options-container">
                <label>Options</label>
                <!-- Options will be added here -->
            </div>
            
            <button type="button" class="add-option btn add-btn">Add Option</button>
        `;
        
        document.getElementById('questions-container').appendChild(questionDiv);
        
        // Add event listener for remove button
        const removeButton = questionDiv.querySelector('.remove-question');
        if (removeButton) {
            removeButton.addEventListener('click', function() {
                if (document.querySelectorAll('.question-item').length > 1) {
                    questionDiv.remove();
                    updateQuestionNumbers();
                }
            });
        }
        
        // Add options for this question
        const optionsContainer = questionDiv.querySelector('.options-container');
        
        // Add each option
        questionData.options.forEach(option => {
            addExistingOption(optionsContainer, option);
        });
        
        // Set up event listener for adding new options
        questionDiv.querySelector('.add-option').addEventListener('click', function() {
            // Use the regular addOption function from quizEditor.js
            window.addOption(optionsContainer);
        });
    }
    
    // Function to add an existing option
    function addExistingOption(container, optionData) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        
        // Create option HTML
        optionDiv.innerHTML = `
            <input type="text" class="option-text" placeholder="Option text" value="${escapeHtml(optionData.text)}" required>
            <div class="is-correct-container">
                <label class="is-correct-label">
                    <input type="checkbox" class="is-correct" ${optionData.isCorrect ? 'checked' : ''}>
                    <span class="correct-circle"></span>
                </label>
            </div>
            <button type="button" class="remove-option">&times;</button>
        `;
        
        container.appendChild(optionDiv);
        
        // Add event listener for remove button
        const removeButton = optionDiv.querySelector('.remove-option');
        removeButton.addEventListener('click', function() {
            if (container.querySelectorAll('.option-item').length > 2) {
                optionDiv.remove();
            } else {
                alert('Each question must have at least 2 options.');
            }
        });
    }
    
    // Helper function to escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Helper function to update question numbers
    function updateQuestionNumbers() {
        const questions = document.querySelectorAll('.question-item');
        questions.forEach((question, index) => {
            const label = question.querySelector('.form-group label');
            if (label && label.textContent.includes('Question')) {
                label.textContent = `Question ${index + 1}`;
            }
            
            const removeBtn = question.querySelector('.remove-question');
            if (index === 0) {
                if (removeBtn) removeBtn.style.display = 'none';
            } else {
                if (removeBtn) removeBtn.style.display = 'block';
            }
        });
    }
});