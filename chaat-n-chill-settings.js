(function () {
  const STORAGE_KEY = "juiceShop_app_settings_v2";

  const defaultSettings = {
    cloud: { sheetsUrl: "", formUrl: "", sheetsConnected: false, formConnected: false },
    profile: { shopName: "Chaat N Chill", ownerName: "", email: "", phone: "", address: "", image: "" },
    theme: { mode: "light", primary: "#f97316", accent: "#0ea5e9", fontSize: "medium" },
    contact: { businessPhone: "", whatsapp: "", email: "", website: "", address: "", instagram: "", facebook: "" }
  };

  let settings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || defaultSettings;
  let activeTab = "editBills";

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    alert("Saved successfully ✅");
  }

  function getBills() {
    const keys = Object.keys(localStorage);
    let bills = [];

    keys.forEach(k => {
      try {
        const v = JSON.parse(localStorage.getItem(k));
        if (Array.isArray(v)) {
          v.forEach((x, i) => {
            if (x && (x.total || x.items || x.cart)) {
              bills.push({ key: k, index: i, data: x });
            }
          });
        }
      } catch {}
    });

    if (bills.length === 0) {
      return [
        { key: "demo", index: 0, data: { id: 5, total: 300, items: [{ name: "Apple Juice" }], date: "17/05/2026" } },
        { key: "demo", index: 1, data: { id: 4, total: 2.5, items: [{ name: "Lemon Juice" }], date: "17/05/2026" } },
        { key: "demo", index: 2, data: { id: 3, total: 5.5, items: [{ name: "Mango Juice" }], date: "17/05/2026" } }
      ];
    }

    return bills;
  }

  function deleteBill(key, index) {
    if (!confirm("Delete this bill?")) return;

    if (key !== "demo") {
      try {
        let arr = JSON.parse(localStorage.getItem(key));
        arr.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(arr));
      } catch {}
    }

    render();
  }

  function editBill(key, index) {
    const amount = prompt("Enter new bill amount:");
    if (!amount) return;

    if (key !== "demo") {
      try {
        let arr = JSON.parse(localStorage.getItem(key));
        arr[index].total = Number(amount);
        localStorage.setItem(key, JSON.stringify(arr));
      } catch {}
    }

    alert("Bill updated ✅");
    render();
  }

  function css() {
    if (document.getElementById("js-settings-style")) return;

    const style = document.createElement("style");
    style.id = "js-settings-style";
    style.innerHTML = `
      .js-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:18px}
      .js-modal{width:min(980px,96vw);height:min(760px,92vh);background:#f8fafc;border-radius:26px;box-shadow:0 30px 90px rgba(0,0,0,.25);overflow:hidden;font-family:Inter,system-ui,Arial;color:#111827;animation:pop .2s ease}
      @keyframes pop{from{transform:scale(.96);opacity:.5}to{transform:scale(1);opacity:1}}
      .js-head{display:flex;align-items:center;gap:12px;padding:22px 26px;background:white;border-bottom:1px solid #eef2f7}
      .js-logo{width:48px;height:48px;border-radius:50%;object-fit:cover}
      .js-title{font-size:18px;font-weight:900}
      .js-sub{font-size:13px;color:#64748b}
      .js-close{margin-left:auto;border:0;background:#f1f5f9;width:42px;height:42px;border-radius:50%;font-size:22px;cursor:pointer}
      .js-body{display:grid;grid-template-columns:290px 1fr;height:calc(100% - 93px)}
      .js-side{background:white;padding:20px;border-right:1px solid #eef2f7}
      .js-tab{width:100%;display:flex;align-items:center;gap:12px;padding:14px;border:0;background:transparent;border-radius:16px;font-weight:800;color:#334155;cursor:pointer;margin-bottom:10px;text-align:left}
      .js-tab.active{background:linear-gradient(90deg,#fff7ed,#e0f2fe);color:#ea580c}
      .js-content{padding:24px;overflow:auto}
      .js-h1{font-size:25px;font-weight:950;margin:0}
      .js-p{color:#64748b;margin:6px 0 18px}
      .js-card{background:white;border:1px solid #eef2f7;border-radius:20px;padding:18px;margin-bottom:16px;box-shadow:0 8px 20px rgba(15,23,42,.04)}
      .js-card h3{margin:0 0 14px;font-size:17px}
      .js-label{font-size:13px;font-weight:800;color:#475569;margin:12px 0 6px;display:block}
      .js-input,.js-select,.js-textarea{width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:14px;padding:13px;background:white;font-size:14px;outline:none}
      .js-textarea{min-height:85px;resize:vertical}
      .js-btn{border:0;border-radius:14px;padding:12px 16px;font-weight:900;cursor:pointer;background:#2563eb;color:white;margin-top:12px}
      .js-btn.orange{background:#f97316}
      .js-btn.red{background:#fee2e2;color:#dc2626}
      .js-btn.light{background:#eff6ff;color:#2563eb}
      .js-status{display:inline-block;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;background:#fee2e2;color:#dc2626;margin-left:8px}
      .js-status.ok{background:#dcfce7;color:#16a34a}
      .js-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .js-bill{border:1px solid #e2e8f0;border-radius:18px;padding:16px;margin-bottom:12px;background:#fff}
      .js-bill strong{display:block;margin-bottom:6px}
      .js-profile{display:flex;align-items:center;gap:14px;background:linear-gradient(90deg,#fff7ed,#eff6ff);border:1px solid #fed7aa;border-radius:18px;padding:16px}
      .js-profile img{width:72px;height:72px;border-radius:50%;object-fit:cover}
      .js-color{width:70px;height:40px;border:0;background:transparent}
      .js-preview{border-radius:18px;padding:18px;background:linear-gradient(135deg,var(--p),var(--a));color:white;font-weight:900}
      @media(max-width:750px){.js-body{grid-template-columns:1fr}.js-side{display:grid;grid-template-columns:1fr 1fr;gap:8px}.js-grid{grid-template-columns:1fr}.js-modal{height:94vh}}
    `;
    document.head.appendChild(style);
  }

  function tabButton(id, icon, name) {
    return `<button class="js-tab ${activeTab === id ? "active" : ""}" onclick="window.jsSetTab('${id}')">${icon} ${name}</button>`;
  }

  function content() {
    if (activeTab === "editBills") {
      const bills = getBills();
      return `
        <h1 class="js-h1">Edit Bills</h1><p class="js-p">Edit or delete saved bills from settings only.</p>
        <div class="js-card"><h3>🧾 Bill Editor</h3>
        ${bills.map((b, i) => `
          <div class="js-bill">
            <strong>Bill #${b.data.id || i + 1}</strong>
            <div class="js-p">${b.data.date || "Saved bill"} • ${(b.data.items || b.data.cart || []).length || 1} item(s)</div>
            <b style="color:#f97316">₹${b.data.total || b.data.grandTotal || 0}</b><br>
            <button class="js-btn light" onclick="window.jsEditBill('${b.key}',${b.index})">✏️ Edit</button>
            <button class="js-btn red" onclick="window.jsDeleteBill('${b.key}',${b.index})">🗑 Delete</button>
          </div>`).join("")}
        </div>`;
    }

    if (activeTab === "cloud") return `
      <h1 class="js-h1">Cloud Storage</h1><p class="js-p">Connect Google Sheets and Forms for future API sync.</p>
      <div class="js-card"><h3>☁️ Google Sheets <span class="js-status ${settings.cloud.sheetsConnected ? "ok" : ""}">${settings.cloud.sheetsConnected ? "Connected" : "Not Connected"}</span></h3>
        <label class="js-label">Google Sheets URL</label><input class="js-input" id="sheetsUrl" value="${settings.cloud.sheetsUrl}" placeholder="https://docs.google.com/spreadsheets/...">
        <button class="js-btn" onclick="window.jsSaveCloud('sheets')">🔗 Connect / Save</button>
      </div>
      <div class="js-card"><h3>📝 Google Forms <span class="js-status ${settings.cloud.formConnected ? "ok" : ""}">${settings.cloud.formConnected ? "Connected" : "Not Connected"}</span></h3>
        <label class="js-label">Google Form URL</label><input class="js-input" id="formUrl" value="${settings.cloud.formUrl}" placeholder="https://forms.gle/...">
        <button class="js-btn" onclick="window.jsSaveCloud('forms')">🔗 Connect / Save</button>
      </div>`;

    if (activeTab === "profile") return `
      <h1 class="js-h1">Profile Edit</h1><p class="js-p">Manage shop identity and owner details.</p>
      <div class="js-card">
        <div class="js-profile"><img src="${settings.profile.image || "/assets/chaat-n-chill-logo.png"}"><div><b>${settings.profile.shopName}</b><div class="js-p">Owner profile</div></div></div>
        <label class="js-label">Profile Image Upload</label><input type="file" class="js-input" id="profileImage" accept="image/*">
        <label class="js-label">Shop Name</label><input class="js-input" id="shopName" value="${settings.profile.shopName}">
        <label class="js-label">Owner Name</label><input class="js-input" id="ownerName" value="${settings.profile.ownerName}">
        <label class="js-label">Email</label><input class="js-input" id="profileEmail" value="${settings.profile.email}">
        <label class="js-label">Phone Number</label><input class="js-input" id="profilePhone" value="${settings.profile.phone}">
        <label class="js-label">Address</label><textarea class="js-textarea" id="profileAddress">${settings.profile.address}</textarea>
        <button class="js-btn orange" onclick="window.jsSaveProfile()">Save Changes</button>
      </div>`;

    if (activeTab === "theme") return `
      <h1 class="js-h1">Theme Settings</h1><p class="js-p">Customize dashboard color, font size and preview.</p>
      <div class="js-card"><h3>🌗 Display Mode</h3>
        <select class="js-select" id="themeMode"><option value="light">Light Mode</option><option value="dark">Dark Mode</option></select>
      </div>
      <div class="js-grid">
        <div class="js-card"><h3>🎨 Primary Color</h3><input class="js-color" type="color" id="primaryColor" value="${settings.theme.primary}"></div>
        <div class="js-card"><h3>✨ Dashboard Accent</h3><input class="js-color" type="color" id="accentColor" value="${settings.theme.accent}"></div>
      </div>
      <div class="js-card"><h3>🔠 Font Size</h3>
        <select class="js-select" id="fontSize"><option>small</option><option>medium</option><option>large</option></select>
      </div>
      <div class="js-card"><h3>Preview</h3><div class="js-preview" style="--p:${settings.theme.primary};--a:${settings.theme.accent}">JuiceShop Dashboard Preview</div>
        <button class="js-btn orange" onclick="window.jsSaveTheme()">Save Theme</button>
      </div>`;

    return `
      <h1 class="js-h1">Contact Information</h1><p class="js-p">Save customer-facing business and social details.</p>
      <div class="js-card">
        ${[
          ["businessPhone","Business phone number"],
          ["whatsapp","WhatsApp number"],
          ["email","Email"],
          ["website","Website"],
          ["address","Address"],
          ["instagram","Instagram"],
          ["facebook","Facebook"]
        ].map(x => `<label class="js-label">${x[1]}</label><input class="js-input" id="${x[0]}" value="${settings.contact[x[0]] || ""}">`).join("")}
        <button class="js-btn orange" onclick="window.jsSaveContact()">Save Contact</button>
      </div>`;
  }

  function render() {
    css();
    let old = document.getElementById("js-settings-overlay");
    if (old) old.remove();

    document.body.insertAdjacentHTML("beforeend", `
      <div class="js-overlay" id="js-settings-overlay">
        <div class="js-modal">
          <div class="js-head">
            <img class="js-logo" src="/assets/chaat-n-chill-logo.png">
            <div><div class="js-title">${settings.profile.shopName || "JuiceShop"}</div><div class="js-sub">App Settings</div></div>
            <button class="js-close" onclick="document.getElementById('js-settings-overlay').remove()">×</button>
          </div>
          <div class="js-body">
            <div class="js-side">
              ${tabButton("editBills","🧾","Edit Bills")}
              ${tabButton("cloud","☁️","Cloud Storage")}
              ${tabButton("profile","👤","Profile Edit")}
              ${tabButton("theme","🎨","Theme")}
              ${tabButton("contact","☎️","Contact Info")}
            </div>
            <div class="js-content">${content()}</div>
          </div>
        </div>
      </div>
    `);

    const mode = document.getElementById("themeMode");
    if (mode) mode.value = settings.theme.mode;
    const fs = document.getElementById("fontSize");
    if (fs) fs.value = settings.theme.fontSize;
  }

  window.jsSetTab = function (tab) { activeTab = tab; render(); };
  window.jsDeleteBill = deleteBill;
  window.jsEditBill = editBill;

  window.jsSaveCloud = function (type) {
    settings.cloud.sheetsUrl = document.getElementById("sheetsUrl")?.value || settings.cloud.sheetsUrl;
    settings.cloud.formUrl = document.getElementById("formUrl")?.value || settings.cloud.formUrl;
    if (type === "sheets") settings.cloud.sheetsConnected = !!settings.cloud.sheetsUrl;
    if (type === "forms") settings.cloud.formConnected = !!settings.cloud.formUrl;
    saveSettings(); render();
  };

  window.jsSaveProfile = function () {
    settings.profile.shopName = document.getElementById("shopName").value;
    settings.profile.ownerName = document.getElementById("ownerName").value;
    settings.profile.email = document.getElementById("profileEmail").value;
    settings.profile.phone = document.getElementById("profilePhone").value;
    settings.profile.address = document.getElementById("profileAddress").value;

    const file = document.getElementById("profileImage").files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        settings.profile.image = e.target.result;
        saveSettings(); render();
      };
      reader.readAsDataURL(file);
    } else {
      saveSettings(); render();
    }
  };

  window.jsSaveTheme = function () {
    settings.theme.mode = document.getElementById("themeMode").value;
    settings.theme.primary = document.getElementById("primaryColor").value;
    settings.theme.accent = document.getElementById("accentColor").value;
    settings.theme.fontSize = document.getElementById("fontSize").value;
    saveSettings();
  };

  window.jsSaveContact = function () {
    ["businessPhone","whatsapp","email","website","address","instagram","facebook"].forEach(id => {
      settings.contact[id] = document.getElementById(id).value;
    });
    saveSettings();
  };

  function hookAppSettings() {
    document.querySelectorAll("button,a,div,span").forEach(el => {
      if ((el.innerText || "").trim() === "App Settings") {
        el.style.cursor = "pointer";
        el.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          activeTab = "editBills";
          render();
        };
      }
    });
  }

  setInterval(hookAppSettings, 1200);
  setTimeout(hookAppSettings, 1000);
})();