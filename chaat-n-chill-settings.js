(function () {
  const STORAGE_KEY = "chaat_n_chill_settings_v1";

  const defaultSettings = {
    cloud: { sheetsUrl: "", formUrl: "" },
    profile: { shopName: "Chaat N Chill", ownerName: "", email: "", phone: "", address: "", image: "" },
    theme: { mode: "light", primaryColor: "#f97316", accentColor: "#0ea5e9", fontSize: "medium" },
    contact: { businessPhone: "", whatsapp: "", email: "", website: "", address: "", instagram: "", facebook: "" }
  };

  let settings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || defaultSettings;
  let activeTab = "bills";

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function getBills() {
    let keys = ["savedBills", "bills", "juiceBills", "chaatBills"];
    for (let key of keys) {
      try {
        let data = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(data) && data.length) return { key, data };
      } catch {}
    }
    return { key: "savedBills", data: [] };
  }

  function deleteBill(index) {
    const result = getBills();
    if (!result.data.length) {
      alert("No bills found");
      return;
    }

    if (!confirm("Delete this selected bill?")) return;

    result.data.splice(index, 1);
    localStorage.setItem(result.key, JSON.stringify(result.data));

    alert("Selected bill deleted");
    renderSettings();
  }

  function editBill(index) {
    alert("Edit bill option ready for Bill #" + (index + 1));
  }

  function renderBills() {
    const result = getBills();
    const bills = result.data;

    if (!bills.length) {
      return `<div class="empty-box">No saved bills found.</div>`;
    }

    return `
      <div class="settings-card">
        <h3>🧾 Bill Editor</h3>
        <p>Edit or delete selected saved bills from settings.</p>
        <div class="bill-list">
          ${bills.map((bill, index) => {
            const total = bill.total || bill.grandTotal || bill.amount || 0;
            const items = bill.items?.length || bill.cart?.length || 0;
            return `
              <div class="bill-item">
                <div>
                  <b>Bill #${index + 1}</b>
                  <span>${items} item(s)</span>
                  <strong>₹${total}</strong>
                </div>
                <div class="bill-actions">
                  <button onclick="window.editSelectedBill(${index})">✏️ Edit</button>
                  <button class="danger" onclick="window.deleteSelectedBill(${index})">🗑 Delete</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderCloud() {
    return `
      <div class="settings-card">
        <h3>☁️ Google Sheets</h3>
        <span class="status">${settings.cloud.sheetsUrl ? "Connected" : "Not Connected"}</span>
        <input id="sheetsUrl" placeholder="Google Sheets URL" value="${settings.cloud.sheetsUrl}">
        <button onclick="window.saveCloud()">Connect / Save</button>
      </div>

      <div class="settings-card">
        <h3>📄 Google Forms</h3>
        <span class="status">${settings.cloud.formUrl ? "Connected" : "Not Connected"}</span>
        <input id="formUrl" placeholder="Google Form URL" value="${settings.cloud.formUrl}">
        <button onclick="window.saveCloud()">Connect / Save</button>
      </div>
    `;
  }

  function renderProfile() {
    return `
      <div class="settings-card">
        <h3>👤 Profile Edit</h3>
        <input id="shopName" placeholder="Shop Name" value="${settings.profile.shopName}">
        <input id="ownerName" placeholder="Owner Name" value="${settings.profile.ownerName}">
        <input id="email" placeholder="Email" value="${settings.profile.email}">
        <input id="phone" placeholder="Phone Number" value="${settings.profile.phone}">
        <textarea id="address" placeholder="Address">${settings.profile.address}</textarea>
        <input id="profileImage" type="file" accept="image/*">
        <button onclick="window.saveProfile()">Save Changes</button>
      </div>
    `;
  }

  function renderTheme() {
    return `
      <div class="settings-card">
        <h3>🎨 Theme Settings</h3>
        <label>Mode</label>
        <select id="themeMode">
          <option value="light" ${settings.theme.mode === "light" ? "selected" : ""}>Light Mode</option>
          <option value="dark" ${settings.theme.mode === "dark" ? "selected" : ""}>Dark Mode</option>
        </select>

        <label>Primary Color</label>
        <input id="primaryColor" type="color" value="${settings.theme.primaryColor}">

        <label>Dashboard Accent</label>
        <input id="accentColor" type="color" value="${settings.theme.accentColor}">

        <label>Font Size</label>
        <select id="fontSize">
          <option value="small" ${settings.theme.fontSize === "small" ? "selected" : ""}>Small</option>
          <option value="medium" ${settings.theme.fontSize === "medium" ? "selected" : ""}>Medium</option>
          <option value="large" ${settings.theme.fontSize === "large" ? "selected" : ""}>Large</option>
        </select>

        <div class="preview-box">Preview Section</div>
        <button onclick="window.saveTheme()">Save Theme</button>
      </div>
    `;
  }

  function renderContact() {
    return `
      <div class="settings-card">
        <h3>☎️ Contact Information</h3>
        <input id="businessPhone" placeholder="Business phone number" value="${settings.contact.businessPhone}">
        <input id="whatsapp" placeholder="WhatsApp number" value="${settings.contact.whatsapp}">
        <input id="contactEmail" placeholder="Email" value="${settings.contact.email}">
        <input id="website" placeholder="Website" value="${settings.contact.website}">
        <textarea id="contactAddress" placeholder="Address">${settings.contact.address}</textarea>
        <input id="instagram" placeholder="Instagram link" value="${settings.contact.instagram}">
        <input id="facebook" placeholder="Facebook link" value="${settings.contact.facebook}">
        <button onclick="window.saveContact()">Save Contact</button>
      </div>
    `;
  }

  function renderContent() {
    if (activeTab === "bills") return renderBills();
    if (activeTab === "cloud") return renderCloud();
    if (activeTab === "profile") return renderProfile();
    if (activeTab === "theme") return renderTheme();
    if (activeTab === "contact") return renderContact();
  }

  function renderSettings() {
    const box = document.getElementById("modernSettingsBox");
    if (!box) return;

    box.innerHTML = `
      <div class="modern-modal">
        <button class="close-btn" onclick="window.closeSettings()">×</button>

        <div class="settings-head">
          <h2>App Settings</h2>
          <p>Manage cloud, profile, theme, contact and bills.</p>
        </div>

        <div class="settings-tabs">
          <button class="${activeTab === "bills" ? "active" : ""}" onclick="window.setSettingsTab('bills')">🧾 Edit Bills</button>
          <button class="${activeTab === "cloud" ? "active" : ""}" onclick="window.setSettingsTab('cloud')">☁️ Cloud Storage</button>
          <button class="${activeTab === "profile" ? "active" : ""}" onclick="window.setSettingsTab('profile')">👤 Profile Edit</button>
          <button class="${activeTab === "theme" ? "active" : ""}" onclick="window.setSettingsTab('theme')">🎨 Theme</button>
          <button class="${activeTab === "contact" ? "active" : ""}" onclick="window.setSettingsTab('contact')">☎️ Contact Info</button>
        </div>

        <div class="settings-content">
          ${renderContent()}
        </div>
      </div>
    `;
  }

  function openSettings() {
    let old = document.getElementById("modernSettingsBox");
    if (old) old.remove();

    const box = document.createElement("div");
    box.id = "modernSettingsBox";
    document.body.appendChild(box);

    renderSettings();
  }

  window.closeSettings = function () {
    const box = document.getElementById("modernSettingsBox");
    if (box) box.remove();
  };

  window.setSettingsTab = function (tab) {
    activeTab = tab;
    renderSettings();
  };

  window.saveCloud = function () {
    settings.cloud.sheetsUrl = document.getElementById("sheetsUrl")?.value || "";
    settings.cloud.formUrl = document.getElementById("formUrl")?.value || "";
    saveSettings();
    alert("Cloud settings saved");
    renderSettings();
  };

  window.saveProfile = function () {
    settings.profile.shopName = document.getElementById("shopName")?.value || "";
    settings.profile.ownerName = document.getElementById("ownerName")?.value || "";
    settings.profile.email = document.getElementById("email")?.value || "";
    settings.profile.phone = document.getElementById("phone")?.value || "";
    settings.profile.address = document.getElementById("address")?.value || "";
    saveSettings();
    alert("Profile saved");
  };

  window.saveTheme = function () {
    settings.theme.mode = document.getElementById("themeMode")?.value || "light";
    settings.theme.primaryColor = document.getElementById("primaryColor")?.value || "#f97316";
    settings.theme.accentColor = document.getElementById("accentColor")?.value || "#0ea5e9";
    settings.theme.fontSize = document.getElementById("fontSize")?.value || "medium";
    saveSettings();
    alert("Theme saved");
  };

  window.saveContact = function () {
    settings.contact.businessPhone = document.getElementById("businessPhone")?.value || "";
    settings.contact.whatsapp = document.getElementById("whatsapp")?.value || "";
    settings.contact.email = document.getElementById("contactEmail")?.value || "";
    settings.contact.website = document.getElementById("website")?.value || "";
    settings.contact.address = document.getElementById("contactAddress")?.value || "";
    settings.contact.instagram = document.getElementById("instagram")?.value || "";
    settings.contact.facebook = document.getElementById("facebook")?.value || "";
    saveSettings();
    alert("Contact saved");
  };

  window.deleteSelectedBill = deleteBill;
  window.editSelectedBill = editBill;

  document.addEventListener("click", function (e) {
    const target = e.target.closest("button, a, div");
    if (!target) return;

    const text = (target.innerText || "").trim().toLowerCase();

    if (text === "app settings") {
      e.preventDefault();
      e.stopPropagation();
      openSettings();
    }
  });

  const style = document.createElement("style");
  style.innerHTML = `
    #modernSettingsBox {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .modern-modal {
      width: min(980px, 96vw);
      max-height: 90vh;
      overflow-y: auto;
      background: #f8fafc;
      border-radius: 28px;
      padding: 26px;
      position: relative;
      box-shadow: 0 30px 80px rgba(0,0,0,.25);
      animation: pop .25s ease;
      font-family: Inter, Arial, sans-serif;
    }

    @keyframes pop {
      from { transform: scale(.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .close-btn {
      position: absolute;
      right: 22px;
      top: 20px;
      border: 0;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #e5e7eb;
      cursor: pointer;
      font-size: 22px;
    }

    .settings-head h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 900;
      color: #111827;
    }

    .settings-head p {
      margin: 6px 0 20px;
      color: #64748b;
    }

    .settings-tabs {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .settings-tabs button {
      border: 0;
      padding: 15px;
      border-radius: 18px;
      background: white;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(15,23,42,.06);
      transition: .2s;
    }

    .settings-tabs button.active,
    .settings-tabs button:hover {
      background: linear-gradient(135deg, #fff7ed, #e0f2fe);
      color: #f97316;
      transform: translateY(-2px);
    }

    .settings-content {
      display: grid;
      gap: 16px;
    }

    .settings-card {
      background: white;
      border-radius: 22px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(15,23,42,.07);
      border: 1px solid #eef2f7;
    }

    .settings-card h3 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 900;
      color: #111827;
    }

    .settings-card p {
      margin: 0 0 14px;
      color: #64748b;
    }

    .settings-card input,
    .settings-card textarea,
    .settings-card select {
      width: 100%;
      box-sizing: border-box;
      margin: 8px 0;
      padding: 14px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 15px;
      outline: none;
      font-size: 15px;
      background: #fff;
    }

    .settings-card textarea {
      min-height: 90px;
      resize: vertical;
    }

    .settings-card button,
    .bill-actions button {
      border: 0;
      border-radius: 14px;
      padding: 12px 18px;
      background: linear-gradient(135deg, #f97316, #fb923c);
      color: white;
      font-weight: 800;
      cursor: pointer;
      margin-top: 8px;
    }

    .status {
      display: inline-block;
      background: #f1f5f9;
      color: #475569;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 10px;
    }

    .preview-box {
      padding: 22px;
      border-radius: 18px;
      margin-top: 12px;
      background: linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.accentColor});
      color: white;
      font-weight: 900;
    }

    .bill-list {
      display: grid;
      gap: 12px;
      max-height: 420px;
      overflow-y: auto;
    }

    .bill-item {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 16px;
      border-radius: 18px;
      border: 1px solid #e5e7eb;
      background: #fff;
    }

    .bill-item span {
      display: block;
      color: #64748b;
      margin-top: 4px;
      font-size: 13px;
    }

    .bill-item strong {
      display: block;
      color: #f97316;
      margin-top: 6px;
    }

    .bill-actions {
      display: flex;
      gap: 8px;
    }

    .bill-actions .danger {
      background: linear-gradient(135deg, #ef4444, #f87171);
    }

    .empty-box {
      background: white;
      padding: 30px;
      border-radius: 22px;
      color: #64748b;
      text-align: center;
    }

    @media (max-width: 768px) {
      .settings-tabs {
        grid-template-columns: 1fr;
      }

      .bill-item {
        flex-direction: column;
        align-items: flex-start;
      }

      .modern-modal {
        padding: 18px;
      }
    }
  `;
  document.head.appendChild(style);
})();