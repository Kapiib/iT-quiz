document.addEventListener('DOMContentLoaded', function() {
    // Get all password toggle elements
    const toggles = document.querySelectorAll('.password-toggle');
    
    // Add click event listener to each toggle
    toggles.forEach(toggle => {
        // Set initial image
        toggle.innerHTML = '<img src="/img/hide.png" alt="Show password">';
        
        toggle.addEventListener('click', function() {
            // Find the password input field
            const passwordField = this.previousElementSibling;
            
            // Toggle between password and text type
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                this.innerHTML = '<img src="/img/visible.png" alt="Hide password">';
                this.title = 'Hide password';
            } else {
                passwordField.type = 'password';
                this.innerHTML = '<img src="/img/hide.png" alt="Show password">';
                this.title = 'Show password';
            }
        });
    });
});