const STORAGE_KEY = "pocketplanExpenses";
const THEME_KEY = "pocketplanTheme";

let expenses = loadExpenses();

const themeToggle = document.getElementById("themeToggle");
const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const topCategory = document.getElementById("topCategory");

const form = document.getElementById("expenseForm");
const formHeading = document.getElementById("formHeading");
const expenseIdInput = document.getElementById("expenseId");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const filterCategory = document.getElementById("filterCategory");
const filterMonth = document.getElementById("filterMonth");
const sortBy = document.getElementById("sortBy");
const clearFilters = document.getElementById("clearFilters");

const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");
const filteredTotal = document.getElementById("filteredTotal");
const categorySummary = document.getElementById("categorySummary");

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatMoney(value) {
  return "₹" + value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function getVisibleExpenses() {
  let result = expenses.filter(function (expense) {
    const categoryMatch =
      filterCategory.value === "all" || expense.category === filterCategory.value;
    const monthMatch =
      filterMonth.value === "" || expense.date.slice(0, 7) === filterMonth.value;
    return categoryMatch && monthMatch;
  });

  result.sort(function (a, b) {
    if (sortBy.value === "amount-desc") return b.amount - a.amount;
    if (sortBy.value === "amount-asc") return a.amount - b.amount;
    if (sortBy.value === "date-asc") return a.date.localeCompare(b.date);
    return b.date.localeCompare(a.date);
  });

  return result;
}

function getCategoryTotals() {
  const totals = {};
  expenses.forEach(function (expense) {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  });
  return totals;
}

function render() {
  const visible = getVisibleExpenses();

  expenseList.innerHTML = visible
    .map(function (expense) {
      return (
        "<tr>" +
        '<td data-label="Title">' + escapeHtml(expense.title) + "</td>" +
        '<td data-label="Category"><span class="badge">' + escapeHtml(expense.category) + "</span></td>" +
        '<td data-label="Date">' + expense.date + "</td>" +
        '<td data-label="Amount" class="amount-cell">' + formatMoney(expense.amount) + "</td>" +
        '<td data-label="Actions"><div class="row-actions">' +
        '<button type="button" class="btn-small btn-edit" data-action="edit" data-id="' + expense.id + '">Edit</button>' +
        '<button type="button" class="btn-small btn-delete" data-action="delete" data-id="' + expense.id + '">Delete</button>' +
        "</div></td>" +
        "</tr>"
      );
    })
    .join("");

  emptyState.classList.toggle("hidden", visible.length > 0);

  const visibleTotal = visible.reduce(function (sum, expense) {
    return sum + expense.amount;
  }, 0);
  filteredTotal.textContent = formatMoney(visibleTotal);

  const allTotal = expenses.reduce(function (sum, expense) {
    return sum + expense.amount;
  }, 0);
  totalAmount.textContent = formatMoney(allTotal);
  expenseCount.textContent = expenses.length;

  const totals = getCategoryTotals();
  const names = Object.keys(totals).sort(function (a, b) {
    return totals[b] - totals[a];
  });

  topCategory.textContent = names.length > 0 ? names[0] : "-";

  if (names.length === 0) {
    categorySummary.innerHTML = '<li class="empty-state">Add expenses to see the breakdown.</li>';
  } else {
    categorySummary.innerHTML = names
      .map(function (name) {
        const percent = allTotal > 0 ? (totals[name] / allTotal) * 100 : 0;
        return (
          "<li>" +
          '<div class="category-row"><span>' + escapeHtml(name) + "</span><span>" + formatMoney(totals[name]) + "</span></div>" +
          '<div class="category-bar"><div class="category-fill" style="width:' + percent.toFixed(1) + '%"></div></div>' +
          "</li>"
        );
      })
      .join("");
  }
}

function resetForm() {
  form.reset();
  expenseIdInput.value = "";
  dateInput.value = todayString();
  formError.textContent = "";
  formHeading.textContent = "Add Expense";
  submitBtn.textContent = "Add Expense";
  cancelEditBtn.classList.add("hidden");
}

function startEdit(id) {
  const expense = expenses.find(function (item) {
    return item.id === id;
  });
  if (!expense) return;

  expenseIdInput.value = expense.id;
  titleInput.value = expense.title;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  dateInput.value = expense.date;
  formError.textContent = "";
  formHeading.textContent = "Edit Expense";
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.classList.remove("hidden");
  titleInput.focus();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteExpense(id) {
  const sure = confirm("Are you sure you want to delete this expense?");
  if (!sure) return;

  expenses = expenses.filter(function (item) {
    return item.id !== id;
  });
  saveExpenses();

  if (expenseIdInput.value === String(id)) {
    resetForm();
  }
  render();
}

function handleSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (title === "") {
    formError.textContent = "Please enter a title.";
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    formError.textContent = "Amount must be a number greater than 0.";
    return;
  }
  if (category === "") {
    formError.textContent = "Please choose a category.";
    return;
  }
  if (date === "") {
    formError.textContent = "Please pick a date.";
    return;
  }

  if (expenseIdInput.value === "") {
    expenses.push({
      id: Date.now(),
      title: title,
      amount: amount,
      category: category,
      date: date
    });
  } else {
    const id = Number(expenseIdInput.value);
    const index = expenses.findIndex(function (item) {
      return item.id === id;
    });
    if (index !== -1) {
      expenses[index] = {
        id: id,
        title: title,
        amount: amount,
        category: category,
        date: date
      };
    }
  }

  saveExpenses();
  resetForm();
  render();
}

function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  if (button.dataset.action === "edit") {
    startEdit(id);
  } else if (button.dataset.action === "delete") {
    deleteExpense(id);
  }
}

function handleClearFilters() {
  filterCategory.value = "all";
  filterMonth.value = "";
  sortBy.value = "date-desc";
  render();
}

themeToggle.addEventListener("click", toggleTheme);
form.addEventListener("submit", handleSubmit);
cancelEditBtn.addEventListener("click", resetForm);
expenseList.addEventListener("click", handleListClick);
filterCategory.addEventListener("change", render);
filterMonth.addEventListener("change", render);
sortBy.addEventListener("change", render);
clearFilters.addEventListener("click", handleClearFilters);

applyTheme(localStorage.getItem(THEME_KEY) || "light");
dateInput.value = todayString();
render();