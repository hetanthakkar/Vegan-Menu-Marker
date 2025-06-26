// Vegan Menu Marker for Google Maps - Content Script (Fixed)

(function() {
  'use strict';

  let isEnabled = true;
  
  // Load extension state
  chrome.storage.sync.get(['veganMarkingEnabled'], function(result) {
    isEnabled = result.veganMarkingEnabled !== false;
    if (isEnabled) {
      initVeganMarker();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleVeganMarking') {
      isEnabled = request.enabled;
      if (isEnabled) {
        initVeganMarker();
      } else {
        removeVeganMarks();
      }
    }
  });

  function initVeganMarker() {
    // Curated list of non-vegan ingredients
    const animalKeywords = [
      // E-numbers
      /\bE120\b/i, /\bE322\b/i, /\bE422\b/i, /\bE471\b/i, /\bE542\b/i, /\bE631\b/i, /\bE901\b/i, /\bE904\b/i,
      // Dairy and eggs
      /\bcheese\b/i, /\bfeta\b/i, /\bmozzarella\b/i, /\bcheddar\b/i, /\bparmesan\b/i, /\bgouda\b/i, /\bbrie\b/i, 
      /\bcamembert\b/i, /\bblue cheese\b/i, /\bgoat cheese\b/i, /\bmilk\b/i, /\bcream\b/i, /\bbutter\b/i, 
      /\byogurt\b/i, /\bghee\b/i, /\bpaneer\b/i, /\bricotta\b/i, /\bmascarpone\b/i, /\bsour cream\b/i, 
      /\bcottage cheese\b/i, /\bcurds\b/i, /\begg?\b/i, /\beggs?\b/i, /\bmayonnaise\b/i, /\baioli\b/i,
      // Meat and poultry
      /\bmeat\b/i, /\bbeef\b/i, /\bpork\b/i, /\bchicken\b/i, /\bturkey\b/i, /\blamb\b/i, /\bduck\b/i, 
      /\bveal\b/i, /\bbacon\b/i, /\bsausage\b/i, /\bham\b/i, /\bprosciutto\b/i, /\bsalami\b/i, /\bchorizo\b/i, 
      /\bpepperoni\b/i, /\bmeatballs?\b/i, /\bsteak\b/i, /\bribs\b/i, /\bbrisket\b/i,
      // Seafood
      /\bfish\b/i, /\bsalmon\b/i, /\btuna\b/i, /\bshrimp\b/i, /\bprawn\b/i, /\bcrab\b/i, /\blobster\b/i, 
      /\boyster\b/i, /\banchovy\b/i, /\bsardine\b/i, /\bcalamari\b/i, /\bscallop\b/i, /\bmussel\b/i, 
      /\beel\b/i, /\bcaviar\b/i,
      // Other animal products
      /\bgelatin\b/i, /\bhoney\b/i, /\bwhey\b/i, /\bcasein\b/i, /\blactose\b/i, /\blard\b/i, /\brennet\b/i,
      /\bfish sauce\b/i, /\boyster sauce\b/i, /\banchovy paste\b/i, /\bchicken broth\b/i, /\bbeef broth\b/i
    ];

    // Allowlist for vegan substitutes to avoid false positives
    const veganAllowlist = [
      /\bvegan cheese\b/i, /\bvegan meat\b/i, /\bvegan sausage\b/i, /\bvegan chicken\b/i, /\bvegan "chicken"\b/i,
      /\bvegan beef\b/i, /\bvegan "beef"\b/i, /\bvegan pork\b/i, /\bvegan "pork"\b/i, /\bvegan turkey\b/i,
      /\bvegan fish\b/i, /\bvegan "fish"\b/i, /\bvegan shrimp\b/i, /\bvegan "shrimp"\b/i,
      /\bseitan\b/i, /\btofu\b/i, /\btempeh\b/i, /\bplant-based\b/i, /\bbeyond meat\b/i, /\bimpossible\b/i, 
      /\bjackfruit\b/i, /\bnutritional yeast\b/i, /\bcoconut milk\b/i, /\balmond milk\b/i, /\bsoy milk\b/i, 
      /\boat milk\b/i, /\bcashew cream\b/i, /\bdaring brand\b/i
    ];

    function containsAnimalIngredient(text) {
      if (!text) return false;
      const lower = text.toLowerCase();
      
      // First check if the text contains explicit vegan substitutes
      const hasVeganSubstitute = veganAllowlist.some(rx => rx.test(lower));
      
      if (hasVeganSubstitute) {
        // If vegan substitutes are explicitly mentioned, we assume it's vegan
        // unless there are other clear animal ingredients not covered by substitutes
        
        // Create a copy of text and remove vegan substitute phrases
        let remainingText = lower;
        veganAllowlist.forEach(rx => {
          remainingText = remainingText.replace(rx, ' ');
        });
        
        // Check if remaining text still contains animal ingredients
        return animalKeywords.some(rx => rx.test(remainingText));
      }
      
      // If no explicit vegan substitutes mentioned, check for animal ingredients normally
      return animalKeywords.some(rx => rx.test(lower));
    }

    function markVeganDishes() {
      console.log("marking vegan dishes");
      if (!isEnabled) return;

      // Google Maps menu item selectors
      const dishContainers = document.querySelectorAll('span.jI4Erf, div[data-item-id]');
      
      dishContainers.forEach(container => {
        const nameElem = container.querySelector('div.gq9CCd, h3, .fontHeadlineSmall') || 
                        container.querySelector('[role="heading"]');
        
        // Check both hidden full description and visible truncated description
        const fullDescElem = container.querySelector('div.LvL5Ne span.lum-fi-dl[style*="display:none"], div.LvL5Ne span.lum-fi-dl');
        const visibleDescElem = container.querySelector('div.LvL5Ne span.lum-fi-ds, div.LvL5Ne span.lum-fi-dl:not([style*="display:none"])') ||
                               container.querySelector('.fontBodyMedium, p') ||
                               container.querySelector('span:not([role="heading"])');
        
        if (!nameElem) return;

        const name = nameElem.textContent || '';
        
        // Check both full and visible descriptions
        let fullDesc = '';
        let visibleDesc = '';
        
        if (fullDescElem) {
          fullDesc = fullDescElem.textContent || '';
        }
        
        if (visibleDescElem && visibleDescElem !== fullDescElem) {
          visibleDesc = visibleDescElem.textContent || '';
        }
        
        // Combine all text for checking
        const combinedText = `${name} ${fullDesc} ${visibleDesc}`.trim();
        
        // Only check items that have actual ingredient/description information
        const hasIngredientInfo = fullDesc.length > 0 || visibleDesc.length > 0;
        
        // Only add 🌱 if:
        // 1. There is ingredient information available
        // 2. There are NO non-vegan ingredients in ANY of the text
        if (hasIngredientInfo && !containsAnimalIngredient(combinedText)) {
          if (!nameElem.textContent.includes('🌱')) {
            nameElem.textContent += ' 🌱';
            nameElem.setAttribute('data-vegan-marked', 'true');
          }
        }
      });
    }

    function removeVeganMarks() {
      const markedElements = document.querySelectorAll('[data-vegan-marked="true"]');
      markedElements.forEach(element => {
        element.textContent = element.textContent.replace(' 🌱', '');
        element.removeAttribute('data-vegan-marked');
      });
    }

    // Initial run
    markVeganDishes();

    // Observe for dynamic content changes
    const observer = new MutationObserver(() => {
      if (isEnabled) {
        setTimeout(markVeganDishes, 100); // Small delay to ensure DOM is updated
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Store observer reference for cleanup
    window.veganMarkerObserver = observer;
  }

  // Cleanup function
  function removeVeganMarks() {
    const markedElements = document.querySelectorAll('[data-vegan-marked="true"]');
    markedElements.forEach(element => {
      element.textContent = element.textContent.replace(' 🌱', '');
      element.removeAttribute('data-vegan-marked');
    });
    
    // Stop observing
    if (window.veganMarkerObserver) {
      window.veganMarkerObserver.disconnect();
    }
  }
})();