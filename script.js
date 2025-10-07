document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle functionality
  const sidebar = document.querySelector('.sidebar');
  const contentArea = document.querySelector('.content-area');
  const menuToggle = document.querySelector('.menu-toggle');

  if (menuToggle && sidebar && contentArea) {
    const toggleSidebar = () => {
      sidebar.classList.toggle('closed');
      contentArea.classList.toggle('shifted');
    };

    menuToggle.addEventListener('click', toggleSidebar);

    // Set initial sidebar state based on screen size
    if (window.innerWidth > 768) {
      sidebar.classList.remove('closed');
      contentArea.classList.remove('shifted');
    } else {
      sidebar.classList.add('closed');
      contentArea.classList.add('shifted');
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove('closed');
        contentArea.classList.remove('shifted');
      } else {
        sidebar.classList.add('closed');
        contentArea.classList.add('shifted');
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

  // Event listener for Register User button
  registerBtn.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
      authStatus.textContent = 'Error: Please enter both username and password.';
      authStatus.className = 'status-message error';
      return;
    }

    if (users.some(user => user.username === username)) {
      authStatus.textContent = `Error: User "${username}" already exists.`;
      authStatus.className = 'status-message error';
      return;
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    users.push({
      username,
      salt,
      hashedPassword
    });
    updateDatabaseTable();

    authStatus.textContent = `User "${username}" registered successfully!`;
    authStatus.className = 'status-message success';
    usernameInput.value = '';
    passwordInput.value = '';
  });

  // Event listener for Login button
  loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
      authStatus.textContent = 'Error: Please enter both username and password.';
      authStatus.className = 'status-message error';
      return;
    }

    const user = users.find(u => u.username === username);

    if (!user) {
      authStatus.textContent = 'Error: Invalid username or password.';
      authStatus.className = 'status-message error';
      return;
    }

    const hashedPasswordAttempt = await hashPassword(password, user.salt);

    if (hashedPasswordAttempt === user.hashedPassword) {
      authStatus.textContent = `User "${username}" logged in successfully!`;
      authStatus.className = 'status-message success';
    } else {
      authStatus.textContent = 'Error: Invalid username or password.';
      authStatus.className = 'status-message error';
    }
  });

  // Event listener for Generate Salt & Hash button
  generateHashBtn.addEventListener('click', async () => {
    const plaintextPassword = plaintextPasswordInput.value;

    if (!plaintextPassword) {
      generatedSaltInput.value = '';
      resultingHashInput.value = '';
      return;
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(plaintextPassword, salt);

    generatedSaltInput.value = salt;
    resultingHashInput.value = hashedPassword;
  });
});