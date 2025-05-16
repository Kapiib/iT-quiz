document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.quiz-card, .home-quizzes .quiz-card').forEach(card => {
    // Set data-category attribute
    const categorySpan = card.querySelector('.category-name, .quiz-meta span:first-child');
    if (categorySpan) {
      const category = categorySpan.textContent.trim().toLowerCase() || 'general';
      card.setAttribute('data-category', category);
    } else {
      card.setAttribute('data-category', 'general');
    }
    
    // Set data-questions attribute for the count badge
    const questionMeta = card.querySelector('.quiz-meta span:nth-child(2)');
    const title = card.querySelector('h3');
    
    if (questionMeta && title) {
      const count = questionMeta.textContent.match(/\d+/)[0];
      title.setAttribute('data-questions', count);
    }
  });
});