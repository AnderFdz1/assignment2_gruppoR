/* =========================================
   EXPLORE PROJECTS PAGE
   Search, status filters and card placeholders
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("project-search");
    const filterButtons = document.querySelectorAll(".filter-button");
    const projectCards = Array.from(document.querySelectorAll(".project-card"));
    const projectCount = document.getElementById("project-count");
    const noResults = document.getElementById("no-results");
    const toast = document.getElementById("project-toast");

    let activeFilter = "all";
    let toastTimer = null;

    /* -----------------------------------------
       Text helpers
    ----------------------------------------- */

    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function currentLanguage() {
        return document.documentElement.lang || "en";
    }

    function translateCount(shown, total) {
        const template = typeof getTranslation === "function"
            ? getTranslation("explore.showing", currentLanguage())
            : "Showing {shown} of {total} projects";

        return template
            .replace("{shown}", shown)
            .replace("{total}", total);
    }

    /* -----------------------------------------
       Filtering
    ----------------------------------------- */

    function cardMatches(card, query) {
        const matchesStatus = activeFilter === "all"
            || card.dataset.status === activeFilter;

        if (!matchesStatus) {
            return false;
        }

        if (!query) {
            return true;
        }

        return normalizeText(card.textContent).includes(query);
    }

    function updateProgressLabels() {
        const fundedLabel = typeof getTranslation === "function"
            ? getTranslation("explore.funded", currentLanguage())
            : "funded";

        projectCards.forEach(card => {
            const progressBar = card.querySelector(".project-progress");
            const title = card.querySelector(".project-title");
            const percent = card.querySelector(".project-percent");

            if (!progressBar || !title || !percent) {
                return;
            }

            progressBar.setAttribute(
                "aria-label",
                `${title.textContent.trim()}: ${percent.textContent.trim()} ${fundedLabel}`
            );
        });
    }

    function updateProjectList() {
        const query = normalizeText(searchInput ? searchInput.value : "");
        let visibleProjects = 0;

        projectCards.forEach(card => {
            const isVisible = cardMatches(card, query);

            card.hidden = !isVisible;

            if (isVisible) {
                visibleProjects += 1;
            }
        });

        if (projectCount) {
            projectCount.textContent = translateCount(
                visibleProjects,
                projectCards.length
            );
        }

        if (noResults) {
            noResults.hidden = visibleProjects !== 0;
        }

        updateProgressLabels();
    }

    /* -----------------------------------------
       Status filters
    ----------------------------------------- */

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter || "all";

            filterButtons.forEach(filterButton => {
                const isActive = filterButton === button;

                filterButton.classList.toggle("active", isActive);
                filterButton.setAttribute("aria-pressed", String(isActive));
            });

            updateProjectList();
        });
    });

    /* -----------------------------------------
       Search
    ----------------------------------------- */

    if (searchInput) {
        searchInput.addEventListener("input", updateProjectList);

        searchInput.addEventListener("keydown", event => {
            if (event.key === "Escape" && searchInput.value) {
                searchInput.value = "";
                updateProjectList();
            }
        });
    }

    /* -----------------------------------------
       Project cards (detail pages not built yet)
    ----------------------------------------- */

    function showToast() {
        if (!toast) {
            return;
        }

        clearTimeout(toastTimer);
        toast.hidden = false;

        requestAnimationFrame(() => {
            toast.classList.add("visible");
        });

        toastTimer = setTimeout(() => {
            toast.classList.remove("visible");

            setTimeout(() => {
                toast.hidden = true;
            }, 220);
        }, 2400);
    }

    projectCards.forEach(card => {
        card.addEventListener("click", event => {
            if (card.dataset.project === "cool-streets") {
                return;
            }

            event.preventDefault();
            showToast();
        });
    });

    /* -----------------------------------------
       React to language changes
    ----------------------------------------- */

    document.addEventListener("languagechange", updateProjectList);

    // Initial state after the saved language has been applied.
    updateProjectList();
});
