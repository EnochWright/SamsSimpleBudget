// State
let state = {
    budget: 0,
    entries: []
};

// DOM Elements
const elements = {
    remainingAmount: document.getElementById('remainingAmount'),
    budgetDisplay: document.getElementById('budgetDisplay'),
    budgetInput: document.getElementById('budgetInput'),
    budgetEdit: document.getElementById('budgetEdit'),
    editBudgetBtn: document.getElementById('editBudgetBtn'),
    saveBudgetBtn: document.getElementById('saveBudgetBtn'),
    descInput: document.getElementById('descInput'),
    amountInput: document.getElementById('amountInput'),
    addBtn: document.getElementById('addBtn'),
    entriesList: document.getElementById('entriesList'),
    viewBtn: document.getElementById('viewBtn'),
    backupBtn: document.getElementById('backupBtn'),
    resetBtn: document.getElementById('resetBtn')
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    render();
    setupListeners();
});

function setupListeners() {
    // Budget Toggle
    elements.editBudgetBtn.addEventListener('click', () => {
        elements.budgetEdit.classList.remove('hidden');
        elements.budgetInput.value = state.budget || '';
        elements.editBudgetBtn.classList.add('hidden');
        elements.budgetInput.focus();
    });

    // Save Budget
    elements.saveBudgetBtn.addEventListener('click', saveBudget);
    elements.budgetInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveBudget();
    });

    // Add Entry
    elements.addBtn.addEventListener('click', addEntry);
    elements.amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addEntry();
    });

    // Delete Entry (Delegation)
    elements.entriesList.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-btn');
        if (btn) {
            const id = parseInt(btn.dataset.id);
            deleteEntry(id);
        }
    });

    // View Toggle
    elements.viewBtn.addEventListener('click', toggleView);

    // Backup
    elements.backupBtn.addEventListener('click', exportData);

    // Reset
    elements.resetBtn.addEventListener('click', resetData);
}

// Logic
function loadData() {
    const saved = localStorage.getItem('samsBudget_v1');
    if (saved) {
        state = JSON.parse(saved);
    }

    // Restore View Preference
    const isWide = localStorage.getItem('samsBudget_wideMode') === 'true';
    if (isWide) {
        document.querySelector('.app-container').classList.add('wide-mode');
    }
}

function saveData() {
    localStorage.setItem('samsBudget_v1', JSON.stringify(state));
    render();
}

function toggleView() {
    const container = document.querySelector('.app-container');
    container.classList.toggle('wide-mode');

    const isWide = container.classList.contains('wide-mode');
    localStorage.setItem('samsBudget_wideMode', isWide);
}

function saveBudget() {
    const val = parseFloat(elements.budgetInput.value);
    if (!isNaN(val) && val >= 0) {
        state.budget = val;
        saveData();
    }
    elements.budgetEdit.classList.add('hidden');
    elements.editBudgetBtn.classList.remove('hidden');
}

function addEntry() {
    const desc = elements.descInput.value.trim() || 'Expense';
    const amount = parseFloat(elements.amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    const entry = {
        id: Date.now(),
        desc: desc,
        amount: amount,
        date: new Date().toLocaleDateString()
    };

    state.entries.unshift(entry); // Add to top

    // Save without full render
    localStorage.setItem('samsBudget_v1', JSON.stringify(state));

    // Optimistic UI Update (No Flash)
    const li = createEntryElement(entry);
    elements.entriesList.prepend(li);
    updateBalanceUI();

    // Clear inputs
    elements.descInput.value = '';
    elements.amountInput.value = '';
    elements.descInput.focus();
}

function deleteEntry(id) {
    if (confirm('Delete this entry?')) {
        state.entries = state.entries.filter(e => e.id !== id);
        localStorage.setItem('samsBudget_v1', JSON.stringify(state));

        // Remove from DOM without flash
        const btn = document.querySelector(`.delete-btn[data-id="${id}"]`);
        if (btn) {
            const li = btn.closest('.entry-item');
            li.remove();
        }
        updateBalanceUI();
    }
}

// Separate UI updates for cleaner code
function updateBalanceUI() {
    const totalExpenses = state.entries.reduce((sum, e) => sum + e.amount, 0);
    const remaining = state.budget - totalExpenses;

    elements.budgetDisplay.textContent = `$${state.budget.toFixed(2)}`;
    elements.remainingAmount.textContent = remaining.toFixed(2);

    if (remaining < 0) {
        elements.remainingAmount.style.color = '#d32f2f';
    } else {
        elements.remainingAmount.style.color = '#1a1a1a';
    }
}

function createEntryElement(entry) {
    const li = document.createElement('li');
    li.className = 'entry-item';
    li.innerHTML = `
        <div class="entry-info">
            <h3>${entry.desc}</h3>
            <p>${entry.date}</p>
        </div>
        <div class="entry-actions">
            <span class="amount">-$${entry.amount.toFixed(2)}</span>
            <button class="delete-btn" data-id="${entry.id}" title="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;
    return li;
}

function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        state = {
            budget: 0,
            entries: []
        };
        saveData();
        // Reset Inputs
        elements.budgetInput.value = '';
        elements.budgetEdit.classList.add('hidden');
        elements.editBudgetBtn.classList.remove('hidden');
    }
}

// Render
function render() {
    updateBalanceUI();

    // Render List
    elements.entriesList.innerHTML = '';
    state.entries.forEach(entry => {
        const li = createEntryElement(entry);
        elements.entriesList.appendChild(li);
    });
}
