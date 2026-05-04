const accrualRate = 5.25 / 80;
const hoursInWorkDay = 8;
const daysInPayPeriod = 14;

window.onload = function () {
  const savedBalance = localStorage.getItem("vacationBalance");
  if (savedBalance) {
    document.getElementById("currentBalance").value = savedBalance;
  }

  document.getElementById("payPeriodDate").value = getToday();
  document.getElementById("nextPayPeriodDate").value = getToday();

  loadHistory();
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function calculateVacation() {
  const date = document.getElementById("payPeriodDate").value || getToday();
  const current = Number(document.getElementById("currentBalance").value) || 0;
  const hours = Number(document.getElementById("hoursWorked").value) || 80;
  const daysOff = Number(document.getElementById("daysOff").value) || 0;
  const extra = Number(document.getElementById("extraHoursOff").value) || 0;

  const earned = hours * accrualRate;
  const used = (daysOff * hoursInWorkDay) + extra;
  const newBalance = current + earned - used;

  localStorage.setItem("previousBalance", current.toFixed(2));
  localStorage.setItem("previousHistory", JSON.stringify(getHistory()));

  document.getElementById("vacationEarned").textContent = earned.toFixed(2);
  document.getElementById("vacationUsed").textContent = used.toFixed(2);
  document.getElementById("newBalance").textContent = newBalance.toFixed(2);

  localStorage.setItem("vacationBalance", newBalance.toFixed(2));
  document.getElementById("currentBalance").value = newBalance.toFixed(2);

  const history = getHistory();
  history.push({ date, earned, used, balance: newBalance });
  localStorage.setItem("vacationHistory", JSON.stringify(history));

  loadHistory();

  document.getElementById("hoursWorked").value = 80;
  document.getElementById("daysOff").value = 0;
  document.getElementById("extraHoursOff").value = 0;
}

function undoLastCalculation() {
  const prev = localStorage.getItem("previousBalance");
  const prevHistory = localStorage.getItem("previousHistory");

  if (!prev || !prevHistory) {
    alert("Nothing to undo.");
    return;
  }

  localStorage.setItem("vacationBalance", prev);
  localStorage.setItem("vacationHistory", prevHistory);

  document.getElementById("currentBalance").value = prev;
  loadHistory();

  alert("Undo complete.");
}

function projectVacation() {
  const current = Number(document.getElementById("currentBalance").value) || 0;
  const avg = Number(document.getElementById("averageHours").value) || 80;
  const target = new Date(document.getElementById("targetDate").value);

  const days = (target - new Date()) / (1000 * 60 * 60 * 24);
  const periods = days / daysInPayPeriod;

  const earned = periods * (avg * accrualRate);
  const total = current + earned;

  document.getElementById("estimatedPayPeriods").textContent = periods.toFixed(1);
  document.getElementById("projectedEarned").textContent = earned.toFixed(2);
  document.getElementById("projectedBalance").textContent = total.toFixed(2);
}

function calculateGoalDate() {
  const current = Number(document.getElementById("currentBalance").value) || 0;
  const desired = Number(document.getElementById("desiredVacationHours").value);
  const avg = Number(document.getElementById("goalAverageHours").value) || 80;
  const start = new Date(document.getElementById("nextPayPeriodDate").value);

  const perPeriod = avg * accrualRate;
  const needed = desired - current;
  const periods = Math.ceil(needed / perPeriod);

  const resultDate = new Date(start);
  resultDate.setDate(resultDate.getDate() + (periods - 1) * daysInPayPeriod);

  document.getElementById("payPeriodsNeeded").textContent = periods;
  document.getElementById("goalDateResult").textContent = resultDate.toLocaleDateString();
}

function getHistory() {
  return JSON.parse(localStorage.getItem("vacationHistory")) || [];
}

function loadHistory() {
  const history = getHistory();
  const container = document.getElementById("historyList");

  container.innerHTML = "";

  history.slice().reverse().forEach(h => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <strong>${h.date}</strong><br>
      Earned: ${h.earned.toFixed(2)}<br>
      Used: ${h.used.toFixed(2)}<br>
      Balance: ${h.balance.toFixed(2)}
    `;
    container.appendChild(div);
  });
}