(function () {
  const API_BASE_URL = "http://localhost:8000/api/v1";

  const entriesBody = document.getElementById("entries-body");
  const entriesStatus = document.getElementById("entries-status");
  const refreshBtn = document.getElementById("refresh-btn");

  const form = document.getElementById("entry-form");
  const dateInput = document.getElementById("date");
  const memberInput = document.getElementById("member_name");
  const activityInput = document.getElementById("activity");
  const hoursInput = document.getElementById("hours");
  const formError = document.getElementById("form-error");
  const formSuccess = document.getElementById("form-success");

  function setEntriesStatus(message, type) {
    entriesStatus.textContent = message || "";
    entriesStatus.className = "status" + (type ? " " + type : "");
  }

  function setFormMessage(type, message) {
    formError.textContent = "";
    formSuccess.textContent = "";
    if (type === "error") {
      formError.textContent = message;
    } else if (type === "success") {
      formSuccess.textContent = message;
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toISOString().slice(0, 10);
    } catch {
      return dateStr;
    }
  }

  function renderRows(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      entriesBody.innerHTML = "";
      setEntriesStatus("No entries yet.", "info");
      return;
    }

    const rowsHtml = entries
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      .map((entry) => {
        const safeActivity = (entry.activity || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeMember = (entry.member_name || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<tr data-id="${entry.id}">
          <td>${formatDate(entry.date)}</td>
          <td>${safeMember}</td>
          <td>${safeActivity}</td>
          <td>${Number(entry.hours).toFixed(2)}</td>
          <td class="actions-col">
            <button type="button" class="danger delete-btn">Delete</button>
          </td>
        </tr>`;
      })
      .join("");

    entriesBody.innerHTML = rowsHtml;
  }

  async function loadEntries() {
    setEntriesStatus("Loading entries...", "info");
    entriesBody.innerHTML = "";
    try {
      const res = await fetch(`${API_BASE_URL}/entries`);
      if (!res.ok) {
        throw new Error(`Failed to load entries (HTTP ${res.status})`);
      }
      const data = await res.json();
      renderRows(data);
      if (Array.isArray(data) && data.length > 0) {
        setEntriesStatus(`Loaded ${data.length} entr${data.length === 1 ? "y" : "ies"}.`, "success");
      }
    } catch (err) {
      console.error(err);
      setEntriesStatus("Failed to load entries. Please try again.", "error");
    }
  }

  async function createEntry(payload) {
    const res = await fetch(`${API_BASE_URL}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let message = "Failed to create entry.";
      if (res.status === 422) {
        message = "Validation failed. Check your inputs (hours must be > 0 and \\u2264 24).";
      }
      throw new Error(message);
    }

    return res.json();
  }

  async function deleteEntry(id) {
    const res = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: "DELETE",
    });

    if (!res.ok && res.status !== 404) {
      throw new Error("Failed to delete entry.");
    }
  }

  function validateForm() {
    const date = dateInput.value.trim();
    const member = memberInput.value.trim();
    const activity = activityInput.value.trim();
    const hoursRaw = hoursInput.value.trim();

    if (!date || !member || !activity || !hoursRaw) {
      throw new Error("All fields are required.");
    }

    const hours = Number(hoursRaw);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
      throw new Error("Hours must be a number greater than 0 and at most 24.");
    }

    return {
      date,
      member_name: member,
      activity,
      hours,
    };
  }

  function attachEventListeners() {
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        loadEntries();
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setFormMessage();

      let payload;
      try {
        payload = validateForm();
      } catch (err) {
        setFormMessage("error", err.message || "Invalid form data.");
        return;
      }

      const originalText = form.querySelector("button[type='submit']").textContent;
      const submitBtn = form.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      try {
        await createEntry(payload);
        setFormMessage("success", "Entry added successfully.");
        form.reset();
        loadEntries();
      } catch (err) {
        console.error(err);
        setFormMessage("error", err.message || "Failed to save entry.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    entriesBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("delete-btn")) return;

      const row = target.closest("tr");
      if (!row) return;
      const id = row.getAttribute("data-id");
      if (!id) return;

      const confirmed = window.confirm("Delete this entry?");
      if (!confirmed) return;

      target.disabled = true;
      target.textContent = "Deleting...";

      try {
        await deleteEntry(id);
        row.remove();
        if (!entriesBody.children.length) {
          setEntriesStatus("No entries yet.", "info");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to delete entry. Please try again.");
        target.disabled = false;
        target.textContent = "Delete";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().slice(0, 10);
    if (dateInput) {
      dateInput.value = today;
    }
    attachEventListeners();
    loadEntries();
  });
})();
