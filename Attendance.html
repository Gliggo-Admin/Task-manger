<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>User Management - Task Manager</title>
  <style>
    /* === RESET & BASE === */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      background: linear-gradient(135deg, #dfe9f3, #ffffff);
      height: 100vh;
      overflow: hidden;
      color: #2c3e50;
    }

    /* === TOPBAR === */
    .topbar {
      height: 60px;
      background: linear-gradient(to right, #1abc9c, #16a085);
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 10;
      color: white;
    }

    .topbar .left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .topbar .left a {
      color: white;
      font-weight: bold;
      text-decoration: none;
      font-size: 18px;
      padding: 6px 12px;
      border-radius: 6px;
      background: rgba(255 255 255 / 0.2);
      transition: background 0.3s;
    }
    .topbar .left a:hover {
      background: rgba(255 255 255 / 0.4);
    }

    #dateTime {
      font-weight: 600;
      font-size: 16px;
      min-width: 180px;
      text-align: center;
    }

    .profile {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .profile img {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }

    /* === MAIN CONTENT === */
    main.main-content {
      margin-left: 0;
      padding: 80px 30px 30px;
      background: linear-gradient(135deg, #fdfbfb, #e2e2f2, #cfd9df);
      min-height: calc(100vh - 60px);
      overflow-y: auto;
      border-top-left-radius: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      max-width: 1200px;
      margin: 80px auto 30px;
      position: relative;
    }

    h1 {
      margin-bottom: 20px;
      color: #16a085;
      display: inline-block;
    }

    /* Edit button */
    .edit-btn {
      float: right;
      margin-left: 10px;
      font-size: 24px;
      cursor: pointer;
      color: #16a085;
      user-select: none;
      transition: color 0.3s;
    }
    .edit-btn:hover {
      color: #1abc9c;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.12);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    table th, table td {
      padding: 14px 18px;
      border-bottom: 1px solid #ecf0f1;
      text-align: left;
      transition: background 0.3s;
    }

    table th {
      background: #16a085;
      color: #fff;
      font-weight: 600;
      user-select: none;
    }

    table tbody tr:hover {
      background: #d1f0e7;
    }

    table td input[type="checkbox"] {
      transform: scale(1.2);
      cursor: pointer;
    }

    /* Editable cells */
    td.editable {
      background-color: #eafaf6;
      cursor: text;
    }

    td.editable[contenteditable="true"]:focus {
      outline: 2px solid #1abc9c;
      background-color: #d0f0e7;
    }

    /* Floating Add button */
    .add-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #1abc9c;
      color: white;
      font-size: 32px;
      border: none;
      border-radius: 50%;
      width: 55px;
      height: 55px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: background 0.3s;
      z-index: 20;
    }
    .add-btn:hover {
      background: #16a085;
    }

    /* Add User Form */
    .form-popup {
      display: none;
      position: fixed;
      bottom: 95px;
      right: 30px;
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      width: 320px;
      z-index: 30;
    }

    .form-popup input, .form-popup select {
      width: 100%;
      margin-bottom: 12px;
      padding: 10px;
      border: 1.8px solid #16a085;
      border-radius: 8px;
      font-size: 16px;
      color: #2c3e50;
      transition: border-color 0.3s;
    }
    .form-popup input:focus, .form-popup select:focus {
      border-color: #1abc9c;
      outline: none;
      background: #eafaf6;
    }

    .form-popup button {
      background: #16a085;
      color: white;
      border: none;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      transition: background 0.3s;
    }
    .form-popup button:hover {
      background: #1abc9c;
    }
    
    .del-btn { 
      color: #e74c3c; 
      cursor: pointer; 
      font-size: 18px; 
    }
    .del-btn:hover { 
      color: #c0392b; 
    }
    
    /* Login Form */
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #1abc9c, #16a085);
    }
    
    .login-form {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      width: 350px;
    }
    
    .login-form h2 {
      text-align: center;
      margin-bottom: 20px;
      color: #16a085;
    }
    
    .login-form input {
      width: 100%;
      padding: 12px;
      margin-bottom: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
    }
    
    .login-form button {
      width: 100%;
      padding: 12px;
      background: #16a085;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .login-form button:hover {
      background: #1abc9c;
    }
    
    .error-message {
      color: #e74c3c;
      text-align: center;
      margin-top: 10px;
      font-size: 14px;
    }
    
    /* User info in topbar */
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .user-role {
      background: rgba(255, 255, 255, 0.3);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
    
    /* Attendance section */
    .attendance-section {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.12);
      margin-bottom: 20px;
    }
    
    .attendance-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .attendance-btn {
      padding: 10px 15px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .punch-in {
      background: #2ecc71;
      color: white;
    }
    
    .punch-out {
      background: #e74c3c;
      color: white;
    }
    
    .break-btn {
      background: #f39c12;
      color: white;
    }
    
    .attendance-status {
      font-weight: 600;
      padding: 8px 12px;
      border-radius: 8px;
      display: inline-block;
    }
    
    .status-present {
      background: #e8f6f3;
      color: #16a085;
    }
    
    .status-absent {
      background: #fdedec;
      color: #e74c3c;
    }
    
    .status-break {
      background: #fef9e7;
      color: #f39c12;
    }
  </style>
</head>
<body>
  <!-- Login Screen -->
  <div id="loginScreen" class="login-container">
    <div class="login-form">
      <h2>User Login</h2>
      <input type="text" id="loginUsername" placeholder="Username" />
      <input type="password" id="loginPassword" placeholder="Password" />
      <button onclick="login()">Login</button>
      <div id="loginError" class="error-message"></div>
    </div>
  </div>

  <!-- Main Application (Hidden Initially) -->
  <div id="appContainer" style="display: none;">
    <div class="topbar">
      <div class="left">
        <a href="#" id="homeLink">🏠 Home</a>
        <a href="#" id="attendanceLink">📊 Attendance</a>
      </div>
      <div id="dateTime">Loading...</div>
      <div class="profile">
        <img src="https://i.pravatar.cc/40" alt="User" id="userAvatar" />
        <div class="user-info">
          <span id="loggedInUser">User</span>
          <span class="user-role" id="userRole">Role</span>
          <button onclick="logout()" style="background: none; border: none; color: white; cursor: pointer;">Logout</button>
        </div>
      </div>
    </div>

    <main class="main-content">
      <h1 id="pageTitle">Users</h1>
      <span class="edit-btn" id="editToggle">✏️</span>
      
      <!-- Attendance Section (for regular users) -->
      <div id="attendanceSection" class="attendance-section">
        <h2>Today's Attendance</h2>
        <div class="attendance-controls">
          <button class="attendance-btn punch-in" id="punchInBtn" onclick="punchIn()">Punch In</button>
          <button class="attendance-btn punch-out" id="punchOutBtn" onclick="punchOut()" disabled>Punch Out</button>
          <button class="attendance-btn break-btn" id="breakBtn" onclick="toggleBreak()">Start Break</button>
        </div>
        <div>
          <strong>Status: </strong>
          <span class="attendance-status status-absent" id="attendanceStatus">Not Checked In</span>
        </div>
        <div id="attendanceTime">
          <p>Punch In: <span id="punchInTime">-</span></p>
          <p>Punch Out: <span id="punchOutTime">-</span></p>
          <p>Break Time: <span id="breakTime">0 minutes</span></p>
        </div>
      </div>
      
      <!-- User Management Section (for admins) -->
      <div id="userManagementSection">
        <table id="userTable" spellcheck="false">
          <thead>
            <tr>
              <th>Edit?</th><th>Emp ID</th><th>Username</th><th>Password</th><th>Mail ID</th>
              <th>Role</th><th>Passcode</th><th>Delete</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div class="form-popup" id="formPopup">
        <input id="empId" placeholder="Emp ID"/>
        <input id="username" placeholder="Username"/>
        <input id="password" placeholder="Password"/>
        <input id="email" placeholder="Mail ID"/>
        <select id="role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <input id="passcode" placeholder="Passcode"/>
        <button onclick="addUser()">Add User</button>
      </div>
      <button class="add-btn" onclick="toggleForm()">+</button>
    </main>
  </div>

  <!-- Firebase scripts -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <script>
    // Firebase initialization
    const firebaseConfig = {
      apiKey: "AIzaSyD9ymWqihHWbVb4IRop1lXT-huLjBvS50w",
      authDomain: "task-manager-602da.firebaseapp.com",
      projectId: "task-manager-602da",
      storageBucket: "task-manager-602da.appspot.com",
      messagingSenderId: "438978699329",
      appId: "1:438978699329:web:9f475d04352bbdaa5ce6c0"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Global variables
    let currentUser = null;
    let currentUserData = null;
    let editMode = false;
    let currentAttendanceId = null;
    let isOnBreak = false;
    let breakStartTime = null;
    let totalBreakTime = 0;

    // Update date and time
    function updateDateTime() {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // Login function
    function login() {
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      
      if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
      }
      
      // Check user credentials
      db.collection("users")
        .where("username", "==", username)
        .where("password", "==", password)
        .get()
        .then(snapshot => {
          if (snapshot.empty) {
            showLoginError('Invalid username or password');
            return;
          }
          
          // User found
          snapshot.forEach(doc => {
            currentUser = doc.id;
            currentUserData = doc.data();
            
            // Hide login, show app
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appContainer').style.display = 'block';
            
            // Update UI with user info
            document.getElementById('loggedInUser').textContent = currentUserData.username;
            document.getElementById('userRole').textContent = currentUserData.role;
            document.getElementById('userAvatar').src = `https://i.pravatar.cc/40?u=${currentUserData.username}`;
            
            // Setup UI based on user role
            setupUIForUserRole();
            
            // Check today's attendance
            checkTodayAttendance();
            
            // Load user data
            loadUserData();
          });
        })
        .catch(error => {
          console.error("Error logging in:", error);
          showLoginError('Error logging in. Please try again.');
        });
    }
    
    function showLoginError(message) {
      document.getElementById('loginError').textContent = message;
    }

    // Logout function
    function logout() {
      currentUser = null;
      currentUserData = null;
      document.getElementById('loginScreen').style.display = 'flex';
      document.getElementById('appContainer').style.display = 'none';
      
      // Clear login form
      document.getElementById('loginUsername').value = '';
      document.getElementById('loginPassword').value = '';
      document.getElementById('loginError').textContent = '';
    }

    // Setup UI based on user role
    function setupUIForUserRole() {
      const isAdmin = currentUserData.role === 'admin';
      
      // Show/hide user management section
      document.getElementById('userManagementSection').style.display = isAdmin ? 'block' : 'none';
      document.querySelector('.add-btn').style.display = isAdmin ? 'block' : 'none';
      document.getElementById('editToggle').style.display = isAdmin ? 'inline-block' : 'none';
      
      // Show/hide attendance section
      document.getElementById('attendanceSection').style.display = isAdmin ? 'none' : 'block';
      
      // Update page title
      document.getElementById('pageTitle').textContent = isAdmin ? 'User Management' : 'My Dashboard';
    }

    // Toggle form visibility
    function toggleForm() {
      const formPopup = document.getElementById('formPopup');
      formPopup.style.display = formPopup.style.display === 'block' ? 'none' : 'block';
    }

    // Clear form inputs
    function clearForm() {
      ['empId', 'username', 'password', 'email', 'role', 'passcode'].forEach(id => {
        document.getElementById(id).value = '';
      });
    }

    // Add new user (admin only)
    function addUser() {
      if (currentUserData.role !== 'admin') {
        alert('Only administrators can add new users.');
        return;
      }
      
      const userData = {
        empId: document.getElementById('empId').value.trim(),
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value.trim(),
        email: document.getElementById('email').value.trim(),
        role: document.getElementById('role').value,
        passcode: document.getElementById('passcode').value.trim()
      };
      
      // Validate all fields are filled
      if (Object.values(userData).some(value => !value)) {
        alert('Please fill all fields');
        return;
      }
      
      // Add user to Firestore
      db.collection("users").add(userData)
        .then(() => {
          alert('User added successfully!');
          toggleForm();
          clearForm();
        })
        .catch(error => {
          console.error('Error adding user:', error);
          alert('Error adding user. Please try again.');
        });
    }

    // Load user data (admin only)
    function loadUserData() {
      if (currentUserData.role !== 'admin') return;
      
      // Set up real-time listener for users collection
      db.collection("users").onSnapshot(snapshot => {
        const tbody = document.querySelector("#userTable tbody");
        tbody.innerHTML = "";
        
        // Show message if no users found
        if (snapshot.empty) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No users found</td></tr>';
          return;
        }
        
        // Process each user document
        snapshot.forEach(doc => {
          const user = doc.data();
          const tr = document.createElement("tr");
          
          // Create table row with user data
          tr.innerHTML = `
            <td><input type="checkbox" class="chk-edit" disabled></td>
            <td>${user.empId || '-'}</td>
            <td class="editable">${user.username}</td>
            <td class="editable">${user.password}</td>
            <td class="editable">${user.email}</td>
            <td class="editable">${user.role}</td>
            <td>${user.passcode || '-'}</td>
            <td><span class="del-btn">🗑️</span></td>
          `;
          
          // Set up edit functionality
          const editCheckbox = tr.querySelector(".chk-edit");
          editCheckbox.disabled = !editMode;
          
          editCheckbox.onchange = function(e) {
            if (!e.target.checked) return;
            
            const editableCells = tr.querySelectorAll(".editable");
            editableCells.forEach(cell => {
              cell.contentEditable = "true";
              cell.focus();
            });
            
            // Handle saving on blur
            editableCells.forEach(cell => {
              cell.onblur = function() {
                const updatedData = {
                  username: tr.children[2].textContent,
                  password: tr.children[3].textContent,
                  email: tr.children[4].textContent,
                  role: tr.children[5].textContent
                };
                
                // Update user in Firestore
                db.collection("users").doc(doc.id).update(updatedData)
                  .then(() => {
                    e.target.checked = false;
                    editableCells.forEach(c => c.contentEditable = "false");
                  })
                  .catch(error => {
                    console.error("Error updating user:", error);
                    alert("Error updating user. Please try again.");
                  });
              };
            });
          };
          
          // Set up delete functionality
          tr.querySelector(".del-btn").onclick = function() {
            if (confirm("Are you sure you want to delete this user?")) {
              db.collection("users").doc(doc.id).delete()
                .catch(error => {
                  console.error("Error deleting user:", error);
                  alert("Error deleting user. Please try again.");
                });
            }
          };
          
          tbody.appendChild(tr);
        });
      });
    }

    // Toggle edit mode (admin only)
    document.getElementById("editToggle").onclick = function() {
      if (currentUserData.role !== 'admin') return;
      
      editMode = !editMode;
      document.querySelectorAll("#userTable tbody .chk-edit").forEach(checkbox => {
        checkbox.disabled = !editMode;
      });
      
      this.style.color = editMode ? "#27ae60" : "#16a085";
    };

    // Attendance functions
    function punchIn() {
      const now = new Date();
      const punchInTime = now.toTimeString().split(' ')[0];
      const today = now.toISOString().split('T')[0];
      
      // Create attendance record
      db.collection("attendance").add({
        userId: currentUser,
        username: currentUserData.username,
        date: today,
        punchIn: punchInTime,
        punchOut: null,
        breaks: [],
        totalBreakTime: 0,
        status: 'present'
      })
      .then(docRef => {
        currentAttendanceId = docRef.id;
        document.getElementById('punchInBtn').disabled = true;
        document.getElementById('punchOutBtn').disabled = false;
        document.getElementById('attendanceStatus').textContent = 'Present';
        document.getElementById('attendanceStatus').className = 'attendance-status status-present';
        document.getElementById('punchInTime').textContent = punchInTime;
        
        // Update UI
        checkTodayAttendance();
      })
      .catch(error => {
        console.error("Error punching in:", error);
        alert("Error punching in. Please try again.");
      });
    }

    function punchOut() {
      if (!currentAttendanceId) {
        alert("No active attendance record found.");
        return;
      }
      
      const now = new Date();
      const punchOutTime = now.toTimeString().split(' ')[0];
      
      // Calculate total hours worked
      db.collection("attendance").doc(currentAttendanceId).get()
        .then(doc => {
          if (doc.exists) {
            const data = doc.data();
            const punchInTime = data.punchIn;
            
            // Calculate time difference
            const today = new Date().toISOString().split('T')[0];
            const punchInDate = new Date(`${today} ${punchInTime}`);
            const punchOutDate = new Date(`${today} ${punchOutTime}`);
            const diffMs = punchOutDate - punchInDate;
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            
            // Subtract break time
            const netHrs = diffHrs - (totalBreakTime / 60);
            
            // Update attendance record
            db.collection("attendance").doc(currentAttendanceId).update({
              punchOut: punchOutTime,
              totalHours: `${netHrs}h ${diffMins}m`,
              totalBreakTime: totalBreakTime
            })
            .then(() => {
              currentAttendanceId = null;
              isOnBreak = false;
              totalBreakTime = 0;
              
              document.getElementById('punchInBtn').disabled = false;
              document.getElementById('punchOutBtn').disabled = true;
              document.getElementById('breakBtn').textContent = 'Start Break';
              document.getElementById('breakBtn').classList.remove('break-active');
              document.getElementById('attendanceStatus').textContent = 'Completed';
              document.getElementById('punchOutTime').textContent = punchOutTime;
              document.getElementById('breakTime').textContent = '0 minutes';
            })
            .catch(error => {
              console.error("Error punching out:", error);
              alert("Error punching out. Please try again.");
            });
          }
        });
    }

    function toggleBreak() {
      if (!currentAttendanceId) {
        alert("You need to punch in first before taking a break.");
        return;
      }
      
      const now = new Date();
      
      if (!isOnBreak) {
        // Start break
        isOnBreak = true;
        breakStartTime = now;
        document.getElementById('breakBtn').textContent = 'End Break';
        document.getElementById('breakBtn').classList.add('break-active');
        document.getElementById('attendanceStatus').textContent = 'On Break';
        document.getElementById('attendanceStatus').className = 'attendance-status status-break';
        
        // Record break start in Firestore
        db.collection("attendance").doc(currentAttendanceId).update({
          breaks: firebase.firestore.FieldValue.arrayUnion({
            start: now.toTimeString().split(' ')[0],
            end: null
          })
        });
      } else {
        // End break
        isOnBreak = false;
        const breakEndTime = now;
        const breakDuration = Math.round((breakEndTime - breakStartTime) / 60000); // in minutes
        totalBreakTime += breakDuration;
        
        document.getElementById('breakBtn').textContent = 'Start Break';
        document.getElementById('breakBtn').classList.remove('break-active');
        document.getElementById('attendanceStatus').textContent = 'Present';
        document.getElementById('attendanceStatus').className = 'attendance-status status-present';
        document.getElementById('breakTime').textContent = `${totalBreakTime} minutes`;
        
        // Update break record in Firestore
        db.collection("attendance").doc(currentAttendanceId).get()
          .then(doc => {
            if (doc.exists) {
              const data = doc.data();
              const breaks = data.breaks || [];
              
              // Find the break that hasn't ended yet
              for (let i = 0; i < breaks.length; i++) {
                if (breaks[i].end === null) {
                  breaks[i].end = breakEndTime.toTimeString().split(' ')[0];
                  break;
                }
              }
              
              // Update the document
              db.collection("attendance").doc(currentAttendanceId).update({
                breaks: breaks,
                totalBreakTime: totalBreakTime
              });
            }
          });
      }
    }

    function checkTodayAttendance() {
      const today = new Date().toISOString().split('T')[0];
      
      db.collection("attendance")
        .where("userId", "==", currentUser)
        .where("date", "==", today)
        .get()
        .then(snapshot => {
          if (!snapshot.empty) {
            snapshot.forEach(doc => {
              const data = doc.data();
              currentAttendanceId = doc.id;
              
              if (data.punchOut) {
                // Already completed work day
                document.getElementById('punchInBtn').disabled = true;
                document.getElementById('punchOutBtn').disabled = true;
                document.getElementById('attendanceStatus').textContent = 'Completed';
                document.getElementById('attendanceStatus').className = 'attendance-status status-present';
                document.getElementById('punchInTime').textContent = data.punchIn;
                document.getElementById('punchOutTime').textContent = data.punchOut;
                document.getElementById('breakTime').textContent = `${data.totalBreakTime} minutes`;
              } else {
                // Currently working
                document.getElementById('punchInBtn').disabled = true;
                document.getElementById('punchOutBtn').disabled = false;
                document.getElementById('attendanceStatus').textContent = 'Present';
                document.getElementById('attendanceStatus').className = 'attendance-status status-present';
                document.getElementById('punchInTime').textContent = data.punchIn;
                
                // Check if user is on break
                if (data.breaks && data.breaks.length > 0) {
                  const lastBreak = data.breaks[data.breaks.length - 1];
                  if (lastBreak.end === null) {
                    isOnBreak = true;
                    document.getElementById('breakBtn').textContent = 'End Break';
                    document.getElementById('breakBtn').classList.add('break-active');
                    document.getElementById('attendanceStatus').textContent = 'On Break';
                    document.getElementById('attendanceStatus').className = 'attendance-status status-break';
                  }
                }
                
                // Calculate total break time so far
                if (data.totalBreakTime) {
                  totalBreakTime = data.totalBreakTime;
                  document.getElementById('breakTime').textContent = `${totalBreakTime} minutes`;
                }
              }
            });
          } else {
            // No attendance record for today
            document.getElementById('punchInBtn').disabled = false;
            document.getElementById('punchOutBtn').disabled = true;
            document.getElementById('attendanceStatus').textContent = 'Not Checked In';
            document.getElementById('attendanceStatus').className = 'attendance-status status-absent';
          }
        })
        .catch(error => {
          console.error("Error checking attendance:", error);
        });
    }

    // Initialize the application
    window.onload = function() {
      // Set up event listeners
      document.getElementById('homeLink').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'Home.html';
      });
      
      document.getElementById('attendanceLink').addEventListener('click', function(e) {
        e.preventDefault();
        // In a real app, this would navigate to the attendance page
        alert('Attendance page would open here');
      });
      
      // Check if user is already logged in (from sessionStorage)
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser) {
        try {
          currentUserData = JSON.parse(savedUser);
          currentUser = currentUserData.id;
          
          // Hide login, show app
          document.getElementById('loginScreen').style.display = 'none';
          document.getElementById('appContainer').style.display = 'block';
          
          // Update UI with user info
          document.getElementById('loggedInUser').textContent = currentUserData.username;
          document.getElementById('userRole').textContent = currentUserData.role;
          document.getElementById('userAvatar').src = `https://i.pravatar.cc/40?u=${currentUserData.username}`;
          
          // Setup UI based on user role
          setupUIForUserRole();
          
          // Check today's attendance
          checkTodayAttendance();
          
          // Load user data
          loadUserData();
        } catch (e) {
          console.error('Error loading saved user:', e);
          sessionStorage.removeItem('currentUser');
        }
      }
    };
  </script>
</body>
</html>
