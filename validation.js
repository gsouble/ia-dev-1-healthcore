// Utilidades de errores
function showError(name, message) {
  const p = document.querySelector(`[data-error-for="${name}"]`);
  if (p) {
    p.textContent = message || "";
    p.classList.toggle("hidden", !message);
  }
}

function showWarning(name, message) {
  const p = document.querySelector(`[data-warning-for="${name}"]`);
  if (p) {
    p.textContent = message || "";
    p.classList.toggle("hidden", !message);
  }
}

function clearAllMessages() {
  document.querySelectorAll("[data-error-for]").forEach(p => {
    p.textContent = "";
    p.classList.add("hidden");
  });
  document.querySelectorAll("[data-warning-for]").forEach(p => {
    p.textContent = "";
    p.classList.add("hidden");
  });
}

// Validaciones específicas
const nameRegex = /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]{2,50}$/;
const phoneRegex = /^\+\d[\d\s]{7,}$/;
const insuranceIdRegex = /^[A-Za-z0-9]{6,20}$/;
const patientIdRegex = /^HC-[A-Za-z0-9]{6}$/;

function validateName(value, fieldName) {
  if (!value) return "Este campo es obligatorio.";
  if (!nameRegex.test(value)) {
    return "Debe tener 2–50 caracteres y solo letras (incluyendo acentos).";
  }
  return "";
}

function validateDateOfBirth(value) {
  if (!value) return "Este campo es obligatorio.";
  const dob = new Date(value);
  const today = new Date();
  if (dob > today) return "La fecha de nacimiento no puede ser futura.";
  const age = (today - dob) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 0 || age > 120) return "El paciente debe tener entre 0 y 120 años.";
  return "";
}

function validateEmail(value) {
  if (!value) return "Este campo es obligatorio.";
  // usar validación nativa del navegador, aquí solo presencia
  return "";
}

function validatePhone(value) {
  if (!value) return "Este campo es obligatorio.";
  if (!phoneRegex.test(value)) {
    return "Debe comenzar con + seguido de código de país (ej. +1 305 555 0191).";
  }
  return "";
}

function validatePreferredDate(value) {
  if (!value) return "Este campo es obligatorio.";
  const today = new Date();
  const date = new Date(value);
  const oneDayMs = 1000 * 60 * 60 * 24;
  const diffDays = (date - today) / oneDayMs;
  if (diffDays < 1) return "Debe ser al menos 1 día hábil desde hoy.";
  if (diffDays > 60) return "No puede ser más de 60 días en el futuro.";
  return "";
}

function validateInsuranceProvider(value, required) {
  if (!required && !value) return "";
  if (!value) return "Este campo es obligatorio.";
  if (value.length > 100) return "Máximo 100 caracteres.";
  return "";
}

function validateInsuranceMemberId(value, required) {
  if (!required && !value) return "";
  if (!value) return "Este campo es obligatorio.";
  if (!insuranceIdRegex.test(value)) {
    return "Debe tener 6–20 caracteres alfanuméricos.";
  }
  return "";
}

function validatePatientId(value) {
  if (!value) return "";
  if (!patientIdRegex.test(value)) {
    return "Formato HC- seguido de 6 caracteres alfanuméricos (ej. HC-A3F291).";
  }
  return "";
}

function validateHealthConcern(value) {
  if (!value) return "Este campo es obligatorio.";
  if (value.length < 20) return "Debe tener al menos 20 caracteres.";
  if (value.length > 500) return "Máximo 500 caracteres.";
  return "";
}

// Lógica principal
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("patient-enquiry-form");
  if (!form) return;

  const healthConcern = document.getElementById("health_concern");
  const healthConcernCount = document.getElementById("health_concern_count");
  const patientIdWrapper = document.getElementById("patient-id-wrapper");
  const insuranceFields = document.getElementById("insurance-fields");
  const successMessage = document.getElementById("success-message");

  // Contador de caracteres en vivo
  if (healthConcern && healthConcernCount) {
    healthConcern.addEventListener("input", () => {
      healthConcernCount.textContent = healthConcern.value.length.toString();
      const msg = validateHealthConcern(healthConcern.value);
      showError("health_concern", msg);
    });
  }

  // Campos condicionales: new_patient
  form.elements["new_patient"].forEach
  ? null
  : null; // solo para evitar errores en algunos navegadores

  form.addEventListener("change", (e) => {
    const target = e.target;

    if (target.name === "new_patient") {
      if (target.value === "No") {
        patientIdWrapper.classList.remove("hidden");
      } else {
        patientIdWrapper.classList.add("hidden");
        showError("patient_id", "");
      }
    }

    if (target.name === "has_insurance") {
      if (target.value === "Yes") {
        insuranceFields.classList.remove("hidden");
      } else {
        insuranceFields.classList.add("hidden");
        showError("insurance_provider", "");
        showError("insurance_member_id", "");
      }
    }
  });

  // Validación suave en blur
  form.querySelectorAll("input, select, textarea").forEach(el => {
    el.addEventListener("blur", () => {
      validateField(el, false);
    });
  });

  function validateField(el, strict) {
    const name = el.name;
    const value = el.value.trim();
    let msg = "";

    switch (name) {
      case "first_name":
      case "last_name":
        msg = validateName(value, name);
        break;
      case "date_of_birth":
        msg = validateDateOfBirth(value);
        break;
      case "email":
        msg = validateEmail(value);
        break;
      case "phone":
        msg = validatePhone(value);
        break;
      case "preferred_language":
      case "preferred_clinic":
      case "service_type":
        if (!value) msg = "Este campo es obligatorio.";
        break;
      case "preferred_date":
        msg = validatePreferredDate(value);
        break;
      case "preferred_time":
        if (!value) {
          msg = "Este campo es obligatorio.";
        } else {
          // advertencia por combinación poco probable
          const clinic = form.elements["preferred_clinic"].value;
          if (value === "Evening" && clinic) {
            if (clinic === "HealthCore San Antonio") {
              showWarning("preferred_time", "San Antonio cierra a las 6pm; la disponibilidad en la franja Evening puede ser limitada.");
            } else if (clinic === "HealthCore Austin North") {
              showWarning("preferred_time", "Austin North cierra a las 7pm; la disponibilidad en la franja Evening puede ser limitada.");
            } else {
              showWarning("preferred_time", "");
            }
          } else {
            showWarning("preferred_time", "");
          }
        }
        break;
      case "insurance_provider": {
        const hasInsurance = getRadioValue("has_insurance") === "Yes";
        msg = validateInsuranceProvider(value, hasInsurance);
        break;
      }
      case "insurance_member_id": {
        const hasInsurance = getRadioValue("has_insurance") === "Yes";
        msg = validateInsuranceMemberId(value, hasInsurance);
        break;
      }
      case "patient_id":
        msg = validatePatientId(value);
        break;
      case "health_concern":
        msg = validateHealthConcern(value);
        break;
      case "contact_consent":
        if (!el.checked) msg = "Debes marcar esta casilla para enviar.";
        break;
      default:
        break;
    }

    if (name === "new_patient" || name === "has_insurance") {
      const radioMsg = validateRadioGroup(name);
      msg = radioMsg || msg;
    }

    if (strict || msg) {
      showError(name, msg);
    }
    return !msg;
  }

  function validateRadioGroup(name) {
    const value = getRadioValue(name);
    if (!value) return "Este campo es obligatorio.";
    return "";
  }

  function getRadioValue(name) {
    const radios = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
    for (const r of radios) {
      if (r.checked) return r.value;
    }
    return "";
  }

  // Validación Paediatric Care + edad
  function validatePaediatricAge() {
    const service = form.elements["service_type"].value;
    const dobValue = form.elements["date_of_birth"].value;
    if (service === "Paediatric Care" && dobValue) {
      const dob = new Date(dobValue);
      const today = new Date();
      const age = (today - dob) / (1000 * 60 * 60 * 24 * 365.25);
      if (age >= 18) {
        showError("service_type", "Para Paediatric Care, el paciente debe tener menos de 18 años.");
        return false;
      }
    }
    return true;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllMessages();

    let valid = true;

    form.querySelectorAll("input, select, textarea").forEach(el => {
      const ok = validateField(el, true);
      if (!ok) valid = false;
    });

    if (!validatePaediatricAge()) valid = false;

    if (valid) {
      successMessage.classList.remove("hidden");
      // Simular envío: no se envían datos a ningún servidor
      form.reset();
      if (healthConcernCount) healthConcernCount.textContent = "0";
      insuranceFields.classList.add("hidden");
      patientIdWrapper.classList.add("hidden");
    } else {
      successMessage.classList.add("hidden");
    }
  });
});
