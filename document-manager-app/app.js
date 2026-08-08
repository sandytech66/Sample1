(() => {
  const API_URL = '/.netlify/functions/records';
  const CONFIG_URL = '/.netlify/functions/config';
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_EXTENSIONS = ['.html', '.htm', '.txt', '.xls', '.xlsx', '.doc', '.docx'];
  const STORAGE_BUCKET = 'documents';

  let supabaseClient = null;

  const getSupabaseClient = async () => {
    if (supabaseClient) return supabaseClient;
    const res = await fetch(CONFIG_URL);
    if (!res.ok) throw new Error('Could not load storage configuration.');
    const { url, anonKey } = await res.json();
    supabaseClient = window.supabase.createClient(url, anonKey);
    return supabaseClient;
  };

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
      downloadLink.href = '#';
      downloadLink.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
          const res = await fetch(record.dataUrl);
          if (!res.ok) throw new Error('Download failed');
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          const tempLink = document.createElement('a');
          tempLink.href = objectUrl;
          tempLink.download = record.docName;
          document.body.appendChild(tempLink);
          tempLink.click();
          tempLink.remove();
          URL.revokeObjectURL(objectUrl);
        } catch {
          documentError.textContent = 'Could not download the file. Please try again.';
        }
      });

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

  const uploadFile = async (file) => {
    const client = await getSupabaseClient();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
    if (error) throw new Error(error.message || 'Failed to upload file');
    const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  };

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

    submitBtn.disabled = true;
    try {
      const { path, publicUrl } = await uploadFile(file);
      await createRecord({
        name,
        age: Number(age),
        docName: file.name,
        docSize: file.size,
        dataUrl: publicUrl,
        storagePath: path,
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
