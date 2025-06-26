// Popup script for Vegan Menu Marker extension

document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggleSwitch');

    // Get current state from storage
    chrome.storage.sync.get(['veganMarkingEnabled'], function(result) {
        const isEnabled = result.veganMarkingEnabled !== false; // Default to true
        
        if (isEnabled) {
            toggleSwitch.classList.add('active');
        }
    });

    // Handle toggle click
    toggleSwitch.addEventListener('click', function () {
        const newState = !toggleSwitch.classList.contains('active');

        if (newState) {
            toggleSwitch.classList.add('active');
        } else {
            toggleSwitch.classList.remove('active');
        }

        // Save state to storage
        chrome.storage.sync.set({veganMarkingEnabled: newState});

        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].url.includes('google.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleVeganMarking',
                    enabled: newState
                }).catch(error => {
                    // Handle case where content script isn't loaded yet
                    console.log('Content script not ready:', error);
                });
            }
        });
    });

    // Handle feedback button clicks to ensure user gesture
    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    feedbackButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // The mailto link will work now because it's triggered by a user gesture
            window.open(this.href);
        });
    });
});