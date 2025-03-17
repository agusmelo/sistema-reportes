import { clientApi, vehicleApi } from "./services/api.js";

const itemsTable = document
  .getElementById("items-table")
  .querySelector("tbody");
const ivaEl = document.getElementById("tax-iva");
const subtotalEl = document.getElementById("sub-total");
const grandTotalEl = document.getElementById("total-plus-tax");
const ivaToggleBtn = document.getElementById("iva-toggle-btn");
const loadInfoBtn = document.getElementById("load-info-btn");
const warningMsgBox = document.getElementById("warning-message");
let itemIndex = 1;
let esConIVA = true;

let listaInfoClientes = []; // Lista de todos los clientes de la base de datos
let listaInfoVehiculos = []; // Lista de vehiculos del cliente cargado

const clientesSelect = document.querySelector("#client-name");
const vehiculoMarcaSelect = document.querySelector("#vehicle-make");
const vehiculoModeloSelect = document.querySelector("#vehicle-model");
const vehiculoMatriculaSelect = document.querySelector("#vehicle-plate");
const vehiculoKilometrajeInput = document.querySelector("#vehicle-mileage");

//Setup afterSelect function para los searchable-selects
clientesSelect.afterSelect = async (e) => {
  [vehiculoMarcaSelect, vehiculoModeloSelect, vehiculoMatriculaSelect].forEach(
    (select) => {
      select.clearField();
    }
  );
  vehiculoKilometrajeInput.value = "";

  const clienteSeleccionado = listaInfoClientes.find(
    (cliente) =>
      cliente.nombre.toUpperCase() === clientesSelect.input.value.toUpperCase()
  );

  try {
    const { data: clientData } = await clientApi.getClientByName(
      clientesSelect.input.value
    );
    if (clientData) {
      console.log("Cliente encontrado", clientData);
      try {
        listaInfoVehiculos = await vehicleApi.getVehicleByClientId(
          clientData.id
        );
        if (listaInfoVehiculos) {
          vehiculoMarcaSelect.options = listaInfoVehiculos.map(
            (vehiculo) => vehiculo.marca
          );
          vehiculoModeloSelect.options = listaInfoVehiculos.map(
            (vehiculo) => vehiculo.modelo
          );
          vehiculoMatriculaSelect.options = listaInfoVehiculos.map(
            (vehiculo) => vehiculo.matricula
          );
        }
      } catch (error) {
        //TODO: Eliminar esto el api.interceptors.response ya maneja los errores de status
        if (
          error.response.status === 404 &&
          error.response.data.message === "Vehículo no encontrado"
        ) {
          console.error("No se encontro el vehiculo");
        } else {
          console.error("Error al obtener el vehículo:", error);
        }
        listaInfoVehiculos = [];
        [
          vehiculoMarcaSelect,
          vehiculoModeloSelect,
          vehiculoMatriculaSelect,
        ].forEach((select) => {
          select.clearField();
        });
        vehiculoKilometrajeInput.value = "";
      }
    } else {
      console.log("Cliente no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener el cliente:", error);
  }
};

vehiculoMarcaSelect.afterSelect = (e) => {
  vehiculoModeloSelect.input.value = "";
  vehiculoMatriculaSelect.input.value = "";
  vehiculoKilometrajeInput.value = "";

  if (vehiculoMarcaSelect.input.value !== "") {
    const vehiculoSeleccionado = listaInfoVehiculos.find(
      (vehiculo) =>
        vehiculo.marca.toUpperCase() ===
        vehiculoMarcaSelect.input.value.toUpperCase()
    );
    if (vehiculoSeleccionado !== undefined) {
      vehiculoModeloSelect.options = listaInfoVehiculos.map(
        (vehiculo) => vehiculo.modelo
      );
      vehiculoModeloSelect.options = listaInfoVehiculos
        .filter(
          (vehiculo) =>
            vehiculo.marca.toUpperCase() ===
            vehiculoMarcaSelect.input.value.toUpperCase()
        )
        .map((vehiculo) => vehiculo.modelo);

      vehiculoMatriculaSelect.options = listaInfoVehiculos.map(
        (vehiculo) => vehiculo.matricula
      );
    } else {
      // TODO: indicar al usuario que se esta creando un vehiculo nuevo
      // TODO: Levantar flag de nuevo vehiculo
      console.log("Vehiculo no encontrado en la lista");
    }
  }
};
vehiculoModeloSelect.afterSelect = (e) => {
  vehiculoMatriculaSelect.input.value = "";
  vehiculoKilometrajeInput.value = "";

  if (vehiculoModeloSelect.input.value !== "") {
    const vehiculoSeleccionado = listaInfoVehiculos.find(
      (vehiculo) =>
        vehiculo.modelo.toUpperCase() ===
        vehiculoModeloSelect.input.value.toUpperCase()
    );
    if (vehiculoSeleccionado !== undefined) {
      vehiculoMatriculaSelect.options = listaInfoVehiculos.map(
        (vehiculo) => vehiculo.matricula
      );
    } else {
    }
  }
};

vehiculoMatriculaSelect.afterSelect = (e) => {
  vehiculoKilometrajeInput.value = "";
  if (vehiculoMatriculaSelect.input.value !== "") {
    const vehiculoSeleccionado = listaInfoVehiculos.find(
      (vehiculo) =>
        vehiculo.matricula.toUpperCase() ===
        vehiculoMatriculaSelect.input.value.toUpperCase()
    );
    if (vehiculoSeleccionado !== undefined) {
      vehiculoKilometrajeInput.value = vehiculoSeleccionado.kilometraje;
      // si la matricula esta en la lista, cargar el kilometraje, y la marca y modelo del vehiculo
      vehiculoMarcaSelect.input.value = vehiculoSeleccionado.marca;
      vehiculoModeloSelect.input.value = vehiculoSeleccionado.modelo;
    } else {
      // nuevoVehiculoMatricula = true;
    }
  }
};

//TODO: Parsear la fecha
// document.getElementById("date").value = new Date().toISOString().split("T")[0];

document
  .getElementById("buscar-matricula")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    if (vehiculoMatriculaSelect.input.value === "") {
      alert("Ingrese una matrícula");
      return;
    }
    try {
      const vehicleData = await vehicleApi.getVehicleByMatricula(
        vehiculoMatriculaSelect.input.value
      );
      console.log(vehicleData);
      if (vehicleData) {
        clientesSelect.input.value = vehicleData.cliente_nombre;
        vehiculoMarcaSelect.input.value = vehicleData.marca;
        vehiculoModeloSelect.input.value = vehicleData.modelo;
        vehiculoKilometrajeInput.value = vehicleData.kilometraje;
        console.log("Vehículo encontrado", vehicleData);
      } else {
        alert("Vehículo no encontrado");
      }
    } catch (error) {
      if (
        error.response.status === 404 &&
        error.response.data.message === "Vehículo no encontrado"
      ) {
        console.error("No se encontro el vehiculo");
      } else {
        console.error("Error al obtener el vehículo:", error);
      }
    }
  });

document.querySelector(".add-row").addEventListener("click", addRow);
itemsTable.addEventListener("input", (e) => {
  if (
    e.target.classList.contains("quantity") ||
    e.target.classList.contains("unit-price")
  ) {
    const row = e.target.closest("tr");
    const quantity = parseFloat(row.querySelector(".quantity").value) || 0;
    const unitPrice = parseFloat(row.querySelector(".unit-price").value) || 0;
    const lineTotal = (quantity * unitPrice).toFixed(2);
    row.querySelector(".line-total").textContent = `$${lineTotal}`;
    updateGrandTotal();
  }
});

itemsTable.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-row")) {
    e.target.closest("tr").remove();
    updateGrandTotal();
  }
});

ivaToggleBtn.addEventListener("click", (e) => {
  esConIVA = !esConIVA;
  updateGrandTotal();
});

function updateGrandTotal() {
  let subTotal = 0;
  let ivaPer = 0.22;
  itemsTable.querySelectorAll(".line-total").forEach((lineTotalEl) => {
    const lineTotal = parseFloat(lineTotalEl.textContent.replace("$", "")) || 0;
    subTotal += lineTotal;
  });
  subtotalEl.textContent = `$${subTotal.toFixed(2)}`;
  if (!esConIVA) {
    ivaPer = 0;
  }
  ivaEl.textContent = `$${(subTotal * ivaPer).toFixed(2)}`;
  grandTotalEl.textContent = `$${(subTotal + subTotal * ivaPer).toFixed(2)}`;
}

function addRow(data) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input name="items[${itemIndex}][quantity]" type="number" class="quantity item-input" min="1" value="1" required></td>
    <td><textarea name="items[${itemIndex}][description]" type="text" class="description item-input" placeholder="Ingrese descripción" required></textarea></td>
    <td><input name="items[${itemIndex}][unitPrice]" type="number" class="unit-price item-input" min="0" step="0.01" placeholder="0.00" required></td>
    <td class="line-total">$0.00</td>
    <td><button type="button" class="delete-row">Eliminar</button></td>
  `;
  itemsTable.appendChild(row);
  itemIndex++;
}

document.getElementById("test-btn").addEventListener("click", (e) => {
  document.getElementById("client-name").input.value = "Agustin";
  document.getElementById("date").value = "2025-02-23";
  document.getElementById("vehicle-make").input.value = "Marca";
  document.getElementById("vehicle-model").input.value = "Modelo";
  document.getElementById("vehicle-plate").input.value = "AAA 1234";
  document.getElementById("vehicle-mileage").value = "99999";
  addRow();
});

function showErrorPopup(errors) {
  const popup = document.getElementById("error-popup");
  const errorList = document.getElementById("error-list");
  errorList.innerHTML = "";

  errors.forEach((error) => {
    const li = document.createElement("li");
    li.textContent = error;
    errorList.appendChild(li);
  });

  popup.style.display = "block";
}

document.querySelector(".close-popup").addEventListener("click", () => {
  document.getElementById("error-popup").style.display = "none";
});

document.querySelector(".popup-overlay").addEventListener("click", (e) => {
  if (e.target.classList.contains("popup-overlay")) {
    document.getElementById("error-popup").style.display = "none";
  }
});

loadInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  alert("Carga de datos alternativa, no implementada");
});

function clearErrorStyles() {
  document.querySelectorAll(".error-input").forEach((input) => {
    input.classList.remove("error-input");
  });
}

function validateForm() {
  // TODOD: Get the values as parameters of the function
  let isValid = true;
  const errorMessages = [];
  clearErrorStyles();

  const fields = [
    {
      id: "client-name",
      name: "El nombre del cliente",
      getValue: (elem) => elem.input.value,
      validate: (value) => value.trim() !== "",
    },
    {
      id: "date",
      name: "La fecha",
      getValue: (elem) => elem.value,
      validate: (value) => value !== "",
    },
    {
      id: "vehicle-make",
      name: "La marca del vehículo",
      getValue: (elem) => elem.input.value,
      validate: (value) => value.trim() !== "",
    },
    {
      id: "vehicle-model",
      name: "El modelo del vehículo",
      getValue: (elem) => elem.input.value,
      validate: (value) => value.trim() !== "",
    },
    {
      id: "vehicle-plate",
      name: "La matrícula",
      getValue: (elem) => elem.input.value,
      validate: (value) => value.trim() !== "",
    },
    {
      id: "vehicle-mileage",
      name: "El kilometraje",
      getValue: (elem) => elem.value,
      validate: (value) => value > 0,
    },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    const value = field.getValue(element);

    if (!field.validate(value)) {
      errorMessages.push(`${field.name} es requerido`);
      element.classList.add("error-input");
      isValid = false;
    }
  });

  const rows = itemsTable.querySelectorAll("tr");
  if (rows.length === 0) {
    errorMessages.push("Debe agregar al menos un ítem");
    isValid = false;
  }

  rows.forEach((row, index) => {
    const quantityInput = row.querySelector(".quantity");
    const descriptionInput = row.querySelector(".description");
    const unitPriceInput = row.querySelector(".unit-price");

    const quantity = quantityInput.value;
    const description = descriptionInput.value.trim();
    const unitPrice = unitPriceInput.value;

    if (!quantity || quantity < 1) {
      errorMessages.push(`Fila ${index + 1}: La cantidad debe ser mayor a 0`);
      quantityInput.classList.add("error-input");
      isValid = false;
    }

    if (!description) {
      errorMessages.push(`Fila ${index + 1}: La descripción es requerida`);
      descriptionInput.classList.add("error-input");
      isValid = false;
    }

    if (!unitPrice || unitPrice <= 0) {
      errorMessages.push(
        `Fila ${index + 1}: El precio unitario debe ser mayor a 0`
      );
      unitPriceInput.classList.add("error-input");
      isValid = false;
    }
  });

  if (!isValid) {
    showErrorPopup(errorMessages);
  }

  return isValid;
}

function showSuccessPopup(invoiceUrl) {
  const popup = document.getElementById("success-popup");
  const viewInvoiceBtn = document.getElementById("view-invoice-btn");

  viewInvoiceBtn.onclick = () => {
    window.open(invoiceUrl, "_blank");
    popup.style.display = "none";
  };

  popup.style.display = "block";
}

document.querySelector(".generate-button").addEventListener("click", (e) => {
  e.preventDefault();
  if (!validateForm()) {
    return;
  }

  const form = document.getElementById("invoice-form");
  const formData = new FormData();
  formData.append("client", form.querySelector("#client-name").input.value);
  formData.append("date", form.querySelector("#date").value);
  formData.append("make", form.querySelector("#vehicle-make").input.value);
  formData.append("model", form.querySelector("#vehicle-model").input.value);
  formData.append("plate", form.querySelector("#vehicle-plate").input.value);
  formData.append("mileage", form.querySelector("#vehicle-mileage").value);
  formData.append(
    "iva",
    form.querySelector("#iva-toggle-btn").checked ? "on" : "off"
  );
  for (let pair of formData.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }
  return;

  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  const items = [];
  itemsTable.querySelectorAll("tr").forEach((row) => {
    const item = {
      quantity: row.querySelector(".quantity").value,
      description: row.querySelector(".description").value,
      unitPrice: row.querySelector(".unit-price").value,
    };
    items.push(item);
  });

  data.items = items;

  fetch("/generate-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      const redirectUrl = response.headers.get("X-Redirect-Url");
      response.json().then((data) => {
        console.log("Respuesta:", data);
        showSuccessPopup(redirectUrl);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      showErrorPopup([
        "Ocurrió un error al generar la factura. Por favor, intente nuevamente.",
      ]);
    });
});

document.querySelectorAll(".popup-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      overlay.style.display = "none";
    }
  });
});

document.querySelectorAll(".close-popup").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".popup-overlay").style.display = "none";
  });
});

document.getElementById("client-name").addEventListener("keypress", (e) => {
  const name = document.getElementById("client-name").value;
});

async function loadClientes() {
  try {
    const clientList = await clientApi.getClients();
    listaInfoClientes = clientList.data;
    console.log(listaInfoClientes);
    clientesSelect.options = listaInfoClientes.map((cliente) => cliente.nombre);
  } catch (error) {
    console.log("Error al cargar los clientes:", error);
  }
}

function setupAutoComplete() {
  const makes = [
    "Toyota",
    "Honda",
    "Nissan",
    "Chevrolet",
    "Ford",
    "Hyundai",
    "Kia",
  ];
  const makeInput = document.getElementById("vehicle-make");

  const datalist = document.createElement("datalist");
  datalist.id = "makes-list";
  makes.forEach((make) => {
    const option = document.createElement("option");
    option.value = make;
    datalist.appendChild(option);
  });

  document.body.appendChild(datalist);
  makeInput.setAttribute("list", "makes-list");
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      document.querySelector(".generate-button").click();
    } else if (e.ctrlKey && e.key === "i") {
      e.preventDefault();
      addRow();
    }
  });
}

function setWarningMsg(msg) {
  warningMsgBox.innerHtml = msg;
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("date").valueAsDate = new Date();
  setupAutoComplete();
  setupKeyboardShortcuts();
  await loadClientes();
  //TODO: enable the inputs after the clients are loaded
});
