const STORAGE_KEY = "personal-finance-app-v1";

const defaultState = {
  accounts: [
    { id: crypto.randomUUID(), name: "Efectivo", balance: 0 },
    { id: crypto.randomUUID(), name: "Banco", balance: 0 },
  ],
  investments: [],
  transactions: [],
  settings: {
    monthlyBudget: 0,
    monthlySavingsGoal: 0,
    currency: "MXN",
  },
};

const categories = {
  expense: ["Comida", "Transporte", "Casa", "Servicios", "Salud", "Ocio", "Deuda", "Otro"],
  income: ["Sueldo", "Freelance", "Venta", "Regalo", "Otro"],
  saving: ["Ahorro", "Inversion", "Emergencia", "Meta", "Otro"],
};

let state = loadState();

const els = {
  totalBalance: document.querySelector("#totalBalance"),
  balanceHint: document.querySelector("#balanceHint"),
  monthIncome: document.querySelector("#monthIncome"),
  monthExpense: document.querySelector("#monthExpense"),
  availableMoney: document.querySelector("#availableMoney"),
  availableHint: document.querySelector("#availableHint"),
  investmentTotal: document.querySelector("#investmentTotal"),
  investmentHint: document.querySelector("#investmentHint"),
  todayStatus: document.querySelector("#todayStatus"),
  form: document.querySelector("#transactionForm"),
  typeInput: document.querySelector("#typeInput"),
  amountInput: document.querySelector("#amountInput"),
  categoryInput: document.querySelector("#categoryInput"),
  accountInput: document.querySelector("#accountInput"),
  noteInput: document.querySelector("#noteInput"),
  categoryChart: document.querySelector("#categoryChart"),
  accountsList: document.querySelector("#accountsList"),
  investmentsList: document.querySelector("#investmentsList"),
  transactionsList: document.querySelector("#transactionsList"),
  budgetForm: document.querySelector("#budgetForm"),
  monthlyBudgetInput: document.querySelector("#monthlyBudgetInput"),
  monthlySavingsGoalInput: document.querySelector("#monthlySavingsGoalInput"),
  budgetProgress: document.querySelector("#budgetProgress"),
  addAccountBtn: document.querySelector("#addAccountBtn"),
  accountDialog: document.querySelector("#accountDialog"),
  accountForm: document.querySelector("#accountForm"),
  accountNameInput: document.querySelector("#accountNameInput"),
  accountBalanceInput: document.querySelector("#accountBalanceInput"),
  addInvestmentBtn: document.querySelector("#addInvestmentBtn"),
  investmentDialog: document.querySelector("#investmentDialog"),
  investmentForm: document.querySelector("#investmentForm"),
  investmentNameInput: document.querySelector("#investmentNameInput"),
  investmentTypeInput: document.querySelector("#investmentTypeInput"),
  investmentValueInput: document.querySelector("#investmentValueInput"),
  investmentNoteInput: document.querySelector("#investmentNoteInput"),
  exportJsonBtn: document.querySelector("#exportJsonBtn"),
  importJsonInput: document.querySelector("#importJsonInput"),
  downloadCsvBtn: document.querySelector("#downloadCsvBtn"),
  clearDemoBtn: document.querySelector("#clearDemoBtn"),
  installHelp: document.querySelector("#installHelp"),
  accountTemplate: document.querySelector("#accountTemplate"),
  investmentTemplate: document.querySelector("#investmentTemplate"),
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : defaultState.accounts,
      investments: Array.isArray(parsed.investments) ? parsed.investments : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      settings: { ...defaultState.settings, ...parsed.settings },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: state.settings.currency,
  }).format(value || 0);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthKey() {
  return todayISO().slice(0, 7);
}

function getMonthTransactions() {
  const month = currentMonthKey();
  return state.transactions.filter((item) => item.date.startsWith(month));
}

function sumByType(type, items = getMonthTransactions()) {
  return items
    .filter((item) => item.type === type)
    .reduce((sum, item) => sum + Number(item.amount), 0);
}

function getAccountsTotal() {
  return state.accounts.reduce((sum, account) => sum + Number(account.balance), 0);
}

function getInvestmentsTotal() {
  return state.investments.reduce((sum, investment) => sum + Number(investment.value), 0);
}

function updateCategories() {
  const type = els.typeInput.value;
  els.categoryInput.innerHTML = categories[type]
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function renderAccountOptions() {
  els.accountInput.innerHTML = state.accounts
    .map((account) => `<option value="${account.id}">${account.name}</option>`)
    .join("");
}

function renderSummary() {
  const monthItems = getMonthTransactions();
  const income = sumByType("income", monthItems);
  const expense = sumByType("expense", monthItems);
  const saving = sumByType("saving", monthItems);
  const accountsTotal = getAccountsTotal();
  const investmentsTotal = getInvestmentsTotal();
  const available = accountsTotal - saving;
  const netWorth = accountsTotal + investmentsTotal;

  els.totalBalance.textContent = money(netWorth);
  els.balanceHint.textContent = `${money(accountsTotal)} disponible + ${money(investmentsTotal)} invertido`;
  els.monthIncome.textContent = money(income);
  els.monthExpense.textContent = money(expense);
  els.availableMoney.textContent = money(available);
  els.availableHint.textContent = saving > 0 ? `${money(saving)} apartado este mes` : "Sin apartados este mes";
  els.investmentTotal.textContent = money(investmentsTotal);
  els.investmentHint.textContent = `${state.investments.length} inversion${state.investments.length === 1 ? "" : "es"} registrada${state.investments.length === 1 ? "" : "s"}`;

  const hasTodayMovement = state.transactions.some((item) => item.date === todayISO());
  els.todayStatus.textContent = hasTodayMovement ? "Listo hoy" : "Pendiente";
  els.todayStatus.classList.toggle("done", hasTodayMovement);
}

function renderCategoryChart() {
  const expenses = getMonthTransactions().filter((item) => item.type === "expense");
  if (!expenses.length) {
    els.categoryChart.className = "category-chart empty-state";
    els.categoryChart.textContent = "Aun no hay gastos este mes.";
    return;
  }

  const totals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});
  const max = Math.max(...Object.values(totals));

  els.categoryChart.className = "category-chart";
  els.categoryChart.innerHTML = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => {
      const width = Math.max(6, Math.round((total / max) * 100));
      return `
        <div class="bar-row">
          <div class="bar-label"><strong>${category}</strong><span>${money(total)}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
        </div>
      `;
    })
    .join("");
}

function renderAccounts() {
  els.accountsList.innerHTML = "";

  state.accounts.forEach((account) => {
    const row = els.accountTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector("strong").textContent = account.name;
    row.querySelector("small").textContent = "Edita el balance si necesitas corregirlo";
    const input = row.querySelector("input");
    input.value = Number(account.balance).toFixed(2);
    input.addEventListener("change", () => {
      account.balance = Number(input.value) || 0;
      saveAndRender();
    });
    els.accountsList.append(row);
  });
}

function renderInvestments() {
  if (!state.investments.length) {
    els.investmentsList.className = "investments-list empty-state";
    els.investmentsList.textContent = "Sin inversiones registradas.";
    return;
  }

  els.investmentsList.className = "investments-list";
  els.investmentsList.innerHTML = "";

  state.investments
    .sort((a, b) => Number(b.value) - Number(a.value))
    .forEach((investment) => {
      const row = els.investmentTemplate.content.firstElementChild.cloneNode(true);
      row.querySelector("strong").textContent = investment.name;
      row.querySelector("small").textContent = `${investment.type}${investment.note ? ` · ${investment.note}` : ""}`;

      const input = row.querySelector("input");
      input.value = Number(investment.value).toFixed(2);
      input.addEventListener("change", () => {
        investment.value = Number(input.value) || 0;
        investment.updatedAt = new Date().toISOString();
        saveAndRender();
      });

      row.querySelector("button").addEventListener("click", () => {
        const confirmed = confirm(`Eliminar inversion "${investment.name}"?`);
        if (!confirmed) return;
        state.investments = state.investments.filter((item) => item.id !== investment.id);
        saveAndRender();
      });

      els.investmentsList.append(row);
    });
}

function renderTransactions() {
  const recent = [...state.transactions]
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`))
    .slice(0, 12);

  if (!recent.length) {
    els.transactionsList.className = "transactions-list empty-state";
    els.transactionsList.textContent = "Sin movimientos todavia.";
    return;
  }

  els.transactionsList.className = "transactions-list";
  els.transactionsList.innerHTML = recent
    .map((item) => {
      const sign = item.type === "income" ? "+" : "-";
      const account = state.accounts.find((entry) => entry.id === item.accountId);
      return `
        <div class="transaction-row">
          <div>
            <strong>${item.category}${item.note ? ` · ${item.note}` : ""}</strong>
            <small>${item.date} · ${account?.name || "Cuenta eliminada"}</small>
          </div>
          <span class="transaction-amount ${item.type}">${sign}${money(item.amount)}</span>
        </div>
      `;
    })
    .join("");
}

function renderBudget() {
  els.monthlyBudgetInput.value = state.settings.monthlyBudget || "";
  els.monthlySavingsGoalInput.value = state.settings.monthlySavingsGoal || "";

  const expense = sumByType("expense");
  const saving = sumByType("saving");
  const budget = Number(state.settings.monthlyBudget);
  const goal = Number(state.settings.monthlySavingsGoal);

  const cards = [];
  if (budget > 0) {
    const pct = Math.min(100, Math.round((expense / budget) * 100));
    cards.push(progressCard("Gasto mensual", expense, budget, pct, pct > 90));
  }
  if (goal > 0) {
    const pct = Math.min(100, Math.round((saving / goal) * 100));
    cards.push(progressCard("Ahorro mensual", saving, goal, pct, false));
  }

  els.budgetProgress.innerHTML = cards.length
    ? cards.join("")
    : `<div class="empty-state">Agrega limites para saber si vas bien durante el mes.</div>`;
}

function progressCard(label, current, target, pct, warn) {
  return `
    <div class="budget-card">
      <strong><span>${label}</span><span>${pct}%</span></strong>
      <small>${money(current)} de ${money(target)}</small>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%; background:${warn ? "var(--warning)" : "var(--brand)"}"></div>
      </div>
    </div>
  `;
}

function saveAndRender() {
  saveState();
  render();
}

function render() {
  renderAccountOptions();
  renderSummary();
  renderCategoryChart();
  renderAccounts();
  renderInvestments();
  renderTransactions();
  renderBudget();
  renderInstallHelp();
}

function renderInstallHelp() {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isiPhone = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
  els.installHelp.hidden = !isiPhone || isStandalone;
}

function addTransaction(event) {
  event.preventDefault();
  const amount = Number(els.amountInput.value);
  const type = els.typeInput.value;
  const account = state.accounts.find((item) => item.id === els.accountInput.value);
  if (!account || !amount) return;

  if (type === "income") account.balance += amount;
  if (type === "expense") account.balance -= amount;

  state.transactions.push({
    id: crypto.randomUUID(),
    type,
    amount,
    category: els.categoryInput.value,
    accountId: account.id,
    note: els.noteInput.value.trim(),
    date: todayISO(),
    createdAt: new Date().toISOString(),
  });

  els.amountInput.value = "";
  els.noteInput.value = "";
  saveAndRender();
}

function addAccount(event) {
  event.preventDefault();
  state.accounts.push({
    id: crypto.randomUUID(),
    name: els.accountNameInput.value.trim(),
    balance: Number(els.accountBalanceInput.value) || 0,
  });
  els.accountForm.reset();
  els.accountDialog.close();
  saveAndRender();
}

function addInvestment(event) {
  event.preventDefault();
  state.investments.push({
    id: crypto.randomUUID(),
    name: els.investmentNameInput.value.trim(),
    type: els.investmentTypeInput.value,
    value: Number(els.investmentValueInput.value) || 0,
    note: els.investmentNoteInput.value.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  els.investmentForm.reset();
  els.investmentDialog.close();
  saveAndRender();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  downloadBlob(blob, `finanzas-respaldo-${todayISO()}.json`);
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) {
        throw new Error("Formato invalido");
      }
      state = {
        ...structuredClone(defaultState),
        ...parsed,
        investments: Array.isArray(parsed.investments) ? parsed.investments : [],
        settings: { ...defaultState.settings, ...parsed.settings },
      };
      saveAndRender();
    } catch {
      alert("No pude importar el archivo. Revisa que sea un respaldo JSON de esta app.");
    }
  });
  reader.readAsText(file);
  event.target.value = "";
}

function downloadCsv() {
  const header = ["fecha", "tipo", "monto", "categoria", "cuenta", "nota"];
  const rows = state.transactions.map((item) => {
    const account = state.accounts.find((entry) => entry.id === item.accountId);
    return [
      item.date,
      item.type,
      item.amount,
      item.category,
      account?.name || "",
      item.note || "",
    ];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `movimientos-${todayISO()}.csv`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function resetApp() {
  const confirmed = confirm("Esto borrara cuentas, inversiones, movimientos y limites guardados en este navegador. Continuar?");
  if (!confirmed) return;
  state = structuredClone(defaultState);
  saveAndRender();
}

els.typeInput.addEventListener("change", updateCategories);
els.form.addEventListener("submit", addTransaction);
els.addAccountBtn.addEventListener("click", () => els.accountDialog.showModal());
document.querySelector("#cancelAccountBtn").addEventListener("click", () => els.accountDialog.close());
els.accountForm.addEventListener("submit", addAccount);
els.addInvestmentBtn.addEventListener("click", () => els.investmentDialog.showModal());
document.querySelector("#cancelInvestmentBtn").addEventListener("click", () => els.investmentDialog.close());
els.investmentForm.addEventListener("submit", addInvestment);
els.budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.settings.monthlyBudget = Number(els.monthlyBudgetInput.value) || 0;
  state.settings.monthlySavingsGoal = Number(els.monthlySavingsGoalInput.value) || 0;
  saveAndRender();
});
els.exportJsonBtn.addEventListener("click", exportJson);
els.importJsonInput.addEventListener("change", importJson);
els.downloadCsvBtn.addEventListener("click", downloadCsv);
els.clearDemoBtn.addEventListener("click", resetApp);

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

updateCategories();
render();
