/**
 * Go Robo Bill Generator Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Authentication & Session State
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const authUsername = document.getElementById('auth-username');
  const authPassword = document.getElementById('auth-password');
  const authError = document.getElementById('auth-error');
  const userBadge = document.getElementById('user-badge');
  const userDisplayName = document.getElementById('user-display-name');
  const btnLogout = document.getElementById('btn-logout');

  // Check Authentication Session
  async function checkAuthSession() {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        showApp(data.user.name, data.user.billingName);
      } else {
        showLogin();
      }
    } catch (e) {
      // Local fallback mode when testing directly in static file mode
      console.warn('API connection offline or static mode detected. Unlocking application.');
      showApp('Shree (Local)');
    }
  }

  function showLogin() {
    loginModal.style.display = 'flex';
  }

  function showApp(userName, billingName) {
    loginModal.style.display = 'none';
    userBadge.style.display = 'inline-flex';
    userDisplayName.textContent = userName;
    // Auto-fill the billing person name into the seller name field
    if (billingName) {
      const sellerNameEl = document.getElementById('seller-name');
      if (sellerNameEl) sellerNameEl.value = billingName;
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none';
    const username = authUsername.value;
    const password = authPassword.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showApp(data.user.name, data.user.billingName);
        authPassword.value = '';
      } else {
        authError.textContent = data.error || 'Invalid credentials';
        authError.style.display = 'block';
      }
    } catch (err) {
      authError.textContent = 'Server connection error. Please try again.';
      authError.style.display = 'block';
    }
  });

  btnLogout.addEventListener('click', async () => {
    try {
      await fetch('/api/logout');
    } catch (e) {}
    userBadge.style.display = 'none';
    showLogin();
  });

  // Check session on startup
  checkAuthSession();

  // Application State
  const DEFAULT_LOGO_PATH = 'assets/logo-placeholder.png';
  let items = [];
  let customLogoUrl = DEFAULT_LOGO_PATH;

  // DOM Element References - Inputs
  const invoiceNoInput = document.getElementById('invoice-no');
  const currencySelect = document.getElementById('currency-symbol');
  const invoiceDateInput = document.getElementById('invoice-date');
  const dueDateInput = document.getElementById('due-date');

  const sellerNameInput = document.getElementById('seller-name');
  const sellerContactInput = document.getElementById('seller-contact');
  const sellerAddressInput = document.getElementById('seller-address');

  const clientNameInput = document.getElementById('client-name');
  const clientContactInput = document.getElementById('client-contact');
  const clientAddressInput = document.getElementById('client-address');

  const deliveryChargeInput = document.getElementById('delivery-charge');
  const platformChargeInput = document.getElementById('platform-charge');
  const taxRateInput = document.getElementById('tax-rate');
  const discountInput = document.getElementById('discount-amount');
  const notesInput = document.getElementById('notes');

  const itemsEditorList = document.getElementById('items-editor-list');
  const logoInput = document.getElementById('logo-input');
  const btnRemoveLogo = document.getElementById('btn-remove-logo');

  // Preview DOM References
  const prevInvoiceNo = document.getElementById('prev-invoice-no');
  const prevInvoiceDate = document.getElementById('prev-invoice-date');
  const prevDueDate = document.getElementById('prev-due-date');

  const prevSellerName = document.getElementById('prev-seller-name');
  const prevSellerContact = document.getElementById('prev-seller-contact');
  const prevSellerAddress = document.getElementById('prev-seller-address');

  const prevClientName = document.getElementById('prev-client-name');
  const prevClientContact = document.getElementById('prev-client-contact');
  const prevClientAddress = document.getElementById('prev-client-address');

  const prevItemsBody = document.getElementById('prev-items-body');
  const prevSubtotal = document.getElementById('prev-subtotal');
  const prevDelivery = document.getElementById('prev-delivery');
  const prevPlatform = document.getElementById('prev-platform');
  const prevTaxRate = document.getElementById('prev-tax-rate');
  const prevTaxAmount = document.getElementById('prev-tax-amount');
  const prevDiscountAmount = document.getElementById('prev-discount-amount');
  const prevGrandTotal = document.getElementById('prev-grand-total');
  const prevNotes = document.getElementById('prev-notes');

  const formLogoContainer = document.getElementById('form-logo-container');
  const previewLogoContainer = document.getElementById('preview-logo-container');

  const currencyPrefixes = document.querySelectorAll('.currency-prefix');

  // Action Buttons
  const btnAddItem = document.getElementById('btn-add-item');
  const btnPrint = document.getElementById('btn-print');
  const btnReset = document.getElementById('btn-reset');
  const btnLoadSample = document.getElementById('btn-load-sample');

  // Initialize Default Dates
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  invoiceDateInput.value = today;
  dueDateInput.value = due;

  // Initialize Default Sample Items
  const sampleItems = [
    { name: 'Robo Arm Cybernetic Joint v2', qty: 2, price: 2499.00 },
    { name: 'AI Vision Processor Chipset', qty: 1, price: 1250.00 },
    { name: 'Robotics Maintenance & Calibration', qty: 3, price: 350.00 }
  ];

  // Helper: Format Currency
  function formatMoney(amount) {
    const symbol = currencySelect.value;
    const formattedNum = Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${symbol}${formattedNum}`;
  }

  // Update Currency Prefixes across inputs
  function updateCurrencyPrefixes() {
    const symbol = currencySelect.value;
    currencyPrefixes.forEach(prefix => {
      prefix.textContent = symbol;
    });
    renderPreview();
  }

  // Render Form Items Row
  function renderItemRows() {
    itemsEditorList.innerHTML = '';
    items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      const itemTotal = (item.qty || 0) * (item.price || 0);

      row.innerHTML = `
        <input type="text" class="form-control item-name-input" placeholder="Item Name" value="${item.name || ''}" data-index="${index}">
        <input type="number" class="form-control item-qty-input" placeholder="Qty" min="1" value="${item.qty ?? 1}" data-index="${index}">
        <input type="number" class="form-control item-price-input" placeholder="Price" min="0" step="0.01" value="${item.price ?? 0}" data-index="${index}">
        <div class="item-row-total">${formatMoney(itemTotal)}</div>
        <button type="button" class="btn-remove-item" data-index="${index}" title="Remove Item">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      itemsEditorList.appendChild(row);
    });

    // Attach row listeners
    document.querySelectorAll('.item-name-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = e.target.dataset.index;
        items[idx].name = e.target.value;
        renderPreview();
      });
    });

    document.querySelectorAll('.item-qty-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = e.target.dataset.index;
        items[idx].qty = parseFloat(e.target.value) || 0;
        updateItemRowTotal(idx);
        renderPreview();
      });
    });

    document.querySelectorAll('.item-price-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = e.target.dataset.index;
        items[idx].price = parseFloat(e.target.value) || 0;
        updateItemRowTotal(idx);
        renderPreview();
      });
    });

    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.currentTarget.dataset.index;
        items.splice(idx, 1);
        renderItemRows();
        renderPreview();
      });
    });
  }

  function updateItemRowTotal(index) {
    const rows = itemsEditorList.querySelectorAll('.item-row');
    if (rows[index]) {
      const item = items[index];
      const itemTotal = (item.qty || 0) * (item.price || 0);
      const totalEl = rows[index].querySelector('.item-row-total');
      if (totalEl) totalEl.textContent = formatMoney(itemTotal);
    }
  }

  // Calculate & Render Live Preview
  function renderPreview() {
    // Basic Meta
    prevInvoiceNo.textContent = invoiceNoInput.value || 'GR-000';
    prevInvoiceDate.textContent = invoiceDateInput.value || today;
    prevDueDate.textContent = dueDateInput.value || due;

    // Parties
    prevSellerName.textContent = sellerNameInput.value || 'Go Robo';
    prevSellerContact.textContent = sellerContactInput.value || '';
    prevSellerAddress.textContent = sellerAddressInput.value || '';

    prevClientName.textContent = clientNameInput.value || 'Customer Name';
    prevClientContact.textContent = clientContactInput.value || '';
    prevClientAddress.textContent = clientAddressInput.value || '';

    prevNotes.textContent = notesInput.value || 'Thank you for your business!';

    // Render Preview Table Rows
    prevItemsBody.innerHTML = '';
    let subtotal = 0;

    if (items.length === 0) {
      prevItemsBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">
            No items added yet. Click "Add Item" to start building your bill.
          </td>
        </tr>
      `;
    } else {
      items.forEach((item, idx) => {
        const lineTotal = (item.qty || 0) * (item.price || 0);
        subtotal += lineTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td><strong>${escapeHtml(item.name || 'Unnamed Item')}</strong></td>
          <td style="text-align: center;">${item.qty || 0}</td>
          <td style="text-align: right;">${formatMoney(item.price || 0)}</td>
          <td style="text-align: right;"><strong>${formatMoney(lineTotal)}</strong></td>
        `;
        prevItemsBody.appendChild(tr);
      });
    }

    // Additional Charges
    const deliveryCharge = parseFloat(deliveryChargeInput.value) || 0;
    const platformCharge = parseFloat(platformChargeInput.value) || 0;
    const taxRate = parseFloat(taxRateInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;

    // Calculation Sequence
    const taxableSubtotal = subtotal + deliveryCharge + platformCharge;
    const taxAmount = (taxableSubtotal * taxRate) / 100;
    const grandTotal = Math.max(0, taxableSubtotal + taxAmount - discount);

    // Update Totals Display
    prevSubtotal.textContent = formatMoney(subtotal);
    prevDelivery.textContent = formatMoney(deliveryCharge);
    prevPlatform.textContent = formatMoney(platformCharge);

    prevTaxRate.textContent = taxRate;
    prevTaxAmount.textContent = formatMoney(taxAmount);
    prevDiscountAmount.textContent = `-${formatMoney(discount)}`;
    prevGrandTotal.textContent = formatMoney(grandTotal);

    // Toggle tax/discount visibility row
    document.getElementById('row-tax').style.display = taxRate > 0 ? 'flex' : 'none';
    document.getElementById('row-discount').style.display = discount > 0 ? 'flex' : 'none';
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  // Handle Logo Upload & Reset
  logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        customLogoUrl = event.target.result;
        updateLogoDisplays();
      };
      reader.readAsDataURL(file);
    }
  });

  btnRemoveLogo.addEventListener('click', () => {
    customLogoUrl = DEFAULT_LOGO_PATH;
    logoInput.value = '';
    updateLogoDisplays();
  });

  function updateLogoDisplays() {
    const imgHTML = `<img src="${customLogoUrl}" alt="Brand Logo">`;
    formLogoContainer.innerHTML = imgHTML;
    previewLogoContainer.innerHTML = imgHTML;
  }

  // Add Item Click
  btnAddItem.addEventListener('click', () => {
    items.push({ name: '', qty: 1, price: 0 });
    renderItemRows();
    renderPreview();
  });

  // Load Sample Data
  btnLoadSample.addEventListener('click', () => {
    items = JSON.parse(JSON.stringify(sampleItems));
    deliveryChargeInput.value = 50;
    platformChargeInput.value = 25;
    taxRateInput.value = 18;
    discountInput.value = 100;
    currencySelect.value = '₹';
    updateCurrencyPrefixes();
    renderItemRows();
    renderPreview();
  });

  // Reset Form
  btnReset.addEventListener('click', () => {
    items = [];
    invoiceNoInput.value = `GR-${Math.floor(1000 + Math.random() * 9000)}`;
    sellerNameInput.value = 'Go Robo Technologies';
    sellerContactInput.value = '';
    sellerAddressInput.value = '';
    clientNameInput.value = '';
    clientContactInput.value = '';
    clientAddressInput.value = '';
    deliveryChargeInput.value = 0;
    platformChargeInput.value = 0;
    taxRateInput.value = 0;
    discountInput.value = 0;
    customLogoUrl = DEFAULT_LOGO_PATH;
    logoInput.value = '';
    updateLogoDisplays();
    renderItemRows();
    renderPreview();
  });

  // Direct Automatic PDF Download Handler (No Webpage Print Format)
  btnPrint.addEventListener('click', () => {
    const element = document.getElementById('invoice-paper');
    const invoiceNum = invoiceNoInput.value || 'Invoice';
    
    // UI indicator
    const originalText = btnPrint.innerHTML;
    btnPrint.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...`;
    btnPrint.disabled = true;

    const opt = {
      margin:       [0.2, 0.2, 0.2, 0.2],
      filename:     `GoRobo_Invoice_${invoiceNum}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      btnPrint.innerHTML = originalText;
      btnPrint.disabled = false;
    }).catch(err => {
      console.error('PDF Generation Error:', err);
      btnPrint.innerHTML = originalText;
      btnPrint.disabled = false;
    });
  });

  // Add event listeners to all general inputs
  const allInputs = [
    invoiceNoInput, invoiceDateInput, dueDateInput,
    sellerNameInput, sellerContactInput, sellerAddressInput,
    clientNameInput, clientContactInput, clientAddressInput,
    deliveryChargeInput, platformChargeInput, taxRateInput, discountInput, notesInput
  ];

  allInputs.forEach(input => {
    input.addEventListener('input', renderPreview);
  });

  currencySelect.addEventListener('change', updateCurrencyPrefixes);

  // Initial Load setup
  items = JSON.parse(JSON.stringify(sampleItems));
  updateCurrencyPrefixes();
  updateLogoDisplays();
  renderItemRows();
  renderPreview();
});
