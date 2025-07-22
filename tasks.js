  // Firebase config (unchanged)
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

  // DOM Elements
  const taskTableBody = document.querySelector('#tasksTable tbody');
  const paginationDiv = document.getElementById('paginationControls');
  const searchCompany = document.getElementById('searchCompany');
  const searchOwner = document.getElementById('searchOwner');
  const statusFilter = document.getElementById('statusFilter');

  const rowsPerPage = 10;
  let currentPage = 1;
  let allTasks = [];
  let filteredTasks = [];

// Load tasks from Firestore
async function loadTasks() {
  try {
    const snapshot = await db.collection('tasks').get();
    allTasks = []; // reset on reload
    snapshot.forEach(doc => {
      allTasks.push({ id: doc.id, ...doc.data() });
    });


    // Sort ascending by numeric part of SINO
    allTasks.sort((a, b) => {
      const getNumber = sino => {
        if (!sino) return 0;
        const match = sino.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getNumber(a.SINO) - getNumber(b.SINO);
    });

    // Auto update incomplete tasks
    await Promise.all(
      allTasks
        .filter(task =>
          task.Status === "Complete" &&
          Array.isArray(task.workSessions) &&
          task.workSessions.length > 0 &&
          (!task.TotalWorkHours || !task.TotalPauseHours)
        )
        .map(task => {
          console.log(`Auto-calculating times for task: ${task.SINO} (${task.id})`);
          console.log(`Auto-updating task: ${task.SINO} (${task.id})`);
          const taskRef = db.collection('tasks').doc(task.id);
          return updateTaskAsComplete(taskRef, task);
        })
    );
    
populateCompanyList();

function populateCompanyList() {
  const companyList = document.getElementById('companyList');
  companyList.innerHTML = ''; // Clear previous options

  const companiesSet = new Set();

  allTasks.forEach(task => {
    const company = task['Existing Company Name'];
    if (company) {
      companiesSet.add(company);
    }
  });

  companiesSet.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    companyList.appendChild(option);
  });
}



    applyFilters(); // Initial render with sorting applied
  } catch (error) {
    console.error(error);
  }
}


  // Render a specific page
  function renderTablePage(page, tasks) {
    taskTableBody.innerHTML = '';
    const start = (page - 1) * rowsPerPage;
    const pageTasks = tasks.slice(start, start + rowsPerPage);

    pageTasks.forEach(task => {
      const tr = document.createElement('tr');
      tr.classList.add('task-row');
      tr.innerHTML = `
        <td>${task.SINO || ''}</td>
        <td>${task['Existing Company Name'] || ''}</td>
        <td>${task['TYPE OF WORK'] || ''}</td>
        <td>${task.Status || ''}</td>
        <td>${task.Owner || ''}</td>
      `;

      const detailsTr = document.createElement('tr');
      detailsTr.classList.add('details-row');
      detailsTr.style.display = 'none';
      detailsTr.innerHTML = `
        <td colspan="5">
          <div class="details-box">
            <strong>ACCOUNT TYPE:</strong> ${task['ACCOUNT TYPE'] || ''}<br/>
            <strong>Accounts / Cards:</strong> ${task['Accounts / Cards'] || ''}<br/>
            <strong>Task:</strong> ${task.Task || ''}<br/>
            <strong>WORK FOR:</strong> ${task['WORK FOR'] || ''}<br/>
            <strong>PERIOD:</strong> ${task.PERIOD || ''}<br/>
            <strong>Due Date:</strong> ${task['Due date'] || ''}<br/>
            <strong>Assigned By:</strong> ${task['Assigned By'] || ''}<br/>
            <strong>Notes:</strong> ${task.Notes || ''}<br/>
          <strong>Time Started:</strong> ${formatTimestamp(task.taskStart)}<br/>
        <strong>Time End:</strong> ${formatTimestamp(task.taskEnd)}<br/>
        <strong>Total Work Hours:</strong> ${task.TotalWorkHours || ''}<br/>
        <strong>Total Pause Hours:</strong> ${task.TotalPauseHours || ''}<br/>
        <strong>Remarks:</strong> ${task.Remarks || ''}<br/><br/>
        <button class="edit-btn action-btn" data-id="${task.id}">Edit</button>
        <button class="delete-btn action-btn" data-id="${task.id}">Delete</button>
          </div>
        </td>
      `;

      tr.addEventListener('click', () => {
        detailsTr.style.display = detailsTr.style.display === 'none' ? 'table-row' : 'none';
      });

      taskTableBody.appendChild(tr);
      taskTableBody.appendChild(detailsTr);
    });

    attachRowEventListeners();
  }

  function formatTimestamp(ts) {
    if (!ts) return '';
    if (typeof ts.toDate === 'function') {
      return ts.toDate().toLocaleString();
    }
    if (ts instanceof Date) {
      return ts.toLocaleString();
    }
    return '';
  }


// --- Update task as Complete with real time calculations ---
async function updateTaskAsComplete(taskRef, task) {
  const nowTimestamp = firebase.firestore.Timestamp.now();

  function formatMs(ms) {
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  }

  function toFirestoreTimestamp(value) {
    if (!value) return null;
    if (value instanceof firebase.firestore.Timestamp) return value;
    if (value instanceof Date) return firebase.firestore.Timestamp.fromDate(value);
    const d = new Date(value);
    if (!isNaN(d.getTime())) return firebase.firestore.Timestamp.fromDate(d);
    return null;
  }

  function calcTimeDetails(sessions = []) {
    let totalWorkMs = 0, totalPauseMs = 0, pauseCount = 0, lastEnd = null;

    sessions.forEach(sess => {
      const startMs = sess.start?.toDate?.().getTime();
      const endMs = sess.end?.toDate?.().getTime();
      if (startMs && endMs) {
        totalWorkMs += endMs - startMs;
        if (lastEnd !== null) {
          const pause = startMs - lastEnd;
          if (pause > 0) {
            totalPauseMs += pause;
            pauseCount++;
          }
        }
        lastEnd = endMs;
      }
    });

    const startTime = sessions[0]?.start || null;
    const endTime = sessions.length ? sessions[sessions.length - 1]?.end || null : null;

    return { totalWorkMs, totalPauseMs, pauseCount, startTime, endTime };
  }

  const sessions = Array.isArray(task.workSessions) ? task.workSessions : [];

  const { totalWorkMs, totalPauseMs, pauseCount, startTime, endTime } = calcTimeDetails(sessions);

  const taskStart = toFirestoreTimestamp(startTime) || toFirestoreTimestamp(task.taskStart) || nowTimestamp;
  const taskEnd = toFirestoreTimestamp(endTime) || nowTimestamp;

  try {
    await taskRef.update({
      Status: "Complete",
      taskStart: taskStart,
      taskEnd: taskEnd,
      TimeStarted: formatTimestamp(taskStart),
      TimeEnd: formatTimestamp(taskEnd),
      TotalWorkHours: formatMs(totalWorkMs || (taskEnd.toMillis() - taskStart.toMillis())),
      TotalPauseHours: formatMs(totalPauseMs),
      Remarks: pauseCount > 1 ? "-" : (task.Remarks || "")
    });

    alert("Task marked complete with updated time info.");
  } catch (err) {
    console.error("Failed to update task:", err);
    alert("Failed to update task time info.");
  }
}



  // Attach edit/delete/complete button events
  function attachRowEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const id = e.target.dataset.id;
        if (confirm('Delete this task?')) {
          try {
            await db.collection('tasks').doc(id).delete();
            alert('Deleted');
            loadTasks();
          } catch (err) {
            console.error(err);
            alert('Delete failed');
          }
        }
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const id = e.target.dataset.id;
        const task = allTasks.find(t => t.id === id);
        if (!task) return alert('Not found');

        // Clone task data to avoid editing timestamp fields as strings by mistake
        const updated = { ...task };

        // Disable editing timestamp fields to prevent corruption
        const timestampKeys = ['taskStart', 'taskEnd'];

        for (const key in updated) {
          if (key === 'id' || timestampKeys.includes(key)) continue; // skip timestamps and id
          const value = prompt(`Edit ${key}`, updated[key] || '');
          if (value !== null) updated[key] = value;
        }

        try {
          await db.collection('tasks').doc(id).set(updated);
          alert('Updated');
          loadTasks();
        } catch (err) {
          console.error(err);
          alert('Update failed');
        }
      });
    });

 
  }

  // Render pagination with page numbers
  function renderPagination(tasks) {
    paginationDiv.innerHTML = '';
    const totalPages = Math.ceil(tasks.length / rowsPerPage);
    if (totalPages <= 1) return;

    const prevBtn = createPageButton('Prev', currentPage === 1, () => {
      if (currentPage > 1) {
        currentPage--;
        renderTablePage(currentPage, filteredTasks);
        renderPagination(filteredTasks);
      }
    });
    paginationDiv.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const btn = createPageButton(i, i === currentPage, () => {
        currentPage = i;
        renderTablePage(currentPage, filteredTasks);
        renderPagination(filteredTasks);
      });
      paginationDiv.appendChild(btn);
    }

    const nextBtn = createPageButton('Next', currentPage === totalPages, () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTablePage(currentPage, filteredTasks);
        renderPagination(filteredTasks);
      }
    });
    paginationDiv.appendChild(nextBtn);
  }

  function createPageButton(label, disabled, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.disabled = disabled;
    if (!disabled) btn.addEventListener('click', onClick);
    return btn;
  }

  // Filter tasks based on inputs
  function applyFilters() {
    const company = searchCompany.value.toLowerCase();
    const owner = searchOwner.value.toLowerCase();
    const status = statusFilter.value;

    filteredTasks = allTasks.filter(task => {
      const matchCompany = task['Existing Company Name']?.toLowerCase().includes(company);
      const matchOwner = task.Owner?.toLowerCase().includes(owner);
      const matchStatus = !status || task.Status === status;
      return matchCompany && matchOwner && matchStatus;
    });

    currentPage = 1;
    renderTablePage(currentPage, filteredTasks);
    renderPagination(filteredTasks);
  }

  // Attach filter input listeners
  [searchCompany, searchOwner, statusFilter].forEach(el =>
    el.addEventListener('input', applyFilters)
  );

  // Load tasks on page load
  window.onload = loadTasks;





// --- Your existing code remains unchanged above ---

const createTaskBtn = document.getElementById('createTaskBtn');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const ownerSelect = document.getElementById('ownerSelect');
const assignedBySelect = document.getElementById('assignedBySelect');
const companyInput = taskForm.elements['company'];

// Open modal on + button click
createTaskBtn.addEventListener('click', () => {
  populateDropdowns();
  taskForm.reset();
  taskModal.style.display = 'flex';
});

// Close modal if clicking outside form
taskModal.addEventListener('click', (e) => {
  if (e.target === taskModal) {
    taskModal.style.display = 'none';
  }
});

// Populate Owner and Assigned By dropdowns from existing tasks
// Populate Owner and Assigned By dropdowns from existing tasks
function populateDropdowns() {
  const owners = new Set();
  const assignedBys = new Set();

  allTasks.forEach(task => {
    if (task.Owner) owners.add(task.Owner);
    if (task['Assigned By']) assignedBys.add(task['Assigned By']);
  });

  ownerSelect.innerHTML = '<option value="">Select Owner</option>';
  assignedBySelect.innerHTML = '<option value="">Select Assigned By</option>';

  owners.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    ownerSelect.appendChild(option);
  });

  assignedBys.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    assignedBySelect.appendChild(option);
  });
}

// When user types company name, prefill if exists
companyInput.addEventListener('input', () => {
  const val = companyInput.value.trim().toLowerCase();
  if (!val) return;
  const existingTask = allTasks.find(task => (task['Existing Company Name']?.toLowerCase() === val));
  if (existingTask) {
    taskForm.elements['typeOfWork'].value = existingTask['TYPE OF WORK'] || '';
    taskForm.elements['accountType'].value = existingTask['ACCOUNT TYPE'] || '';
    taskForm.elements['accountsCards'].value = existingTask['Accounts / Cards'] || '';
    taskForm.elements['owner'].value = existingTask.Owner || '';
    taskForm.elements['assignedBy'].value = existingTask['Assigned By'] || '';
  }
});

// Corrected generateSINO: generates globally incremented SINO ignoring company name
function generateSINO() {
  let maxNumber = 0;
  allTasks.forEach(task => {
    if (task.SINO) {
      const match = task.SINO.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }
  });

  const nextNumber = maxNumber + 1;
  return String(nextNumber).padStart(3, '0');
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(taskForm);
  const data = {};

  formData.forEach((value, key) => {
    data[key] = value.trim();
  });

  if (!data.company || !data.typeOfWork || !data.dueDate || !data.owner || !data.assignedBy) {
    alert('Please fill in all required fields.');
    return;
  }

  data.SINO = generateSINO();
  data.Status = 'Not Started';

  data['Existing Company Name'] = data.company;
  data['TYPE OF WORK'] = data.typeOfWork;
  data['ACCOUNT TYPE'] = data.accountType || '';
  data['Accounts / Cards'] = data.accountsCards || '';
  data.Task = data.task || '';
  data.Owner = data.owner;
  data['WORK FOR'] = data.workFor || '';
  data.PERIOD = data.period || '';
  data['Due date'] = data.dueDate;
  data['Assigned By'] = data.assignedBy;
  data.Notes = data.notes || '';

  // Remove raw keys
  delete data.company;
  delete data.typeOfWork;
  delete data.accountType;
  delete data.accountsCards;
  delete data.task;
  delete data.owner;
  delete data.workFor;
  delete data.period;
  delete data.dueDate;
  delete data.assignedBy;
  delete data.notes;

  try {
    await db.collection('tasks').add(data);
    alert('Task created successfully!');
    taskModal.style.display = 'none';
    loadTasks();
  } catch (err) {
    console.error(err);
    alert('Error creating task.');
  }
});



// Assuming these exist in your form and HTML:
const accountTypeSelect = taskForm.elements['accountType'];
const accountsCardsList = document.getElementById('accountsCardsList'); // <datalist> element

function updateAccountsCardsList() {
  const company = companyInput.value.trim();
  const accountType = accountTypeSelect.value;

  accountsCardsList.innerHTML = '';

  if (!company) return;

  const cardsSet = new Set();

  allTasks.forEach(task => {
    const taskCompany = task['Existing Company Name'] || '';
    const taskAccountType = task['ACCOUNT TYPE'] || '';

    if (
      taskCompany.toLowerCase() === company.toLowerCase() &&
      taskAccountType.toLowerCase() === accountType.toLowerCase() &&
      task['Accounts / Cards']
    ) {
      cardsSet.add(task['Accounts / Cards']);
    }
  });

  cardsSet.forEach(card => {
    const option = document.createElement('option');
    option.value = card;
    accountsCardsList.appendChild(option);
  });
}

// Add event listeners to update Accounts / Cards dynamically
companyInput.addEventListener('input', updateAccountsCardsList);
accountTypeSelect.addEventListener('change', updateAccountsCardsList);

document.getElementById('workForSelect').addEventListener('change', function () {
  const val = this.value;
  const period = document.getElementById('periodInput');
  if (val) {
    period.style.display = 'inline-block';
    period.placeholder = `${val} Period`;
  } else {
    period.style.display = 'none';
  }
});





