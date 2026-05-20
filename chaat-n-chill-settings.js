(function () {
  function openSettings() {
    const old = document.getElementById("settingsModal");
    if (old) old.remove();

    const box = document.createElement("div");
    box.id = "settingsModal";
    box.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;padding:30px;overflow:auto">
        <div style="max-width:900px;margin:auto;background:white;border-radius:24px;padding:24px;font-family:Arial">
          <button onclick="document.getElementById('settingsModal').remove()" style="float:right;border:0;background:#eee;border-radius:50%;width:36px;height:36px">×</button>
          <h2>App Settings</h2>

          <h3>Cloud Storage</h3>
          <input placeholder="Google Sheets URL" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <input placeholder="Google Form URL" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <button onclick="alert('Cloud saved')" style="padding:12px 18px;border:0;border-radius:12px;background:#f97316;color:white">Save Cloud</button>

          <h3>Profile Edit</h3>
          <input placeholder="Shop Name" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <input placeholder="Owner Name" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <input placeholder="Email" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <input placeholder="Phone Number" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <textarea placeholder="Address" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px"></textarea>
          <button onclick="alert('Profile saved')" style="padding:12px 18px;border:0;border-radius:12px;background:#f97316;color:white">Save Profile</button>

          <h3>Theme Settings</h3>
          <select style="padding:12px;margin:8px;border-radius:12px">
            <option>Light Mode</option>
            <option>Dark Mode</option>
          </select>
          <input type="color" value="#f97316">
          <input type="color" value="#0ea5e9">
          <button onclick="alert('Theme saved')" style="padding:12px 18px;border:0;border-radius:12px;background:#f97316;color:white">Save Theme</button>

          <h3>Contact Information</h3>
          <input placeholder="Business Phone Number" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <input placeholder="WhatsApp Number" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <input placeholder="Email" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <input placeholder="Website" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <input placeholder="Social Media Links" style="width:100%;padding:12px;margin:8px;border:1px solid #ddd;border-radius:12px">
          <button onclick="alert('Contact saved')" style="padding:12px 18px;border:0;border-radius:12px;background:#f97316;color:white">Save Contact</button>

          <h3>Bill Settings</h3>
          <button onclick="alert('Edit bill option ready')" style="padding:12px 18px;border:0;border-radius:12px;background:#2563eb;color:white">Edit Bill</button>
          <button onclick="alert('Delete bill option ready')" style="padding:12px 18px;border:0;border-radius:12px;background:#ef4444;color:white">Delete Bill</button>
        </div>
      </div>
    `;
    document.body.appendChild(box);
  }

  function hookButton() {
    document.querySelectorAll("button, a, div").forEach(el => {
      if ((el.innerText || "").toLowerCase().includes("app settings")) {
        el.onclick = openSettings;
      }
    });
  }

  window.openSettings = openSettings;
  setInterval(hookButton, 1000);
})();