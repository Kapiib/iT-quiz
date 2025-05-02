document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('quizSearch');
    const quizCards = document.querySelectorAll('.quiz-card');
    
    if (searchInput && quizCards) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            quizCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(query) || description.includes(query)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});