(function () {
  const STORAGE_KEY = "chaat_n_chill_settings";

  const defaultSettings = {
    cloud: { sheetsUrl: "", formUrl: "" },
    profile: { shopName: "Chaat N Chill", ownerName: "", email: "", phone: "", address: "", image: "" },
    theme: { mode: "light", primary: "#f97316", accent: "#0ea5e9", fontSize: "medium" },
    contact: { businessPhone: "", whatsapp: "", email: "", website: "", address: "", instagram: "", facebook: "" }
  };

  function loadSettings() {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return defaultSettings;
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function getBills() {
    const keys = ["bills", "savedBills", "juiceBills", "billingHistory"];
    for (const key of keys) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(data) && data.length) return { key, bills: data };
      } catch {}
    }
    return { key: "bills", bills: [] };
  }

  function saveBills(key, bills) {
    localStorage.setItem(key, JSON.stringify(bills));
  }

  function money(v) {
    const n = Number(v || 0);
    return "₹" + n.toFixed(2);
  }

  function billTotal(bill) {
    return bill.total || bill.grandTotal || bill.amount || bill.total_amount || bill.finalTotal || 0;
  }

  function billName(bill, index) {
    return bill.id || bill.billNo || bill.bill_number || bill.invoiceNo || "#" + (index + 1);
  }

  function openSettings(tab = "bills") {
    const old = document.getElementById("modernSettingsModal");
    if (old) old.remove();

    const settings = loadSettings();
    const billStore = getBills();
    const bills = billStore.bills;

    const modal = document.createElement("div");
    modal.id = "modernSettingsModal";
    modal.innerHTML = `
      <style>
        .ms-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:99999;padding:24px;overflow:auto;backdrop-filter:blur(6px)}
        .ms-box{max-width:980px;margin:20px auto;background:#fff;border-radius:26px;box-shadow:0 25px 80px rgba(0,0,0,.25);font-family:Inter,Arial,sans-serif;overflow:hidden;animation:msPop .22s ease}
        @keyframes msPop{from{transform:translateY(20px);opacity:.4}to{transform:translateY(0);opacity:1}}
        .ms-head{display:flex;justify-content:space-between;align-items:center;padding:22px 26px;border-bottom:1px solid #eef2f7}
        .ms-title{display:flex;gap:12px;align-items:center}
        .ms-logo{width:46px;height:46px;border-radius:16px;background:linear-gradient(135deg,#fff7ed,#e0f2fe);display:grid;place-items:center;font-size:22px}
        .ms-close{border:0;background:#f3f4f6;width:38px;height:38px;border-radius:50%;font-size:22px;cursor:pointer}
        .ms-tabs{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:18px 26px;background:#fff}
        .ms-tab{border:0;border-radius:16px;padding:15px;text-align:left;font-weight:700;cursor:pointer;background:#f8fafc;color:#334155}
        .ms-tab.active{background:linear-gradient(90deg,#fff7ed,#e0f2fe);color:#111827}
        .ms-body{padding:24px 26px;background:#f8fafc;max-height:68vh;overflow:auto}
        .ms-section{display:none}
        .ms-section.active{display:block}
        .ms-card{background:#fff;border:1px solid #edf2f7;border-radius:20px;padding:18px;margin-bottom:16px;box-shadow:0 8px 24px rgba(15,23,42,.04)}
        .ms-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .ms-label{font-size:13px;font-weight:700;color:#475569;margin:8px 0 6px}
        .ms-input,.ms-select,.ms-textarea{width:100%;box-sizing:border-box;border:1px solid #e5e7eb;border-radius:14px;padding:13px 14px;font-size:14px;outline:none;background:#fff}
        .ms-textarea{min-height:90px;resize:vertical}
        .ms-btn{border:0;border-radius:14px;padding:12px 16px;font-weight:800;cursor:pointer}
        .ms-primary{background:#f97316;color:#fff}
        .ms-blue{background:#2563eb;color:#fff}
        .ms-red{background:#fee2e2;color:#dc2626}
        .ms-badge{display:inline-block;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:800;background:#f1f5f9;color:#64748b}
        .ms-bill{display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid #e5e7eb;border-radius:18px;padding:14px;margin:10px 0;background:#fff}
        .ms-actions{display:flex;gap:8px;flex-wrap:wrap}
        .ms-preview{border-radius:18px;padding:18px;background:linear-gradient(135deg,#fff7ed,#e0f2fe)}
        @media(max-width:700px){.ms-tabs,.ms-grid{grid-template-columns:1fr}.ms-box{margin:0}.ms-overlay{padding:10px}.ms-bill{display:block}.ms-actions{margin-top:12px}}
      </style>

      <div class="ms-overlay">
        <div class="ms-box">
          <div class="ms-head">
            <div class="ms-title">
              <div class="ms-logo">⚙️</div>
              <div>
                <h2 style="margin:0;font-size:22px">App Settings</h2>
                <p style="margin:4px 0 0;color:#64748b;font-size:13px">Manage shop, theme, cloud and bills</p>
              </div>
            </div>
            <button class="ms-close" onclick="document.getElementById('modernSettingsModal').remove()">×</button>
          </div>

          <div class="ms-tabs">
            <button class="ms-tab ${tab==="bills"?"active":""}" onclick="openSettings('bills')">🧾 Edit / Delete Bills</button>
            <button class="ms-tab ${tab==="cloud"?"active":""}" onclick="openSettings('cloud')">☁️ Cloud Storage</button>
            <button class="ms-tab ${tab==="profile"?"active":""}" onclick="openSettings('profile')">👤 Profile Edit</button>
            <button class="ms-tab ${tab==="theme"?"active":""}" onclick="openSettings('theme')">🎨 Theme</button>
            <button class="ms-tab ${tab==="contact"?"active":""}" onclick="openSettings('contact')">📞 Contact Info</button>
          </div>

          <div class="ms-body">
            <div class="ms-section ${tab==="bills"?"active":""}">
              <h2 style="margin:0 0 6px">Bill Settings</h2>
              <p style="margin:0 0 16px;color:#64748b">Select one saved bill to edit or delete.</p>
              <div class="ms-card">
                ${bills.length ? bills.map((bill, index) => `
                  <div class="ms-bill">
                    <div>
                      <b>Bill ${billName(bill,index)}</b>
                      <div style="color:#64748b;font-size:13px;margin-top:4px">${bill.date || bill.createdAt || ""} • ${(bill.items && bill.items.length) || bill.itemCount || 0} item(s)</div>
                      <div style="color:#f97316;font-weight:900;margin-top:8px">${money(billTotal(bill))}</div>
                    </div>
                    <div class="ms-actions">
                      <button class="ms-btn ms-blue" onclick="editSelectedBill(${index})">Edit</button>
                      <button class="ms-btn ms-red" onclick="deleteSelectedBill(${index})">Delete</button>
                    </div>
                  </div>
                `).join("") : `<p style="color:#64748b">No saved bills found.</p>`}
              </div>
            </div>

            <div class="ms-section ${tab==="cloud"?"active":""}">
              <h2>Cloud Storage</h2>
              <div class="ms-card">
                <h3>Google Sheets <span class="ms-badge">${settings.cloud.sheetsUrl ? "Connected" : "Not Connected"}</span></h3>
                <input id="msSheets" class="ms-input" placeholder="Google Sheets URL" value="${settings.cloud.sheetsUrl}">
                <br><br>
                <h3>Google Forms <span class="ms-badge">${settings.cloud.formUrl ? "Connected" : "Not Connected"}</span></h3>
                <input id="msForm" class="ms-input" placeholder="Google Form URL" value="${settings.cloud.formUrl}">
                <br><br>
                <button class="ms-btn ms-primary" onclick="saveCloudSettings()">Connect / Save</button>
              </div>
            </div>

            <div class="ms-section ${tab==="profile"?"active":""}">
              <h2>Profile Edit</h2>
              <div class="ms-card">
                <div class="ms-grid">
                  <div><div class="ms-label">Shop Name</div><input id="msShop" class="ms-input" value="${settings.profile.shopName}"></div>
                  <div><div class="ms-label">Owner Name</div><input id="msOwner" class="ms-input" value="${settings.profile.ownerName}"></div>
                  <div><div class="ms-label">Email</div><input id="msEmail" class="ms-input" value="${settings.profile.email}"></div>
                  <div><div class="ms-label">Phone Number</div><input id="msPhone" class="ms-input" value="${settings.profile.phone}"></div>
                </div>
                <div class="ms-label">Address</div>
                <textarea id="msAddress" class="ms-textarea">${settings.profile.address}</textarea>
                <div class="ms-label">Profile Image Upload</div>
                <input id="msImage" class="ms-input" type="file" accept="image/*">
                <br><br>
                <button class="ms-btn ms-primary" onclick="saveProfileSettings()">Save Changes</button>
              </div>
            </div>

            <div class="ms-section ${tab==="theme"?"active":""}">
              <h2>Theme Settings</h2>
              <div class="ms-card">
                <div class="ms-grid">
                  <div><div class="ms-label">Mode</div><select id="msMode" class="ms-select"><option value="light">Light Mode</option><option value="dark">Dark Mode</option></select></div>
                  <div><div class="ms-label">Font Size</div><select id="msFont" class="ms-select"><option>small</option><option>medium</option><option>large</option></select></div>
                  <div><div class="ms-label">Primary Color</div><input id="msPrimary" class="ms-input" type="color" value="${settings.theme.primary}"></div>
                  <div><div class="ms-label">Dashboard Accent</div><input id="msAccent" class="ms-input" type="color" value="${settings.theme.accent}"></div>
                </div>
                <br>
                <div class="ms-preview"><b>Preview</b><p>Modern JuiceShop dashboard theme preview.</p></div>
                <br>
                <button class="ms-btn ms-primary" onclick="saveThemeSettings()">Save Theme</button>
              </div>
            </div>

            <div class="ms-section ${tab==="contact"?"active":""}">
              <h2>Contact Information</h2>
              <div class="ms-card">
                <div class="ms-grid">
                  <input id="msBusinessPhone" class="ms-input" placeholder="Business phone number" value="${settings.contact.businessPhone}">
                  <input id="msWhatsapp" class="ms-input" placeholder="WhatsApp number" value="${settings.contact.whatsapp}">
                  <input id="msContactEmail" class="ms-input" placeholder="Email" value="${settings.contact.email}">
                  <input id="msWebsite" class="ms-input" placeholder="Website" value="${settings.contact.website}">
                  <input id="msInstagram" class="ms-input" placeholder="Instagram" value="${settings.contact.instagram}">
                  <input id="msFacebook" class="ms-input" placeholder="Facebook" value="${settings.contact.facebook}">
                </div>
                <div class="ms-label">Address</div>
                <textarea id="msContactAddress" class="ms-textarea">${settings.contact.address}</textarea>
                <button class="ms-btn ms-primary" onclick="saveContactSettings()">Save Contact</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const mode = document.getElementById("msMode");
    const font = document.getElementById("msFont");
    if (mode) mode.value = settings.theme.mode;
    if (font) font.value = settings.theme.fontSize;
  }

  window.deleteSelectedBill = function (index) {
    const store = getBills();
    if (!confirm("Delete this selected bill?")) return;
    store.bills.splice(index, 1);
    saveBills(store.key, store.bills);
    alert("Selected bill deleted ✅");
    openSettings("bills");
  };

  window.editSelectedBill = function (index) {
    const store = getBills();
    const bill = store.bills[index];
    const oldAmount = billTotal(bill);
    const newAmount = prompt("Enter new bill amount", oldAmount);
    if (newAmount === null) return;
    bill.total = Number(newAmount);
    bill.grandTotal = Number(newAmount);
    bill.amount = Number(newAmount);
    bill.total_amount = Number(newAmount);
    store.bills[index] = bill;
    saveBills(store.key, store.bills);
    alert("Bill updated ✅");
    openSettings("bills");
  };

  window.saveCloudSettings = function () {
    const s = loadSettings();
    s.cloud.sheetsUrl = document.getElementById("msSheets").value;
    s.cloud.formUrl = document.getElementById("msForm").value;
    saveSettings(s);
    alert("Cloud settings saved ✅");
    openSettings("cloud");
  };

  window.saveProfileSettings = function () {
    const s = loadSettings();
    s.profile.shopName = document.getElementById("msShop").value;
    s.profile.ownerName = document.getElementById("msOwner").value;
    s.profile.email = document.getElementById("msEmail").value;
    s.profile.phone = document.getElementById("msPhone").value;
    s.profile.address = document.getElementById("msAddress").value;
    saveSettings(s);
    alert("Profile saved ✅");
    openSettings("profile");
  };

  window.saveThemeSettings = function () {
    const s = loadSettings();
    s.theme.mode = document.getElementById("msMode").value;
    s.theme.fontSize = document.getElementById("msFont").value;
    s.theme.primary = document.getElementById("msPrimary").value;
    s.theme.accent = document.getElementById("msAccent").value;
    saveSettings(s);
    alert("Theme saved ✅");
    openSettings("theme");
  };

  window.saveContactSettings = function () {
    const s = loadSettings();
    s.contact.businessPhone = document.getElementById("msBusinessPhone").value;
    s.contact.whatsapp = document.getElementById("msWhatsapp").value;
    s.contact.email = document.getElementById("msContactEmail").value;
    s.contact.website = document.getElementById("msWebsite").value;
    s.contact.address = document.getElementById("msContactAddress").value;
    s.contact.instagram = document.getElementById("msInstagram").value;
    s.contact.facebook = document.getElementById("msFacebook").value;
    saveSettings(s);
    alert("Contact saved ✅");
    openSettings("contact");
  };

  function hookButton() {
    document.querySelectorAll("button, a, div, span").forEach(el => {
      const text = (el.innerText || "").toLowerCase().trim();
      if (text === "app settings" || text.includes("app settings")) {
        el.style.cursor = "pointer";
        el.onclick = function (e) {
          e.preventDefault();
          openSettings("bills");
        };
      }
    });
  }

  window.openSettings = openSettings;
  setInterval(hookButton, 800);
})();