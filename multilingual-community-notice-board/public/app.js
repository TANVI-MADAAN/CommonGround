// ------------------------------------------------------------
// FRONTEND JAVASCRIPT
// This file handles page interactions and communicates with
// the Express backend using fetch().
// ------------------------------------------------------------

const noticeGrid = document.getElementById("noticeGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const languageFilter = document.getElementById("languageFilter");
const loginDialog = document.getElementById("loginDialog");
const noticeDialog = document.getElementById("noticeDialog");

let allNotices = [];
let currentUser = null;
let languageRowCount = 0;

// Send a request to the backend and automatically convert JSON responses.
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

// Ask the backend for the current user's login status.
async function checkLogin() {
  try {
    const result = await apiRequest("/api/me");
    currentUser = result.user;
    updateNavigation();
  } catch (error) {
    showToast("Could not connect to the server.");
  }
}

function updateNavigation() {
  const loginButton = document.getElementById("loginButton");
  const userPill = document.getElementById("userPill");
  const logoutButton = document.getElementById("logoutButton");
  const createButton = document.getElementById("createButton");

  loginButton.classList.toggle("hidden", Boolean(currentUser));
  userPill.classList.toggle("hidden", !currentUser);
  logoutButton.classList.toggle("hidden", !currentUser);
  createButton.classList.toggle("hidden", !currentUser || currentUser.role !== "admin");

  if (currentUser) {
    userPill.textContent = currentUser.name + (currentUser.role === "admin" ? " · Admin" : "");
  }
}

// Load public notices from the backend.
async function loadNotices() {
  try {
    allNotices = await apiRequest("/api/notices");
    renderNotices();
  } catch (error) {
    noticeGrid.innerHTML = '<p class="form-error">Could not load notices. Is the server running?</p>';
    document.getElementById("resultsText").textContent = "Connection error";
  }
}

// Find the language version selected by the visitor.
// If it does not exist, use English and explain that fallback.
function getLanguageVersion(notice, languageCode) {
  const selected = notice.versions.find(version => version.languageCode === languageCode);
  const english = notice.versions.find(version => version.languageCode === "en");
  return { version: selected || english || notice.versions[0], isFallback: !selected };
}

// Filter notices using search text and category.
function renderNotices() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedLanguage = languageFilter.value;

  const filtered = allNotices.filter(notice => {
    const version = getLanguageVersion(notice, selectedLanguage).version;
    const searchableText = [notice.title, notice.category, ...notice.versions.map(v => v.title + " " + v.content)].join(" ").toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory && version;
  });

  document.getElementById("noticeCount").textContent = allNotices.length;
  document.getElementById("resultsText").textContent = `${filtered.length} notice${filtered.length === 1 ? "" : "s"} found`;
  document.getElementById("emptyState").classList.toggle("hidden", filtered.length > 0);

  noticeGrid.innerHTML = filtered.map(notice => {
    const result = getLanguageVersion(notice, selectedLanguage);
    const version = result.version;
    const languageCount = notice.versions.length;
    const date = new Date(notice.publishDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    return `
      <article class="notice-card">
        <div class="card-top">
          <span class="category-tag">${escapeHTML(notice.category)}</span>
          <span class="date-text">${date}</span>
        </div>
        <h3>${escapeHTML(version.title || notice.title)}</h3>
        <p class="notice-content">${escapeHTML(version.content)}</p>
        ${result.isFallback ? '<p class="translation-note">This notice is not yet available in your selected language. Showing another available version.</p>' : ""}
        <div class="card-bottom">
          <span class="language-count">${languageCount} language version${languageCount === 1 ? "" : "s"}</span>
          <button class="read-link" data-notice-id="${escapeHTML(notice.id)}">Read notice ↗</button>
        </div>
      </article>`;
  }).join("");

  // Add click listeners to the newly created Read buttons.
  document.querySelectorAll(".read-link").forEach(button => {
    button.addEventListener("click", () => showNoticeDetails(button.dataset.noticeId));
  });
}

// Escape user-provided text before inserting it into HTML.
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

// Show all language versions and their translation status.
function showNoticeDetails(id) {
  const notice = allNotices.find(item => item.id === id);
  if (!notice) return;

  const details = notice.versions.map(version =>
    `<div class="version-row">
      <div class="version-row-top"><strong>${escapeHTML(version.language)}</strong>
      <span class="category-tag">${escapeHTML(version.translationStatus)}</span></div>
      <h3>${escapeHTML(version.title)}</h3><p class="notice-content">${escapeHTML(version.content)}</p>
    </div>`
  ).join("");

  const dialog = document.createElement("dialog");
  dialog.className = "modal modal-wide";
  dialog.innerHTML = `<div class="modal-content">
    <button class="modal-close" aria-label="Close">×</button>
    <p class="eyebrow">${escapeHTML(notice.category)} · ${escapeHTML(notice.publishDate)}</p>
    <h2>${escapeHTML(notice.title)}</h2><p class="modal-intro">Available language versions and translation progress</p>
    ${details}<button class="button button-primary button-full close-details">Close</button>
  </div>`;
  document.body.appendChild(dialog);
  dialog.querySelectorAll(".modal-close,.close-details").forEach(button => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("close", () => dialog.remove());
  dialog.showModal();
}

// Create one language-version editor row.
function addLanguageRow(defaultLanguage = "en") {
  languageRowCount++;
  const row = document.createElement("div");
  row.className = "version-row";
  row.innerHTML = `
    <div class="version-row-top">
      <select class="language-name" aria-label="Language">
        <option value="en" ${defaultLanguage === "en" ? "selected" : ""}>English</option>
        <option value="hi" ${defaultLanguage === "hi" ? "selected" : ""}>Hindi (हिन्दी)</option>
        <option value="pa" ${defaultLanguage === "pa" ? "selected" : ""}>Punjabi (ਪੰਜਾਬੀ)</option>
        <option value="other" ${defaultLanguage === "other" ? "selected" : ""}>Other language</option>
      </select>
      <select class="status-select translation-status" aria-label="Translation status">
        <option>Completed</option><option>In Progress</option><option>Pending</option>
      </select>
    </div>
    <input class="version-title" required maxlength="100" placeholder="Notice title in this language">
    <textarea class="version-content" required placeholder="Write the notice in this language..."></textarea>
    <button type="button" class="read-link remove-version">Remove this language ×</button>`;
  row.querySelector(".remove-version").addEventListener("click", () => row.remove());
  document.getElementById("versionFields").appendChild(row);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// Search and filter update the visible notices immediately.
searchInput.addEventListener("input", renderNotices);
categoryFilter.addEventListener("change", renderNotices);
languageFilter.addEventListener("change", renderNotices);

document.getElementById("loginButton").addEventListener("click", () => loginDialog.showModal());
document.getElementById("createButton").addEventListener("click", () => {
  document.getElementById("noticeForm").reset();
  document.getElementById("versionFields").innerHTML = "";
  addLanguageRow("en");
  addLanguageRow("hi");
  document.querySelector('#noticeForm [name="publishDate"]').value = new Date().toISOString().slice(0, 10);
  document.getElementById("noticeError").textContent = "";
  noticeDialog.showModal();
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => document.getElementById(button.dataset.close).close());
});

// Login form submits credentials to the backend.
document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const formData = new FormData(event.target);
  try {
    const result = await apiRequest("/api/login", {
      method: "POST",
      body: JSON.stringify({ username: formData.get("username"), password: formData.get("password") })
    });
    currentUser = result.user;
    updateNavigation();
    loginDialog.close();
    event.target.reset();
    showToast("Signed in successfully.");
  } catch (error) {
    document.getElementById("loginError").textContent = error.message;
  }
});

// Logout asks the backend to destroy the session.
document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    await apiRequest("/api/logout", { method: "POST" });
    currentUser = null;
    updateNavigation();
    showToast("You have logged out.");
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById("addLanguageButton").addEventListener("click", () => addLanguageRow("pa"));

// Collect the form values and send a new notice to the backend.
document.getElementById("noticeForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.target;
  const versions = [...document.querySelectorAll(".version-row")].map(row => {
    const languageSelect = row.querySelector(".language-name");
    const languageMap = { en: "English", hi: "हिन्दी", pa: "ਪੰਜਾਬੀ", other: "Other" };
    return {
      language: languageMap[languageSelect.value],
      languageCode: languageSelect.value,
      title: row.querySelector(".version-title").value.trim(),
      content: row.querySelector(".version-content").value.trim(),
      translationStatus: row.querySelector(".translation-status").value
    };
  });

  if (!versions.length) {
    document.getElementById("noticeError").textContent = "Add at least one language version.";
    return;
  }

  const payload = {
    title: form.elements.title.value.trim(),
    category: form.elements.category.value,
    publishDate: form.elements.publishDate.value,
    expiryDate: form.elements.expiryDate.value,
    versions
  };

  try {
    await apiRequest("/api/notices", { method: "POST", body: JSON.stringify(payload) });
    noticeDialog.close();
    await loadNotices();
    showToast("Your notice has been published.");
  } catch (error) {
    document.getElementById("noticeError").textContent = error.message;
  }
});

// Start the page.
checkLogin();
loadNotices();