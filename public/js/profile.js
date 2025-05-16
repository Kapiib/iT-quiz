document.addEventListener('DOMContentLoaded', function() {
    // Delete quiz modal functionality
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    // Function to show the delete modal
    window.showDeleteModal = function(button) {
        const quizId = button.getAttribute('data-quiz-id');
        
        // Set the correct delete URL
        confirmDeleteBtn.href = '/quiz/delete/' + quizId;
        
        // Show modal
        deleteModal.style.display = 'flex';
    };
    
    // Handle cancel button
    if (cancelDeleteBtn) {
        cancelDeleteBtn.onclick = function() {
            deleteModal.style.display = 'none';
        };
    }
    
    // Close when clicking outside the modal
    window.onclick = function(event) {
        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    };
});