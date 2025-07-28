/**
 * MOT Trajectory Visualization Animation Enhancement
 * 
 * This script enhances the animation functionality of the MOT trajectory visualization
 * by properly tracking animation frames and ensuring smooth transitions.
 * 
 * Features:
 * - Proper animation frame tracking and cancellation
 * - Robust initialization with periodic checking
 * - Debug console for monitoring animation state
 * - Safe access to global variables
 */

// Create a global variable to track animation frames if it doesn't exist
window.animationFrame = window.animationFrame || null;

// Function to safely access global variables
function safelyGetGlobal(name, defaultValue) {
  return typeof window[name] !== 'undefined' ? window[name] : defaultValue;
}

// Debug logging function
function debugLog(message, data) {
  const debugInfo = document.getElementById('debug-info');
  if (debugInfo) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span style="color:#888">[${timestamp}]</span> ${message}`;
    
    if (data !== undefined) {
      const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
      logEntry.innerHTML += ` <span style="color:#0066cc">${dataStr}</span>`;
    }
    
    debugInfo.appendChild(logEntry);
    debugInfo.scrollTop = debugInfo.scrollHeight;
    
    // Keep only the last 50 log entries
    while (debugInfo.children.length > 50) {
      debugInfo.removeChild(debugInfo.firstChild);
    }
  }
  console.log(message, data);
}

// Show a completion message when animation finishes
function showCompletionMessage() {
  // Create message element if it doesn't exist
  let messageEl = document.getElementById('completion-message');
  
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'completion-message';
    messageEl.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      padding: 15px 25px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-weight: bold;
      font-size: 18px;
      color: #2c3e50;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    `;
    
    const container = document.querySelector('.visualization-container');
    if (container) {
      container.appendChild(messageEl);
    }
  }
  
  // Set message content
  const numObjects = parseInt(document.getElementById('object-count').value) || 5;
  messageEl.textContent = `Completed tracking ${numObjects} objects`;
  
  // Show message with fade-in
  messageEl.style.opacity = '1';
  
  // Hide after 2 seconds
  setTimeout(() => {
    messageEl.style.opacity = '0';
  }, 2000);
}

// Wait for the page to fully load
document.addEventListener("DOMContentLoaded", function() {
  // Check periodically if the visualization has been initialized
  const checkInterval = setInterval(function() {
    // Check if required functions exist
    if (typeof renderTrajectories === 'function' && 
        typeof initVisualization === 'function' && 
        typeof generateTrajectories === 'function') {
      
      clearInterval(checkInterval);
      enhanceVisualization();
    }
  }, 200); // Check every 200ms
  
  // Timeout after 10 seconds to avoid infinite checking
  setTimeout(function() {
    clearInterval(checkInterval);
  }, 10000);
  
  function enhanceVisualization() {
    debugLog("Enhancing MOT visualization animation...");
    
    // Set up debug toggle
    const debugConsole = document.querySelector('.debug-console');
    const debugToggle = document.getElementById('debug-toggle');
    
    if (debugToggle) {
      debugToggle.addEventListener('change', function() {
        debugConsole.style.display = this.checked ? 'block' : 'none';
      });
    }
    
    // Ensure we have a global config object
    window.config = window.config || {
      animationDuration: 5000 // Default 5 seconds if not defined
    };
    
    debugLog("Animation configuration", window.config);
    
    // Replace animation function with enhanced version
    window.animateTrajectories = function() {
      // Cancel any existing animation
      if (window.animationFrame) {
        debugLog("Cancelling existing animation", window.animationFrame);
        cancelAnimationFrame(window.animationFrame);
        window.animationFrame = null;
      }
      
      const startTime = Date.now();
      const animDuration = safelyGetGlobal('config', {}).animationDuration || 5000;
      
      debugLog("Starting animation", { duration: animDuration + "ms" });
      
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animDuration, 1.0);
        
        // Only log every 10% progress to avoid flooding
        if (Math.floor(progress * 10) > Math.floor((elapsed - 16) / animDuration * 10)) {
          debugLog("Animation progress", Math.round(progress * 100) + "%");
        }
        
        window.renderTrajectories(progress);
        
        if (progress < 1.0) {
          window.animationFrame = requestAnimationFrame(animate);
        } else {
          window.animationFrame = null;
          debugLog("Animation complete");
          
          // Show completion message
          showCompletionMessage();
        }
      }
      
      animate();
    };
    
    // Enhance button functionality
    const buttons = {
      'play-btn': function() {
        debugLog("Play button clicked");
        if (window.animationFrame) {
          debugLog("Cancelling existing animation", window.animationFrame);
          cancelAnimationFrame(window.animationFrame);
          window.animationFrame = null;
        }
        window.animateTrajectories();
      },
      'reset-btn': function() {
        debugLog("Reset button clicked");
        if (window.animationFrame) {
          debugLog("Cancelling existing animation", window.animationFrame);
          cancelAnimationFrame(window.animationFrame);
          window.animationFrame = null;
        }
        debugLog("Rendering full trajectories");
        window.renderTrajectories(1.0);
      },
      'update-btn': function() {
        debugLog("Update button clicked");
        if (window.animationFrame) {
          debugLog("Cancelling existing animation", window.animationFrame);
          cancelAnimationFrame(window.animationFrame);
          window.animationFrame = null;
        }
        
        const numObjects = parseInt(document.getElementById("object-count").value) || 5;
        debugLog("Updating visualization", { objectCount: numObjects });
        
        window.currentTrajectoryData = [];
        window.initVisualization();
        window.generateTrajectories();
        window.renderTrajectories(1.0);
      }
    };
    
    // Apply enhanced handlers to buttons
    Object.keys(buttons).forEach(function(id) {
      const button = document.getElementById(id);
      if (button) {
        const originalHandler = button.onclick;
        button.onclick = buttons[id];
      }
    });
    
    console.log("MOT visualization animation enhanced successfully!");
  }
});
