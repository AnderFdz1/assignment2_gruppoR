const launchForm = document.getElementById("launchForm");
const launchLayout = document.getElementById("launchLayout");
const launchSuccess = document.getElementById("launchSuccess");

const errorFields = {
    firstNameError: { key: "launch.errorFirstName", field: "firstName" },
    lastNameError: { key: "launch.errorLastName", field: "lastName" },
    emailError: { key: "launch.errorEmail", field: "email" },
    campaignTitleError: { key: "launch.errorCampaignTitle", field: "campaignTitle" },
    projectCategoryError: { key: "launch.errorCategory", field: "projectCategory" },
    projectDescriptionError: { key: "launch.errorDescription", field: "projectDescription" },
    fundingGoalError: { key: "launch.errorAmount", field: "fundingGoal" },
    teamDescriptionError: { key: "launch.errorTeamDescription", field: "teamDescription" },
    teamExperienceError: { key: "launch.errorTeamExperience", field: "teamExperience" },
    termsError: { key: "launch.errorTerms", field: null }
};

function getError(key) {
    return getTranslation(key, document.documentElement.lang);
}

function setError(id, message) {
    const error = document.getElementById(id);
    if (!error) return;

    error.textContent = message;
    error.classList.toggle("has-error", Boolean(message));

    const config = errorFields[id];
    const field = config && config.field ? document.getElementById(config.field) : null;
    if (field) field.classList.toggle("input-error", Boolean(message));
}

function fieldValue(id) {
    return document.getElementById(id).value.trim();
}

launchForm.addEventListener("submit", event => {
    event.preventDefault();
    let valid = true;

    if (!fieldValue("firstName")) {
        setError("firstNameError", getError("launch.errorFirstName"));
        valid = false;
    }
    if (!fieldValue("lastName")) {
        setError("lastNameError", getError("launch.errorLastName"));
        valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue("email"))) {
        setError("emailError", getError("launch.errorEmail"));
        valid = false;
    }
    if (!fieldValue("campaignTitle")) {
        setError("campaignTitleError", getError("launch.errorCampaignTitle"));
        valid = false;
    }
    if (!fieldValue("projectCategory")) {
        setError("projectCategoryError", getError("launch.errorCategory"));
        valid = false;
    }
    if (!fieldValue("projectDescription")) {
        setError("projectDescriptionError", getError("launch.errorDescription"));
        valid = false;
    }

    const fundingGoal = Number.parseFloat(document.getElementById("fundingGoal").value);
    if (!Number.isFinite(fundingGoal) || fundingGoal < 500) {
        setError("fundingGoalError", getError("launch.errorAmount"));
        valid = false;
    }

    if (!fieldValue("teamDescription")) {
        setError("teamDescriptionError", getError("launch.errorTeamDescription"));
        valid = false;
    }
    if (!fieldValue("teamExperience")) {
        setError("teamExperienceError", getError("launch.errorTeamExperience"));
        valid = false;
    }
    if (!document.getElementById("terms").checked) {
        setError("termsError", getError("launch.errorTerms"));
        valid = false;
    }

    if (!valid) {
        const firstError = launchForm.querySelector(".has-error");
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    launchLayout.hidden = true;
    launchSuccess.hidden = false;
    launchSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelectorAll("#launchForm input, #launchForm select, #launchForm textarea").forEach(field => {
    const eventName = field.tagName === "SELECT" || field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventName, () => {
        const errorId = `${field.id}Error`;
        if (document.getElementById(errorId)) setError(errorId, "");
    });
});

document.addEventListener("languagechange", () => {
    Object.entries(errorFields).forEach(([id, config]) => {
        const error = document.getElementById(id);
        if (error && error.textContent) setError(id, getError(config.key));
    });
});
