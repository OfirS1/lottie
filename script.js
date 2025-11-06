const rulesTableBody = document.querySelector('#rulesTable tbody');
const ruleCount = document.querySelector('#ruleCount');
const addRuleForm = document.querySelector('#addRuleForm');
const searchInput = document.querySelector('#searchInput');
const rowTemplate = document.querySelector('#ruleRowTemplate');

const rules = [
  { number: 1, name: 'Register date equals pay date', id: '5', description: 'תאריך הרישום זהה לתאריך התשלום' },
  { number: 2, name: 'Register date in last week', id: '3', description: 'תאריך רישום מהשבוע האחרון' },
  { number: 3, name: 'Register day equals birthday', id: '25', description: 'יום הרשמה שווה ליום הולדת' },
  { number: 4, name: 'Register month equals birth month', id: '2', description: 'חודש הרשמה שווה לחודש יומולדת' },
  { number: 5, name: 'No redeem in week', id: '95', description: 'אין מימוש/משיכה השבוע' },
  { number: 6, name: 'No pay in week', id: '3', description: 'אין תשלום השבוע' },
  { number: 7, name: '0-3 users added the current user phone number', id: '20', description: '0-3 משתמשים הוסיפו את הטלפון הזה' },
  { number: 8, name: 'Birthday is 24 years ago on same date', id: '2', description: 'יום הולדת 24 שנים בדיוק באותו התאריך' },
  { number: 9, name: 'No contacts on phone', id: '20', description: 'אין אנשי קשר בטלפון' },
  { number: 10, name: 'No waze/facebook/whatsapp installed', id: '1', description: 'אין וויז/פייסבוק/וואצאפ בטלפון' },
  { number: 11, name: 'Blockchain app installed', id: '11', description: 'אפליקציית בלוקצ\'יין מותקנת' },
  { number: 12, name: 'Time zone not Jerusalem', id: '13', description: 'זמן מכשיר לא לפי ירושלים' },
  { number: 13, name: 'Same Device UUID', id: '1', description: 'אותו uuid של מכשיר' },
  { number: 14, name: 'Registered in last 3 days & >1 Israeli ID', id: '1', description: 'משתמש שנרשם בשלושה ימים האחרונים ויש לו יותר מת.ז אחת' },
  { number: 15, name: 'Signed up & paid same day >1500', id: '10', description: 'נרשם ושילם באותו היום מעל 1500' },
  { number: 16, name: 'Banned By Low Wallet Score', id: '0', description: 'לא פעיל' },
  { number: 17, name: 'First transaction day', id: '2', description: 'תשלום ראשון באותו היום' },
  { number: 18, name: 'Suspicious Fingerprint', id: '70', description: 'טביעת מכשיר חשודה' },
  { number: 19, name: 'UUID recently changed', id: '0', description: 'uuid השתנה לאחרונה' }
];

let filteredRules = [...rules];

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
  filteredRules.forEach((rule) => {
    rulesTableBody.appendChild(createRow(rule));
  });
  ruleCount.textContent = `${filteredRules.length} rule${filteredRules.length !== 1 ? 's' : ''}`;
};

const getRuleIndex = (number) => rules.findIndex((rule) => rule.number === number);

const deleteRow = (number) => {
  const ruleIndex = getRuleIndex(number);
  if (ruleIndex === -1) return;

  rules.splice(ruleIndex, 1);
  filteredRules = filteredRules.filter((rule) => rule.number !== number);
  reindexRules();
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

  rules[ruleIndex].name = newName;
  rules[ruleIndex].id = newId;
  rules[ruleIndex].description = newDescription;

  filteredRules = rules.filter((ruleItem) => matchesSearch(ruleItem, searchInput.value.trim()));
  renderTable();
};

const cancelEditingRow = () => {
  renderTable();
};

const reindexRules = () => {
  rules.forEach((rule, index) => {
    rule.number = index + 1;
  });
  filteredRules = rules.filter((rule) => matchesSearch(rule, searchInput.value.trim()));
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
    number: rules.length + 1,
    name,
    id,
    description
  };

  rules.push(newRule);
  filteredRules = rules.filter((rule) => matchesSearch(rule, searchInput.value.trim()));
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

renderTable();
