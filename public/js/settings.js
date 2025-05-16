document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const navItems = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Show the corresponding section
            const targetSection = document.getElementById(item.getAttribute('data-target'));
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Password strength meter
    const passwordInput = document.getElementById('newPassword');
    const strengthBar = document.querySelector('.strength-bar');
    
    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            // Calculate strength
            if (password.length >= 8) strength += 1;
            if (password.match(/[A-Z]/)) strength += 1;
            if (password.match(/[0-9]/)) strength += 1;
            if (password.match(/[^A-Za-z0-9]/)) strength += 1;
            
            // Update the strength bar
            strengthBar.className = 'strength-bar';
            strengthBar.style.width = (strength * 25) + '%';
            
            if (strength < 2) {
                strengthBar.classList.add('weak');
            } else if (strength < 4) {
                strengthBar.classList.add('medium');
            } else {
                strengthBar.classList.add('strong');
            }
        });
    }
    
    // Delete account modal
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    const cancelDeleteAccount = document.getElementById('cancel-delete-account');
    
    if (deleteAccountBtn && deleteAccountModal) {
        deleteAccountBtn.addEventListener('click', function() {
            deleteAccountModal.style.display = 'flex';
        });
        
        cancelDeleteAccount.addEventListener('click', function() {
            deleteAccountModal.style.display = 'none';
        });
        
        window.addEventListener('click', function(event) {
            if (event.target === deleteAccountModal) {
                deleteAccountModal.style.display = 'none';
            }
        });
    }

    // Handle profile picture preview
    const fileInput = document.getElementById('profile-pic');
    const currentPicture = document.querySelector('.current-picture');
    const profilePicChanged = document.getElementById('profile-pic-changed');
    
    if (fileInput && currentPicture && profilePicChanged) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                // Mark the profile pic as changed so the backend knows to process it
                profilePicChanged.value = 'true';
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Check if there's already an image in the container
                    let img = currentPicture.querySelector('img');
                    if (!img) {
                        // If there's no image, create one and replace the letter
                        currentPicture.innerHTML = '';
                        img = document.createElement('img');
                        currentPicture.appendChild(img);
                    }
                    img.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
});