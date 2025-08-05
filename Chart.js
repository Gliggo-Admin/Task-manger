// chart.js

// Firebase config
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

// Chart contexts
const statusCtx = document.getElementById('statusChart').getContext('2d');
const ownerCtx = document.getElementById('ownerChart').getContext('2d');
const typeCtx = document.getElementById('typeChart').getContext('2d');
const assignedByCtx = document.getElementById('assignedByChart').getContext('2d');
const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
const avgWorkCtx = document.getElementById('avgWorkChart').getContext('2d');
const avgPauseCtx = document.getElementById('avgPauseChart').getContext('2d');
const completeTimelineCtx = document.getElementById('completeTimelineChart').getContext('2d');

let allTasks = [];
let filteredTasks = [];

let statusChart, ownerChart, typeChart, assignedByChart, monthlyChart, avgWorkChart, avgPauseChart, completeTimelineChart;

// Add filter UI
const filterSection = document.createElement('div');
filterSection.id = 'filterSection';
filterSection.innerHTML = `
  <button id="showAllBtn">Show All</button>
  <button id="prevMonthBtn">Previous Month</button>
  <button id="thisMonthBtn">This Month</button>
  <label for="startDate">From:</label>
  <input type="date" id="startDate" />
  <label for="endDate">To:</label>
  <input type="date" id="endDate" />
  <button id="applyCustomBtn">Apply</button>
`;
document.body.insertBefore(filterSection, document.body.querySelector('h1').nextSibling);

// Utility functions
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.toDate) return value.toDate();

  // Try parsing ISO or yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);

  // Try parsing dd-mm-yyyy or dd/mm/yyyy
  const dmyMatch = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    return new Date(y, parseInt(m) - 1, parseInt(d));
  }

  // Try parsing dd-MMM-yyyy (e.g., 12-Jan-2024)
  const mmmMatch = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (mmmMatch) {
    let [_, d, mmm, y] = mmmMatch;
    const months = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    if (y.length === 2) y = '20' + y;
    return new Date(parseInt(y), months[mmm], parseInt(d));
  }

  return new Date(value); // fallback
}


function parseDueDate(dueDateStr) {
  return toDate(dueDateStr); // supports multiple formats
}



function filterByDateRange(tasks, startDate, endDate) {
  return tasks.filter(task => {
    const dueDate = parseDueDate(task['Due Date']);
    if (!dueDate) return false;
    if (startDate && dueDate < startDate) return false;
    if (endDate && dueDate > endDate) return false;
    return true;
  });
}


// Count helpers
function countByField(tasks, field) {
  const counts = {};
  tasks.forEach(t => {
    const val = t[field] || 'Unknown';
    counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

function countStatus(tasks) { return countByField(tasks, 'Status'); }
function countOwner(tasks) { return countByField(tasks, 'Owner'); }
function countType(tasks) { return countByField(tasks, 'TYPE OF WORK'); }
function countAssignedBy(tasks) { return countByField(tasks, 'Assigned By'); }

function monthlyCompletedTasks(tasks) {
  const counts = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('default', { year: 'numeric', month: 'short' });
    counts[key] = 0;
  }
  tasks.forEach(t => {
    if (t.Status === 'Complete') {
      const endDate = parseDueDate(t['Due Date']);
      if (!endDate) return;
      const key = endDate.toLocaleString('default', { year: 'numeric', month: 'short' });
      if (counts[key] !== undefined) counts[key]++;
    }
  });
  return counts;
}

function parseHours(str) {
  if (!str) return 0;
  const h = parseInt(str.match(/(\d+)h/)?.[1] || 0);
  const m = parseInt(str.match(/(\d+)m/)?.[1] || 0);
  return h * 60 + m;
}

function avgWorkPause(tasks) {
  const workMins = [], pauseMins = [];
  tasks.forEach(t => {
    if (t.Status === 'Complete') {
      const w = parseHours(t.TotalWorkHours);
      const p = parseHours(t.TotalPauseHours);
      if (w) workMins.push(w);
      if (p) pauseMins.push(p);
    }
  });
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  return { avgWorkMins: avg(workMins), avgPauseMins: avg(pauseMins) };
}

function completionTimeline(tasks) {
  const counts = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0,10);
    counts[key] = 0;
  }
  tasks.forEach(t => {
    if (t.Status === 'Complete') {
      const endDate = toDate(t['Time End'] || t.taskEnd);
      if (!endDate) return;
      const key = endDate.toISOString().slice(0,10);
      if (counts[key] !== undefined) counts[key]++;
    }
  });
  return counts;
}

function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
}

function createOrUpdateChart(ctx, type, data, options, existingChart) {
  if (existingChart) {
    existingChart.data = data;
    existingChart.options = options;
    existingChart.update();
    return existingChart;
  }
  return new Chart(ctx, { type, data, options });
}

// Employee month-wise chart
function getMonthsInRange(startDate, endDate) {
  const months = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    months.push(`${current.getFullYear()}-${current.toLocaleString('default', { month: 'short' })}`);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

function tasksByOwnerInRange(tasks, startDate, endDate) {
  const months = getMonthsInRange(startDate, endDate);
  const owners = [...new Set(tasks.map(t => t.Owner || 'Unknown'))];
  const data = {};
  owners.forEach(o => data[o] = Array(months.length).fill(0));

  tasks.forEach(t => {
    const owner = t.Owner || 'Unknown';
    const date = parseDueDate(t['Due Date']);
    if (!date || date < startDate || date > endDate) return;
    const key = `${date.getFullYear()}-${date.toLocaleString('default', { month: 'short' })}`;
    const idx = months.indexOf(key);
    if (idx !== -1) data[owner][idx]++;
  });

  return { months, data };
}

function createOwnerMonthChartsFromFilter() {
  const startInput = document.getElementById('startDate').value;
  const endInput = document.getElementById('endDate').value;
  if (!startInput || !endInput) return;

  const startDate = new Date(startInput);
  const endDate = new Date(endInput);
  endDate.setHours(23, 59, 59, 999);

  const { months, data } = tasksByOwnerInRange(filteredTasks, startDate, endDate);
  const owners = Object.keys(data).slice(0, 7); // limit to 7 owners

  // Destroy old charts
  if (window.ownerMonthCharts) window.ownerMonthCharts.forEach(c => c.destroy());
  window.ownerMonthCharts = [];

  // Chart container
  let container = document.getElementById('ownerMonthChartsContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ownerMonthChartsContainer';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '20px';
    document.body.appendChild(container);
  }
  container.innerHTML = '';

  // Create charts
  owners.forEach(owner => {
    const canvas = document.createElement('canvas');
    canvas.style.width = '300px';
    canvas.style.height = '250px';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: `Tasks for ${owner}`,
          data: data[owner],
          backgroundColor: '#2980b9'
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: `Tasks Allotted to ${owner}` }
        },
        scales: {
          y: { beginAtZero: true, precision: 0 },
          x: { ticks: { maxRotation: 0, minRotation: 0 } }
        }
      }
    });

    window.ownerMonthCharts.push(chart);
  });
}

// 🔁 Final single unified updateCharts() function
function updateCharts() {
  const filtered = filteredTasks;

  // Status
  const statusData = countStatus(filtered);
  statusChart = createOrUpdateChart(statusCtx, 'pie', {
    labels: Object.keys(statusData),
    datasets: [{ data: Object.values(statusData), backgroundColor: generateColors(Object.keys(statusData).length) }]
  }, { responsive: true, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Tasks by Status' } } }, statusChart);

  // Owner
  const ownerData = countOwner(filtered);
  ownerChart = createOrUpdateChart(ownerCtx, 'bar', {
    labels: Object.keys(ownerData),
    datasets: [{ label: 'Tasks', data: Object.values(ownerData), backgroundColor: '#3498db' }]
  }, { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Tasks by Owner' } }, scales: { y: { beginAtZero: true } } }, ownerChart);

  // Type
  const typeData = countType(filtered);
  typeChart = createOrUpdateChart(typeCtx, 'doughnut', {
    labels: Object.keys(typeData),
    datasets: [{ data: Object.values(typeData), backgroundColor: generateColors(Object.keys(typeData).length) }]
  }, { responsive: true, plugins: { legend: { position: 'right' }, title: { display: true, text: 'Tasks by Type of Work' } } }, typeChart);

  // Assigned By
  const assignedByData = countAssignedBy(filtered);
  assignedByChart = createOrUpdateChart(assignedByCtx, 'bar', {
    labels: Object.keys(assignedByData),
    datasets: [{ label: 'Tasks', data: Object.values(assignedByData), backgroundColor: '#e67e22' }]
  }, { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Tasks by Assigned By' } }, scales: { y: { beginAtZero: true } } }, assignedByChart);

  // Monthly Completion
  const monthlyData = monthlyCompletedTasks(filtered);
  monthlyChart = createOrUpdateChart(monthlyCtx, 'line', {
    labels: Object.keys(monthlyData),
    datasets: [{ label: 'Completed Tasks', data: Object.values(monthlyData), fill: false, borderColor: '#2ecc71', tension: 0.3 }]
  }, { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Tasks Completed per Month (Last 12 Months)' } }, scales: { y: { beginAtZero: true } } }, monthlyChart);

  // Work vs Pause
  const { avgWorkMins, avgPauseMins } = avgWorkPause(filtered);
  avgWorkChart = createOrUpdateChart(avgWorkCtx, 'bar', {
    labels: ['Average Work Hours', 'Average Pause Hours'],
    datasets: [{ label: 'Minutes', data: [avgWorkMins.toFixed(1), avgPauseMins.toFixed(1)], backgroundColor: ['#9b59b6', '#f1c40f'] }]
  }, { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Average Work vs Pause Time (Minutes)' } }, scales: { y: { beginAtZero: true } } }, avgWorkChart);

  // Timeline
  const timelineData = completionTimeline(filtered);
  completeTimelineChart = createOrUpdateChart(completeTimelineCtx, 'bar', {
    labels: Object.keys(timelineData),
    datasets: [{ label: 'Tasks Completed', data: Object.values(timelineData), backgroundColor: '#1abc9c' }]
  }, { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Tasks Completed - Last 30 Days' } }, scales: { x: { ticks: { maxRotation: 90, minRotation: 45 } }, y: { beginAtZero: true } } }, completeTimelineChart);

  // Employee charts
  createOwnerMonthChartsFromFilter()
}

// Date filter events
document.getElementById('showAllBtn').addEventListener('click', () => {
  filteredTasks = allTasks;
  resetDateInputs();
  updateCharts();
});

document.getElementById('prevMonthBtn').addEventListener('click', () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  filteredTasks = filterByDateRange(allTasks, start, end);
  setDateInputs(start, end);
  updateCharts();
});

document.getElementById('thisMonthBtn').addEventListener('click', () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  filteredTasks = filterByDateRange(allTasks, start, end);
  setDateInputs(start, end);
  updateCharts();
});

document.getElementById('applyCustomBtn').addEventListener('click', () => {
  const startInput = document.getElementById('startDate').value;
  const endInput = document.getElementById('endDate').value;
  const start = startInput ? new Date(startInput) : null;
 const end = endInput ? new Date(new Date(endInput).setHours(23,59,59,999)) : null;


  if (start && end && start > end) {
    alert('Start date cannot be after end date.');
    return;
  }

  filteredTasks = filterByDateRange(allTasks, start, end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23,59,59) : null);
  updateCharts();
});

function resetDateInputs() {
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
}

function setDateInputs(start, end) {
  document.getElementById('startDate').value = start.toISOString().slice(0,10);
  document.getElementById('endDate').value = end.toISOString().slice(0,10);
}

// Load tasks
async function loadTasks() {
  try {
    const snapshot = await db.collection('tasks').get();
    allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    filteredTasks = allTasks;
    updateCharts();
  } catch (error) {
    console.error("Error loading tasks:", error);
    alert("Failed to load tasks from database.");
  }
}



// Initial load
loadTasks().then(() => {
  document.getElementById('thisMonthBtn').click();
});
