(function () {
  const STORAGE_KEY = "chaat-n-chill-settings";

  const defaults = {
    cloud: { sheetsUrl: "", formUrl: "", sheetsConnected: false, formConnected: false },
    profile: { shopName: "Chaat N Chill", ownerName: "", email: "", phone: "", address: "", image: "" },
    theme: { mode: "light", primaryColor: "#f97316", accentColor: "#0ea5e9", fontSize: "medium" },
    contact: { businessPhone: "", whatsapp: "", email: "", website: "", address: "", instagram: "", facebook: "", youtube: "" }
  };

  let settings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || defaults;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    alert("Settings saved");
  }

  function openSettings() {
    document.body.insertAdjacentHTML("beforeend", `
      <div id="settingsBox" style="position:fixed;inset:0;background:#0008;z-index:9999;padding:20px;overflow:auto">
        <div style="background:white;border-radius:20px;padding:20px;max-width:900px;margin:auto">
          <button onclick="document.getElementById('settingsBox').remove()" style="float:right">X</button>
          <h2>App Settings</h2>

          <h3>Cloud Storage</h3>
          <input id="sheetUrl" placeholder="Google Sheets URL" style="width:100%;padding:12px;margin:6px" value="${settings.cloud.sheetsUrl}">
          <input id="formUrl" placeholder="Google Form URL" style="width:100%;padding:12px;margin:6px" value="${settings.cloud.formUrl}">
          <button onclick="window.saveCloud()">Save Cloud</button>

          <h3>Profile Edit</h3>
          <input id="shopName" placeholder="Shop Name" style="width:100%;padding:12px;margin:6px" value="${settings.profile.shopName}">
          <input id="ownerName" placeholder="Owner Name" style="width:100%;padding:12px;margin:6px" value="${settings.profile.ownerName}">
          <input id="email" placeholder="Email" style="width:100%;padding:12px;margin:6px" value="${settings.profile.email}">
          <input id="phone" placeholder="Phone" style="width:100%;padding:12px;margin:6px" value="${settings.profile.phone}">
          <textarea id="address" placeholder="Address" style="width:100%;padding:12px;margin:6px">${settings.profile.address}</textarea>
          <button onclick="window.saveProfile()">Save Profile</button>

          <h3>Theme</h3>
          <select id="mode"><option value="light">Light</option><option value="dark">Dark</option></select>
          <input id="primaryColor" type="color" value="${settings.theme.primaryColor}">
          <input id="accentColor" type="color" value="${settings.theme.accentColor}">
          <button onclick="window.saveTheme()">Save Theme</button>

          <h3>Contact Info</h3>
          <input id="businessPhone" placeholder="Business Phone" style="width:100%;padding:12px;margin:6px" value="${settings.contact.businessPhone}">
          <input id="whatsapp" placeholder="WhatsApp" style="width:100%;padding:12px;margin:6px" value="${settings.contact.whatsapp}">
          <input id="website" placeholder="Website" style="width:100%;padding:12px;margin:6px" value="${settings.contact.website}">
          <button onclick="window.saveContact()">Save Contact</button>

          <h3>Bill Settings</h3>
          <p>Edit/Delete bill option added in settings area.</p>
          <button onclick="alert('Bill edit/delete needs your bill storage key. We will add next.')">Open Bill Settings</button>
        </div>
      </div>
    `);
  }

  window.saveCloud = function () {
    settings.cloud.sheetsUrl = document.getElementById("sheetUrl").value;
    settings.cloud.formUrl = document.getElementById("formUrl").value;
    settings.cloud.sheetsConnected = !!settings.cloud.sheetsUrl;
    settings.cloud.formConnected = !!settings.cloud.formUrl;
    save();
  };

  window.saveProfile = function () {
    settings.profile.shopName = document.getElementById("shopName").value;
    settings.profile.ownerName = document.getElementById("ownerName").value;
    settings.profile.email = document.getElementById("email").value;
    settings.profile.phone = document.getElementById("phone").value;
    settings.profile.address = document.getElementById("address").value;
    save();
  };

  window.saveTheme = function () {
    settings.theme.mode = document.getElementById("mode").value;
    settings.theme.primaryColor = document.getElementById("primaryColor").value;
    settings.theme.accentColor = document.getElementById("accentColor").value;
    save();
  };

  window.saveContact = function () {
    settings.contact.businessPhone = document.getElementById("businessPhone").value;
    settings.contact.whatsapp = document.getElementById("whatsapp").value;
    settings.contact.website = document.getElementById("website").value;
    save();
  };

  setTimeout(() => {
    const btn = document.createElement("button");
    btn.innerText = "App Settings";
    btn.style = "position:fixed;right:20px;bottom:20px;z-index:9998;padding:14px 18px;border-radius:20px;background:#f97316;color:white;border:0;font-weight:bold";
    btn.onclick = openSettings;
    document.body.appendChild(btn);
  }, 1000);
  setTimeout(() => {
  document.querySelectorAll("button, a, div, span").forEach((el) => {
    if ((el.innerText || "").trim() === "App Settings") {
      el.onclick = function (e) {
        e.preventDefault();
        openSettings();
      };
    }
  });
}, 1500);
})();