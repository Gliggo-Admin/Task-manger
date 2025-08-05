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

const companyCtx = document.getElementById('companyChart').getContext('2d');
const avgDurationCtx = document.getElementById('avgDurationChart').getContext('2d');
const avgDurationOwnerCtx = document.getElementById('avgDurationOwnerChart').getContext('2d');
const radarCtx = document.getElementById('radarChart').getContext('2d');
const bubbleCtx = document.getElementById('bubbleChart').getContext('2d');
// You can add more ctx variables here for other charts if needed.

let allTasks = [];
let filteredTasks = [];

let statusChart, ownerChart, typeChart, assignedByChart, monthlyChart, avgWorkChart, avgPauseChart, completeTimelineChart;
let companyChart, avgDurationChart, avgDurationOwnerChart, radarChart, bubbleChart;

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

// Utility functions (same as your code)

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.toDate) return value.toDate();

  if (typeof value !== 'string') return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);

  const dmyMatch = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    return new Date(y, parseInt(m) - 1, parseInt(d));
  }

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

  const usDateTimeMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  if (usDateTimeMatch) {
    const [_, m, d, y, hh, mm, ss] = usDateTimeMatch;
    return new Date(y, parseInt(m) - 1, d, hh, mm, ss);
  }

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
      const dueDate = parseDueDate(t['Due date']);
      if (!dueDate) return;
      const key = dueDate.toLocaleString('default', { year: 'numeric', month: 'short' });
      if (counts[key] !== undefined) counts[key]++;
    }
  });
  return counts;
}

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
      const dueDate = parseDueDate(t['Due date']);
      if (!dueDate) return;
      const key = dueDate.toISOString().slice(0,10);
      if (counts[key] !== undefined) counts[key]++;
    }
  });
  return counts;
}

function companyTaskCount(tasks) {
  return countByField(tasks, 'Company');
}

function avgDurationByCompany(tasks) {
  const companyTimes = {};
  tasks.forEach(t => {
    if (t.Status === 'Complete') {
      const c = t.Company || 'Unknown';
      const dur = parseTimeToMinutes(t['TOTAL OUT OF HOURS']);
      if (!companyTimes[c]) companyTimes[c] = [];
      if (dur) companyTimes[c].push(dur);
    }
  });
  const averages = {};
  for (const c in companyTimes) {
    const arr = companyTimes[c];
    averages[c] = arr.reduce((a,b) => a+b, 0) / arr.length;
  }
  return averages;
}

function avgDurationByOwner(tasks) {
  const ownerTimes = {};
  tasks.forEach(t => {
    if (t.Status === 'Complete') {
      const owner = t.Owner || 'Unknown';
      const dur = parseTimeToMinutes(t['TOTAL OUT OF HOURS']);
      if (!ownerTimes[owner]) ownerTimes[owner] = [];
      if (dur) ownerTimes[owner].push(dur);
    }
  });
  const averages = {};
  for (const owner in ownerTimes) {
    const arr = ownerTimes[owner];
    averages[owner] = arr.reduce((a,b) => a+b, 0) / arr.length;
  }
  return averages;
}

// ... Additional radar and bubble chart data preparation can be added similarly.

// Create or update charts
function createOrUpdateBarChart(chart, ctx, labels, data, title) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
    return chart;
  }
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true }, title: { display: true, text: title } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function createOrUpdatePieChart(chart, ctx, labels, data, title) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
    return chart;
  }
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#C9CBCF', '#FF6384'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'right' }, title: { display: true, text: title } }
    }
  });
}

function createOrUpdateLineChart(chart, ctx, labels, data, title) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
    return chart;
  }
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: title } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function createOrUpdateRadarChart(chart, ctx, labels, data, title) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
    return chart;
  }
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)'
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: title } }
    }
  });
}

// Main rendering function
function renderCharts() {
  // Status Chart
  const statusData = countStatus(filteredTasks);
  statusChart = createOrUpdatePieChart(
    statusChart,
    statusCtx,
    Object.keys(statusData),
    Object.values(statusData),
    'Task Status Distribution'
  );

  // Owner Chart
  const ownerData = countOwner(filteredTasks);
  ownerChart = createOrUpdatePieChart(
    ownerChart,
    ownerCtx,
    Object.keys(ownerData),
    Object.values(ownerData),
    'Task Owner Distribution'
  );

  // Type of Work Chart
  const typeData = countType(filteredTasks);
  typeChart = createOrUpdatePieChart(
    typeChart,
    typeCtx,
    Object.keys(typeData),
    Object.values(typeData),
    'Type of Work Distribution'
  );

  // Assigned By Chart
  const assignedData = countAssignedBy(filteredTasks);
  assignedByChart = createOrUpdatePieChart(
    assignedByChart,
    assignedByCtx,
    Object.keys(assignedData),
    Object.values(assignedData),
    'Assigned By Distribution'
  );

  // Monthly Completed Tasks Chart
  const monthlyData = monthlyCompletedTasks(filteredTasks);
  monthlyChart = createOrUpdateLineChart(
    monthlyChart,
    monthlyCtx,
    Object.keys(monthlyData),
    Object.values(monthlyData),
    'Monthly Completed Tasks (Last 12 Months)'
  );

  // Avg Work & Pause Time (Bar charts)
  const avgTimes = avgWorkPause(filteredTasks);
  avgWorkChart = createOrUpdateBarChart(
    avgWorkChart,
    avgWorkCtx,
    ['Average Work Time (minutes)'],
    [avgTimes.avgWorkMins],
    'Average Work Time'
  );
  avgPauseChart = createOrUpdateBarChart(
    avgPauseChart,
    avgPauseCtx,
    ['Average Pause Time (minutes)'],
    [avgTimes.avgPauseMins],
    'Average Pause Time'
  );

  // Completion Timeline (Last 30 days)
  const timelineData = completionTimeline(filteredTasks);
  completeTimelineChart = createOrUpdateLineChart(
    completeTimelineChart,
    completeTimelineCtx,
    Object.keys(timelineData),
    Object.values(timelineData),
    'Completed Tasks Timeline (Last 30 Days)'
  );

  // Company Tasks
  const companyData = companyTaskCount(filteredTasks);
  companyChart = createOrUpdateBarChart(
    companyChart,
    companyCtx,
    Object.keys(companyData),
    Object.values(companyData),
    'Tasks per Company'
  );

  // Avg Duration by Company
  const avgDurationData = avgDurationByCompany(filteredTasks);
  avgDurationChart = createOrUpdateBarChart(
    avgDurationChart,
    avgDurationCtx,
    Object.keys(avgDurationData),
    Object.values(avgDurationData),
    'Average Duration by Company (minutes)'
  );

  // Avg Duration by Owner
  const avgDurationOwnerData = avgDurationByOwner(filteredTasks);
  avgDurationOwnerChart = createOrUpdateBarChart(
    avgDurationOwnerChart,
    avgDurationOwnerCtx,
    Object.keys(avgDurationOwnerData),
    Object.values(avgDurationOwnerData),
    'Average Duration by Owner (minutes)'
  );

function radarStatusOwner(tasks) {
  const owners = Object.keys(countOwner(tasks));
  const statuses = Object.keys(countStatus(tasks));

  // Prepare dataset: For each status, count tasks per owner
  const datasets = statuses.map((status, i) => {
    const data = owners.map(owner => 
      tasks.filter(t => t.Status === status && t.Owner === owner).length
    );
    return {
      label: status,
      data,
      fill: true,
      backgroundColor: hsla(${(i*360/statuses.length)}, 70%, 60%, 0.4),
      borderColor: hsl(${(i*360/statuses.length)}, 70%, 50%),
      pointBackgroundColor: hsl(${(i*360/statuses.length)}, 70%, 50%),
      borderWidth: 1
    };
  });

  return { labels: owners, datasets };
}

const radarData = radarStatusOwner(tasks);
const radarChart = createOrUpdateChart(radarCtx, 'radar', radarData, { responsive: true }, radarChart);

const ownersIndex = {};
let idx = 0;
allTasks.forEach(t => {
  const owner = t.Owner || 'Unknown';
  if (!ownersIndex.hasOwnProperty(owner)) ownersIndex[owner] = idx++;
});

const bubbleDataPoints = allTasks.map(task => {
  return {
    x: calcTaskDurationMinutes(task),
    y: parseTimeToMinutes(task['TOTAL OUT OF HOURS']),
    r: 5, // radius fixed or based on other metric
    ownerIdx: ownersIndex[task.Owner || 'Unknown']
  };
});

const bubbleChart = createOrUpdateChart(bubbleCtx, 'bubble', {
  datasets: [{
    label: 'Task Duration vs Pause',
    data: bubbleDataPoints.map(pt => ({x: pt.x, y: pt.y, r: pt.r})),
    backgroundColor: 'rgba(54, 162, 235, 0.5)'
  }]
}, { responsive: true, scales: { x: { title: { display: true, text: 'Duration (mins)' } }, y: { title: { display: true, text: 'Pause (mins)' } } } }, bubbleChart);

}

// Filter button handlers
document.getElementById('showAllBtn').addEventListener('click', () => {
  filteredTasks = [...allTasks];
  renderCharts();
});

document.getElementById('prevMonthBtn').addEventListener('click', () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  filteredTasks = filterByDateRange(allTasks, start, end);
  renderCharts();
});

document.getElementById('thisMonthBtn').addEventListener('click', () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  filteredTasks = filterByDateRange(allTasks, start, end);
  renderCharts();
});

document.getElementById('applyCustomBtn').addEventListener('click', () => {
  const startInput = document.getElementById('startDate').value;
  const endInput = document.getElementById('endDate').value;
  const start = startInput ? new Date(startInput) : null;
  const end = endInput ? new Date(endInput + 'T23:59:59') : null;
  filteredTasks = filterByDateRange(allTasks, start, end);
  renderCharts();
});

// Load data once from Firestore
async function loadData() {
  const snapshot = await db.collection('Tasks').get();
  allTasks = snapshot.docs.map(doc => doc.data());
  filteredTasks = [...allTasks];
  renderCharts();
}

// Start
loadData().catch(console.error);
