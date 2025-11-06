const rulesTableBody = document.querySelector('#rulesTable tbody');
const ruleCount = document.querySelector('#ruleCount');
const addRuleForm = document.querySelector('#addRuleForm');
const searchInput = document.querySelector('#searchInput');
const rowTemplate = document.querySelector('#ruleRowTemplate');
const downloadButton = document.querySelector('#downloadButton');
const resetButton = document.querySelector('#resetButton');
const lastSavedDisplay = document.querySelector('#lastSaved');

const STORAGE_KEY = 'rule-dashboard-data';
const STORAGE_TIMESTAMP_KEY = 'rule-dashboard-last-saved';

const resolveStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage is unavailable:', error);
    return null;
  }
};

const getStorageItem = (key) => {
  const storage = resolveStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch (error) {
    console.warn('Unable to read from local storage:', error);
    return null;
  }
};

const setStorageItem = (key, value) => {
  const storage = resolveStorage();
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch (error) {
    console.warn('Unable to persist data locally:', error);
  }
};

const defaultRules = [
  { name: 'Register date equals pay date', id: '5', description: 'תאריך הרישום זהה לתאריך התשלום' },
  { name: 'Register date in last week', id: '3', description: 'תאריך רישום מהשבוע האחרון' },
  { name: 'Register day equals birthday', id: '25', description: 'יום הרשמה שווה ליום הולדת' },
  { name: 'Register month equals birth month', id: '2', description: 'חודש הרשמה שווה לחודש יומולדת' },
  { name: 'No redeem in week', id: '95', description: 'אין מימוש/משיכה השבוע' },
  { name: 'No pay in week', id: '3', description: 'אין תשלום השבוע' },
  { name: '0-3 users added the current user phone number', id: '20', description: '0-3 משתמשים הוסיפו את הטלפון הזה' },
  { name: 'Birthday is 24 years ago on same date', id: '2', description: 'יום הולדת 24 שנים בדיוק באותו התאריך' },
  { name: 'No contacts on phone', id: '20', description: 'אין אנשי קשר בטלפון' },
  { name: 'No waze/facebook/whatsapp installed', id: '1', description: 'אין וויז/פייסבוק/וואצאפ בטלפון' },
  { name: 'Blockchain app installed', id: '11', description: "אפליקציית בלוקצ'יין מותקנת" },
  { name: 'Time zone not Jerusalem', id: '13', description: 'זמן מכשיר לא לפי ירושלים' },
  { name: 'Same Device UUID', id: '1', description: 'אותו uuid של מכשיר' },
  { name: 'Registered in last 3 days & >1 Israeli ID', id: '1', description: 'משתמש שנרשם בשלושה ימים האחרונים ויש לו יותר מת.ז אחת' },
  { name: 'Signed up & paid same day >1500', id: '10', description: 'נרשם ושילם באותו היום מעל 1500' },
  { name: 'Banned By Low Wallet Score', id: '0', description: 'לא פעיל' },
  { name: 'First transaction day', id: '2', description: 'תשלום ראשון באותו היום' },
  { name: 'Suspicious Fingerprint', id: '70', description: 'טביעת מכשיר חשודה' },
  { name: 'UUID recently changed', id: '0', description: 'uuid השתנה לאחרונה' }
];

const withNumbers = (rules) =>
  rules.map((rule, index) => ({
    ...rule,
    number: index + 1
  }));

const parseStoredRules = (value) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((rule) => rule && typeof rule === 'object')
      .map((rule) => ({
        name: String(rule.name ?? '').trim(),
        id: String(rule.id ?? '').trim(),
        description: String(rule.description ?? '').trim()
      }))
      .filter((rule) => rule.name && rule.id && rule.description);
  } catch (error) {
    console.error('Unable to parse saved rules:', error);
    return null;
  }
};

const loadRules = () => {
  const storedRules = parseStoredRules(getStorageItem(STORAGE_KEY));
  if (storedRules && storedRules.length) {
    return withNumbers(storedRules);
  }
  return withNumbers(defaultRules);
};

let rules = loadRules();
let filteredRules = [...rules];

const saveTimestamp = (isoString) => {
  setStorageItem(STORAGE_TIMESTAMP_KEY, isoString);
};

const updateLastSaved = () => {
  if (!lastSavedDisplay) return;
  const savedValue = getStorageItem(STORAGE_TIMESTAMP_KEY);
  if (!savedValue) {
    lastSavedDisplay.textContent = 'No changes saved yet';
    return;
  }
  try {
    const savedDate = new Date(savedValue);
    if (Number.isNaN(savedDate.getTime())) {
      lastSavedDisplay.textContent = 'No changes saved yet';
      return;
    }
    lastSavedDisplay.textContent = savedDate.toLocaleString();
  } catch (error) {
    console.error('Unable to read last saved timestamp:', error);
    lastSavedDisplay.textContent = 'No changes saved yet';
  }
};

const persistRules = () => {
  const payload = rules.map(({ number, ...rest }) => rest);
  setStorageItem(STORAGE_KEY, JSON.stringify(payload));
  const now = new Date().toISOString();
  saveTimestamp(now);
  updateLastSaved();
};

const createRow = (rule) => {
  const fragment = rowTemplate.content.cloneNode(true);
  const row = fragment.querySelector('tr');

  row.dataset.ruleNumber = rule.number;
  row.querySelector('.rule-index').textContent = rule.number;

  const nameCell = row.querySelector('td[data-field="name"]');
  const idCell = row.querySelector('td[data-field="id"]');
  const descriptionCell = row.querySelector('td[data-field="description"]');

  nameCell.textContent = rule.name;
  nameCell.dataset.label = 'Rule Name';

  idCell.textContent = rule.id;
  idCell.dataset.label = 'Rule ID';

  descriptionCell.textContent = rule.description;
  descriptionCell.dataset.label = 'Description';

  const editButton = row.querySelector('.edit-btn');
  const deleteButton = row.querySelector('.delete-btn');
  editButton.dataset.action = 'edit';
  deleteButton.dataset.action = 'delete';

  return fragment;
};

const renderTable = () => {
  rulesTableBody.innerHTML = '';
  if (!filteredRules.length) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 5;
    emptyCell.className = 'empty-state';
    emptyCell.textContent = searchInput.value.trim()
      ? 'No rules match your search yet.'
      : 'Add your first rule to get started.';
    emptyRow.appendChild(emptyCell);
    rulesTableBody.appendChild(emptyRow);
  } else {
    filteredRules.forEach((rule) => {
      rulesTableBody.appendChild(createRow(rule));
    });
  }

  ruleCount.textContent = `${filteredRules.length} rule${filteredRules.length !== 1 ? 's' : ''}`;
};

const getRuleIndex = (number) => rules.findIndex((rule) => rule.number === number);

const deleteRow = (number) => {
  const ruleIndex = getRuleIndex(number);
  if (ruleIndex === -1) return;

  rules.splice(ruleIndex, 1);
  rules = withNumbers(rules);
  filteredRules = rules.filter((rule) => matchesSearch(rule, searchInput.value.trim()));
  persistRules();
  renderTable();
};

const startEditingRow = (row, number) => {
  const existingEditingRow = rulesTableBody.querySelector('.editing');
  if (existingEditingRow && existingEditingRow !== row) {
    renderTable();
    const refreshedRow = rulesTableBody.querySelector(`tr[data-rule-number="${number}"]`);
    if (refreshedRow) {
      startEditingRow(refreshedRow, number);
    }
    return;
  }

  const ruleIndex = getRuleIndex(number);
  if (ruleIndex === -1) return;

  const rule = rules[ruleIndex];
  row.classList.add('editing');

  const nameCell = row.querySelector('td[data-field="name"]');
  const idCell = row.querySelector('td[data-field="id"]');
  const descriptionCell = row.querySelector('td[data-field="description"]');

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = rule.name;
  nameInput.required = true;

  const idInput = document.createElement('input');
  idInput.type = 'number';
  idInput.value = rule.id;
  idInput.min = '0';
  idInput.step = '1';
  idInput.required = true;

  const descriptionInput = document.createElement('textarea');
  descriptionInput.value = rule.description;
  descriptionInput.rows = 2;

  nameCell.textContent = '';
  idCell.textContent = '';
  descriptionCell.textContent = '';

  nameCell.appendChild(nameInput);
  idCell.appendChild(idInput);
  descriptionCell.appendChild(descriptionInput);

  const editButton = row.querySelector('.edit-btn');
  const deleteButton = row.querySelector('.delete-btn');

  editButton.textContent = 'Save';
  editButton.dataset.action = 'save';

  deleteButton.textContent = 'Cancel';
  deleteButton.dataset.action = 'cancel';
  deleteButton.classList.add('btn--muted');
};

const saveRow = (row, number) => {
  const ruleIndex = getRuleIndex(number);
  if (ruleIndex === -1) return;

  const nameInput = row.querySelector('td[data-field="name"] input');
  const idInput = row.querySelector('td[data-field="id"] input');
  const descriptionInput = row.querySelector('td[data-field="description"] textarea');

  const newName = nameInput.value.trim();
  const newId = idInput.value.trim();
  const newDescription = descriptionInput.value.trim();

  if (!newName || !newId || !newDescription) {
    alert('All fields are required.');
    return;
  }

  rules[ruleIndex] = {
    ...rules[ruleIndex],
    name: newName,
    id: newId,
    description: newDescription
  };

  rules = withNumbers(rules);
  filteredRules = rules.filter((ruleItem) => matchesSearch(ruleItem, searchInput.value.trim()));
  persistRules();
  renderTable();
};

const cancelEditingRow = () => {
  renderTable();
};

const matchesSearch = (rule, query) => {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  return (
    rule.name.toLowerCase().includes(normalizedQuery) ||
    rule.id.toString().includes(normalizedQuery) ||
    rule.description.toLowerCase().includes(normalizedQuery)
  );
};

addRuleForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const nameInput = document.querySelector('#newName');
  const idInput = document.querySelector('#newId');
  const descriptionInput = document.querySelector('#newDescription');

  const name = nameInput.value.trim();
  const id = idInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!name || !id || !description) {
    alert('Please fill out all fields before adding a rule.');
    return;
  }

  const newRule = {
    name,
    id,
    description
  };

  rules.push({ ...newRule, number: rules.length + 1 });
  rules = withNumbers(rules);
  filteredRules = rules.filter((rule) => matchesSearch(rule, searchInput.value.trim()));
  persistRules();
  renderTable();

  addRuleForm.reset();
  nameInput.focus();
});

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim();
  filteredRules = rules.filter((rule) => matchesSearch(rule, query));
  renderTable();
});

rulesTableBody.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const row = button.closest('tr');
  const ruleNumber = Number(row?.dataset.ruleNumber);
  if (!ruleNumber) return;

  switch (button.dataset.action) {
    case 'edit':
      startEditingRow(row, ruleNumber);
      break;
    case 'save':
      saveRow(row, ruleNumber);
      break;
    case 'cancel':
      cancelEditingRow();
      break;
    case 'delete':
      if (confirm('Delete this rule?')) {
        deleteRow(ruleNumber);
      }
      break;
    default:
      break;
  }
});

if (downloadButton) {
  downloadButton.addEventListener('click', () => {
    const payload = rules.map(({ number, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.download = `rules-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
  });
}

if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (!confirm('Reset the dashboard to the original rules?')) {
      return;
    }
    rules = withNumbers(defaultRules);
    filteredRules = [...rules];
    persistRules();
    renderTable();
  });
}

updateLastSaved();
renderTable();
