(() => {
  const API_URL = '/.netlify/functions/records';
  const MAX_FILE_SIZE = 5 * 1024; // 5 KB
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
  const submitBtn = form.querySelector('button[type="submit"]');

  const getExtension = (fileName) => {
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex === -1 ? '' : fileName.slice(dotIndex).toLowerCase();
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

  const fetchRecords = async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to load records');
    return res.json();
  };

  const createRecord = async (record) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to save record');
    }
    return res.json();
  };

  const deleteRecord = async (id) => {
    const res = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete record');
  };

  const renderRecords = (records) => {
    recordCount.textContent = String(records.length);
    recordsList.innerHTML = '';

    if (records.length === 0) {
      recordsList.appendChild(emptyState);
      return;
    }

    records.forEach((record) => {
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
      deleteBtn.addEventListener('click', async () => {
        deleteBtn.disabled = true;
        try {
          await deleteRecord(record.id);
          await refresh();
        } catch {
          documentError.textContent = 'Could not delete the record. Please try again.';
          deleteBtn.disabled = false;
        }
      });

      actions.append(downloadLink, deleteBtn);
      item.append(info, actions);
      recordsList.appendChild(item);
    });
  };

  const refresh = async () => {
    try {
      const records = await fetchRecords();
      renderRecords(records);
    } catch {
      recordsList.innerHTML = '';
      const errorState = document.createElement('p');
      errorState.className = 'empty-state';
      errorState.textContent = 'Could not load records. Please refresh the page.';
      recordsList.appendChild(errorState);
    }
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
        documentError.textContent = 'File is too large. Maximum size is 5 KB.';
        hasError = true;
      }
    }

    if (hasError) return;

    submitBtn.disabled = true;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await createRecord({
        name,
        age: Number(age),
        docName: file.name,
        docSize: file.size,
        dataUrl,
      });
      form.reset();
      await refresh();
    } catch (err) {
      documentError.textContent = err.message || 'Could not save the record. Please try again.';
    } finally {
      submitBtn.disabled = false;
    }
  });

  refresh();
})();
