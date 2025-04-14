//TODO: pasar a usar api.interceptors.response para handelear los errors
import ERROR_CODES from "./utils/errorCodes.js";
import { clientApi, vehicleApi, facturaApi } from "./services/api.js";
import { validateForm } from "./utils/validation.js";

const IVA = 0.22; // 22% IVA

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

let listaInfoClientes = []; // Lista de todos los clientes de la base de datos
let listaInfoVehiculos = []; // Lista de vehiculos del cliente cargado

const clientesSelect = document.querySelector("#client-name");
const vehiculoMarcaSelect = document.querySelector("#vehicle-make");
const vehiculoModeloSelect = document.querySelector("#vehicle-model");
const vehiculoMatriculaSelect = document.querySelector("#vehicle-plate");
const vehiculoKilometrajeInput = document.querySelector("#vehicle-mileage");

// -> GENERAR FACTURA: Boton Grande dinamico + actualizar usuario - tiene que ser dinamico para mostrar al usuario que se esta haciendo.
// 4 estados:
// (1) Verde: Cliente existe + auto existe, solo se actualiza el kilometraje + se genera la factura
// (2) Amarillo: Cliente existe + auto no existe: Se agrega el auto asociado al cliente a al sistema + se genera la factura
// (3) Naranja: Cliente no existe + auto no existe: Se agrega el auto y el cliente al sistema + se genera la factura
// (4) Deshabilitado: El cliente no existe + el auto existe o matricula no coincide con marca/modelo
// -> Generar emergencia: Boton chico que bypassea guardar las cosas en la base de datos estructurada: Guarda los archivos, intenta (sin bloquear) guardar la factura en una json, y genera el pdf
// generar un objeto que genere los estados arriba
// TODO: hacer una funcion que haga el request al backend para obtener la info del cliente y el vehiculo, y lo llame desde el afterSelect de los selects

const REPORT_STATE = [
  {
    name: "ErrorClienteExisteVehiculoExisteNoRelacionado",
    flags: {
      clienteExiste: true,
      VehiculoExiste: true,
      vehiculoEsDeCliente: false,
    },
    descripcion:
      "Cliente Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y modelo",
    cond: ({
      clientesSelect,
      vehiculoMatriculaSelect,
      clienteExiste,
      existeVehiculo,
      vehiculoEsDeCliente,
    }) =>
      clientesSelect.input.value !== "" &&
      vehiculoMatriculaSelect.input.value !== "" &&
      clienteExiste &&
      existeVehiculo &&
      !vehiculoEsDeCliente,
    buttonText: "Error",
    buttonDisabled: true,
    buttonColor: "red",
  },
  {
    name: "ErrorClienteNoExisteVehiculoExisteNoRelacionado",
    flags: {
      clienteExiste: false,
      VehiculoExiste: true,
    },
    descripcion:
      "Cliente NO Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y Modelo",
    cond: ({
      clientesSelect,
      vehiculoMatriculaSelect,
      clienteExiste,
      existeVehiculo,
    }) =>
      clientesSelect.input.value !== "" &&
      vehiculoMatriculaSelect.input.value !== "" &&
      !clienteExiste &&
      existeVehiculo,
    buttonText: "Error",
    buttonDisabled: true,
    buttonColor: "red",
  },
  {
    name: "Undefined",
    descripcion: "Faltan datos",
    flags: {},
    cond: ({
      vehiculoModeloSelect,
      vehiculoMarcaSelect,
      vehiculoMatriculaSelect,
      clientesSelect,
    }) =>
      vehiculoModeloSelect.input.value === "" ||
      vehiculoMarcaSelect.input.value === "" ||
      vehiculoMatriculaSelect.input.value === "" ||
      clientesSelect.input.value === "",
    buttonColor: "gray",
    buttonDisabled: true,
  },

  {
    name: "newReport",
    descripcion:
      "Cliente Existente + Matricula Existente Relacionada + Coincide Marca Y modelo",
    flags: {
      clienteExiste: true,
      existeVehiculo: true,
      vehiculoEsDeCliente: true,
      vehiculoMarcaMatchModelo: true,
    },
    cond: ({
      clienteExiste,
      existeVehiculo,
      vehiculoEsDeCliente,
      vehiculoMarcaMatchModelo,
    }) =>
      clienteExiste &&
      existeVehiculo &&
      vehiculoEsDeCliente &&
      vehiculoMarcaMatchModelo,
    buttonColor: "green",
    buttonText: "Generar Factura",
    buttonDisabled: false,
    action: (btn) => {
      //change the button style:
      btn.classList.remove("btn-green");
      btn.classList.add("btn-yellow");
      // applyy buttonDisabled
      btn.disabled = false;
    },
  },

  {
    name: "OldUserNewVehicle",
    descripcion:
      "Cliente Existente + Matricula NO Existente + SI/NO Coincide Marca Y modelo",
    flags: {
      clienteExiste: true,
      existeVehiculo: false,
    },
    cond: ({ clienteExiste, existeVehiculo }) =>
      clienteExiste && !existeVehiculo,
    buttonColor: "yellow",
    buttonText: "Generar Factura + Nuevo Vehiculo",
    buttonDisabled: false,
  },
  {
    name: "newUserNewVehicle",
    descripcion:
      "Cliente NO Existente + Matricula NO Existente + SI/NO Coincide Marca Y modelo",
    flags: {
      clienteExiste: false,
      existeVehiculo: false,
    },
    cond: ({ clienteExiste, existeVehiculo }) =>
      !clienteExiste && !existeVehiculo,
    buttonColor: "orange",
    buttonText: "Generar Factura + Nuevo Cliente y Vehiculo",
    buttonDisabled: false,
  },

  {
    name: "ErrorNoCoincideMarcaModelo",
    descripcion:
      "Cliente Existente + Matricula Existente Relacionada + NO Coincide Marca Y modelo",

    flags: {
      clienteExiste: true,
      existeVehiculo: true,
      vehiculoEsDeCliente: true,
      vehiculoMarcaMatchModelo: false,
    },
    cond: ({
      clienteExiste,
      existeVehiculo,
      vehiculoEsDeCliente,
      vehiculoMarcaMatchModelo,
    }) =>
      clienteExiste &&
      existeVehiculo &&
      vehiculoEsDeCliente &&
      !vehiculoMarcaMatchModelo,
    buttonText: "Error",
    buttonDisabled: true,
    buttonColor: "red",
  },
  // {
  //   name: "ErrorVehiculoNoRelacionado",
  //   flags: {
  //     clienteExiste: true,
  //     existeVehiculo: true,
  //     vehiculoEsDeCliente: false,
  //   },
  //   cond: () => clienteExiste && existeVehiculo && !vehiculoEsDeCliente,
  //   estado: "ROJO",
  //   descripcion:
  //     "Cliente Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y modelo",
  // },
  {
    name: "ErrorNuevoClienteVehiculoNoRelacionado",
    cond: ({ clienteExiste, existeVehiculo, vehiculoEsDeCliente }) =>
      !clienteExiste && existeVehiculo && !vehiculoEsDeCliente,
    descripcion:
      "Cliente NO Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y Modelo",
    flags: {
      clienteExiste: false,
      existeVehiculo: true,
      vehiculoEsDeCliente: false,
    },
    buttonText: "Error",
    buttonDisabled: true,
    buttonColor: "red",
  },
];
async function updateState() {
  /*
BIEN - Cliente Existente + Matricula Existente Relacionada + Coincide Marca Y modelo 
MAL - CLiente Existente + Matricula Existente Relacionada + NO Coincide Marca Y modelo
MAL - Cliente Existente + Matricula Existente NO Relaciondad + Coincide Marca Y modelo 
MAL - Cliente Existente + Matricula Existente NO Relaciondad + NO Coincide Marca Y modelo 
BIEN (Se crea nuevo vehiculo) - Cliente Existente + Matricula NO Existente + NO Coincide Marca Y modelo 
MAL - Cliente NO Existente + Matricula Existente NO Relacionada + Coincide Marca Y Modelo 
MAL - Cliente NO Existente + Matricula Existente NO Relacionada + NO Coincide Marca Y Modelo 
BIEN (Se crea nuevo cliente y vehiculo) - Cliente NO Existente + Matricula NO Existente +  NO Coincide Marca Y Modelo 
*/

  const clienteSeleccionado = listaInfoClientes.find(
    (cliente) =>
      cliente.nombre.toUpperCase() === clientesSelect.input.value.toUpperCase()
  );

  let vehiculoSeleccionado;
  let existeVehiculo;
  let vehiculoEsDeCliente;
  let clienteExiste = clienteSeleccionado !== undefined;
  let vehiculoMarcaMatchModelo;
  try {
    vehiculoSeleccionado = await vehicleApi.getVehicleByMatricula(
      vehiculoMatriculaSelect.input.value
    );
    if (clienteExiste) {
      vehiculoEsDeCliente =
        vehiculoSeleccionado.data.cliente_id === clienteSeleccionado.id;
    } else {
      vehiculoEsDeCliente = false;
    }
    vehiculoMarcaMatchModelo =
      vehiculoSeleccionado.data.marca.toUpperCase() ===
        vehiculoMarcaSelect.input.value.toUpperCase() &&
      vehiculoSeleccionado.data.modelo.toUpperCase() ===
        vehiculoModeloSelect.input.value.toUpperCase();
    existeVehiculo = true;
  } catch (error) {
    if (error.code === ERROR_CODES.NOT_FOUND.code) {
      existeVehiculo = false;
      vehiculoEsDeCliente = false;
      vehiculoMarcaMatchModelo = false;
    } else {
      console.error("No se pudo concretar estado", error);
      return "Error";
    }
  }
  // const estadosPosibles = [
  //   // Casos invalido temprano:
  //   {
  //     cond: () =>
  //       clientesSelect.input.value !== "" &&
  //       vehiculoMatriculaSelect.input.value !== "" &&
  //       clienteExiste &&
  //       existeVehiculo &&
  //       !vehiculoEsDeCliente,
  //     estado: "ROJO",
  //     descripcion:
  //       "Cliente Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y modelo",
  //   },
  //   {
  //     cond: () =>
  //       clientesSelect.input.value !== "" &&
  //       vehiculoMatriculaSelect.input.value !== "" &&
  //       !clienteExiste &&
  //       existeVehiculo,
  //     estado: "ROJO",
  //     descripcion:
  //       "Cliente NO Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y Modelo ",
  //   },
  //   //UNDEFINED
  //   {
  //     cond: () =>
  //       vehiculoModeloSelect.input.value === "" ||
  //       vehiculoMarcaSelect.input.value === "" ||
  //       vehiculoMatriculaSelect.input.value === "" ||
  //       clientesSelect.input.value === "",
  //     estado: "UNDEFINED",
  //     descripcion: "Faltan datos",
  //   },

  //   //* Casos Validos:
  //   //BIEN - Cliente Existente + Matricula Existente Relacionada + Coincide Marca Y modelo
  //   {
  //     cond: () =>
  //       clienteExiste &&
  //       existeVehiculo &&
  //       vehiculoEsDeCliente &&
  //       vehiculoMarcaMatchModelo,
  //     estado: "VERDE",
  //     descripcion:
  //       "Cliente Existente + Matricula Existente Relacionada + Coincide Marca Y modelo",
  //   },
  //   //BIEN (Se crea nuevo vehiculo) - Cliente Existente + Matricula NO Existente + SI/NO Coincide Marca Y modelo
  //   {
  //     cond: () => clienteExiste && !existeVehiculo,
  //     estado: "AMARILLO",
  //     descripcion:
  //       "Cliente Existente + Matricula NO Existente + SI/NO Coincide Marca Y modelo",
  //   },
  //   {
  //     cond: () => !clienteExiste && !existeVehiculo,
  //     estado: "NARANJA",
  //     descripcion:
  //       "Cliente NO Existente + Matricula NO Existente + SI/NO Coincide Marca Y modelo",
  //   },
  //   //! Casos invalidos
  //   {
  //     cond: () =>
  //       clienteExiste &&
  //       existeVehiculo &&
  //       vehiculoEsDeCliente &&
  //       !vehiculoMarcaMatchModelo,
  //     estado: "ROJO",
  //     descripcion:
  //       "Cliente Existente + Matricula Existente Relacionada + NO Coincide Marca Y modelo",
  //   },
  //   {
  //     cond: () => clienteExiste && existeVehiculo && !vehiculoEsDeCliente,
  //     estado: "ROJO",
  //     descripcion:
  //       "Cliente Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y modelo",
  //   },
  //   {
  //     cond: () => !clienteExiste && existeVehiculo && !vehiculoEsDeCliente,
  //     estado: "ROJO",
  //     descripcion:
  //       "Cliente NO Existente + Matricula Existente NO Relacionada + SI/NO Coincide Marca Y Modelo",
  //   },
  // ];
  // const estado = estadosPosibles.find((estado) => estado.cond());
  // console.log(estado);
  const conditions = {
    clientesSelect,
    vehiculoMatriculaSelect,
    vehiculoModeloSelect,
    vehiculoMarcaSelect,
    clienteExiste,
    existeVehiculo,
    vehiculoEsDeCliente,
    vehiculoMarcaMatchModelo,
  };
  const estado = REPORT_STATE.find((estado) => estado.cond(conditions));

  // console.log(estado);

  return estado;
}

//Setup afterSelect function para los searchable-selects
clientesSelect.afterSelect = async (e) => {
  [vehiculoMarcaSelect, vehiculoModeloSelect, vehiculoMatriculaSelect].forEach(
    (select) => {
      select.clearField();
    }
  );
  // vehiculoKilometrajeInput.value = "";

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
        if (error.code === 404 && error.message === "Vehículo no encontrado") {
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
    if (error.code === 404) {
      console.error("No se encontro el cliente");
    } else {
      console.error("Error al obtener el cliente:", error);
    }
  } finally {
    console.log(await updateState());
  }
};

vehiculoMarcaSelect.afterSelect = async (e) => {
  // vehiculoModeloSelect.input.value = "";
  // vehiculoMatriculaSelect.input.value = "";
  // vehiculoKilometrajeInput.value = "";

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
      console.log("Vehiculo no encontrado en la lista");
    }
  }
  console.log(await updateState());
};
vehiculoModeloSelect.afterSelect = async (e) => {
  // vehiculoMatriculaSelect.input.value = "";
  // vehiculoKilometrajeInput.value = "";

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
    }
  }
  console.log(await updateState());
};

vehiculoMatriculaSelect.afterSelect = async (e) => {
  vehiculoKilometrajeInput.value = "";
  //TODO: requestear el vehiculo al backend
  const vehiculoSeleccionado = listaInfoVehiculos.find(
    (vehiculo) =>
      vehiculo.matricula.toUpperCase() ===
      vehiculoMatriculaSelect.input.value.toUpperCase()
  );
  if (
    vehiculoMatriculaSelect.input.value !== "" &&
    vehiculoSeleccionado !== undefined
  ) {
    vehiculoKilometrajeInput.value = vehiculoSeleccionado.kilometraje;
    // si la matricula esta en la lista, cargar el kilometraje, y la marca y modelo del vehiculo
    vehiculoMarcaSelect.input.value = vehiculoSeleccionado.marca;
    vehiculoModeloSelect.input.value = vehiculoSeleccionado.modelo;
  }
  console.log(await updateState());
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
      const { data: vehicleData } = await vehicleApi.getVehicleByMatricula(
        vehiculoMatriculaSelect.input.value
      );
      console.log(vehicleData);
      if (vehicleData) {
        clientesSelect.input.value = vehicleData.cliente_nombre;
        vehiculoMarcaSelect.input.value = vehicleData.marca;
        vehiculoModeloSelect.input.value = vehicleData.modelo;
        vehiculoKilometrajeInput.value = vehicleData.kilometraje;
      } else {
        //TODO: mostrar un mensaje de error en la pagina
        alert("Vehículo no encontrado");
      }
    } catch (error) {
      if (error.code === 404 && error.message === "Vehículo no encontrado") {
        //TODO: mostrar un mensaje de error en la pagina
        console.log("No existe vehiculo con esa matrícula");
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
    //TODO (low): add a the total to an attribute of the row
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
  updateGrandTotal();
});

function hasIVA() {
  return ivaToggleBtn.checked;
}

function updateGrandTotal() {
  let subTotal = 0;
  let ivaPer = hasIVA() ? IVA : 0;

  itemsTable.querySelectorAll(".line-total").forEach((lineTotalEl) => {
    const lineTotal = parseFloat(lineTotalEl.textContent.replace("$", "")) || 0;
    subTotal += lineTotal;
  });
  subtotalEl.textContent = `$${subTotal.toFixed(2)}`;

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

function showErrorPopup(title, errors = ["Error desconocido"]) {
  const popup = document.getElementById("error-popup");
  const errorList = document.getElementById("error-list");
  const elemTitle = document.getElementById("error-title");
  errorList.innerHTML = "";

  elemTitle.innerHTML = title;
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

function showSuccessPopup(invoiceUrl) {
  const popup = document.getElementById("success-popup");
  const viewInvoiceBtn = document.getElementById("view-invoice-btn");

  viewInvoiceBtn.onclick = () => {
    window.open(invoiceUrl, "_blank");
    popup.style.display = "none";
  };

  popup.style.display = "block";
}

document
  .querySelector(".generate-button")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const data = getInfoForm();

    try {
      const client = await clientApi.createClient({ nombre: data.client_name });
      // const dataClient = await clientApi.getClientByName(data.client.nombre);
      console.log("Cliente creado:", client.data);
      data.client_id = client.data.id;
    } catch (error) {
      if (error.status === 409) {
        console.log("El cliente ya existe");
      } else {
        console.error("Error al crear el cliente:", error);
        const errMsg = error?.response?.data?.message || "Error desconocido";
        showErrorPopup("Error al crear el cliente", [errMsg]);
      }
    }

    try {
      const response = await facturaApi.generateFactura(data, {
        emergencia: "false",
      });
      //redirect to the invoice using axios
      console.log("Factura generada:", response.data);
      // const redirectUrl = response.headers.get("X-Redirect-Url");
      showSuccessPopup(response.data.pdfUrl);
    } catch (error) {
      console.error("Error al crear la factura:", error);
      const errMsg = error?.response?.data?.message || "Error desconocido";
      showErrorPopup("Error al crear la factura", [errMsg]);
    }
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

function getInfoForm() {
  const form = document.getElementById("invoice-form");
  const data = {};
  data.client_name = form.querySelector("#client-name").input.value;
  data.date = form.querySelector("#date").value;
  data.make = form.querySelector("#vehicle-make").input.value;
  data.model = form.querySelector("#vehicle-model").input.value;
  data.plate = form.querySelector("#vehicle-plate").input.value;
  data.mileage = form.querySelector("#vehicle-mileage").value;
  data.incluye_iva = form.querySelector("#iva-toggle-btn").checked;
  console.log(data);
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
  return data;
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
  // setupAutoComplete();
  setupKeyboardShortcuts();
  await loadClientes();
  //TODO: enable the inputs after the clients are loaded
});
