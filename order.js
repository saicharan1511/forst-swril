/* Frost&Swirl — standalone Order Now JavaScript */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const root = document.documentElement;
  const $ = id => document.getElementById(id);

  const themeButton = $("theme-toggle");
  const directionButton = $("direction-toggle");
  const category = $("category");
  const product = $("product");
  const quantity = $("quantity");
  const pickup = $("pickup");
  const form = $("order-form");
  const dialog = $("review-dialog");

  function readPreference(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Preferences still work when storage is unavailable.
    }
  }

  /* SAME THEME SETTINGS AS HOME */
  const icons = {
    moon:
      '<path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z"/>',
    sun:
      '<circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2v2m0 16v2M2 12h2m16 0h2' +
      'M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'
  };

  function setTheme(value) {
    const dark = value === "dark";

    root.dataset.theme = dark ? "dark" : "light";
    $("theme-icon").innerHTML = icons[dark ? "sun" : "moon"];

    themeButton.setAttribute(
      "aria-label",
      `Switch to ${dark ? "light" : "dark"} mode`
    );

    savePreference("frost-swirl-theme", root.dataset.theme);
  }

  const defaultTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches ? "dark" : "light";

  setTheme(readPreference("frost-swirl-theme", defaultTheme));

  themeButton.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  /* SAME DIRECTION SETTINGS AS HOME */
  function setDirection(value) {
    root.dir = value === "rtl" ? "rtl" : "ltr";

    directionButton.textContent = root.dir === "rtl" ? "LTR" : "RTL";
    directionButton.setAttribute(
      "aria-label",
      `Switch to ${root.dir === "rtl" ? "left-to-right" : "right-to-left"} layout`
    );

    savePreference("frost-swirl-direction", root.dir);
  }

  setDirection(readPreference("frost-swirl-direction", "ltr"));

  directionButton.addEventListener("click", () => {
    setDirection(root.dir === "rtl" ? "ltr" : "rtl");
  });

  /* SAMPLE MENU MATCHES HOME */
  const menu = {
    icecream: [
      { name: "Vanilla Bean", price: 99 },
      { name: "Chocolate Fudge", price: 109 },
      { name: "Strawberry Swirl", price: 119 },
      { name: "Mango Magic", price: 129 },
      { name: "Cookies & Cream", price: 139 },
      { name: "Pistachio Delight", price: 149 }
    ],
    combos: [
      { name: "Chocolate Dream", price: 249 },
      { name: "Berry Bliss", price: 269 },
      { name: "Vanilla & Caramel", price: 289 }
    ]
  };

  const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  function selectedItem() {
    return menu[category.value][Number(product.value)];
  }

  function updateSummary() {
    const count = Number(quantity.value);
    const valid = Number.isInteger(count) && count >= 1 && count <= 20;
    const item = selectedItem();

    $("summary-product").textContent = item.name;
    $("summary-quantity").textContent = valid
      ? `${count} ${count === 1 ? "item" : "items"}`
      : "Enter a quantity from 1 to 20";

    $("total").textContent = valid
      ? money.format(item.price * count)
      : "—";

    $("decrease").disabled = valid && count === 1;
    $("increase").disabled = valid && count === 20;
  }

  function populateProducts() {
    product.replaceChildren();

    menu[category.value].forEach((item, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${item.name} — ${money.format(item.price)}`;
      product.append(option);
    });

    updateSummary();
  }

  category.addEventListener("change", populateProducts);
  product.addEventListener("change", updateSummary);
  quantity.addEventListener("input", updateSummary);

  function changeQuantity(delta) {
    const current = Number(quantity.value);
    const base = Number.isInteger(current) ? current : 1;

    quantity.value = String(Math.min(20, Math.max(1, base + delta)));
    updateSummary();
  }

  $("decrease").addEventListener("click", () => changeQuantity(-1));
  $("increase").addEventListener("click", () => changeQuantity(1));

  /* LOCAL PICKUP TIME */
  function updatePickupMinimum() {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 1, 0, 0);

    const pad = value => String(value).padStart(2, "0");

    pickup.min =
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-` +
      `${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  pickup.addEventListener("input", () => {
    pickup.setCustomValidity("");
  });

  $("customer-name").addEventListener("input", event => {
    event.target.setCustomValidity("");
  });

  $("phone").addEventListener("input", event => {
    event.target.setCustomValidity("");
  });

  /* REVIEW ONLY — NO FALSE ORDER CONFIRMATION */
  form.addEventListener("submit", event => {
    event.preventDefault();

    const nameInput = $("customer-name");
    const phoneInput = $("phone");
    const customerName = nameInput.value.trim();
    const phoneNumber = phoneInput.value.trim();
    const digits = phoneNumber.replace(/\D/g, "");
    const pickupDate = new Date(pickup.value);

    nameInput.setCustomValidity(
      customerName ? "" : "Please enter your name."
    );

    phoneInput.setCustomValidity(
      /^[+\d\s().-]+$/.test(phoneNumber) &&
      digits.length >= 7 && digits.length <= 15
        ? ""
        : "Please enter a valid phone number."
    );

    updatePickupMinimum();

    pickup.setCustomValidity(
      Number.isNaN(pickupDate.getTime()) || pickupDate <= new Date()
        ? "Please choose a future pickup time."
        : ""
    );

    if (!form.reportValidity()) return;

    const item = selectedItem();
    const count = Number(quantity.value);

    const details = [
      ["Dessert", item.name],
      ["Quantity", String(count)],
      ["Sample total", money.format(item.price * count)],
      ["Name", customerName],
      ["Phone", phoneNumber],
      ["Preferred pickup", pickupDate.toLocaleString()],
      ["Notes", $("notes").value.trim() || "No additional notes"]
    ];

    const reviewDetails = $("review-details");
    reviewDetails.replaceChildren();

    details.forEach(([label, value]) => {
      const term = document.createElement("dt");
      const description = document.createElement("dd");

      term.textContent = label;
      description.textContent = value;

      reviewDetails.append(term, description);
    });

    dialog.showModal();
    $("close-review").focus();
  });

  $("close-review").addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;

    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (outside) dialog.close();
  });

  updatePickupMinimum();
  populateProducts();
});