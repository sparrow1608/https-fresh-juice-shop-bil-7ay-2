(function () {
  const LOGO_URL = "/assets/chaat-n-chill-logo.png";
  const STORAGE_KEY = "chaat-n-chill-settings";
  const SUPABASE_URL = "https://rbyzkgutpwlfhktlqnwf.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJieXprZ3V0cHdsZmhrdGxxbndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTczMzIsImV4cCI6MjA5NDU3MzMzMn0.1luwIintr050bBRHV9AtKGZn2nsQ8SAOdMqy34twUwU";
  // Beginner note: paste your Google Sheet and Google Form links in the Cloud Storage settings UI.
  // For Google Forms, create fields named Bill No, Customer Name, Date, Amount, and Item Details.
  // In Google Forms, open Responses, click the green Sheets icon, then paste that Sheet URL in the Google Sheets URL box.

  const defaults = {
    cloud: {
      sheetsUrl: "",
      formUrl: "",
      sheetsConnected: false,
      formConnected: false,
      formFields: {
        billNo: "Bill No",
        customerName: "Customer Name",
        date: "Date",
        amount: "Amount",
        itemDetails: "Item Details",
      },
    },
    profile: {
      shopName: "Chaat N Chill",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      image: "",
    },
    theme: {
      mode: "light",
      primaryColor: "#f97316",
      accentColor: "#0ea5e9",
      fontSize: "medium",
    },
    contact: {
      businessPhone: "",
      whatsapp: "",
      email: "",
      website: "",
      address: "",
      instagram: "",
      facebook: "",
      youtube: "",
    },
  };

  let settings = loadSettings();
  let activeSettingsTab = "cloud";
  let mutationQueued = false;
  let billEditorState = {
    status: "idle",
    bills: [],
    selectedId: "",
    error: "",
    saving: false,
    deleting: false,
    pendingDeleteId: "",
  };

  const iconPaths = {
    dashboard: '<path d="M3 13h8V3H3v10Z"/><path d="M13 21h8V11h-8v10Z"/><path d="M13 3v6h8V3h-8Z"/><path d="M3 21h8v-6H3v6Z"/>',
    billing: '<path d="M6 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/>',
    purchase: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    reports: '<path d="M3 3v18h18"/><path d="M8 17V9"/><path d="M13 17V5"/><path d="M18 17v-3"/>',
    bills: '<path d="M8 2h8"/><path d="M9 2v4h6V2"/><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M8 11h8"/><path d="M8 15h5"/><path d="M16 15.5l2 2 3-4"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6V20a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.18.36.39.7.6 1H20a2 2 0 1 1 0 4h-.09c-.21.3-.42.64-.51 1Z"/>',
    cloud: '<path d="M17.5 19H7a5 5 0 1 1 .72-9.95A6 6 0 0 1 19 11.5a3.75 3.75 0 0 1-1.5 7.5Z"/>',
    form: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    profile: '<path d="M20 21a8 8 0 0 0-16 0"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>',
    theme: '<path d="M12 22a10 10 0 1 0 0-20 7 7 0 0 0 0 14 3 3 0 0 1 0 6Z"/><path d="M7 10h.01"/><path d="M10 7h.01"/><path d="M14 7h.01"/><path d="M17 10h.01"/>',
    contact: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.58 2.61a2 2 0 0 1-.45 2.11L8 9.67a16 16 0 0 0 6.33 6.33l1.23-1.23a2 2 0 0 1 2.11-.45c.84.26 1.71.46 2.61.58A2 2 0 0 1 22 16.92Z"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  };

  function loadSettings() {
    try {
      return merge(defaults, JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      return structuredClone(defaults);
    }
  }

  function merge(base, override) {
    const output = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(override || {}).forEach((key) => {
      if (override[key] && typeof override[key] === "object" && !Array.isArray(override[key])) {
        output[key] = merge(base[key] || {}, override[key]);
      } else {
        output[key] = override[key];
      }
    });
    return output;
  }

  function saveSettings(message) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      applyPreferences();
      enhanceAppChrome();
      if (message) showToast(message);
    } catch {
      showToast("Could not save. The selected image may be too large.");
    }
  }

  function icon(name, size = 17) {
    return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.settings}</svg>`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getShopName() {
    return settings.profile.shopName.trim() || defaults.profile.shopName;
  }

  function getLogoSrc() {
    return settings.profile.image || LOGO_URL;
  }

  function applyPreferences() {
    const root = document.documentElement;
    root.classList.toggle("cnc-dark", settings.theme.mode === "dark");
    root.style.setProperty("--cnc-primary", settings.theme.primaryColor || defaults.theme.primaryColor);
    root.style.setProperty("--cnc-accent", settings.theme.accentColor || defaults.theme.accentColor);
    const fontScale = { small: 0.94, medium: 1, large: 1.08 }[settings.theme.fontSize] || 1;
    root.style.setProperty("--cnc-font-scale", String(fontScale));
    document.title = `${getShopName()} - Billing & Management`;
  }

  function textOf(element) {
    return (element?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function replaceTextNodes() {
    if (!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const shopName = getShopName();
    const replacements = [
      [/JuiceShop/g, shopName],
      [/Fresh Juice Shop/g, shopName],
      [/\$/g, "₹"],
    ];

    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (parent && !parent.closest(".cnc-settings-overlay")) {
        let next = node.nodeValue;
        replacements.forEach(([pattern, value]) => {
          next = next.replace(pattern, value);
        });
        if (next !== node.nodeValue) node.nodeValue = next;
      }
      node = walker.nextNode();
    }
  }

  function enhanceBrandLogos() {
    const shopName = getShopName();
    document.querySelectorAll("header span, .fixed.top-0.left-0 span").forEach((label) => {
      if (textOf(label) !== shopName) return;
      const holder = label.parentElement?.firstElementChild;
      if (!holder || holder.querySelector(".cnc-logo-img")) return;
      holder.classList.add("cnc-logo-wrap");
      holder.innerHTML = `<img class="cnc-logo-img" src="${escapeHtml(getLogoSrc())}" alt="${escapeHtml(shopName)} logo">`;
    });
  }

  function renderSideMenu() {
    return `
      <div class="cnc-side-menu">
        <div class="cnc-side-menu__title">Menu</div>
        <button type="button" class="cnc-side-menu__button" data-cnc-side-action="dashboard">
          <span class="cnc-menu-icon">${icon("dashboard", 16)}</span><span>Dashboard</span>
        </button>
        <button type="button" class="cnc-side-menu__button" data-cnc-side-action="billing">
          <span class="cnc-menu-icon">${icon("billing", 16)}</span><span>Billing</span>
        </button>
        <button type="button" class="cnc-side-menu__button" data-cnc-side-action="purchasing">
          <span class="cnc-menu-icon">${icon("purchase", 16)}</span><span>Purchasing</span>
        </button>
        <button type="button" class="cnc-side-menu__button" data-cnc-side-action="reports">
          <span class="cnc-menu-icon">${icon("reports", 16)}</span><span>Reports</span>
        </button>
        <button type="button" class="cnc-side-menu__button" data-cnc-side-action="settings">
          <span class="cnc-menu-icon">${icon("settings", 16)}</span><span>App Settings</span>
        </button>
        <div class="cnc-side-menu__sub">
          <button type="button" class="cnc-side-menu__subbutton" data-cnc-side-action="bills">${icon("bills", 15)} Edit Bills</button>
          <button type="button" class="cnc-side-menu__subbutton" data-cnc-side-action="cloud">${icon("cloud", 15)} Cloud Storage</button>
          <button type="button" class="cnc-side-menu__subbutton" data-cnc-side-action="profile">${icon("profile", 15)} Profile Edit</button>
          <button type="button" class="cnc-side-menu__subbutton" data-cnc-side-action="theme">${icon("theme", 15)} Theme</button>
          <button type="button" class="cnc-side-menu__subbutton" data-cnc-side-action="contact">${icon("contact", 15)} Contact Info</button>
        </div>
      </div>
    `;
  }

  function enhanceSidebar() {
    document.querySelectorAll("nav").forEach((nav) => {
      if (nav.closest(".cnc-settings-overlay") || nav.dataset.cncEnhanced === "true") return;
      const label = textOf(nav);
      if (!label.includes("App Settings") || !label.includes("Edit Items")) return;
      nav.dataset.cncEnhanced = "true";
      nav.innerHTML = renderSideMenu();
      nav.addEventListener("click", handleSideMenuClick);
    });
  }

  function handleSideMenuClick(event) {
    const button = event.target.closest("[data-cnc-side-action]");
    if (!button) return;
    event.preventDefault();
    const action = button.dataset.cncSideAction;
    const settingsTabs = { settings: "cloud", bills: "bills", cloud: "cloud", profile: "profile", theme: "theme", contact: "contact" };
    if (settingsTabs[action]) {
      closeSidebar();
      openSettings(settingsTabs[action]);
      return;
    }
    const tabName = action === "dashboard" ? "Billing" : action[0].toUpperCase() + action.slice(1);
    closeSidebar();
    setTimeout(() => clickTopTab(tabName), 60);
  }

  function clickTopTab(name) {
    const button = Array.from(document.querySelectorAll("header button")).find((candidate) => textOf(candidate) === name);
    button?.click();
  }

  function closeSidebar() {
    const drawer = document.querySelector(".fixed.top-0.left-0.z-50");
    const closeButton = drawer?.querySelector("button.w-8.h-8.rounded-full");
    closeButton?.click();
  }

  function interceptOriginalSettingsClick(event) {
    const button = event.target.closest("button");
    if (!button || button.closest(".cnc-settings-overlay") || button.closest(".cnc-side-menu")) return;
    if (textOf(button) !== "App Settings") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeSidebar();
    openSettings("cloud");
  }

  function enhanceAppChrome() {
    replaceTextNodes();
    enhanceBrandLogos();
    enhanceSidebar();
    removeBoltBadge();
  }

  function removeBoltBadge() {
    document.querySelectorAll('a[href*="bolt.new"], script[src*="bolt.new/badge"]').forEach((element) => element.remove());
  }

  function statusPill(connected) {
    return `<span class="cnc-status ${connected ? "cnc-status--connected" : "cnc-status--idle"}">${connected ? "Connected" : "Not Connected"}</span>`;
  }

  function renderSettingsShell() {
    const tabs = [
      ["bills", "Edit Bills", "bills"],
      ["cloud", "Cloud Storage", "cloud"],
      ["profile", "Profile Edit", "profile"],
      ["theme", "Theme", "theme"],
      ["contact", "Contact Info", "contact"],
    ];
    return `
      <div class="cnc-settings-shell" role="dialog" aria-modal="true" aria-label="App Settings">
        <aside class="cnc-settings-sidebar">
          <div class="cnc-settings-brand">
            <img src="${escapeHtml(getLogoSrc())}" alt="${escapeHtml(getShopName())} logo">
            <div><strong>${escapeHtml(getShopName())}</strong><span>App Settings</span></div>
          </div>
          <nav class="cnc-settings-tabs" aria-label="Settings sections">
            ${tabs.map(([id, label, iconName]) => `
              <button type="button" class="cnc-settings-tab ${activeSettingsTab === id ? "is-active" : ""}" data-cnc-settings-tab="${id}">
                <span class="cnc-menu-icon">${icon(iconName, 16)}</span><span>${label}</span>
              </button>
            `).join("")}
          </nav>
        </aside>
        <section class="cnc-settings-content">
          <div class="cnc-settings-header">
            <div>
              <h2>${settingsHeader(activeSettingsTab).title}</h2>
              <p>${settingsHeader(activeSettingsTab).subtitle}</p>
            </div>
            <button type="button" class="cnc-settings-close" data-cnc-close-settings aria-label="Close settings">${icon("close", 18)}</button>
          </div>
          ${renderSettingsContent(activeSettingsTab)}
        </section>
        ${renderDeleteConfirmDialog()}
      </div>
    `;
  }

  function settingsHeader(tab) {
    const copy = {
      bills: ["Edit Bills", "Select a saved bill and update it from Settings."],
      cloud: ["Cloud Storage", "Connect your Google Sheets and Forms links for future sync."],
      profile: ["Profile Edit", "Manage shop identity, owner details, and display image."],
      theme: ["Theme Settings", "Customize display mode, colors, font size, and preview."],
      contact: ["Contact Information", "Save customer-facing business and social details."],
    };
    const [title, subtitle] = copy[tab] || copy.cloud;
    return { title, subtitle };
  }

  function renderSettingsContent(tab) {
    if (tab === "bills") return renderBillEditorSettings();
    if (tab === "profile") return renderProfileSettings();
    if (tab === "theme") return renderThemeSettings();
    if (tab === "contact") return renderContactSettings();
    return renderCloudSettings();
  }

  function renderDeleteConfirmDialog() {
    if (!billEditorState.pendingDeleteId) return "";
    const bill = billEditorState.bills.find((entry) => String(entry.id) === String(billEditorState.pendingDeleteId));
    return `
      <div class="cnc-confirm-backdrop" role="alertdialog" aria-modal="true" aria-label="Delete bill confirmation">
        <div class="cnc-confirm-card">
          <div class="cnc-card-title">${icon("trash")} Delete Bill</div>
          <p>Are you sure you want to delete this bill?</p>
          <small>${bill ? `Bill #${escapeHtml(bill.bill_number)} • ${formatMoney(bill.total_amount)}` : "This action cannot be undone."}</small>
          <div class="cnc-actions">
            <button type="button" class="cnc-button cnc-button--soft" data-cnc-action="cancel-delete-bill">Cancel</button>
            <button type="button" class="cnc-button cnc-button--danger" data-cnc-action="confirm-delete-bill" ${billEditorState.deleting ? "disabled" : ""}>${icon("trash", 15)} ${billEditorState.deleting ? "Deleting..." : "Yes, Delete"}</button>
          </div>
        </div>
      </div>
    `;
  }

  function formatMoney(value) {
    const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
    return `₹${amount.toFixed(2)}`;
  }

  function selectedBill() {
    if (!billEditorState.selectedId && billEditorState.bills.length) {
      billEditorState.selectedId = String(billEditorState.bills[0].id);
    }
    return billEditorState.bills.find((bill) => String(bill.id) === String(billEditorState.selectedId)) || null;
  }

  function ensureBillsLoaded() {
    if (billEditorState.status !== "idle") return;
    billEditorState.status = "loading";
    setTimeout(() => loadBills(), 0);
  }

  async function supabaseRequest(path, options = {}) {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || response.statusText);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function loadBills(force = false) {
    if (!force && billEditorState.status === "loaded") return;
    billEditorState = { ...billEditorState, status: "loading", error: "" };
    rerenderSettings();
    try {
      const bills = await supabaseRequest("bills?select=*,bill_items(*)&order=created_at.desc");
      billEditorState = {
        ...billEditorState,
        status: "loaded",
        bills: Array.isArray(bills) ? bills : [],
        selectedId: billEditorState.selectedId || (bills?.[0] ? String(bills[0].id) : ""),
        error: "",
      };
    } catch (error) {
      billEditorState = {
        ...billEditorState,
        status: "error",
        error: "Could not load bills. Check the database connection and try again.",
      };
      console.error(error);
    }
    rerenderSettings();
  }

  function renderBillEditorSettings() {
    ensureBillsLoaded();
    const bill = selectedBill();
    const bills = billEditorState.bills;

    if (billEditorState.status === "loading") {
      return `
        <div class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("bills")} Loading saved bills</div>
          <p class="text-sm text-gray-500">Fetching bills from the existing app database...</p>
        </div>
      `;
    }

    if (billEditorState.status === "error") {
      return `
        <div class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("bills")} Bill Editor</div>
          <p class="text-sm text-gray-500">${escapeHtml(billEditorState.error)}</p>
          <div class="cnc-actions">
            <button type="button" class="cnc-button cnc-button--primary" data-cnc-action="refresh-bills">${icon("bills", 15)} Try Again</button>
          </div>
        </div>
      `;
    }

    if (!bills.length) {
      return `
        <div class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("bills")} No Bills Yet</div>
          <p class="text-sm text-gray-500">Create a bill from Billing first, then edit it here in Settings.</p>
          <div class="cnc-actions">
            <button type="button" class="cnc-button cnc-button--soft" data-cnc-action="refresh-bills">${icon("bills", 15)} Refresh Bills</button>
          </div>
        </div>
      `;
    }

    const items = Array.isArray(bill?.bill_items) ? bill.bill_items : [];
    const computedTotal = items.reduce((sum, item) => sum + Number(item.subtotal || Number(item.quantity || 0) * Number(item.unit_price || 0)), 0);

    return `
      <div class="cnc-bill-editor">
        <div class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("bills")} Bill Editor</div>
          <div class="cnc-bill-editor-layout">
            <div class="cnc-bill-list">
              ${bills.map((entry) => `
                <div class="cnc-bill-list-item ${String(entry.id) === String(bill?.id) ? "is-active" : ""}">
                  <span>
                    <strong>Bill #${escapeHtml(entry.bill_number)}</strong>
                    <small>${new Date(entry.created_at).toLocaleDateString()} • ${(entry.bill_items || []).length} item(s)</small>
                  </span>
                  <b>${formatMoney(entry.total_amount)}</b>
                  <div class="cnc-bill-row-actions">
                    <button type="button" class="cnc-mini-button cnc-mini-button--edit" data-cnc-bill-select="${escapeHtml(entry.id)}">${icon("edit", 13)} Edit</button>
                    <button type="button" class="cnc-mini-button cnc-mini-button--delete" data-cnc-bill-delete="${escapeHtml(entry.id)}">${icon("trash", 13)} Delete</button>
                  </div>
                </div>
              `).join("")}
            </div>
            <div class="cnc-bill-edit-panel">
              <div class="cnc-field-grid">
                <div class="cnc-field">
                  <label for="cnc-bill-number">Bill Number</label>
                  <input id="cnc-bill-number" class="cnc-input" name="billNumber" value="${escapeHtml(bill?.bill_number || "")}">
                </div>
                <div class="cnc-bill-total-box">
                  <span>Bill Total</span>
                  <strong data-cnc-bill-total>${formatMoney(bill?.total_amount ?? computedTotal)}</strong>
                </div>
              </div>
              <div class="cnc-bill-items">
                <div class="cnc-bill-items-head">
                  <span>Item</span><span>Qty</span><span>Unit Price</span><span>Subtotal</span>
                </div>
                ${items.map((item) => renderBillItemRow(item)).join("")}
              </div>
              <div class="cnc-actions">
                <button type="button" class="cnc-button cnc-button--primary" data-cnc-action="save-bill" ${billEditorState.saving ? "disabled" : ""}>${icon("save", 15)} ${billEditorState.saving ? "Saving..." : "Save Bill Changes"}</button>
                <button type="button" class="cnc-button cnc-button--danger" data-cnc-bill-delete="${escapeHtml(bill?.id || "")}">${icon("trash", 15)} Delete Bill</button>
                <button type="button" class="cnc-button cnc-button--soft" data-cnc-action="refresh-bills">${icon("bills", 15)} Refresh Bills</button>
              </div>
              <p class="text-xs text-gray-400 mt-3">This editor lives only in App Settings, so the Reports page stays clean.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderBillItemRow(item) {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unit_price || 0);
    const subtotal = Number(item.subtotal || quantity * unitPrice);
    return `
      <div class="cnc-bill-item-row" data-cnc-bill-item-row data-bill-item-id="${escapeHtml(item.id)}">
        <input class="cnc-input" name="billItemName" value="${escapeHtml(item.item_name || "")}" aria-label="Item name">
        <input class="cnc-input" name="billItemQuantity" type="number" min="0" step="1" value="${escapeHtml(quantity)}" aria-label="Quantity">
        <input class="cnc-input" name="billItemPrice" type="number" min="0" step="0.01" value="${escapeHtml(unitPrice.toFixed(2))}" aria-label="Unit price">
        <strong data-cnc-item-subtotal>${formatMoney(subtotal)}</strong>
      </div>
    `;
  }

  function renderCloudSettings() {
    const cloud = settings.cloud;
    const formFields = cloud.formFields || defaults.cloud.formFields;
    const sheetsConnected = Boolean(cloud.sheetsConnected && cloud.sheetsUrl);
    const formConnected = Boolean(cloud.formConnected && cloud.formUrl);
    return `
      <div class="cnc-settings-grid">
        <div class="cnc-settings-card">
          <div class="cnc-card-title">${icon("cloud")} Google Sheets ${statusPill(sheetsConnected)}</div>
          <div class="cnc-field">
            <label for="cnc-sheets-url">Google Sheets URL</label>
            <input id="cnc-sheets-url" class="cnc-input" name="sheetsUrl" type="url" value="${escapeHtml(cloud.sheetsUrl)}" placeholder="https://docs.google.com/spreadsheets/...">
          </div>
          <div class="cnc-actions">
            <button type="button" class="cnc-button cnc-button--secondary" data-cnc-action="connect-sheets">${icon("link", 15)} Connect</button>
          </div>
        </div>
        <div class="cnc-settings-card">
          <div class="cnc-card-title">${icon("form")} Google Forms ${statusPill(formConnected)}</div>
          <div class="cnc-field">
            <label for="cnc-form-url">Google Form URL</label>
            <input id="cnc-form-url" class="cnc-input" name="formUrl" type="url" value="${escapeHtml(cloud.formUrl)}" placeholder="https://forms.gle/...">
          </div>
          <div class="cnc-actions">
            <button type="button" class="cnc-button cnc-button--secondary" data-cnc-action="connect-form">${icon("link", 15)} Connect</button>
          </div>
        </div>
        <div class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("save")} Storage Setup</div>
          <p class="text-sm text-gray-500">Links are stored locally now and can be connected to APIs later.</p>
          <p class="text-xs text-gray-400 mt-2">Google Forms idea: create these fields in your form, connect Responses to Google Sheets, then paste the Google Form and Sheet links above.</p>
          <div class="cnc-actions">
            <button type="button" class="cnc-button cnc-button--primary" data-cnc-action="save-cloud">${icon("save", 15)} Save Cloud Settings</button>
            <button type="button" class="cnc-button cnc-button--soft" data-cnc-action="connect-all">${icon("link", 15)} Connect All</button>
          </div>
        </div>
        <div class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("form")} Google Form Response Fields</div>
          <div class="cnc-field-grid">
            ${inputField("Bill No", "formBillNo", formFields.billNo)}
            ${inputField("Customer Name", "formCustomerName", formFields.customerName)}
            ${inputField("Date", "formDate", formFields.date)}
            ${inputField("Amount", "formAmount", formFields.amount)}
            ${inputField("Item Details", "formItemDetails", formFields.itemDetails)}
          </div>
        </div>
      </div>
    `;
  }

  function renderProfileSettings() {
    const profile = settings.profile;
    return `
      <div class="cnc-settings-grid">
        <div class="cnc-settings-card is-wide">
          <div class="cnc-profile-preview">
            <img id="cnc-profile-preview-image" src="${escapeHtml(getLogoSrc())}" alt="${escapeHtml(getShopName())} profile">
            <div>
              <div class="cnc-card-title" style="margin-bottom: .25rem">${escapeHtml(getShopName())}</div>
              <p class="text-sm text-gray-500">${escapeHtml(profile.ownerName || "Owner profile")}</p>
            </div>
          </div>
        </div>
        <div class="cnc-settings-card is-wide">
          <div class="cnc-field-grid">
            ${inputField("Shop Name", "shopName", profile.shopName)}
            ${inputField("Owner Name", "ownerName", profile.ownerName)}
            ${inputField("Email", "profileEmail", profile.email, "email")}
            ${inputField("Phone Number", "profilePhone", profile.phone, "tel")}
            <div class="cnc-field is-wide">
              <label for="cnc-profile-address">Address</label>
              <textarea id="cnc-profile-address" class="cnc-textarea" name="profileAddress">${escapeHtml(profile.address)}</textarea>
            </div>
            <div class="cnc-field is-wide">
              <label for="cnc-profile-image">Profile Image Upload</label>
              <input id="cnc-profile-image" class="cnc-input" name="profileImage" type="file" accept="image/*">
            </div>
          </div>
          <div class="cnc-actions">
            <button type="button" class="cnc-button cnc-button--primary" data-cnc-action="save-profile">${icon("save", 15)} Save Changes</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderThemeSettings() {
    const theme = settings.theme;
    const fontButtons = ["small", "medium", "large"].map((size) => `
      <button type="button" class="${theme.fontSize === size ? "is-active" : ""}" data-cnc-font-size="${size}">${size[0].toUpperCase() + size.slice(1)}</button>
    `).join("");
    return `
      <div class="cnc-settings-grid">
        <div class="cnc-settings-card">
          <div class="cnc-card-title">${icon("theme")} Display Mode</div>
          <div class="cnc-option-row">
            <button type="button" class="cnc-toggle ${theme.mode === "dark" ? "is-on" : ""}" data-cnc-action="toggle-theme" aria-label="Toggle dark mode"><span></span></button>
            <strong>${theme.mode === "dark" ? "Dark Mode" : "Light Mode"}</strong>
          </div>
        </div>
        <div class="cnc-settings-card">
          <div class="cnc-card-title">${icon("settings")} Font Size</div>
          <div class="cnc-segmented">${fontButtons}</div>
        </div>
        <div class="cnc-settings-card">
          <div class="cnc-card-title">${icon("theme")} Primary Color</div>
          <div class="cnc-color-row">
            <input class="cnc-color-input" name="primaryColor" type="color" value="${escapeHtml(theme.primaryColor)}">
            <span class="text-sm text-gray-500">${escapeHtml(theme.primaryColor)}</span>
          </div>
        </div>
        <div class="cnc-settings-card">
          <div class="cnc-card-title">${icon("theme")} Dashboard Accent</div>
          <div class="cnc-color-row">
            <input class="cnc-color-input" name="accentColor" type="color" value="${escapeHtml(theme.accentColor)}">
            <span class="text-sm text-gray-500">${escapeHtml(theme.accentColor)}</span>
          </div>
        </div>
        <div class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("reports")} Preview</div>
          <div class="cnc-preview-box">
            <div class="cnc-preview-mini-card">
              <strong>${escapeHtml(getShopName())}</strong>
              <p class="text-sm text-gray-500 mt-1">Billing card preview with selected theme colors.</p>
              <div class="cnc-actions">
                <span class="cnc-button cnc-button--primary">Primary</span>
                <span class="cnc-button cnc-button--secondary">Accent</span>
              </div>
            </div>
          </div>
          <div class="cnc-actions">
            <button type="button" class="cnc-button cnc-button--primary" data-cnc-action="save-theme">${icon("save", 15)} Save Theme</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderContactSettings() {
    const contact = settings.contact;
    return `
      <div class="cnc-settings-card">
        <div class="cnc-field-grid">
          ${inputField("Business phone number", "businessPhone", contact.businessPhone, "tel")}
          ${inputField("WhatsApp number", "whatsapp", contact.whatsapp, "tel")}
          ${inputField("Email", "contactEmail", contact.email, "email")}
          ${inputField("Website", "website", contact.website, "url")}
          ${inputField("Instagram", "instagram", contact.instagram)}
          ${inputField("Facebook", "facebook", contact.facebook)}
          ${inputField("YouTube", "youtube", contact.youtube)}
          <div class="cnc-field is-wide">
            <label for="cnc-contact-address">Address</label>
            <textarea id="cnc-contact-address" class="cnc-textarea" name="contactAddress">${escapeHtml(contact.address)}</textarea>
          </div>
        </div>
        <div class="cnc-actions">
          <button type="button" class="cnc-button cnc-button--primary" data-cnc-action="save-contact">${icon("save", 15)} Save Contact Info</button>
        </div>
      </div>
    `;
  }

  function inputField(label, name, value, type = "text") {
    const id = `cnc-${name}`;
    return `
      <div class="cnc-field">
        <label for="${id}">${label}</label>
        <input id="${id}" class="cnc-input" name="${name}" type="${type}" value="${escapeHtml(value)}">
      </div>
    `;
  }

  function openSettings(tab = "cloud") {
    activeSettingsTab = tab;
    let overlay = document.getElementById("cnc-settings-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "cnc-settings-overlay";
      overlay.className = "cnc-settings-overlay";
      overlay.addEventListener("click", handleSettingsClick);
      overlay.addEventListener("input", handleSettingsInput);
      overlay.addEventListener("change", handleSettingsChange);
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = renderSettingsShell();
  }

  function openSettingsFromHash() {
    const match = window.location.hash.match(/^#settings\/?(bills|cloud|profile|theme|contact)?$/);
    if (!match) return;
    openSettings(match[1] || "cloud");
  }

  function closeSettings() {
    document.getElementById("cnc-settings-overlay")?.remove();
  }

  function rerenderSettings() {
    const overlay = document.getElementById("cnc-settings-overlay");
    if (overlay) overlay.innerHTML = renderSettingsShell();
  }

  function handleSettingsClick(event) {
    if (event.target.classList.contains("cnc-settings-overlay")) closeSettings();
    const close = event.target.closest("[data-cnc-close-settings]");
    if (close) closeSettings();

    const tab = event.target.closest("[data-cnc-settings-tab]")?.dataset.cncSettingsTab;
    if (tab) {
      activeSettingsTab = tab;
      rerenderSettings();
      return;
    }

    const fontSize = event.target.closest("[data-cnc-font-size]")?.dataset.cncFontSize;
    if (fontSize) {
      settings.theme.fontSize = fontSize;
      saveSettings();
      rerenderSettings();
      return;
    }

    const selectedBillId = event.target.closest("[data-cnc-bill-select]")?.dataset.cncBillSelect;
    if (selectedBillId) {
      billEditorState.selectedId = selectedBillId;
      rerenderSettings();
      return;
    }

    const deleteBillId = event.target.closest("[data-cnc-bill-delete]")?.dataset.cncBillDelete;
    if (deleteBillId) {
      billEditorState.pendingDeleteId = deleteBillId;
      rerenderSettings();
      return;
    }

    const action = event.target.closest("[data-cnc-action]")?.dataset.cncAction;
    if (!action) return;
    if (action === "refresh-bills") loadBills(true);
    if (action === "save-bill") saveBillChanges();
    if (action === "cancel-delete-bill") cancelDeleteBill();
    if (action === "confirm-delete-bill") deleteSelectedBill();
    if (action === "connect-sheets") connectCloud("sheets");
    if (action === "connect-form") connectCloud("form");
    if (action === "connect-all") connectCloud("all");
    if (action === "save-cloud") saveCloud(false);
    if (action === "save-profile") saveProfile();
    if (action === "toggle-theme") toggleTheme();
    if (action === "save-theme") saveSettings("Theme settings saved");
    if (action === "save-contact") saveContact();
  }

  function handleSettingsInput(event) {
    if (event.target.name === "primaryColor" || event.target.name === "accentColor") {
      settings.theme[event.target.name] = event.target.value;
      applyPreferences();
      rerenderSettings();
    }
    if (event.target.closest(".cnc-bill-editor")) {
      refreshBillEditorTotals();
    }
  }

  function handleSettingsChange(event) {
    if (event.target.name !== "profileImage" || !event.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      settings.profile.image = String(reader.result || "");
      saveSettings("Profile image updated");
      rerenderSettings();
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  function readValue(name) {
    return document.querySelector(`#cnc-settings-overlay [name="${name}"]`)?.value.trim() || "";
  }

  function saveCloud(showMessage = true) {
    // These two URL boxes are where beginners should paste their Google links.
    // Google Sheets URL: paste the Sheet connected from Google Forms Responses.
    // Google Form URL: paste the form link that contains the bill fields below.
    settings.cloud.sheetsUrl = readValue("sheetsUrl");
    settings.cloud.formUrl = readValue("formUrl");
    settings.cloud.formFields = {
      billNo: readValue("formBillNo") || defaults.cloud.formFields.billNo,
      customerName: readValue("formCustomerName") || defaults.cloud.formFields.customerName,
      date: readValue("formDate") || defaults.cloud.formFields.date,
      amount: readValue("formAmount") || defaults.cloud.formFields.amount,
      itemDetails: readValue("formItemDetails") || defaults.cloud.formFields.itemDetails,
    };
    settings.cloud.sheetsConnected = settings.cloud.sheetsConnected && Boolean(settings.cloud.sheetsUrl);
    settings.cloud.formConnected = settings.cloud.formConnected && Boolean(settings.cloud.formUrl);
    saveSettings(showMessage ? "Cloud settings saved" : "");
    rerenderSettings();
  }

  function readBillEditorRows() {
    return Array.from(document.querySelectorAll("[data-cnc-bill-item-row]")).map((row) => {
      const itemName = row.querySelector('[name="billItemName"]')?.value.trim() || "";
      const quantity = Number(row.querySelector('[name="billItemQuantity"]')?.value || 0);
      const unitPrice = Number(row.querySelector('[name="billItemPrice"]')?.value || 0);
      return {
        id: row.dataset.billItemId,
        item_name: itemName,
        quantity,
        unit_price: unitPrice,
        subtotal: quantity * unitPrice,
      };
    });
  }

  function refreshBillEditorTotals() {
    const rows = readBillEditorRows();
    let total = 0;
    document.querySelectorAll("[data-cnc-bill-item-row]").forEach((row, index) => {
      const subtotal = rows[index]?.subtotal || 0;
      total += subtotal;
      const subtotalTarget = row.querySelector("[data-cnc-item-subtotal]");
      if (subtotalTarget) subtotalTarget.textContent = formatMoney(subtotal);
    });
    const totalTarget = document.querySelector("[data-cnc-bill-total]");
    if (totalTarget) totalTarget.textContent = formatMoney(total);
  }

  async function saveBillChanges() {
    const bill = selectedBill();
    if (!bill) return;
    const billNumber = readValue("billNumber");
    const rows = readBillEditorRows();
    if (!rows.length) {
      showToast("This bill has no editable items");
      return;
    }
    if (rows.some((row) => !row.item_name || row.quantity < 0 || row.unit_price < 0 || Number.isNaN(row.quantity) || Number.isNaN(row.unit_price))) {
      showToast("Please check item names, quantities, and prices");
      return;
    }

    const total = rows.reduce((sum, row) => sum + row.subtotal, 0);
    billEditorState.saving = true;
    rerenderSettings();

    try {
      await Promise.all(rows.map((row) => supabaseRequest(`bill_items?id=eq.${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          item_name: row.item_name,
          quantity: row.quantity,
          unit_price: row.unit_price,
          subtotal: row.subtotal,
        }),
      })));
      await supabaseRequest(`bills?id=eq.${encodeURIComponent(bill.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          bill_number: billNumber || bill.bill_number,
          total_amount: total,
        }),
      });
      billEditorState.saving = false;
      await loadBills(true);
      showToast("Bill updated from Settings");
    } catch (error) {
      billEditorState.saving = false;
      billEditorState.error = "Could not save bill changes. Please try again.";
      console.error(error);
      showToast("Bill save failed");
      rerenderSettings();
    }
  }

  function cancelDeleteBill() {
    billEditorState.pendingDeleteId = "";
    billEditorState.deleting = false;
    rerenderSettings();
  }

  async function deleteSelectedBill() {
    const billId = billEditorState.pendingDeleteId;
    if (!billId) return;
    const bill = billEditorState.bills.find((entry) => String(entry.id) === String(billId));
    const itemIds = (bill?.bill_items || []).map((item) => item.id).filter(Boolean);

    billEditorState.deleting = true;
    rerenderSettings();

    try {
      // Beginner note: bills have child rows in bill_items. Delete those first,
      // then delete the bill. Using exact item IDs is more reliable than guessing.
      if (itemIds.length) {
        await supabaseRequest(`bill_items?id=in.(${itemIds.map((id) => encodeURIComponent(id)).join(",")})`, {
          method: "DELETE",
          headers: { Prefer: "return=minimal" },
        });
      } else {
        await supabaseRequest(`bill_items?bill_id=eq.${encodeURIComponent(billId)}`, {
          method: "DELETE",
          headers: { Prefer: "return=minimal" },
        });
      }
      await supabaseRequest(`bills?id=eq.${encodeURIComponent(billId)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      // If any future version stores bills in localStorage, remove the deleted bill there too.
      removeDeletedBillFromLocalStorage(billId);

      const remainingBills = billEditorState.bills.filter((entry) => String(entry.id) !== String(billId));
      billEditorState = {
        ...billEditorState,
        bills: remainingBills,
        selectedId: remainingBills[0] ? String(remainingBills[0].id) : "",
        pendingDeleteId: "",
        deleting: false,
        error: "",
      };
      rerenderSettings();
      showToast("Bill deleted");
      loadBills(true);
    } catch (error) {
      billEditorState.deleting = false;
      billEditorState.pendingDeleteId = "";
      console.error(error);
      showToast(`Bill delete failed: ${error.message || "please try again"}`);
      rerenderSettings();
    }
  }

  function removeDeletedBillFromLocalStorage(billId) {
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key) continue;
        const value = localStorage.getItem(key);
        if (!value || (!value.includes(String(billId)) && !value.includes("bill"))) continue;
        const parsed = JSON.parse(value);
        const cleaned = removeBillFromJson(parsed, billId);
        if (cleaned.changed) localStorage.setItem(key, JSON.stringify(cleaned.value));
      }
    } catch {
      // localStorage cleanup is best-effort only; database deletion above is the important part.
    }
  }

  function removeBillFromJson(value, billId) {
    if (Array.isArray(value)) {
      let changed = false;
      const next = value
        .filter((entry) => {
          const keep = !(entry && typeof entry === "object" && String(entry.id) === String(billId));
          if (!keep) changed = true;
          return keep;
        })
        .map((entry) => {
          const cleaned = removeBillFromJson(entry, billId);
          changed = changed || cleaned.changed;
          return cleaned.value;
        });
      return { value: next, changed };
    }

    if (value && typeof value === "object") {
      let changed = false;
      const next = { ...value };
      Object.keys(next).forEach((key) => {
        const cleaned = removeBillFromJson(next[key], billId);
        changed = changed || cleaned.changed;
        next[key] = cleaned.value;
      });
      return { value: next, changed };
    }

    return { value, changed: false };
  }

  function connectCloud(target) {
    saveCloud(false);
    if (target === "sheets" || target === "all") settings.cloud.sheetsConnected = Boolean(settings.cloud.sheetsUrl);
    if (target === "form" || target === "all") settings.cloud.formConnected = Boolean(settings.cloud.formUrl);
    saveSettings("Connection status updated");
    rerenderSettings();
  }

  function saveProfile() {
    settings.profile.shopName = readValue("shopName") || defaults.profile.shopName;
    settings.profile.ownerName = readValue("ownerName");
    settings.profile.email = readValue("profileEmail");
    settings.profile.phone = readValue("profilePhone");
    settings.profile.address = readValue("profileAddress");
    saveSettings("Profile saved");
    rerenderSettings();
  }

  function toggleTheme() {
    settings.theme.mode = settings.theme.mode === "dark" ? "light" : "dark";
    saveSettings("Theme mode updated");
    rerenderSettings();
  }

  function saveContact() {
    settings.contact.businessPhone = readValue("businessPhone");
    settings.contact.whatsapp = readValue("whatsapp");
    settings.contact.email = readValue("contactEmail");
    settings.contact.website = readValue("website");
    settings.contact.address = readValue("contactAddress");
    settings.contact.instagram = readValue("instagram");
    settings.contact.facebook = readValue("facebook");
    settings.contact.youtube = readValue("youtube");
    saveSettings("Contact information saved");
    rerenderSettings();
  }

  function showToast(message) {
    let toast = document.querySelector(".cnc-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "cnc-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  const observer = new MutationObserver(() => {
    if (mutationQueued) return;
    mutationQueued = true;
    requestAnimationFrame(() => {
      mutationQueued = false;
      enhanceAppChrome();
    });
  });

  applyPreferences();
  document.addEventListener("click", interceptOriginalSettingsClick, true);
  window.addEventListener("hashchange", openSettingsFromHash);
  if (document.body) {
    enhanceAppChrome();
    openSettingsFromHash();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      enhanceAppChrome();
      openSettingsFromHash();
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
  }
})();
