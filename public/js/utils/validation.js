import { clearErrorStyles, showErrorPopup } from "./domUtils.js";

const validationRules = {
  "client-name": {
    name: "El nombre del cliente",
    getValue: (elem) => elem.input.value,
    validate: (value) => value.trim() !== "",
    errorMessage: "El nombre del cliente es requerido.",
  },
  date: {
    name: "La fecha",
    getValue: (elem) => elem.value,
    validate: (value) => value !== "",
    errorMessage: "La fecha es requerida.",
  },
  "vehicle-make": {
    name: "La marca del vehículo",
    getValue: (elem) => elem.input.value,
    validate: (value) => value.trim() !== "",
    errorMessage: "La marca del vehículo es requerida.",
  },
  "vehicle-model": {
    name: "El modelo del vehículo",
    getValue: (elem) => elem.input.value,
    validate: (value) => value.trim() !== "",
    errorMessage: "El modelo del vehículo es requerido.",
  },
  "vehicle-plate": {
    name: "La matrícula",
    getValue: (elem) => elem.input.value,
    validate: (value) => value.trim() !== "",
    errorMessage: "La matrícula es requerida.",
  },
  "vehicle-mileage": {
    name: "El kilometraje",
    getValue: (elem) => elem.value,
    validate: (value) => value > 0,
    errorMessage: "El kilometraje debe ser mayor a 0.",
  },
};

function validateRow(row, index) {
  const errors = [];
  const quantityInput = row.querySelector(".quantity");
  const descriptionInput = row.querySelector(".description");
  const unitPriceInput = row.querySelector(".unit-price");

  const quantity = quantityInput.value;
  const description = descriptionInput.value.trim();
  const unitPrice = unitPriceInput.value;

  if (!quantity || quantity < 1) {
    errors.push(`Fila ${index + 1}: La cantidad debe ser mayor a 0`);
    quantityInput.classList.add("error-input");
  }

  if (!description) {
    errors.push(`Fila ${index + 1}: La descripción es requerida`);
    descriptionInput.classList.add("error-input");
  }

  if (!unitPrice || unitPrice <= 0) {
    errors.push(`Fila ${index + 1}: El precio unitario debe ser mayor a 0`);
    unitPriceInput.classList.add("error-input");
  }

  return errors;
}

export function validateForm() {
  let isValid = true;
  const errorMessages = [];
  clearErrorStyles();

  // Validate fields based on centralized rules
  Object.keys(validationRules).forEach((fieldId) => {
    const rule = validationRules[fieldId];
    const element = document.getElementById(fieldId);
    const value = rule.getValue(element);

    if (!rule.validate(value)) {
      errorMessages.push(rule.errorMessage);
      element.classList.add("error-input");
      isValid = false;
    }
  });

  // Validate table rows
  const rows = document
    .getElementById("items-table")
    .querySelectorAll("tbody > tr");
  if (rows.length === 0) {
    errorMessages.push("Debe agregar al menos un ítem");
    isValid = false;
  }

  rows.forEach((row, index) => {
    const rowErrors = validateRow(row, index);
    if (rowErrors.length > 0) {
      errorMessages.push(...rowErrors);
      isValid = false;
    }
  });

  if (!isValid) {
    showErrorPopup(errorMessages);
  }

  return isValid;
}
