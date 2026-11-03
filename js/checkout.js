const supportForm = document.getElementById("supportForm");
const amountChoices = document.querySelectorAll(".amount-choice");
const customAmountWrapper = document.getElementById("customAmountWrapper");
const customAmount = document.getElementById("customAmount");
const anonymous = document.getElementById("anonymous");
const summaryAmount = document.getElementById("summaryAmount");
const summaryTotal = document.getElementById("summaryTotal");
let selectedAmount = null;
const errorTranslationKeys = {
    amountError: "support.errorAmount",
    customAmountError: "support.errorCustom",
    firstNameError: "support.errorFirstName",
    lastNameError: "support.errorLastName",
    emailError: "support.errorEmail",
    paymentError: "support.errorPayment",
    termsError: "support.errorTerms"
};

function getError(key) {
    return getTranslation(key, document.documentElement.lang);
}

function setError(id, message) {
    const error = document.getElementById(id);
    error.textContent = message;
    error.classList.toggle("has-error", Boolean(message));
    const field = error.previousElementSibling;
    if (field && (field.tagName === "INPUT" || field.tagName === "DIV")) {
        field.classList.toggle("input-error", Boolean(message));
    }
}

function numericAmount() {
    if (selectedAmount === "custom") {
        const value = Number.parseFloat(customAmount.value);
        return Number.isFinite(value) ? value : null;
    }
    return selectedAmount;
}

function updateSummary() {
    const amount = numericAmount();
    const formatted = amount === null ? "—" : `€${amount.toFixed(2)}`;
    summaryAmount.textContent = formatted;
    summaryTotal.textContent = formatted;
}

function selectAmount(button) {
    amountChoices.forEach(choice => choice.classList.remove("selected"));
    button.classList.add("selected");
    selectedAmount = button.dataset.amount === "custom" ? "custom" : Number(button.dataset.amount);
    customAmountWrapper.classList.toggle("is-hidden", selectedAmount !== "custom");
    if (selectedAmount !== "custom") {
        customAmount.value = "";
        setError("customAmountError", "");
    }
    setError("amountError", "");
    updateSummary();
}

function updateAnonymousState() {
    const fields = [document.getElementById("firstName"), document.getElementById("lastName")];
    fields.forEach(field => {
        field.required = !anonymous.checked;
        field.disabled = anonymous.checked;
        if (anonymous.checked) {
            field.value = "";
            field.classList.remove("input-error");
        }
    });
    setError("firstNameError", "");
    setError("lastNameError", "");
}

amountChoices.forEach(button => button.addEventListener("click", () => selectAmount(button)));
customAmount.addEventListener("input", () => {
    setError("customAmountError", "");
    setError("amountError", "");
    updateSummary();
});
anonymous.addEventListener("change", updateAnonymousState);

["firstName", "lastName", "email"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => setError(`${id}Error`, ""));
});
document.querySelectorAll("input[name='payment']").forEach(input => input.addEventListener("change", () => setError("paymentError", "")));
document.getElementById("terms").addEventListener("change", () => setError("termsError", ""));

supportForm.addEventListener("submit", event => {
    event.preventDefault();
    let valid = true;
    const amount = numericAmount();
    if (amount === null || amount < 5) {
        setError(selectedAmount === "custom" ? "customAmountError" : "amountError", getError(selectedAmount === "custom" ? "support.errorCustom" : "support.errorAmount"));
        valid = false;
    }
    if (!anonymous.checked && !document.getElementById("firstName").value.trim()) {
        setError("firstNameError", getError("support.errorFirstName")); valid = false;
    }
    if (!anonymous.checked && !document.getElementById("lastName").value.trim()) {
        setError("lastNameError", getError("support.errorLastName")); valid = false;
    }
    const email = document.getElementById("email").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("emailError", getError("support.errorEmail")); valid = false;
    }
    if (!document.querySelector("input[name='payment']:checked")) {
        setError("paymentError", getError("support.errorPayment")); valid = false;
    }
    if (!document.getElementById("terms").checked) {
        setError("termsError", getError("support.errorTerms")); valid = false;
    }
    if (!valid) {
        const firstError = supportForm.querySelector(".has-error");
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }
    sessionStorage.setItem("supportAmount", amount.toFixed(2));
    window.location.href = "confirmation.html";
});

document.addEventListener("languagechange", () => {
    updateSummary();
    Object.entries(errorTranslationKeys).forEach(([id, key]) => {
        const error = document.getElementById(id);
        if (error.textContent) setError(id, getError(key));
    });
});

const queryAmount = Number.parseFloat(new URLSearchParams(window.location.search).get("amount"));
if ([10, 25, 50, 100].includes(queryAmount)) {
    selectAmount(document.querySelector(`[data-amount="${queryAmount}"]`));
}
