document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle functionality - FIXED
  const sidebar = document.querySelector('.sidebar');
  const contentArea = document.querySelector('.content-area');
  const menuToggle = document.querySelector('.menu-toggle');

  if (menuToggle && sidebar && contentArea) {
    // On desktop, show sidebar by default
    if (window.innerWidth >= 1024) {
      sidebar.classList.add('open');
      contentArea.classList.add('shifted');
    }

    // Toggle sidebar
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      contentArea.classList.toggle('shifted');
    });

    // Close sidebar when clicking outside on mobile/tablet
    document.addEventListener('click', function(e) {
      if (window.innerWidth < 1024) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove('open');
          contentArea.classList.remove('shifted');
        }
      }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 1024) {
        sidebar.classList.add('open');
        contentArea.classList.add('shifted');
      } else {
        sidebar.classList.remove('open');
        contentArea.classList.remove('shifted');
      }
    });
  }

  // PART I - User Authentication Challenge
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const registerBtn = document.getElementById('registerBtn');
  const loginBtn = document.getElementById('loginBtn');
  const authStatus = document.getElementById('authStatus');

  // PART II - "Database" Record Viewer
  const databaseTableBody = document.getElementById('databaseTableBody');

  // PART III - Hashing & Salting Tool
  const plaintextPasswordInput = document.getElementById('plaintextPasswordInput');
  const generatedSaltInput = document.getElementById('generatedSalt');
  const resultingHashInput = document.getElementById('resultingHash');
  const generateHashBtn = document.getElementById('generateHashBtn');

  // PART IV - Submit Your Analysis
  const analysisTextarea = document.getElementById('analysisTextarea');
  const checkUnderstandingBtn = document.getElementById('checkUnderstandingBtn');

  // In-memory "database" for demonstration
  const users = [];

  // Function to generate a random salt
  const generateSalt = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Function to hash a password with a salt (using SHA-256 for demonstration)
  const hashPassword = async (password, salt) => {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Update database table display
  const updateDatabaseTable = () => {
    databaseTableBody.innerHTML = '';
    users.forEach(user => {
      const row = databaseTableBody.insertRow();
      row.insertCell(0).textContent = user.username;
      row.insertCell(1).textContent = user.salt;
      row.insertCell(2).textContent = user.hashedPassword;
    });
  };

  // Add loading state to button
  const setButtonLoading = (button, isLoading) => {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  };

  // Event listener for Register User button
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        authStatus.textContent = '❌ Error: Please enter both username and password.';
        authStatus.className = 'status-message error';
        return;
      }

      if (users.some(user => user.username === username)) {
        authStatus.textContent = `❌ Error: User "${username}" already exists.`;
        authStatus.className = 'status-message error';
        return;
      }

      setButtonLoading(registerBtn, true);

      try {
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);

        users.push({
          username,
          salt,
          hashedPassword
        });
        updateDatabaseTable();

        authStatus.textContent = `✅ User "${username}" registered successfully! Check the database below.`;
        authStatus.className = 'status-message success';
        usernameInput.value = '';
        passwordInput.value = '';
      } catch (error) {
        authStatus.textContent = '❌ Error: Registration failed. Please try again.';
        authStatus.className = 'status-message error';
      } finally {
        setButtonLoading(registerBtn, false);
      }
    });
  }

  // Event listener for Login button
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        authStatus.textContent = '❌ Error: Please enter both username and password.';
        authStatus.className = 'status-message error';
        return;
      }

      const user = users.find(u => u.username === username);

      if (!user) {
        authStatus.textContent = '❌ Error: Invalid username or password.';
        authStatus.className = 'status-message error';
        return;
      }

      setButtonLoading(loginBtn, true);

      try {
        const hashedPasswordAttempt = await hashPassword(password, user.salt);

        if (hashedPasswordAttempt === user.hashedPassword) {
          authStatus.textContent = `✅ User "${username}" logged in successfully! 🔓`;
          authStatus.className = 'status-message success';
        } else {
          authStatus.textContent = '❌ Error: Invalid username or password.';
          authStatus.className = 'status-message error';
        }
      } catch (error) {
        authStatus.textContent = '❌ Error: Login failed. Please try again.';
        authStatus.className = 'status-message error';
      } finally {
        setButtonLoading(loginBtn, false);
      }
    });
  }

  // Event listener for Generate Salt & Hash button
  if (generateHashBtn) {
    generateHashBtn.addEventListener('click', async () => {
      const plaintextPassword = plaintextPasswordInput.value;

      if (!plaintextPassword) {
        generatedSaltInput.value = '';
        resultingHashInput.value = '';
        alert('⚠️ Please enter a password to hash!');
        return;
      }

      setButtonLoading(generateHashBtn, true);

      try {
        const salt = generateSalt();
        const hashedPassword = await hashPassword(plaintextPassword, salt);

        generatedSaltInput.value = salt;
        resultingHashInput.value = hashedPassword;

        // Add animation to show the values were generated
        generatedSaltInput.style.animation = 'none';
        resultingHashInput.style.animation = 'none';
        setTimeout(() => {
          generatedSaltInput.style.animation = '';
          resultingHashInput.style.animation = '';
        }, 10);
      } catch (error) {
        alert('❌ Error generating hash. Please try again.');
      } finally {
        setButtonLoading(generateHashBtn, false);
      }
    });
  }

  // PART IV - Check Understanding Button
  if (checkUnderstandingBtn && analysisTextarea) {
    checkUnderstandingBtn.addEventListener('click', () => {
      const analysis = analysisTextarea.value.trim();

      if (!analysis) {
        alert('⚠️ Please write your analysis before submitting!');
        return;
      }

      if (analysis.length < 50) {
        alert('⚠️ Your analysis is too short. Please provide a more detailed explanation (at least 50 characters).');
        return;
      }

      // Check for key concepts
      const keyTerms = ['salt', 'hash', 'secure', 'rainbow', 'unique', 'encrypt'];
      const lowerAnalysis = analysis.toLowerCase();
      const foundTerms = keyTerms.filter(term => lowerAnalysis.includes(term));

      // Create feedback message
      let feedbackMessage = '';
      let feedbackClass = '';

      if (foundTerms.length >= 3) {
        feedbackMessage = `✅ Excellent analysis! You've demonstrated understanding of key concepts: ${foundTerms.join(', ')}.\n\n`;
        feedbackMessage += '🔐 Key Points:\n';
        feedbackMessage += '• Salting makes each hash unique, even for identical passwords\n';
        feedbackMessage += '• Rainbow table attacks become ineffective with salts\n';
        feedbackMessage += '• Hashing is one-way, making passwords unrecoverable\n';
        feedbackMessage += '• Each user gets a unique salt, maximizing security';
        feedbackClass = 'success';
      } else if (foundTerms.length >= 2) {
        feedbackMessage = `✓ Good effort! You mentioned: ${foundTerms.join(', ')}.\n\n`;
        feedbackMessage += '💡 Consider also discussing:\n';
        feedbackMessage += '• How salts prevent rainbow table attacks\n';
        feedbackMessage += '• Why each password needs a unique salt\n';
        feedbackMessage += '• The difference between hashing and encryption';
        feedbackClass = 'success';
      } else {
        feedbackMessage = '⚠️ Your analysis could be improved.\n\n';
        feedbackMessage += '💡 Try to include these concepts:\n';
        feedbackMessage += '• Salt: Random data added to passwords\n';
        feedbackMessage += '• Hash: One-way cryptographic function\n';
        feedbackMessage += '• Rainbow tables: Precomputed hash databases\n';
        feedbackMessage += '• Security: Why salted hashes are more secure';
        feedbackClass = 'error';
      }

      // Create or update feedback display
      let feedbackDisplay = document.getElementById('analysisFeedback');
      if (!feedbackDisplay) {
        feedbackDisplay = document.createElement('div');
        feedbackDisplay.id = 'analysisFeedback';
        feedbackDisplay.className = 'status-message';
        checkUnderstandingBtn.parentNode.insertBefore(feedbackDisplay, checkUnderstandingBtn.nextSibling);
      }

      feedbackDisplay.className = `status-message ${feedbackClass}`;
      feedbackDisplay.style.whiteSpace = 'pre-line';
      feedbackDisplay.style.marginTop = '20px';
      feedbackDisplay.textContent = feedbackMessage;

      // Scroll to feedback
      feedbackDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Add confetti effect for excellent answers
      if (foundTerms.length >= 3) {
        createConfetti();
      }
    });
  }

  // Confetti effect for excellent answers
  function createConfetti() {
    const colors = ['#00ff88', '#00d4ff', '#a29bfe', '#ff9500'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.boxShadow = `0 0 10px ${colors[Math.floor(Math.random() * colors.length)]}`;
        document.body.appendChild(confetti);

        const duration = 3000 + Math.random() * 2000;
        const rotation = Math.random() * 360;
        
        confetti.animate([
          { 
            transform: `translateY(0) rotate(0deg)`, 
            opacity: 1 
          },
          { 
            transform: `translateY(${window.innerHeight + 50}px) rotate(${rotation}deg)`, 
            opacity: 0 
          }
        ], {
          duration: duration,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => confetti.remove();
      }, i * 30);
    }
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit in textareas
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (document.activeElement === passwordInput || document.activeElement === usernameInput) {
        if (registerBtn && !registerBtn.disabled) {
          registerBtn.click();
        }
      } else if (document.activeElement === plaintextPasswordInput) {
        if (generateHashBtn && !generateHashBtn.disabled) {
          generateHashBtn.click();
        }
      } else if (document.activeElement === analysisTextarea) {
        if (checkUnderstandingBtn && !checkUnderstandingBtn.disabled) {
          checkUnderstandingBtn.click();
        }
      }
    }
  });

  // Add character counter for analysis textarea
  if (analysisTextarea) {
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'text-align: right; color: #00d4aa; font-size: 0.9em; margin-top: 5px;';
    analysisTextarea.parentNode.appendChild(counterDiv);

    const updateCounter = () => {
      const length = analysisTextarea.value.length;
      counterDiv.textContent = `${length} characters (minimum 50 recommended)`;
      if (length >= 50) {
        counterDiv.style.color = '#00ff88';
      } else {
        counterDiv.style.color = '#ff9500';
      }
    };

    analysisTextarea.addEventListener('input', updateCounter);
    updateCounter();
  }

  // Add Enter key support for login
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && loginBtn && !loginBtn.disabled) {
        loginBtn.click();
      }
    });
  }

  if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        passwordInput.focus();
      }
    });
  }
});