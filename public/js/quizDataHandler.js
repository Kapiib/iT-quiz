document.addEventListener('DOMContentLoaded', function() {
    // Extract quiz data from the data attribute
    const quizDataElement = document.getElementById('quiz-data');
    if (quizDataElement) {
        window.quizData = JSON.parse(decodeURIComponent(quizDataElement.dataset.quiz));
    }
});