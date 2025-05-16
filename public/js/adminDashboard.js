document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding pane
            const paneId = `${this.dataset.tab}-pane`;
            document.getElementById(paneId).classList.add('active');
        });
    });
    
    // Role select change handler
    const roleSelects = document.querySelectorAll('.role-select');
    roleSelects.forEach(select => {
        select.addEventListener('change', function() {
            const userId = this.dataset.userId;
            const newRole = this.value;
            
            // Show confirmation for admin role change
            if (newRole === 'admin') {
                if (!confirm('Are you sure you want to give this user admin privileges?')) {
                    // Reset to previous value if canceled
                    this.value = this.dataset.originalRole || 'user';
                    return;
                }
            }
            
            // Save the original role for potential reset
            this.dataset.originalRole = this.value;
            
            // Update user role via API
            fetch('/api/admin/user/role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, role: newRole }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update user role');
                }
                return response.json();
            })
            .then(data => {
                showNotification('User role updated successfully');
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to update user role', 'error');
                // Reset to original value
                this.value = this.dataset.originalRole || 'user';
            });
        });
    });
    
    // User edit button handler
    const editUserBtns = document.querySelectorAll('.edit-btn[data-user-id]');
    const userEditModal = document.getElementById('user-edit-modal');
    
    editUserBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            
            // Fetch user data from the server
            fetch(`/api/admin/user/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                return response.json();
            })
            .then(userData => {
                // Populate the form
                document.getElementById('edit-user-id').value = userData.id;
                document.getElementById('edit-user-name').value = userData.name;
                document.getElementById('edit-user-email').value = userData.email;
                document.getElementById('edit-user-role').value = userData.role;
                document.getElementById('edit-user-status').value = userData.active ? 'active' : 'inactive';
                
                // Show the modal
                userEditModal.style.display = 'flex';
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to fetch user data', 'error');
            });
        });
    });

    // View user button handler
    const viewUserBtns = document.querySelectorAll('.view-btn[data-user-id]');
    viewUserBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            window.location.href = `/profile/${userId}`;
        });
    });
    
    // Delete user button handler
    const deleteUserBtns = document.querySelectorAll('.delete-btn[data-user-id]');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const deleteConfirmBtn = document.getElementById('confirm-delete-btn');
    const deleteConfirmMessage = document.getElementById('delete-confirm-message');
    
    deleteUserBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            const row = this.closest('tr');
            const userName = row.querySelector('.user-cell').textContent.trim();
            
            // Set up confirmation modal
            deleteConfirmMessage.textContent = `Are you sure you want to delete the user "${userName}"? All their quizzes will also be deleted. This action cannot be undone.`;
            
            // Set up confirm button
            deleteConfirmBtn.onclick = function() {
                // Delete user via API
                fetch(`/api/admin/user/${userId}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete user');
                    }
                    return response.json();
                })
                .then(data => {
                    showNotification('User deleted successfully');
                    deleteConfirmModal.style.display = 'none';
                    
                    // Remove the row from the table
                    row.remove();
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Failed to delete user', 'error');
                });
            };
            
            // Show modal
            deleteConfirmModal.style.display = 'flex';
        });
    });
    
    // Quiz view/edit/delete handlers
    const quizViewBtns = document.querySelectorAll('.view-btn[data-quiz-id]');
    const quizEditBtns = document.querySelectorAll('.edit-btn[data-quiz-id]');
    const quizDeleteBtns = document.querySelectorAll('.delete-btn[data-quiz-id]');
    
    quizViewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const quizId = this.dataset.quizId;
            window.location.href = `/quiz/${quizId}`;
        });
    });
    
    quizEditBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const quizId = this.dataset.quizId;
            window.location.href = `/quiz/edit/${quizId}`;
        });
    });
    
    quizDeleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const quizId = this.dataset.quizId;
            const row = this.closest('tr');
            const quizTitle = row.querySelector('td:first-child').textContent.trim();
            
            // Set up confirmation modal
            deleteConfirmMessage.textContent = `Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`;
            
            // Set up confirm button
            deleteConfirmBtn.onclick = function() {
                // Delete quiz via API
                fetch(`/api/admin/quiz/${quizId}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete quiz');
                    }
                    return response.json();
                })
                .then(data => {
                    showNotification('Quiz deleted successfully');
                    deleteConfirmModal.style.display = 'none';
                    
                    // Remove the row from the table
                    row.remove();
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Failed to delete quiz', 'error');
                });
            };
            
            // Show modal
            deleteConfirmModal.style.display = 'flex';
        });
    });
    
    // Form submissions
    const adminForms = document.querySelectorAll('.admin-form');
    adminForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => data[key] = value);
            
            // Send data to server (specific endpoint depends on the form)
            fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save settings');
                }
                return response.json();
            })
            .then(data => {
                showNotification('Settings saved successfully');
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to save settings', 'error');
            });
        });
    });
    
    // Refresh stats button
    const refreshStatsBtn = document.getElementById('refreshStats');
    if (refreshStatsBtn) {
        refreshStatsBtn.addEventListener('click', function() {
            this.disabled = true;
            
            // Add spinning animation
            const icon = this.querySelector('i');
            icon.classList.add('fa-spin');
            
            // Refresh stats via API
            fetch('/api/admin/stats')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to refresh stats');
                }
                return response.json();
            })
            .then(stats => {
                // Update stats with new data
                document.getElementById('total-users').textContent = stats.totalUsers;
                document.getElementById('total-quizzes').textContent = stats.totalQuizzes;
                document.getElementById('active-users').textContent = stats.activeUsers;
                document.getElementById('admin-users').textContent = stats.adminUsers;
                
                // Remove spinning and enable button
                icon.classList.remove('fa-spin');
                this.disabled = false;
                
                showNotification('Statistics refreshed successfully');
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to refresh stats', 'error');
                
                // Remove spinning and enable button
                icon.classList.remove('fa-spin');
                this.disabled = false;
            });
        });
    }
    
    // Close modal buttons
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Find the parent modal and close it
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Helper function to show notifications
    window.showNotification = function(message, type = 'success') {
        // Check if notification container exists, create if not
        let notifContainer = document.querySelector('.notification-container');
        if (!notifContainer) {
            notifContainer = document.createElement('div');
            notifContainer.className = 'notification-container';
            document.body.appendChild(notifContainer);
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notifContainer.appendChild(notification);
        
        // Auto-remove after 3.5 seconds
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3500);
    };
    
    // Search filter functionality
    const userSearch = document.querySelector('#users-pane .admin-search');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#users-pane tbody tr');
            
            rows.forEach(row => {
                const name = row.querySelector('.user-cell').textContent.toLowerCase();
                const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                
                if (name.includes(query) || email.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    const quizSearch = document.querySelector('#quizzes-pane .admin-search');
    if (quizSearch) {
        quizSearch.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#quizzes-pane tbody tr');
            
            rows.forEach(row => {
                const title = row.querySelector('td:first-child').textContent.toLowerCase();
                const category = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const creator = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
                
                if (title.includes(query) || category.includes(query) || creator.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // User filter functionality
    const userFilter = document.querySelector('#users-pane .admin-filter');
    if (userFilter) {
        userFilter.addEventListener('change', function() {
            const role = this.value;
            const rows = document.querySelectorAll('#users-pane tbody tr');
            
            rows.forEach(row => {
                const userRole = row.querySelector('td:nth-child(3) select').value;
                
                if (role === 'all' || userRole === role) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Quiz filter functionality
    const quizFilter = document.querySelector('#quizzes-pane .admin-filter');
    if (quizFilter) {
        quizFilter.addEventListener('change', function() {
            const category = this.value;
            const rows = document.querySelectorAll('#quizzes-pane tbody tr');
            
            rows.forEach(row => {
                const quizCategory = row.querySelector('td:nth-child(2) span').textContent.toLowerCase();
                
                if (category === 'all' || quizCategory === category) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Add any interactive functionality here
    
    // Example: Add smooth scrolling to action cards
    const actionCards = document.querySelectorAll('.admin-action-card');
    actionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle animation if needed
        });
    });
    
    // Fade in cards on page load
    const cards = document.querySelectorAll('.admin-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
        }, 100 * index);
    });
});