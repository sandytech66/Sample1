(() => {
  const STORAGE_KEY = 'documentManagerRecords';
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_EXTENSIONS = ['.html', '.htm', '.txt', '.xls', '.xlsx', '.doc', '.docx'];

  const form = document.getElementById('recordForm');
  const nameInput = document.getElementById('name');
  const ageInput = document.getElementById('age');
  const documentInput = document.getElementById('document');
  const nameError = document.getElementById('nameError');
  const ageError = document.getElementById('ageError');
  const documentError = document.getElementById('documentError');
  const recordsList = document.getElementById('recordsList');
  const emptyState = document.getElementById('emptyState');
  const recordCount = document.getElementById('recordCount');

  const getExtension = (fileName) => {
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex === -1 ? '' : fileName.slice(dotIndex).toLowerCase();
  };

  const loadRecords = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveRecords = (records) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (err) {
      if (err && err.name === 'QuotaExceededError') {
        documentError.textContent = 'Storage is full. Delete some records or attach a smaller file.';
      } else {
        documentError.textContent = 'Could not save the record. Please try again.';
      }
      return false;
    }
  };

  const makeId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `rec-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearErrors = () => {
    nameError.textContent = '';
    ageError.textContent = '';
    documentError.textContent = '';
  };

  const renderRecords = () => {
    const records = loadRecords();
    recordCount.textContent = String(records.length);
    recordsList.innerHTML = '';

    if (records.length === 0) {
      recordsList.appendChild(emptyState);
      return;
    }

    records
      .slice()
      .reverse()
      .forEach((record) => {
        const item = document.createElement('div');
        item.className = 'record';

        const info = document.createElement('div');
        info.className = 'record-info';

        const name = document.createElement('div');
        name.className = 'record-name';
        name.textContent = record.name;

        const meta = document.createElement('div');
        meta.className = 'record-meta';
        meta.textContent = `Age: ${record.age}`;

        const doc = document.createElement('div');
        doc.className = 'record-doc';
        doc.title = record.docName;
        doc.textContent = `${record.docName} (${formatSize(record.docSize)})`;

        info.append(name, meta, doc);

        const actions = document.createElement('div');
        actions.className = 'record-actions';

        const downloadLink = document.createElement('a');
        downloadLink.className = 'icon-btn download';
        downloadLink.textContent = 'Download';
        downloadLink.href = record.dataUrl;
        downloadLink.download = record.docName;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'icon-btn delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
          const updated = loadRecords().filter((entry) => entry.id !== record.id);
          saveRecords(updated);
          renderRecords();
        });

        actions.append(downloadLink, deleteBtn);
        item.append(info, actions);
        recordsList.appendChild(item);
      });
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();

    const name = nameInput.value.trim();
    const age = ageInput.value.trim();
    const file = documentInput.files[0];
    let hasError = false;

    if (!name) {
      nameError.textContent = 'Name is required.';
      hasError = true;
    }

    if (!age || Number.isNaN(Number(age)) || Number(age) < 0 || Number(age) > 150) {
      ageError.textContent = 'Enter a valid age between 0 and 150.';
      hasError = true;
    }

    if (!file) {
      documentError.textContent = 'Please attach a document.';
      hasError = true;
    } else {
      const extension = getExtension(file.name);
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        documentError.textContent = `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
        hasError = true;
      } else if (file.size > MAX_FILE_SIZE) {
        documentError.textContent = 'File is too large. Maximum size is 5 MB.';
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const records = loadRecords();
      records.push({
        id: makeId(),
        name,
        age: Number(age),
        docName: file.name,
        docSize: file.size,
        dataUrl,
        createdAt: new Date().toISOString(),
      });
      const saved = saveRecords(records);
      if (saved) {
        form.reset();
        renderRecords();
      }
    } catch {
      documentError.textContent = 'Could not read the file. Please try again.';
    }
  });

  renderRecords();
})();
