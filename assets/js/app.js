// ============================
// ESTADO INICIAL
// ============================
let saldo = Number(localStorage.getItem("saldo")) || 0;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

// ============================
// UTILIDADES
// ============================
function saveState() {
  localStorage.setItem("saldo", saldo);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

function addTransaction(type, amount, detail) {
  transactions.push({
    type,
    amount,
    detail,
    date: new Date().toLocaleString()
  });
  saveState();
}

function renderContacts() {
  const select = $("#contactSelect");
  if (!select.length) return;

  select.empty();
  select.append(`<option value="">Selecciona un contacto</option>`);

  contacts.forEach((contact, index) => {
    select.append(
      `<option value="${index}">${contact.name} (${contact.alias})</option>`
    );
  });
}

// ============================
// DOCUMENT READY
// ============================
$(document).ready(function () {

  // ============================
  // LOGIN
  // ============================
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const email = $("#email").val();
    const password = $("#password").val();

    if (email === "admin@alkewallet.cl" && password === "1234") {
      $("main").fadeOut(300, function () {
        window.location.href = "menu.html";
      });
    } else {
      alert("Credenciales incorrectas");
    }
  });

  // ============================
  // MENU — SALDO / INGRESOS / EGRESOS
  // ============================
  if ($("#saldoDisponible").length) {
    $("#saldoDisponible").text(`$${saldo.toLocaleString()}`).hide().fadeIn();
  }

  if ($("#totalIngresos").length && $("#totalEgresos").length) {
    let ingresos = 0;
    let egresos = 0;

    transactions.forEach((tx) => {
      if (tx.amount > 0) ingresos += tx.amount;
      else egresos += Math.abs(tx.amount);
    });

    $("#totalIngresos").text(`$${ingresos.toLocaleString()}`).hide().fadeIn();
    $("#totalEgresos").text(`$${egresos.toLocaleString()}`).hide().fadeIn();
  }

  // ============================
  // DEPÓSITO
  // ============================
  $("#depositForm").on("submit", function (e) {
    e.preventDefault();

    const amount = Number($("#amount").val());

    if (amount <= 0) {
      alert("Monto inválido");
      return;
    }

    saldo += amount;
    addTransaction("Depósito", amount, "Depósito en cuenta");

    $("#depositForm")
      .slideUp(300)
      .after(`<p class="text-success mt-3">Depósito realizado con éxito</p>`);

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 1000);
  });

  // ============================
  // ENVIAR DINERO
  // ============================

  // Mostrar / ocultar formulario de contacto
  $("#btnAddContact").on("click", function () {
    $("#contactForm").slideToggle();
  });

  // Guardar nuevo contacto
  $("#saveContact").on("click", function () {
    const name = $("#name").val().trim();
    const cbu = $("#cbu").val().trim();
    const alias = $("#alias").val().trim();
    const bank = $("#bank").val().trim();

    if (!name || !cbu || !alias || !bank) {
      $("#message").text("Completa todos los campos").addClass("text-danger");
      return;
    }

    contacts.push({ name, cbu, alias, bank });
    saveState();
    renderContacts();

    $("#contactForm input").val("");
    $("#contactForm").slideUp();

    $("#message")
      .text("Contacto agregado correctamente")
      .removeClass("text-danger")
      .addClass("text-success");
  });

  // Cargar contactos al entrar
  renderContacts();

  // Enviar dinero
  $("#sendMoney").on("click", function () {
    const contactIndex = $("#contactSelect").val();
    const amount = Number($("#amount").val());

    if (contactIndex === "" || amount <= 0) {
      $("#message").text("Selecciona un contacto y un monto válido").addClass("text-danger");
      return;
    }

    if (amount > saldo) {
      $("#message").text("Saldo insuficiente").addClass("text-danger");
      return;
    }

    const contact = contacts[contactIndex];

    saldo -= amount;
    addTransaction("Envío", -amount, `Transferencia a ${contact.name}`);
    saveState();

    $("#message")
      .text("Transferencia realizada con éxito")
      .removeClass("text-danger")
      .addClass("text-success");

    $("#amount").val("");
  });

  // ============================
  // MOVIMIENTOS
  // ============================
  if ($("#transactionList").length) {
    $("#transactionList").empty();

    if (transactions.length === 0) {
      $("#transactionList").append(
        `<li class="list-group-item text-center text-muted">
        No hay movimientos registrados
      </li>`
      );
      return;
    }

    transactions
      .slice()
      .reverse()
      .forEach((tx) => {
        const sign = tx.amount < 0 ? "-" : "+";
        const value = Math.abs(tx.amount).toLocaleString();

        const item = $(`
        <li class="list-group-item">
          <div class="d-flex justify-content-between">
            <div>
              <strong>${tx.type}</strong><br>
              <small>${tx.detail}</small><br>
              <small class="text-muted">${tx.date}</small>
            </div>
            <span>${sign}$${value}</span>
          </div>
        </li>
      `).hide();

        $("#transactionList").append(item);
        item.fadeIn(200);
      });
  }


});