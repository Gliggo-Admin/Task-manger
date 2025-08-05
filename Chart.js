// chart.js

// Firebase config and init
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

// Chart canvas contexts
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
filterSection.style.margin = '20px 0';
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

// Utility: robust date parser for your string formats
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.toDate) return value.toDate();

  if (typeof value !== 'string') return null;

  // yyyy-mm-dd or ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);

  // dd-mm-yyyy or dd/mm/yyyy
  const dmyMatch = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    return new Date(y, parseInt(m) - 1, parseInt(d));
  }

  // dd-MMM-yy or dd-MMM-yyyy like 08-Apr-25 or 08-Apr-2025
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

  // US datetime like "4/8/2025 21:41:26"
  const usDateTimeMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  if (usDateTimeMatch) {
    const [_, m, d, y, hh, mm, ss] = usDateTimeMatch;
    return new Date(y, parseInt(m) - 1, d, hh, mm, ss);
  }

  // fallback to Date constructor
  return new Date(value);
}

function parseDueDate(dueDateStr) {
  const date = toDate(dueDateStr);
  if (!date || isNaN(date.getTime())) {
    console.warn('Invalid Due date:', dueDateStr);
    return null;
  }
  return date;
}

function filterByDateRange(tasks, startDate, endDate) {
  return tasks.filter(task => {
    const dueDate = parseDueDate(task['Due date']);
    if (!dueDate) return false;
    if (startDate && dueDate < startDate) return false;
    if (endDate && dueDate > endDate) return false;
    return true;
  });
}

// Count by any field helper
function countByField(tasks, field) {
  const counts = {};
  tasks.forEach(t => {
    const val = t[field] || 'Unknown';
    counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

// Specific counts
function countStatus(tasks) { return countByField(tasks, 'Status'); }
function countOwner(tasks) { return countByField(tasks, 'Owner'); }
function countType(tasks) { return countByField(tasks, 'TYPE OF WORK'); }
function countAssignedBy(tasks) { return countByField(tasks, 'Assigned By'); }

// Monthly completed task counts for last 12 months
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
      const dueDate = parseDueDate(t['Due date']);
      if (!dueDate) return;
      const key = dueDate.toLocaleString('default', { year: 'numeric', month: 'short' });
      if (counts[key] !== undefined) counts[key]++;
    }
  });
  return counts;
}

// Parse time string like "0:00:00" or "hh:mm:ss" into minutes
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  const [h, m, s] = parts.map(Number);
  return h * 60 + m + s / 60;
}

function avgWorkPause(tasks) {
  const workMins = [];
  const pauseMins = [];
  tasks.forEach(t => {
    if (t.Status === 'Complete') {
      const totalOut = t['TOTAL OUT OF HOURS'] || t.TotalWorkHours || '0:00:00';
      const totalPause = t.TotalPauseHours || '0:00:00';

      const w = parseTimeToMinutes(totalOut);
      const p = parseTimeToMinutes(totalPause);

      if (w) workMins.push(w);
      if (p) pauseMins.push(p);
    }
  });

  const avg = arr => arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;

  return { avgWorkMins: avg(workMins), avgPauseMins: avg(pauseMins) };
}

// Completion timeline last 30 days (by Time End)
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
      const endDate = toDate(t['Time End']);
      if (!endDate || isNaN(endDate.getTime())) return;
      const key = endDate.toISOString().slice(0,10);
      if (counts[key] !== undefined) counts[key]++;
    }
  });
  return counts;
}

// Generate distinct HSL colors for charts
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

// Render charts
function renderCharts(tasks) {
  // Status Chart
  const statusData = countStatus(tasks);
  const statusLabels = Object.keys(statusData);
  const statusCounts = Object.values(statusData);
  const statusColors = generateColors(statusLabels.length);

  statusChart = createOrUpdateChart(statusCtx, 'pie', {
    labels: statusLabels,
    datasets: [{ data: statusCounts, backgroundColor: statusColors }]
  }, { responsive: true }, statusChart);

  // Owner Chart
  const ownerData = countOwner(tasks);
  const ownerLabels = Object.keys(ownerData);
  const ownerCounts = Object.values(ownerData);
  const ownerColors = generateColors(ownerLabels.length);

  ownerChart = createOrUpdateChart(ownerCtx, 'bar', {
    labels: ownerLabels,
    datasets: [{
      label: 'Tasks per Owner',
      data: ownerCounts,
      backgroundColor: ownerColors
    }]
  }, { responsive: true, scales: { y: { beginAtZero: true } } }, ownerChart);

  // Type of Work Chart
  const typeData = countType(tasks);
  const typeLabels = Object.keys(typeData);
  const typeCounts = Object.values(typeData);
  const typeColors = generateColors(typeLabels.length);

  typeChart = createOrUpdateChart(typeCtx, 'doughnut', {
    labels: typeLabels,
    datasets: [{ data: typeCounts, backgroundColor: typeColors }]
  }, { responsive: true }, typeChart);

  // Assigned By Chart
  const assignedByData = countAssignedBy(tasks);
  const assignedByLabels = Object.keys(assignedByData);
  const assignedByCounts = Object.values(assignedByData);
  const assignedByColors = generateColors(assignedByLabels.length);

  assignedByChart = createOrUpdateChart(assignedByCtx, 'pie', {
    labels: assignedByLabels,
    datasets: [{ data: assignedByCounts, backgroundColor: assignedByColors }]
  }, { responsive: true }, assignedByChart);

  // Monthly Completed Chart
  const monthlyDataObj = monthlyCompletedTasks(tasks);
  const monthlyLabels = Object.keys(monthlyDataObj);
  const monthlyCounts = Object.values(monthlyDataObj);
  const monthlyColors = generateColors(monthlyLabels.length);

  monthlyChart = createOrUpdateChart(monthlyCtx, 'line', {
    labels: monthlyLabels,
    datasets: [{
      label: 'Completed Tasks',
      data: monthlyCounts,
      borderColor: 'blue',
      backgroundColor: 'lightblue',
      fill: true,
      tension: 0.2
    }]
  }, { responsive: true, scales: { y: { beginAtZero: true } } }, monthlyChart);

  // Avg Work vs Pause Chart
  const { avgWorkMins, avgPauseMins } = avgWorkPause(tasks);
  avgWorkChart = createOrUpdateChart(avgWorkCtx, 'bar', {
    labels: ['Average Work Time (mins)'],
    datasets: [{
      label: 'Work Time',
      data: [avgWorkMins],
      backgroundColor: 'green'
    }]
  }, { responsive: true, scales: { y: { beginAtZero: true } } }, avgWorkChart);

  avgPauseChart = createOrUpdateChart(avgPauseCtx, 'bar', {
    labels: ['Average Pause Time (mins)'],
    datasets: [{
      label: 'Pause Time',
      data: [avgPauseMins],
      backgroundColor: 'orange'
    }]
  }, { responsive: true, scales: { y: { beginAtZero: true } } }, avgPauseChart);

  // Completion Timeline Chart
  const timelineDataObj = completionTimeline(tasks);
  const timelineLabels = Object.keys(timelineDataObj);
  const timelineCounts = Object.values(timelineDataObj);

  completeTimelineChart = createOrUpdateChart(completeTimelineCtx, 'line', {
    labels: timelineLabels,
    datasets: [{
      label: 'Tasks Completed (Last 30 days)',
      data: timelineCounts,
      borderColor: 'purple',
      backgroundColor: 'violet',
      fill: true,
      tension: 0.3
    }]
  }, { responsive: true, scales: { y: { beginAtZero: true } } }, completeTimelineChart);
}

// Filter buttons and inputs handlers
document.getElementById('showAllBtn').addEventListener('click', () => {
  filteredTasks = allTasks.slice();
  renderCharts(filteredTasks);
  clearDateInputs();
});

document.getElementById('prevMonthBtn').addEventListener('click', () => {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
  const endDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
  filteredTasks = filterByDateRange(allTasks, startDate, endDate);
  renderCharts(filteredTasks);
  setDateInputs(startDate, endDate);
});

document.getElementById('thisMonthBtn').addEventListener('click', () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  filteredTasks = filterByDateRange(allTasks, startDate, endDate);
  renderCharts(filteredTasks);
  setDateInputs(startDate, endDate);
});

document.getElementById('applyCustomBtn').addEventListener('click', () => {
  const startDateInput = document.getElementById('startDate').value;
  const endDateInput = document.getElementById('endDate').value;
  const startDate = startDateInput ? new Date(startDateInput) : null;
  const endDate = endDateInput ? new Date(endDateInput) : null;
  filteredTasks = filterByDateRange(allTasks, startDate, endDate);
  renderCharts(filteredTasks);
});

function clearDateInputs() {
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
}

function setDateInputs(startDate, endDate) {
  document.getElementById('startDate').value = startDate.toISOString().slice(0,10);
  document.getElementById('endDate').value = endDate.toISOString().slice(0,10);
}

// Fetch data from Firestore
function loadData() {
  db.collection('tasks').get().then(snapshot => {
    allTasks = [];
    snapshot.forEach(doc => {
      allTasks.push(doc.data());
    });
    filteredTasks = allTasks.slice();
    renderCharts(filteredTasks);
  }).catch(err => {
    console.error('Error fetching tasks:', err);
  });
}

loadData();
