alert("NEW SETTINGS FILE LOADED");
(function () {
  "use strict";

  const STORAGE_KEY = "chaat_n_chill_settings_v2";
  const DELETED_BILLS_KEY = "chaat_n_chill_deleted_bills_v1";
  const LOGO_SRC = "/assets/chaat-n-chill-logo.png";
  const SHOP_NAME = "Chaat N Chill";
  const RUPEE = "\u20b9";
  const ITEM_IMAGE_ACCEPT = "image/png,image/jpeg,.png,.jpg,.jpeg";
  const DEFAULT_ITEM_IMAGE =
    "https://images.pexels.com/photos/158053/fresh-orange-juice-squeezed-refreshing-158053.jpeg?auto=compress&cs=tinysrgb&w=300";

  // Supabase REST settings for the existing app database.
  // These values let this override read, edit, and delete saved bills from the same tables.
  const SUPABASE_URL = "https://rbyzkgutpwlfhktlqnwf.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJieXprZ3V0cHdsZmhrdGxxbndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTczMzIsImV4cCI6MjA5NDU3MzMzMn0.1luwIintr050bBRHV9AtKGZn2nsQ8SAOdMqy34twUwU";

  const defaultSettings = {
    cloud: {
      sheetsUrl: "",
      formUrl: "",
      fields: {
        billNo: "Bill No",
        customerName: "Customer Name",
        date: "Date",
        amount: "Amount",
        itemDetails: "Item Details"
      }
    },
    profile: {
      shopName: SHOP_NAME,
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      image: LOGO_SRC
    },
    theme: {
      mode: "light",
      primaryColor: "#f97316",
      accentColor: "#0ea5e9",
      fontSize: "medium"
    },
    contact: {
      businessPhone: "",
      whatsapp: "",
      email: "",
      website: "",
      address: "",
      instagram: "",
      facebook: "",
      youtube: ""
    }
  };

  const state = {
    settings: loadSettings(),
    activeTab: "bills",
    bills: [],
    selectedBillId: null,
    loadingBills: false,
    savingBill: false,
    deletingBillId: null,
    confirmDeleteId: null,
    billError: ""
  };

  const itemState = {
    items: [],
    loading: false,
    saving: false,
    deletingId: null,
    editingId: null,
    newImageData: "",
    editImageData: {},
    error: ""
  };

  function deepMerge(base, incoming) {
    if (!incoming || typeof incoming !== "object") return base;
    const merged = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(incoming).forEach((key) => {
      if (
        incoming[key] &&
        typeof incoming[key] === "object" &&
        !Array.isArray(incoming[key]) &&
        base[key] &&
        typeof base[key] === "object"
      ) {
        merged[key] = deepMerge(base[key], incoming[key]);
      } else {
        merged[key] = incoming[key];
      }
    });
    return merged;
  }

  function loadSettings() {
    try {
      return deepMerge(defaultSettings, JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch (error) {
      return structuredClone(defaultSettings);
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
    applyTheme();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function parseAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
  }

  function formatMoney(value) {
    return `${RUPEE}${parseAmount(value).toFixed(2)}`;
  }

  function getShopName() {
    return state.settings.profile.shopName?.trim() || SHOP_NAME;
  }

  function getLogoSrc() {
    return state.settings.profile.image || LOGO_SRC;
  }

  function shortError(error) {
    return String(error?.message || error || "Please try again").slice(0, 140);
  }

  function icon(name) {
    const paths = {
      dashboard:
        '<path d="M3 13h8V3H3v10Z"/><path d="M13 21h8V11h-8v10Z"/><path d="M13 3v6h8V3h-8Z"/><path d="M3 21h8v-6H3v6Z"/>',
      bill:
        '<path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 0 1 2-2Z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
      cart:
        '<path d="M6 6h15l-2 8H8L6 3H3"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
      report:
        '<path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M14 3v6h6"/><path d="M8 17v-4"/><path d="M12 17V9"/><path d="M16 17v-2"/>',
      settings:
        '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6V20a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.08a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9c.25.36.46.7.6 1H20a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-.52 1Z"/>',
      cloud:
        '<path d="M17.5 19H7a5 5 0 0 1-.8-9.94A6.5 6.5 0 0 1 18.6 7.7 4.75 4.75 0 0 1 17.5 19Z"/>',
      profile:
        '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
      theme:
        '<path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-5.8-3.55A4 4 0 0 1 12 3Z"/>',
      contact:
        '<path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.6a2 2 0 0 1-.45 2.11L8 9.7a16 16 0 0 0 6.3 6.3l1.27-1.27a2 2 0 0 1 2.11-.45c.83.3 1.7.51 2.6.63A2 2 0 0 1 22 16.9Z"/>',
      edit:
        '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>',
      trash:
        '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
      save:
        '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
      close:
        '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
      link:
        '<path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.9"/><path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07L13 19.1"/>',
      warning:
        '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
    };

    return `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.settings}</svg>`;
  }

  function applyTheme() {
    const theme = state.settings.theme;
    const scale = theme.fontSize === "small" ? "0.94" : theme.fontSize === "large" ? "1.08" : "1";
    document.documentElement.style.setProperty("--cnc-primary", theme.primaryColor);
    document.documentElement.style.setProperty("--cnc-accent", theme.accentColor);
    document.documentElement.style.setProperty("--cnc-font-scale", scale);
    document.documentElement.classList.toggle("cnc-dark", theme.mode === "dark");
    document.title = `${getShopName()} - Billing & Management`;
  }

  function toast(message) {
    let box = document.querySelector(".cnc-toast");
    if (!box) {
      box = document.createElement("div");
      box.className = "cnc-toast";
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => box.classList.remove("is-visible"), 2200);
  }

  function loadDeletedBills() {
    try {
      const data = JSON.parse(localStorage.getItem(DELETED_BILLS_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function saveDeletedBills(items) {
    localStorage.setItem(DELETED_BILLS_KEY, JSON.stringify(items));
  }

  function rememberDeletedBill(bill) {
    const deleted = loadDeletedBills();
    const entry = {
      id: bill?.id ? String(bill.id) : "",
      bill_number: bill?.bill_number ? String(bill.bill_number) : "",
      deletedAt: new Date().toISOString()
    };
    const alreadySaved = deleted.some((item) => item.id === entry.id && item.bill_number === entry.bill_number);
    if (!alreadySaved) saveDeletedBills([...deleted, entry]);
  }

  function isDeletedBill(bill) {
    const deleted = loadDeletedBills();
    return deleted.some((item) => {
      const idMatches = item.id && bill?.id && String(bill.id) === item.id;
      const numberMatches = item.bill_number && bill?.bill_number && String(bill.bill_number) === item.bill_number;
      return idMatches || numberMatches;
    });
  }

  function installDeletedBillFilter() {
    if (window.__cncFetchFilterInstalled) return;
    window.__cncFetchFilterInstalled = true;
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      try {
        const requestUrl = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
        const isBillsRead = requestUrl.includes(`${SUPABASE_URL}/rest/v1/bills`) && response.ok;
        const isJson = (response.headers.get("content-type") || "").includes("application/json");
        if (!isBillsRead || !isJson) return response;

        const data = await response.clone().json();
        if (!Array.isArray(data)) return response;

        const filtered = data.filter((bill) => !isDeletedBill(bill));
        if (filtered.length === data.length) return response;

        return new Response(JSON.stringify(filtered), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (error) {
        return response;
      }
    };
  }

  async function supabaseRequest(path, options) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(options && options.headers ? options.headers : {})
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function loadBills() {
    state.loadingBills = true;
    state.billError = "";
    renderSettings();

    try {
      const bills = await supabaseRequest("bills?select=*,bill_items(*)&order=created_at.desc", {
        method: "GET",
        headers: { Prefer: "" }
      });
      state.bills = (Array.isArray(bills) ? bills : []).filter((bill) => !isDeletedBill(bill));
      if (!state.selectedBillId && state.bills.length) state.selectedBillId = state.bills[0].id;
    } catch (error) {
      state.billError = "Could not load online bills. Showing local saved bills if available.";
      state.bills = getLocalBills()
        .map((bill, index) => normalizeLocalBill(bill, index))
        .filter((bill) => !isDeletedBill(bill));
      if (!state.selectedBillId && state.bills.length) state.selectedBillId = state.bills[0].id;
    } finally {
      state.loadingBills = false;
      renderSettings();
    }
  }

  function getLocalBillKeys() {
    return ["savedBills", "bills", "juiceBills", "chaatBills"];
  }

  function getLocalBills() {
    for (const key of getLocalBillKeys()) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(data) && data.length) {
          return data.map((bill) => ({ ...bill, __localKey: key }));
        }
      } catch (error) {}
    }
    return [];
  }

  function normalizeLocalBill(bill, index) {
    const rawItems = bill.bill_items || bill.items || bill.cart || [];
    const billItems = rawItems.map((item, itemIndex) => {
      const quantity = parseAmount(item.quantity || item.qty || 1);
      const unitPrice = parseAmount(item.unit_price || item.price || item.rate || 0);
      return {
        id: item.id || `local-${index}-${itemIndex}`,
        item_name: item.item_name || item.name || item.title || `Item ${itemIndex + 1}`,
        quantity,
        unit_price: unitPrice,
        subtotal: parseAmount(item.subtotal || item.total || quantity * unitPrice)
      };
    });

    return {
      ...bill,
      id: bill.id || bill.bill_number || `local-${index}`,
      bill_number: bill.bill_number || bill.billNo || index + 1,
      customer_name: bill.customer_name || bill.customerName || "",
      created_at: bill.created_at || bill.date || new Date().toISOString(),
      total_amount: parseAmount(bill.total_amount || bill.total || bill.grandTotal || bill.amount || 0),
      bill_items: billItems,
      __localIndex: index,
      __localKey: bill.__localKey || "savedBills"
    };
  }

  function removeDeletedBillFromLocalStorage(bill) {
    getLocalBillKeys().forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        if (!Array.isArray(data) || !data.length) return;
        const filtered = data.filter((item, index) => {
          const idsMatch = bill.id && item.id && String(item.id) === String(bill.id);
          const numbersMatch =
            bill.bill_number &&
            (item.bill_number || item.billNo) &&
            String(item.bill_number || item.billNo) === String(bill.bill_number);
          const localIndexMatch = bill.__localKey === key && bill.__localIndex === index;
          return !(idsMatch || numbersMatch || localIndexMatch);
        });
        if (filtered.length !== data.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch (error) {}
    });
  }

  function selectedBill() {
    return state.bills.find((bill) => String(bill.id) === String(state.selectedBillId)) || null;
  }

  function billPayloadFromForm() {
    const bill = selectedBill();
    if (!bill) return null;

    const rows = Array.from(document.querySelectorAll("[data-bill-item-row]")).map((row) => {
      const quantity = Math.max(0, parseAmount(row.querySelector("[data-field='quantity']")?.value || 0));
      const unitPrice = Math.max(0, parseAmount(row.querySelector("[data-field='unit_price']")?.value || 0));
      return {
        id: row.getAttribute("data-item-id"),
        item_name: row.querySelector("[data-field='item_name']")?.value.trim() || "Item",
        quantity,
        unit_price: unitPrice,
        subtotal: quantity * unitPrice
      };
    });

    const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      id: bill.id,
      bill_number: document.querySelector("#cncBillNumber")?.value.trim() || bill.bill_number,
      customer_name: document.querySelector("#cncCustomerName")?.value.trim() || bill.customer_name || "",
      total_amount: total,
      bill_items: rows
    };
  }

  async function saveSelectedBill() {
    const bill = selectedBill();
    const payload = billPayloadFromForm();
    if (!bill || !payload) return;

    state.savingBill = true;
    renderSettings();

    try {
      if (String(bill.id).startsWith("local-") || bill.__localKey) {
        saveLocalBill(payload, bill);
      } else {
        const billUpdate = {
          bill_number: payload.bill_number,
          total_amount: payload.total_amount
        };

        // Only update customer_name when the database table already has that column.
        // This keeps the save button working with the existing beginner project schema.
        if ("customer_name" in bill) billUpdate.customer_name = payload.customer_name;

        await supabaseRequest(`bills?id=eq.${encodeURIComponent(bill.id)}`, {
          method: "PATCH",
          body: JSON.stringify(billUpdate)
        });

        for (const item of payload.bill_items) {
          await supabaseRequest(`bill_items?id=eq.${encodeURIComponent(item.id)}`, {
            method: "PATCH",
            body: JSON.stringify({
              item_name: item.item_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal
            })
          });
        }
      }

      state.bills = state.bills.map((item) => (String(item.id) === String(payload.id) ? { ...item, ...payload } : item));
      toast("Bill updated");
    } catch (error) {
      toast("Could not save bill");
    } finally {
      state.savingBill = false;
      renderSettings();
    }
  }

  function saveLocalBill(payload, originalBill) {
    try {
      const key = originalBill.__localKey || "savedBills";
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(data)) return;
      const index = originalBill.__localIndex ?? data.findIndex((bill) => String(bill.id) === String(originalBill.id));
      if (index < 0) return;
      data[index] = {
        ...data[index],
        bill_number: payload.bill_number,
        customer_name: payload.customer_name,
        total_amount: payload.total_amount,
        total: payload.total_amount,
        grandTotal: payload.total_amount,
        amount: payload.total_amount,
        bill_items: payload.bill_items,
        items: payload.bill_items.map((item) => ({
          name: item.item_name,
          quantity: item.quantity,
          price: item.unit_price,
          subtotal: item.subtotal
        }))
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {}
  }

  async function confirmDeleteBill() {
    const bill = state.bills.find((item) => String(item.id) === String(state.confirmDeleteId));
    if (!bill) return;

    state.deletingBillId = bill.id;
    renderSettings();

    let serverDeleted = true;
    try {
      if (!(String(bill.id).startsWith("local-") || bill.__localKey)) {
        const itemIds = (bill.bill_items || []).map((item) => item.id).filter(Boolean);

        // Beginner note: bill_items are child rows. Delete them first by bill_id,
        // then delete the bill row. This avoids foreign-key errors.
        try {
          await supabaseRequest(`bill_items?bill_id=eq.${encodeURIComponent(bill.id)}`, {
            method: "DELETE",
            headers: { Prefer: "return=minimal" }
          });
        } catch (error) {
          console.warn("Delete by bill_id failed, trying item IDs", error);
        }

        if (itemIds.length) {
          await supabaseRequest(`bill_items?id=in.(${itemIds.map(encodeURIComponent).join(",")})`, {
            method: "DELETE",
            headers: { Prefer: "return=minimal" }
          });
        }

        await supabaseRequest(`bills?id=eq.${encodeURIComponent(bill.id)}`, {
          method: "DELETE",
          headers: { Prefer: "return=minimal" }
        });
      }
    } catch (error) {
      serverDeleted = false;
      console.error("Bill delete failed on server; hiding locally", error);
    } finally {
      rememberDeletedBill(bill);
      removeDeletedBillFromLocalStorage(bill);
      state.bills = state.bills.filter((item) => String(item.id) !== String(bill.id));
      state.selectedBillId = state.bills[0]?.id || null;
      state.confirmDeleteId = null;
      state.deletingBillId = null;
      toast(serverDeleted ? "Bill deleted" : "Bill removed from this app");
      renderSettings();
    }
  }

  function renderBillEditor() {
    if (state.loadingBills) {
      return `<div class="cnc-settings-card is-wide"><div class="cnc-empty">Loading bills...</div></div>`;
    }

    if (!state.bills.length) {
      return `
        <div class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("bill")} Edit Bills</div>
          <div class="cnc-empty">No saved bills found.</div>
        </div>
      `;
    }

    const bill = selectedBill() || state.bills[0];
    const items = Array.isArray(bill.bill_items) ? bill.bill_items : [];
    const total = items.reduce((sum, item) => sum + parseAmount(item.subtotal || parseAmount(item.quantity) * parseAmount(item.unit_price)), 0);

    return `
      <div class="cnc-settings-card is-wide">
        <div class="cnc-card-title">${icon("bill")} Edit Bills</div>
        ${state.billError ? `<p class="cnc-help-text">${escapeHtml(state.billError)}</p>` : ""}
        <div class="cnc-bill-editor-layout">
          <div class="cnc-bill-list" aria-label="Saved bills">
            ${state.bills
              .map((item) => {
                const isActive = String(item.id) === String(bill.id);
                const itemCount = Array.isArray(item.bill_items) ? item.bill_items.length : 0;
                const isDeleting = String(state.deletingBillId) === String(item.id);
                return `
                  <div class="cnc-bill-list-item ${isActive ? "is-active" : ""}" data-select-bill="${escapeHtml(item.id)}">
                    <div>
                      <strong>Bill #${escapeHtml(item.bill_number || item.id)}</strong>
                      <small>${escapeHtml(new Date(item.created_at || Date.now()).toLocaleString())} | ${itemCount} item(s)</small>
                    </div>
                    <div>
                      <b>${formatMoney(item.total_amount)}</b>
                      <div class="cnc-bill-row-actions">
                        <button class="cnc-mini-button cnc-mini-button--edit" data-select-bill="${escapeHtml(item.id)}" type="button">${icon("edit")} Edit</button>
                        <button class="cnc-mini-button cnc-mini-button--delete" data-delete-bill="${escapeHtml(item.id)}" type="button" ${isDeleting ? "disabled" : ""}>${icon("trash")} ${isDeleting ? "Deleting" : "Delete"}</button>
                      </div>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>

          <div class="cnc-bill-edit-panel">
            <div class="cnc-field-grid">
              <div class="cnc-field">
                <label for="cncBillNumber">Bill No</label>
                <input class="cnc-input" id="cncBillNumber" value="${escapeHtml(bill.bill_number || "")}">
              </div>
              <div class="cnc-field">
                <label for="cncCustomerName">Customer Name</label>
                <input class="cnc-input" id="cncCustomerName" value="${escapeHtml(bill.customer_name || "")}">
              </div>
            </div>

            <div class="cnc-bill-items">
              <div class="cnc-bill-items-head">
                <span>Item Details</span>
                <span>Qty</span>
                <span>Unit</span>
                <span>Total</span>
              </div>
              ${items
                .map((item) => {
                  const quantity = parseAmount(item.quantity || 0);
                  const unitPrice = parseAmount(item.unit_price || 0);
                  const subtotal = parseAmount(item.subtotal || quantity * unitPrice);
                  return `
                    <div class="cnc-bill-item-row" data-bill-item-row data-item-id="${escapeHtml(item.id)}">
                      <input class="cnc-input" data-field="item_name" value="${escapeHtml(item.item_name || item.name || "")}">
                      <input class="cnc-input" data-field="quantity" type="number" min="0" step="1" value="${escapeHtml(quantity)}">
                      <input class="cnc-input" data-field="unit_price" type="number" min="0" step="0.01" value="${escapeHtml(unitPrice)}">
                      <strong>${formatMoney(subtotal)}</strong>
                    </div>
                  `;
                })
                .join("")}
            </div>

            <div class="cnc-bill-total-box">
              <span>Total Amount</span>
              <strong>${formatMoney(total || bill.total_amount)}</strong>
            </div>

            <div class="cnc-actions">
              <button class="cnc-button cnc-button--primary" data-save-bill type="button" ${state.savingBill ? "disabled" : ""}>${icon("save")} ${state.savingBill ? "Saving" : "Save Bill Changes"}</button>
              <button class="cnc-button cnc-button--danger" data-delete-bill="${escapeHtml(bill.id)}" type="button">${icon("trash")} Delete Bill</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCloud() {
    const cloud = state.settings.cloud;
    return `
      <div class="cnc-settings-card">
        <div class="cnc-card-title">${icon("cloud")} Google Sheets</div>
        <span class="cnc-status ${cloud.sheetsUrl ? "cnc-status--connected" : "cnc-status--idle"}">${cloud.sheetsUrl ? "Connected" : "Not Connected"}</span>
        <div class="cnc-field">
          <label for="cncSheetsUrl">Google Sheets URL</label>
          <input class="cnc-input" id="cncSheetsUrl" placeholder="Paste Google Sheets URL" value="${escapeHtml(cloud.sheetsUrl)}">
        </div>
      </div>

      <div class="cnc-settings-card">
        <div class="cnc-card-title">${icon("link")} Google Forms</div>
        <span class="cnc-status ${cloud.formUrl ? "cnc-status--connected" : "cnc-status--idle"}">${cloud.formUrl ? "Connected" : "Not Connected"}</span>
        <div class="cnc-field">
          <label for="cncFormUrl">Google Form URL</label>
          <input class="cnc-input" id="cncFormUrl" placeholder="Paste Google Form URL" value="${escapeHtml(cloud.formUrl)}">
        </div>
      </div>

      <div class="cnc-settings-card is-wide">
        <div class="cnc-card-title">${icon("bill")} Google Form Fields</div>
        <div class="cnc-field-grid">
          ${[
            ["billNo", "Bill No"],
            ["customerName", "Customer Name"],
            ["date", "Date"],
            ["amount", "Amount"],
            ["itemDetails", "Item Details"]
          ]
            .map(
              ([key, label]) => `
                <div class="cnc-field">
                  <label for="cncFormField-${key}">${label}</label>
                  <input class="cnc-input" id="cncFormField-${key}" value="${escapeHtml(cloud.fields[key])}">
                </div>
              `
            )
            .join("")}
        </div>
        <p class="cnc-help-text">Connect your Google Form responses to Google Sheets, then save both links here.</p>
        <div class="cnc-actions">
          <button class="cnc-button cnc-button--primary" data-save-cloud type="button">${icon("save")} Connect / Save</button>
        </div>
      </div>
    `;
  }

  function renderProfile() {
    const profile = state.settings.profile;
    return `
      <div class="cnc-settings-card is-wide">
        <div class="cnc-card-title">${icon("profile")} Profile Edit</div>
        <div class="cnc-profile-preview">
          <img src="${escapeHtml(profile.image || LOGO_SRC)}" alt="${escapeHtml(profile.shopName || SHOP_NAME)} logo">
          <div>
            <strong>${escapeHtml(profile.shopName || SHOP_NAME)}</strong>
            <span>${escapeHtml(profile.ownerName || "Owner name not added")}</span>
          </div>
        </div>

        <div class="cnc-field-grid">
          <div class="cnc-field">
            <label for="cncShopName">Shop Name</label>
            <input class="cnc-input" id="cncShopName" value="${escapeHtml(profile.shopName)}">
          </div>
          <div class="cnc-field">
            <label for="cncOwnerName">Owner Name</label>
            <input class="cnc-input" id="cncOwnerName" value="${escapeHtml(profile.ownerName)}">
          </div>
          <div class="cnc-field">
            <label for="cncProfileEmail">Email</label>
            <input class="cnc-input" id="cncProfileEmail" type="email" value="${escapeHtml(profile.email)}">
          </div>
          <div class="cnc-field">
            <label for="cncProfilePhone">Phone Number</label>
            <input class="cnc-input" id="cncProfilePhone" value="${escapeHtml(profile.phone)}">
          </div>
          <div class="cnc-field is-wide">
            <label for="cncProfileAddress">Address</label>
            <textarea class="cnc-textarea" id="cncProfileAddress">${escapeHtml(profile.address)}</textarea>
          </div>
          <div class="cnc-field is-wide">
            <label for="cncProfileImage">Profile Image Upload</label>
            <input class="cnc-input" id="cncProfileImage" type="file" accept="image/*">
          </div>
        </div>

        <div class="cnc-actions">
          <button class="cnc-button cnc-button--primary" data-save-profile type="button">${icon("save")} Save Changes</button>
        </div>
      </div>
    `;
  }

  function renderTheme() {
    const theme = state.settings.theme;
    return `
      <div class="cnc-settings-card is-wide">
        <div class="cnc-card-title">${icon("theme")} Theme Settings</div>
        <div class="cnc-field-grid">
          <div class="cnc-field">
            <label>Light Mode / Dark Mode</label>
            <div class="cnc-option-row">
              <button class="cnc-toggle ${theme.mode === "dark" ? "is-on" : ""}" data-toggle-theme type="button" aria-label="Toggle dark mode"><span></span></button>
              <strong>${theme.mode === "dark" ? "Dark Mode" : "Light Mode"}</strong>
            </div>
          </div>
          <div class="cnc-field">
            <label for="cncFontSize">Font Size</label>
            <select class="cnc-select" id="cncFontSize">
              <option value="small" ${theme.fontSize === "small" ? "selected" : ""}>Small</option>
              <option value="medium" ${theme.fontSize === "medium" ? "selected" : ""}>Medium</option>
              <option value="large" ${theme.fontSize === "large" ? "selected" : ""}>Large</option>
            </select>
          </div>
          <div class="cnc-field">
            <label for="cncPrimaryColor">Primary color selector</label>
            <div class="cnc-color-row">
              <input class="cnc-color-input" id="cncPrimaryColor" type="color" value="${escapeHtml(theme.primaryColor)}">
              <span>${escapeHtml(theme.primaryColor)}</span>
            </div>
          </div>
          <div class="cnc-field">
            <label for="cncAccentColor">Dashboard accent color picker</label>
            <div class="cnc-color-row">
              <input class="cnc-color-input" id="cncAccentColor" type="color" value="${escapeHtml(theme.accentColor)}">
              <span>${escapeHtml(theme.accentColor)}</span>
            </div>
          </div>
        </div>

        <div class="cnc-preview-box">
          <div class="cnc-preview-mini-card">
            <strong>Preview section</strong>
            <p>Sales ${formatMoney(250)} | Purchases ${formatMoney(80)} | Profit ${formatMoney(170)}</p>
          </div>
        </div>

        <div class="cnc-actions">
          <button class="cnc-button cnc-button--primary" data-save-theme type="button">${icon("save")} Save Theme</button>
        </div>
      </div>
    `;
  }

  function renderContact() {
    const contact = state.settings.contact;
    return `
      <div class="cnc-settings-card is-wide">
        <div class="cnc-card-title">${icon("contact")} Contact Information</div>
        <div class="cnc-field-grid">
          <div class="cnc-field">
            <label for="cncBusinessPhone">Business phone number</label>
            <input class="cnc-input" id="cncBusinessPhone" value="${escapeHtml(contact.businessPhone)}">
          </div>
          <div class="cnc-field">
            <label for="cncWhatsApp">WhatsApp number</label>
            <input class="cnc-input" id="cncWhatsApp" value="${escapeHtml(contact.whatsapp)}">
          </div>
          <div class="cnc-field">
            <label for="cncContactEmail">Email</label>
            <input class="cnc-input" id="cncContactEmail" type="email" value="${escapeHtml(contact.email)}">
          </div>
          <div class="cnc-field">
            <label for="cncWebsite">Website</label>
            <input class="cnc-input" id="cncWebsite" value="${escapeHtml(contact.website)}">
          </div>
          <div class="cnc-field is-wide">
            <label for="cncContactAddress">Address</label>
            <textarea class="cnc-textarea" id="cncContactAddress">${escapeHtml(contact.address)}</textarea>
          </div>
          <div class="cnc-field">
            <label for="cncInstagram">Instagram link</label>
            <input class="cnc-input" id="cncInstagram" value="${escapeHtml(contact.instagram)}">
          </div>
          <div class="cnc-field">
            <label for="cncFacebook">Facebook link</label>
            <input class="cnc-input" id="cncFacebook" value="${escapeHtml(contact.facebook)}">
          </div>
          <div class="cnc-field">
            <label for="cncYoutube">YouTube link</label>
            <input class="cnc-input" id="cncYoutube" value="${escapeHtml(contact.youtube)}">
          </div>
        </div>

        <div class="cnc-actions">
          <button class="cnc-button cnc-button--primary" data-save-contact type="button">${icon("save")} Save Contact</button>
        </div>
      </div>
    `;
  }

  function tabTitle(tab) {
    const labels = {
      bills: "Edit and delete saved bills",
      cloud: "Prepare Google Sheets and Forms links",
      profile: "Update shop profile details",
      theme: "Customize dashboard appearance",
      contact: "Manage public contact details"
    };
    return labels[tab] || labels.bills;
  }

  function renderCurrentTab() {
    if (state.activeTab === "bills") return renderBillEditor();
    if (state.activeTab === "cloud") return renderCloud();
    if (state.activeTab === "profile") return renderProfile();
    if (state.activeTab === "theme") return renderTheme();
    return renderContact();
  }

  function renderDeleteConfirm() {
    if (!state.confirmDeleteId) return "";
    return `
      <div class="cnc-confirm-backdrop">
        <div class="cnc-confirm-card">
          <div class="cnc-card-title">${icon("warning")} Delete Bill</div>
          <p>Are you sure you want to delete this bill?</p>
          <small>This removes the bill from the saved bill list and localStorage. Online bills are removed from Supabase.</small>
          <div class="cnc-actions">
            <button class="cnc-button cnc-button--soft" data-cancel-delete type="button">Cancel</button>
            <button class="cnc-button cnc-button--danger" data-confirm-delete type="button">${icon("trash")} Yes, Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSettings() {
    const host = document.querySelector("#cncSettingsOverlay");
    if (!host) return;

    const tabs = [
      ["bills", "bill", "Edit Bills"],
      ["cloud", "cloud", "Cloud Storage"],
      ["profile", "profile", "Profile Edit"],
      ["theme", "theme", "Theme"],
      ["contact", "contact", "Contact Info"]
    ];

    host.innerHTML = `
      <div class="cnc-settings-shell" role="dialog" aria-modal="true" aria-label="App Settings">
        <aside class="cnc-settings-sidebar">
          <div class="cnc-settings-brand">
            <img src="${escapeHtml(getLogoSrc())}" alt="${escapeHtml(getShopName())} logo">
            <div>
              <strong>${escapeHtml(getShopName())}</strong>
              <span>App Settings</span>
            </div>
          </div>
          <nav class="cnc-settings-tabs" aria-label="App settings sections">
            ${tabs
              .map(
                ([id, iconName, label]) => `
                  <button class="cnc-settings-tab ${state.activeTab === id ? "is-active" : ""}" data-settings-tab="${id}" type="button">
                    <span class="cnc-menu-icon">${icon(iconName)}</span>
                    ${label}
                  </button>
                `
              )
              .join("")}
          </nav>
        </aside>

        <section class="cnc-settings-content">
          <header class="cnc-settings-header">
            <div>
              <h2>${tabs.find(([id]) => id === state.activeTab)?.[2] || "App Settings"}</h2>
              <p>${tabTitle(state.activeTab)}</p>
            </div>
            <button class="cnc-settings-close" data-close-settings type="button" aria-label="Close settings">${icon("close")}</button>
          </header>
          <div class="cnc-settings-grid">
            ${renderCurrentTab()}
          </div>
        </section>
        ${renderDeleteConfirm()}
      </div>
    `;
  }

  function normalizeSettingsTab(tab) {
    const allowed = ["bills", "cloud", "profile", "theme", "contact"];
    return allowed.includes(tab) ? tab : "bills";
  }

  function closeOriginalDrawer() {
    const backdrop = Array.from(document.querySelectorAll(".fixed.inset-0")).find((node) => !node.closest("#cncSettingsOverlay"));
    if (backdrop) backdrop.click();
  }

  function openSettings(tab) {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => openSettings(tab), { once: true });
      return;
    }

    state.activeTab = normalizeSettingsTab(tab || state.activeTab || "bills");
    let overlay = document.querySelector("#cncSettingsOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "cncSettingsOverlay";
      overlay.className = "cnc-settings-overlay";
      document.body.appendChild(overlay);
    }
    overlay.style.display = "flex";
    renderSettings();
    if (state.activeTab === "bills" && !state.bills.length && !state.loadingBills) loadBills();
  }

  function openSettingsSafely(tab) {
    const nextTab = normalizeSettingsTab(tab || "bills");
    closeItemEditor();
    closeOriginalDrawer();
    openSettings(nextTab);

    // Beginner note: React can redraw the sidebar immediately after a click.
    // These small retries make sure the custom App Settings modal stays open.
    window.requestAnimationFrame(() => openSettings(nextTab));
    window.setTimeout(() => {
      if (!document.querySelector("#cncSettingsOverlay")) openSettings(nextTab);
    }, 80);
    window.setTimeout(() => {
      if (!document.querySelector("#cncSettingsOverlay")) openSettings(nextTab);
    }, 350);
  }

  function closeSettings() {
    document.querySelector("#cncSettingsOverlay")?.remove();
    state.confirmDeleteId = null;
    if (location.hash.startsWith("#settings")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function saveCloud() {
    const cloud = state.settings.cloud;
    cloud.sheetsUrl = document.querySelector("#cncSheetsUrl")?.value.trim() || "";
    cloud.formUrl = document.querySelector("#cncFormUrl")?.value.trim() || "";
    cloud.fields.billNo = document.querySelector("#cncFormField-billNo")?.value.trim() || "Bill No";
    cloud.fields.customerName = document.querySelector("#cncFormField-customerName")?.value.trim() || "Customer Name";
    cloud.fields.date = document.querySelector("#cncFormField-date")?.value.trim() || "Date";
    cloud.fields.amount = document.querySelector("#cncFormField-amount")?.value.trim() || "Amount";
    cloud.fields.itemDetails = document.querySelector("#cncFormField-itemDetails")?.value.trim() || "Item Details";

    // Beginner note:
    // Paste the Google Sheets link into Google Sheets URL.
    // Paste the Google Form link into Google Form URL.
    // Later, an API script can read these saved links and send each bill to the form/sheet automatically.
    saveSettings();
    toast("Cloud settings saved");
    renderSettings();
  }

  function saveProfile() {
    const profile = state.settings.profile;
    profile.shopName = document.querySelector("#cncShopName")?.value.trim() || SHOP_NAME;
    profile.ownerName = document.querySelector("#cncOwnerName")?.value.trim() || "";
    profile.email = document.querySelector("#cncProfileEmail")?.value.trim() || "";
    profile.phone = document.querySelector("#cncProfilePhone")?.value.trim() || "";
    profile.address = document.querySelector("#cncProfileAddress")?.value.trim() || "";

    const file = document.querySelector("#cncProfileImage")?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        profile.image = reader.result;
        saveSettings();
        replaceBranding();
        toast("Profile saved");
        renderSettings();
      };
      reader.readAsDataURL(file);
      return;
    }

    saveSettings();
    replaceBranding();
    toast("Profile saved");
    renderSettings();
  }

  function saveTheme() {
    state.settings.theme.primaryColor = document.querySelector("#cncPrimaryColor")?.value || "#f97316";
    state.settings.theme.accentColor = document.querySelector("#cncAccentColor")?.value || "#0ea5e9";
    state.settings.theme.fontSize = document.querySelector("#cncFontSize")?.value || "medium";
    saveSettings();
    toast("Theme saved");
    renderSettings();
  }

  function saveContact() {
    const contact = state.settings.contact;
    contact.businessPhone = document.querySelector("#cncBusinessPhone")?.value.trim() || "";
    contact.whatsapp = document.querySelector("#cncWhatsApp")?.value.trim() || "";
    contact.email = document.querySelector("#cncContactEmail")?.value.trim() || "";
    contact.website = document.querySelector("#cncWebsite")?.value.trim() || "";
    contact.address = document.querySelector("#cncContactAddress")?.value.trim() || "";
    contact.instagram = document.querySelector("#cncInstagram")?.value.trim() || "";
    contact.facebook = document.querySelector("#cncFacebook")?.value.trim() || "";
    contact.youtube = document.querySelector("#cncYoutube")?.value.trim() || "";
    saveSettings();
    toast("Contact saved");
  }

  function isAllowedItemImage(file) {
    if (!file) return false;
    const hasGoodType = ["image/png", "image/jpeg"].includes(file.type);
    const hasGoodName = /\.(png|jpe?g)$/i.test(file.name || "");
    return hasGoodType || hasGoodName;
  }

  function readItemImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!isAllowedItemImage(file)) {
        reject(new Error("Please choose a PNG, JPG, or JPEG image"));
        return;
      }

      if (file.size > 2.5 * 1024 * 1024) {
        reject(new Error("Image is too large. Please choose an image under 2.5 MB"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read image file"));
      reader.readAsDataURL(file);
    });
  }

  async function loadItems() {
    itemState.loading = true;
    itemState.error = "";
    renderItemEditor();

    try {
      const items = await supabaseRequest("juice_items?select=*&order=name.asc", {
        method: "GET",
        headers: { Prefer: "" }
      });
      itemState.items = Array.isArray(items) ? items : [];
    } catch (error) {
      itemState.error = `Could not load items: ${shortError(error)}`;
    } finally {
      itemState.loading = false;
      renderItemEditor();
    }
  }

  function openItemEditor() {
    let overlay = document.querySelector("#cncItemEditorOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "cncItemEditorOverlay";
      overlay.className = "cnc-settings-overlay cnc-item-editor-overlay";
      document.body.appendChild(overlay);
    }
    renderItemEditor();
    if (!itemState.items.length && !itemState.loading) loadItems();
  }

  function closeItemEditor() {
    document.querySelector("#cncItemEditorOverlay")?.remove();
    itemState.editingId = null;
    itemState.newImageData = "";
    itemState.editImageData = {};
  }

  function renderItemImagePreview(src, alt) {
    const imageSrc = src || DEFAULT_ITEM_IMAGE;
    return `<img class="cnc-item-image" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(alt || "Item image")}" onerror="this.src='${DEFAULT_ITEM_IMAGE}'">`;
  }

  function renderItemEditor() {
    const host = document.querySelector("#cncItemEditorOverlay");
    if (!host) return;

    host.innerHTML = `
      <div class="cnc-item-shell" role="dialog" aria-modal="true" aria-label="Edit Items">
        <header class="cnc-settings-header">
          <div>
            <h2>Edit Items</h2>
            <p>Add and update menu items with PNG, JPG, or JPEG images.</p>
          </div>
          <button class="cnc-settings-close" data-close-items type="button" aria-label="Close item editor">${icon("close")}</button>
        </header>

        <section class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("cart")} Add New Item</div>
          <div class="cnc-item-add-grid">
            <div class="cnc-field">
              <label for="cncNewItemName">Item Name</label>
              <input class="cnc-input" id="cncNewItemName" placeholder="Item name">
            </div>
            <div class="cnc-field">
              <label for="cncNewItemPrice">Price (${RUPEE})</label>
              <input class="cnc-input" id="cncNewItemPrice" type="number" min="0" step="0.01" placeholder="Price">
            </div>
            <div class="cnc-field">
              <label for="cncNewItemImage">Add Image</label>
              <input class="cnc-input cnc-file-input" id="cncNewItemImage" data-new-item-image type="file" accept="${ITEM_IMAGE_ACCEPT}">
              <small class="cnc-help-text">Only PNG, JPG, and JPEG files are accepted.</small>
            </div>
            <div class="cnc-item-preview">
              ${renderItemImagePreview(itemState.newImageData, "New item preview")}
            </div>
          </div>

          <div class="cnc-actions">
            <button class="cnc-button cnc-button--primary" data-add-item type="button" ${itemState.saving ? "disabled" : ""}>${icon("save")} ${itemState.saving ? "Saving" : "Add Item"}</button>
          </div>
        </section>

        <section class="cnc-settings-card is-wide">
          <div class="cnc-card-title">${icon("bill")} Existing Items</div>
          ${itemState.error ? `<p class="cnc-help-text">${escapeHtml(itemState.error)}</p>` : ""}
          ${
            itemState.loading
              ? `<div class="cnc-empty">Loading items...</div>`
              : itemState.items.length
                ? `<div class="cnc-item-list">
                    ${itemState.items
                      .map((item) => renderItemRow(item))
                      .join("")}
                  </div>`
                : `<div class="cnc-empty">No items found.</div>`
          }
        </section>
      </div>
    `;
  }

  function renderItemRow(item) {
    const editing = String(item.id) === String(itemState.editingId);
    const previewSrc = itemState.editImageData[item.id] || item.image_url || DEFAULT_ITEM_IMAGE;
    const deleting = String(itemState.deletingId) === String(item.id);

    if (editing) {
      return `
        <div class="cnc-item-row is-editing" data-item-row="${escapeHtml(item.id)}">
          ${renderItemImagePreview(previewSrc, item.name)}
          <div class="cnc-item-edit-grid">
            <input class="cnc-input" data-edit-item-name value="${escapeHtml(item.name || "")}">
            <input class="cnc-input" data-edit-item-price type="number" min="0" step="0.01" value="${escapeHtml(item.price || 0)}">
            <input class="cnc-input cnc-file-input" data-edit-item-image="${escapeHtml(item.id)}" type="file" accept="${ITEM_IMAGE_ACCEPT}">
            <small class="cnc-help-text">Choose PNG, JPG, or JPEG to replace the item image.</small>
          </div>
          <div class="cnc-item-actions">
            <button class="cnc-mini-button cnc-mini-button--edit" data-save-item="${escapeHtml(item.id)}" type="button">${icon("save")} Save</button>
            <button class="cnc-mini-button" data-cancel-item-edit type="button">Cancel</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="cnc-item-row">
        ${renderItemImagePreview(previewSrc, item.name)}
        <div class="cnc-item-info">
          <strong>${escapeHtml(item.name || "Untitled item")}</strong>
          <span>${formatMoney(item.price || 0)}</span>
        </div>
        <div class="cnc-item-actions">
          <button class="cnc-mini-button cnc-mini-button--edit" data-edit-item="${escapeHtml(item.id)}" type="button">${icon("edit")} Edit</button>
          <button class="cnc-mini-button cnc-mini-button--delete" data-delete-item="${escapeHtml(item.id)}" type="button" ${deleting ? "disabled" : ""}>${icon("trash")} ${deleting ? "Deleting" : "Delete"}</button>
        </div>
      </div>
    `;
  }

  async function addItem() {
    const name = document.querySelector("#cncNewItemName")?.value.trim() || "";
    const price = parseAmount(document.querySelector("#cncNewItemPrice")?.value || 0);

    if (!name || price < 0) {
      toast("Add item name and valid price");
      return;
    }

    itemState.saving = true;
    renderItemEditor();

    try {
      // Beginner note: the file picker creates a data URL and saves it in image_url,
      // so the existing database structure can store uploaded PNG/JPG/JPEG images.
      const inserted = await supabaseRequest("juice_items", {
        method: "POST",
        body: JSON.stringify({
          name,
          price,
          image_url: itemState.newImageData || DEFAULT_ITEM_IMAGE
        })
      });
      const item = Array.isArray(inserted) ? inserted[0] : inserted;
      if (item) itemState.items = [...itemState.items, item].sort((a, b) => String(a.name).localeCompare(String(b.name)));
      itemState.newImageData = "";
      toast("Item added");
    } catch (error) {
      toast(`Could not add item: ${shortError(error)}`);
    } finally {
      itemState.saving = false;
      renderItemEditor();
    }
  }

  async function saveItem(itemId) {
    const row = document.querySelector(`[data-item-row="${CSS.escape(String(itemId))}"]`);
    const existing = itemState.items.find((item) => String(item.id) === String(itemId));
    if (!row || !existing) return;

    const name = row.querySelector("[data-edit-item-name]")?.value.trim() || "";
    const price = parseAmount(row.querySelector("[data-edit-item-price]")?.value || 0);
    if (!name || price < 0) {
      toast("Check item name and price");
      return;
    }

    itemState.saving = true;
    renderItemEditor();

    try {
      const imageUrl = itemState.editImageData[itemId] || existing.image_url || DEFAULT_ITEM_IMAGE;
      const updated = await supabaseRequest(`juice_items?id=eq.${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        body: JSON.stringify({ name, price, image_url: imageUrl })
      });
      const item = Array.isArray(updated) ? updated[0] : updated;
      itemState.items = itemState.items.map((entry) =>
        String(entry.id) === String(itemId) ? { ...entry, ...(item || {}), name, price, image_url: imageUrl } : entry
      );
      delete itemState.editImageData[itemId];
      itemState.editingId = null;
      toast("Item saved");
    } catch (error) {
      toast(`Could not save item: ${shortError(error)}`);
    } finally {
      itemState.saving = false;
      renderItemEditor();
    }
  }

  async function deleteItem(itemId) {
    const item = itemState.items.find((entry) => String(entry.id) === String(itemId));
    if (!item || !confirm(`Delete ${item.name || "this item"}?`)) return;

    itemState.deletingId = itemId;
    renderItemEditor();

    try {
      await supabaseRequest(`juice_items?id=eq.${encodeURIComponent(itemId)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" }
      });
      itemState.items = itemState.items.filter((entry) => String(entry.id) !== String(itemId));
      toast("Item deleted");
    } catch (error) {
      toast(`Could not delete item: ${shortError(error)}`);
    } finally {
      itemState.deletingId = null;
      renderItemEditor();
    }
  }

  async function handleItemImageChange(input) {
    const file = input.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readItemImageFile(file);
      const editId = input.getAttribute("data-edit-item-image");
      if (editId) {
        itemState.editImageData[editId] = dataUrl;
      } else {
        itemState.newImageData = dataUrl;
      }
      renderItemEditor();
    } catch (error) {
      input.value = "";
      toast(shortError(error));
    }
  }

  function handleItemEditorClick(event) {
    const target = event.target.closest("button");
    if (!target) return;

    if (target.matches("[data-close-items]")) closeItemEditor();
    if (target.matches("[data-add-item]")) addItem();

    const editButton = target.closest("[data-edit-item]");
    if (editButton) {
      itemState.editingId = editButton.getAttribute("data-edit-item");
      renderItemEditor();
    }

    const saveButton = target.closest("[data-save-item]");
    if (saveButton) saveItem(saveButton.getAttribute("data-save-item"));

    if (target.matches("[data-cancel-item-edit]")) {
      itemState.editingId = null;
      itemState.editImageData = {};
      renderItemEditor();
    }

    const deleteButton = target.closest("[data-delete-item]");
    if (deleteButton) deleteItem(deleteButton.getAttribute("data-delete-item"));
  }

  function handleItemEditorChange(event) {
    const imageInput = event.target.closest("[data-new-item-image], [data-edit-item-image]");
    if (imageInput) handleItemImageChange(imageInput);
  }

  function handleSettingsClick(event) {
    const target = event.target.closest("button, a, [data-settings-tab], [data-save-cloud]");
    if (!target) return;

    if (target.matches("[data-close-settings]")) {
      event.preventDefault();
      closeSettings();
      return;
    }

    if (target.matches("[data-settings-tab]")) {
      event.preventDefault();
      state.activeTab = normalizeSettingsTab(target.getAttribute("data-settings-tab") || "bills");
      state.confirmDeleteId = null;
      renderSettings();
      if (state.activeTab === "bills" && !state.bills.length && !state.loadingBills) loadBills();
      return;
    }

    const selectButton = target.closest("[data-select-bill]");
    if (selectButton && !target.closest("[data-delete-bill]")) {
      state.selectedBillId = selectButton.getAttribute("data-select-bill");
      state.confirmDeleteId = null;
      renderSettings();
    }

    const deleteButton = target.closest("[data-delete-bill]");
    if (deleteButton) {
      state.confirmDeleteId = deleteButton.getAttribute("data-delete-bill");
      renderSettings();
    }

    if (target.matches("[data-cancel-delete]")) {
      state.confirmDeleteId = null;
      renderSettings();
    }

    if (target.matches("[data-confirm-delete]")) confirmDeleteBill();
    if (target.matches("[data-save-bill]")) saveSelectedBill();
    if (target.matches("[data-save-cloud]")) saveCloud();
    if (target.matches("[data-save-profile]")) saveProfile();
    if (target.matches("[data-save-theme]")) saveTheme();
    if (target.matches("[data-save-contact]")) saveContact();
    if (target.matches("[data-toggle-theme]")) {
      state.settings.theme.mode = state.settings.theme.mode === "dark" ? "light" : "dark";
      saveSettings();
      renderSettings();
    }
  }

  function handleBillInput(event) {
    if (!event.target.closest("[data-bill-item-row]")) return;
    const row = event.target.closest("[data-bill-item-row]");
    const quantity = parseAmount(row.querySelector("[data-field='quantity']")?.value || 0);
    const unitPrice = parseAmount(row.querySelector("[data-field='unit_price']")?.value || 0);
    const total = row.querySelector("strong");
    if (total) total.textContent = formatMoney(quantity * unitPrice);
    const allRows = Array.from(document.querySelectorAll("[data-bill-item-row]"));
    const sum = allRows.reduce((amount, itemRow) => {
      const qty = parseAmount(itemRow.querySelector("[data-field='quantity']")?.value || 0);
      const price = parseAmount(itemRow.querySelector("[data-field='unit_price']")?.value || 0);
      return amount + qty * price;
    }, 0);
    const totalBox = document.querySelector(".cnc-bill-total-box strong");
    if (totalBox) totalBox.textContent = formatMoney(sum);
  }

  function removeBoltBadge(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('a[href*="bolt.new"], script[src*="bolt.new"], iframe[src*="bolt.new"]').forEach((node) => node.remove());
    scope.querySelectorAll("a, button, div, span").forEach((node) => {
      const text = (node.textContent || "").trim().toLowerCase();
      if (text === "made in bolt" || text === "made with bolt" || text.includes("bolt.new")) {
        node.remove();
      }
    });
  }

  function replaceTextNodes(root) {
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    const replacements = [];
    const shopName = getShopName();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue) continue;
      let text = node.nodeValue;
      if (text.includes("JuiceShop")) text = text.replaceAll("JuiceShop", shopName);
      if (text.includes("Fresh Juice Shop")) text = text.replaceAll("Fresh Juice Shop", shopName);
      if (text.includes(SHOP_NAME) && shopName !== SHOP_NAME) text = text.replaceAll(SHOP_NAME, shopName);
      if (text.includes("$")) text = text.replaceAll("$", RUPEE);
      if (text !== node.nodeValue) replacements.push([node, text]);
    }
    replacements.forEach(([node, text]) => {
      node.nodeValue = text;
    });
  }

  function replaceLogoNearText(container) {
    const shopName = getShopName();
    const brandRows = Array.from(container.querySelectorAll("div")).filter((node) => {
      const text = (node.textContent || "").trim();
      return (text.includes(SHOP_NAME) || text.includes(shopName) || text.includes("JuiceShop")) && node.querySelector("div");
    });

    brandRows.slice(0, 3).forEach((row) => {
      const logoBox = Array.from(row.children).find((child) => {
        const className = child.getAttribute("class") || "";
        return className.includes("w-8") || className.includes("h-8") || className.includes("rounded-xl");
      });
      if (!logoBox || logoBox.querySelector(".cnc-logo-img")) return;
      logoBox.classList.add("cnc-logo-wrap");
      logoBox.innerHTML = `<img class="cnc-logo-img" src="${escapeHtml(getLogoSrc())}" alt="${escapeHtml(shopName)} logo">`;
    });
  }

  function replaceBranding() {
    if (!document.body) return;
    replaceTextNodes(document.body);
    replaceLogoNearText(document.body);
    removeBoltBadge(document);
  }

  function clickTopTab(label) {
    const buttons = Array.from(document.querySelectorAll("button"));
    const button = buttons.find((item) => (item.textContent || "").trim().toLowerCase() === label.toLowerCase());
    if (button) button.click();
  }

  function ensureHeaderSettingsButton() {
    const header = document.querySelector("header");
    if (!header || header.querySelector("[data-cnc-header-settings]")) return;
    const rightSlots = Array.from(header.querySelectorAll("div")).filter((node) => {
      const className = node.getAttribute("class") || "";
      return className.split(/\s+/).includes("w-9");
    });
    const slot = rightSlots[rightSlots.length - 1];
    if (!slot) return;
    slot.innerHTML = `
      <button class="cnc-header-settings" data-cnc-header-settings data-open-settings="bills" type="button" title="App Settings" aria-label="App Settings">
        ${icon("settings")}
      </button>
    `;
  }

  function enhanceSidebar() {
    const drawers = Array.from(document.querySelectorAll(".fixed.top-0.left-0, [class*='fixed'][class*='left-0']")).filter((node) =>
      (node.textContent || "").includes("App Settings")
    );
    const drawer = drawers[0];
    if (!drawer || drawer.querySelector("[data-cnc-side-menu]")) return;
    const nav = drawer.querySelector("nav");
    if (!nav) return;

    nav.innerHTML = `
      <div class="cnc-side-menu" data-cnc-side-menu>
        <p class="cnc-side-menu__title">Menu</p>
        <button class="cnc-side-menu__button" data-cnc-route="dashboard" type="button"><span class="cnc-menu-icon">${icon("dashboard")}</span>Dashboard</button>
        <button class="cnc-side-menu__button" data-cnc-route="billing" type="button"><span class="cnc-menu-icon">${icon("bill")}</span>Billing</button>
        <button class="cnc-side-menu__button" data-cnc-route="purchasing" type="button"><span class="cnc-menu-icon">${icon("cart")}</span>Purchasing</button>
        <button class="cnc-side-menu__button" data-cnc-route="reports" type="button"><span class="cnc-menu-icon">${icon("report")}</span>Reports</button>
        <button class="cnc-side-menu__button" data-open-items type="button"><span class="cnc-menu-icon">${icon("edit")}</span>Edit Items</button>
        <button class="cnc-side-menu__button" data-open-settings="bills" type="button"><span class="cnc-menu-icon">${icon("settings")}</span>App Settings</button>
        <div class="cnc-side-menu__sub">
          <button class="cnc-side-menu__subbutton" data-open-settings="cloud" type="button">${icon("cloud")} Cloud Storage</button>
          <button class="cnc-side-menu__subbutton" data-open-settings="profile" type="button">${icon("profile")} Profile Edit</button>
          <button class="cnc-side-menu__subbutton" data-open-settings="theme" type="button">${icon("theme")} Theme</button>
          <button class="cnc-side-menu__subbutton" data-open-settings="contact" type="button">${icon("contact")} Contact Info</button>
        </div>
      </div>
    `;
  }

  function handlePageClick(event) {
    const route = event.target.closest("[data-cnc-route]");
    if (route) {
      event.preventDefault();
      event.stopPropagation();
      const label = route.getAttribute("data-cnc-route");
      if (label === "dashboard" || label === "billing") clickTopTab("Billing");
      if (label === "purchasing") clickTopTab("Purchasing");
      if (label === "reports") clickTopTab("Reports");
      closeOriginalDrawer();
      return;
    }

    const itemsButton = event.target.closest("[data-open-items]");
    if (itemsButton) {
      event.preventDefault();
      event.stopPropagation();
      closeSettings();
      closeOriginalDrawer();
      openItemEditor();
      return;
    }

    const settingsButton = event.target.closest("[data-open-settings]");
    if (settingsButton) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      openSettingsSafely(settingsButton.getAttribute("data-open-settings") || "bills");
      return;
    }

    const button = event.target.closest("button, a");
    if (!button) return;
    const text = (button.textContent || "").trim().toLowerCase();
    if (text === "app settings" || text.includes("app settings")) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      openSettingsSafely("bills");
    }
  }

  function handleHashRoute() {
    const route = location.hash.replace("#settings/", "");
    if (location.hash.startsWith("#settings")) openSettingsSafely(route);
  }

  function handleGlobalKeydown(event) {
    if (event.key !== "Escape") return;
    if (document.querySelector("#cncSettingsOverlay")) closeSettings();
    if (document.querySelector("#cncItemEditorOverlay")) closeItemEditor();
  }

  function startObservers() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          removeBoltBadge(node);
          replaceTextNodes(node);
        });
      }
      replaceBranding();
      enhanceSidebar();
      ensureHeaderSettingsButton();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.openChaatNChillSettings = openSettings;
  window.openChaatNChillSettingsSafely = openSettingsSafely;
  window.closeChaatNChillSettings = closeSettings;
  window.openChaatNChillItemEditor = openItemEditor;
  window.closeChaatNChillItemEditor = closeItemEditor;

  document.addEventListener("click", handlePageClick, true);
  document.addEventListener("click", handleSettingsClick, true);
  document.addEventListener("click", handleItemEditorClick, true);
  document.addEventListener("input", handleBillInput, true);
  document.addEventListener("change", handleItemEditorChange, true);
  document.addEventListener("keydown", handleGlobalKeydown, true);
  window.addEventListener("hashchange", handleHashRoute);

  installDeletedBillFilter();
  applyTheme();
  startObservers();
  replaceBranding();
  ensureHeaderSettingsButton();
  handleHashRoute();

  const startup = window.setInterval(() => {
    replaceBranding();
    enhanceSidebar();
    ensureHeaderSettingsButton();
  }, 700);
  window.setTimeout(() => window.clearInterval(startup), 8000);
})();
