(function () {
  function getBills() {
    try {
      return JSON.parse(localStorage.getItem("bills") || "[]");
    } catch {
      return [];
    }
  }

  function saveBills(bills) {
    localStorage.setItem("bills", JSON.stringify(bills));
  }

  function openSettings() {
    const old = document.getElementById("settingsModal");
    if (old) old.remove();

    const bills = getBills();

    const billListHtml = bills.length
      ? bills.map((bill, index) => `
        <div style="border:1px solid #ddd;border-radius:14px;padding:12px;margin:10px 0;background:#fff">
          <b>Bill ${bill.id || bill.billNo || bill.bill_number || index + 1}</b><br>
          <span>Total: ₹${bill.total || bill.grandTotal || bill.amount || bill.total_amount || 0}</span><br>
          <button onclick="editSelectedBill(${index})" style="margin-top:8px;padding:10px 14px;border:0;border-radius:10px;background:#2563eb;color:white">Edit</button>
          <button onclick="deleteSelectedBill(${index})" style="margin-top:8px;padding:10px 14px;border:0;border-radius:10px;background:#ef4444;color:white">Delete</button>
        </div>
      `).join("")
      : `<p>No saved bills found.</p>`;

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
          <p>Select one bill below to edit or delete.</p>
          ${billListHtml}
        </div>
      </div>
    `;
    document.body.appendChild(box);
  }

  window.deleteSelectedBill = function (index) {
    const bills = getBills();
    if (!confirm("Delete this selected bill?")) return;

    bills.splice(index, 1);
    saveBills(bills);

    alert("Selected bill deleted ✅");
    openSettings();
  };

  window.editSelectedBill = function (index) {
    const bills = getBills();
    const bill = bills[index];

    const oldAmount = bill.total || bill.grandTotal || bill.amount || bill.total_amount || 0;
    const newAmount = prompt("Enter new bill amount", oldAmount);

    if (newAmount === null) return;

    bill.total = Number(newAmount);
    bill.grandTotal = Number(newAmount);
    bill.amount = Number(newAmount);
    bill.total_amount = Number(newAmount);

    bills[index] = bill;
    saveBills(bills);

    alert("Bill updated ✅");
    openSettings();
  };

  function hookButton() {
    document.querySelectorAll("button, a, div").forEach(el => {
      if ((el.innerText || "").toLowerCase().includes("app settings")) {
        el.style.cursor = "pointer";
        el.onclick = function (e) {
          e.preventDefault();
          openSettings();
        };
      }
    });
  }

  window.openSettings = openSettings;
  setInterval(hookButton, 1000);
})();