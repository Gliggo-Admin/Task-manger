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

// Utility: robust date parser
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
      if (counts.hasOwnProperty(key)) counts[key]++;
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
      if (counts.hasOwnProperty(key)) counts[key]++;
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
  for (const o in ownerTimes) {
    const arr = ownerTimes[o];
    averages[o] = arr.reduce((a,b) => a+b, 0) / arr.length;
  }
  return averages;
}

// Radar Chart: average duration for companies and owners
function buildRadarData(tasks) {
  const companies = Object.keys(avgDurationByCompany(tasks));
  const owners = Object.keys(avgDurationByOwner(tasks));
  const companiesAvg = avgDurationByCompany(tasks);
  const ownersAvg = avgDurationByOwner(tasks);

  const labels = [...new Set([...companies, ...owners])];

  const companyData = labels.map(l => companiesAvg[l] || 0);
  const ownerData = labels.map(l => ownersAvg[l] || 0);

  return { labels, companyData, ownerData };
}

// Bubble Chart: number of tasks vs average duration per company
function buildBubbleData(tasks) {
  const companies = companyTaskCount(tasks);
  const avgDurations = avgDurationByCompany(tasks);

  const data = [];
  for (const c in companies) {
    const count = companies[c];
    const avgDur = avgDurations[c] || 0;
    data.push({
      x: count,
      y: avgDur,
      r: Math.min(20, Math.sqrt(count) * 5)
    });
  }
  return data;
}

// Create / Update charts
function updatePieChart(chart, labels, data, title) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  } else {
    chart = new Chart({
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: generateColors(labels.length),
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: true, text: title } }
      }
    }, chart.ctx);
  }
  return chart;
}

function updateBarChart(chart, labels, data, title) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  } else {
    chart = new Chart({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: generateColors(labels.length),
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: true, text: title } },
        scales: { y: { beginAtZero: true } }
      }
    }, chart.ctx);
  }
  return chart;
}

function updateLineChart(chart, labels, data, title) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  } else {
    chart = new Chart({
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          fill: false,
          borderColor: 'blue',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: true, text: title } },
        scales: { y: { beginAtZero: true } }
      }
    }, chart.ctx);
  }
  return chart;
}

function updateRadarChart(chart, labels, datasets, title) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets = datasets;
    chart.update();
  } else {
    chart = new Chart({
      type: 'radar',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: true, text: title } },
        scales: { r: { beginAtZero: true } }
      }
    }, chart.ctx);
  }
  return chart;
}

function updateBubbleChart(chart, data, title) {
  if (chart) {
    chart.data.datasets[0].data = data;
    chart.update();
  } else {
    chart = new Chart({
      type: 'bubble',
      data: {
        datasets: [{
          label: title,
          data,
          backgroundColor: 'rgba(255,99,132,0.5)'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: true, text: title } },
        scales: {
          x: { title: { display: true, text: 'Number of Tasks' }, beginAtZero: true },
          y: { title: { display: true, text: 'Average Duration (mins)' }, beginAtZero: true }
        }
      }
    }, chart.ctx);
  }
  return chart;
}

// Generate random colors array
function generateColors(num) {
  const colors = [];
  for(let i=0; i<num; i++) {
    colors.push(`hsl(${i*360/num}, 70%, 60%)`);
  }
  return colors;
}

// Main update function
function updateCharts(tasks) {
  // 1. Pie Charts for Status, Owner, Type, Assigned By
  const statusCounts = countStatus(tasks);
  statusChart = updatePieChart(statusChart, Object.keys(statusCounts), Object.values(statusCounts), 'Tasks by Status');
  
  const ownerCounts = countOwner(tasks);
  ownerChart = updatePieChart(ownerChart, Object.keys(ownerCounts), Object.values(ownerCounts), 'Tasks by Owner');
  
  const typeCounts = countType(tasks);
  typeChart = updatePieChart(typeChart, Object.keys(typeCounts), Object.values(typeCounts), 'Tasks by Type');
  
  const assignedByCounts = countAssignedBy(tasks);
  assignedByChart = updatePieChart(assignedByChart, Object.keys(assignedByCounts), Object.values(assignedByCounts), 'Tasks by Assigned By');

  // 2. Monthly Completed Tasks Bar Chart
  const monthlyCounts = monthlyCompletedTasks(tasks);
  monthlyChart = updateBarChart(monthlyChart, Object.keys(monthlyCounts), Object.values(monthlyCounts), 'Monthly Completed Tasks');

  // 3. Average Work and Pause Times
  const { avgWorkMins, avgPauseMins } = avgWorkPause(tasks);
  avgWorkChart = updateBarChart(avgWorkChart, ['Average Work Time'], [avgWorkMins], 'Average Work Time (mins)');
  avgPauseChart = updateBarChart(avgPauseChart, ['Average Pause Time'], [avgPauseMins], 'Average Pause Time (mins)');

  // 4. Completion Timeline (last 30 days) Line Chart
  const timelineCounts = completionTimeline(tasks);
  completeTimelineChart = updateLineChart(completeTimelineChart, Object.keys(timelineCounts), Object.values(timelineCounts), 'Completion Timeline (Last 30 days)');

  // 5. Company Tasks Pie Chart
  const companyCounts = companyTaskCount(tasks);
  companyChart = updatePieChart(companyChart, Object.keys(companyCounts), Object.values(companyCounts), 'Tasks by Company');

  // 6. Average Duration by Company Bar Chart
  const avgDurCompany = avgDurationByCompany(tasks);
  avgDurationChart = updateBarChart(avgDurationChart, Object.keys(avgDurCompany), Object.values(avgDurCompany), 'Average Duration by Company (mins)');

  // 7. Average Duration by Owner Bar Chart
  const avgDurOwner = avgDurationByOwner(tasks);
  avgDurationOwnerChart = updateBarChart(avgDurationOwnerChart, Object.keys(avgDurOwner), Object.values(avgDurOwner), 'Average Duration by Owner (mins)');

  // 8. Radar Chart comparing average durations (companies vs owners)
  const radarData = buildRadarData(tasks);
  const radarDatasets = [
    {
      label: 'Avg Duration by Company',
      data: radarData.companyData,
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 99, 132)'
    },
    {
      label: 'Avg Duration by Owner',
      data: radarData.ownerData,
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      pointBackgroundColor: 'rgb(54, 162, 235)'
    }
  ];
  radarChart = updateRadarChart(radarChart, radarData.labels, radarDatasets, 'Avg Duration: Companies vs Owners');

  // 9. Bubble Chart: number of tasks vs avg duration per company
  const bubbleData = buildBubbleData(tasks);
  bubbleChart = updateBubbleChart(bubbleChart, bubbleData, 'Tasks Count vs Avg Duration by Company');
}

// Load all tasks from Firestore
async function loadTasks() {
  try {
    const snapshot = await db.collection('tasks').get();
    allTasks = snapshot.docs.map(doc => doc.data());
    filteredTasks = [...allTasks];
    updateCharts(filteredTasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

// Filtering buttons logic
document.getElementById('showAllBtn').onclick = () => {
  filteredTasks = [...allTasks];
  updateCharts(filteredTasks);
};

document.getElementById('prevMonthBtn').onclick = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day prev month
  filteredTasks = filterByDateRange(allTasks, start, end);
  updateCharts(filteredTasks);
};

document.getElementById('thisMonthBtn').onclick = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  filteredTasks = filterByDateRange(allTasks, start, end);
  updateCharts(filteredTasks);
};

document.getElementById('applyCustomBtn').onclick = () => {
  const startStr = document.getElementById('startDate').value;
  const endStr = document.getElementById('endDate').value;
  if (!startStr || !endStr) {
    alert('Please select both start and end dates');
    return;
  }
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (end < start) {
    alert('End date must be after start date');
    return;
  }
  filteredTasks = filterByDateRange(allTasks, start, end);
  updateCharts(filteredTasks);
};

// Run at start
loadTasks();
