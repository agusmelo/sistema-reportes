export function clearErrorStyles() {
  document.querySelectorAll(".error-input").forEach((input) => {
    input.classList.remove("error-input");
  });
}

export function showErrorPopup(errors) {
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

export function showSuccessPopup(invoiceUrl) {
  const popup = document.getElementById("success-popup");
  const viewInvoiceBtn = document.getElementById("view-invoice-btn");

  viewInvoiceBtn.onclick = () => {
    window.open(invoiceUrl, "_blank");
    popup.style.display = "none";
  };

  popup.style.display = "block";
}
