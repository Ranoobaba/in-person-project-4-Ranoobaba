// Week 6: Interactive Portfolio
// Adds smooth scrolling, project filtering, a mobile menu, skill animations
// and form validation to the static portfolio.

// ============================================
// THEME TOGGLE (extension task 3)
// Runs first so the saved theme is on <body> before anything else happens.
// ============================================

const THEME_STORAGE_KEY = 'theme';
const themeToggle = document.querySelector('.theme-toggle');
const themeToggleIcon = document.querySelector('.theme-toggle-icon');
const themeToggleLabel = document.querySelector('.theme-toggle-label');

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);

    // The button offers the theme you would switch to
    themeToggleIcon.textContent = isDark ? '☀️' : '🌙';
    themeToggleLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
}

function loadSavedTheme() {
    // localStorage can throw when storage is blocked, so fall back to light
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

applyTheme(loadSavedTheme());

themeToggle.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(newTheme);

    try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
        // The theme still switches for this visit, it just won't be remembered
    }
});


// ============================================
// PART 1: SMOOTH SCROLL NAVIGATION
// ============================================

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

// Every in-page link (navbar and hero buttons) scrolls smoothly
const inPageLinks = document.querySelectorAll('a[href^="#"]');

inPageLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        const targetSection = document.querySelector(link.getAttribute('href'));
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// BONUS: Highlight the nav link for the section currently on screen
function updateActiveNavLink() {
    const scrollPos = window.scrollY + 100;
    let currentSectionId = sections[0].id;

    sections.forEach(section => {
        if (scrollPos >= section.offsetTop) {
            currentSectionId = section.id;
        }
    });

    // The last section can be too short to reach the top of the screen,
    // so treat "scrolled to the bottom" as being on it
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (isAtBottom) {
        currentSectionId = sections[sections.length - 1].id;
    }

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
    });
}

window.addEventListener('scroll', updateActiveNavLink);
updateActiveNavLink();


// ============================================
// PART 2: PROJECT FILTERING
// Also handles the tag search (extension task 4) and the
// "Showing X of Y projects" line (extension task 1).
// ============================================

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const projectSearch = document.querySelector('#project-search');
const filterCount = document.querySelector('.filter-count');

// A card matches the search if any one of its tags contains the typed text
function matchesSearch(card, searchText) {
    if (searchText === '') {
        return true;
    }

    const tags = card.querySelectorAll('.project-tag');
    return Array.from(tags).some(tag => tag.textContent.toLowerCase().includes(searchText));
}

// Decides every card from the active button AND the search box
function applyFilters() {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    const searchText = projectSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    projectCards.forEach(card => {
        const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
        const isVisible = matchesFilter && matchesSearch(card, searchText);

        // '' falls back to the stylesheet's display value
        card.style.display = isVisible ? '' : 'none';

        if (isVisible) {
            visibleCount++;
        }
    });

    filterCount.textContent = `Showing ${visibleCount} of ${projectCards.length} projects`;
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        applyFilters();
    });
});

projectSearch.addEventListener('input', applyFilters);
applyFilters();


// ============================================
// PART 3: MOBILE MENU TOGGLE
// ============================================

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

function setMenuOpen(isOpen) {
    navMenu.classList.toggle('active', isOpen);
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
}

navToggle.addEventListener('click', () => {
    setMenuOpen(!navMenu.classList.contains('active'));
});

// BONUS: Close the menu when a nav link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
});


// ============================================
// PART 4: SKILL ANIMATIONS
// Uses an Intersection Observer so each bar fills when its card scrolls into view.
// ============================================

const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        }

        const bar = entry.target.querySelector('.skill-progress');
        bar.style.width = bar.style.getPropertyValue('--skill-level');

        // Each bar only needs to animate once
        observer.unobserve(entry.target);
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => skillObserver.observe(bar.closest('.skill-card')));


// ============================================
// PART 5: FORM VALIDATION
// Also handles the message character counter (extension task 2).
// ============================================

const contactForm = document.querySelector('#contact-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');
const messageCounter = document.querySelector('.char-counter');

const NAME_MIN_LENGTH = 2;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 300;

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(input, message) {
    clearError(input);

    const error = document.createElement('span');
    error.className = 'error-message';
    error.textContent = message;

    input.classList.add('error');
    input.classList.remove('success');
    input.setAttribute('aria-invalid', 'true');
    input.parentElement.appendChild(error);
}

function clearError(input) {
    const error = input.parentElement.querySelector('.error-message');
    if (error) {
        error.remove();
    }

    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
}

function showSuccess(input) {
    clearError(input);
    input.classList.add('success');
}

// Each validator shows its own error or success state and reports the result
function validateName() {
    if (nameInput.value.trim().length < NAME_MIN_LENGTH) {
        showError(nameInput, `Name must be at least ${NAME_MIN_LENGTH} characters`);
        return false;
    }

    showSuccess(nameInput);
    return true;
}

function validateEmail() {
    if (!isValidEmail(emailInput.value.trim())) {
        showError(emailInput, 'Please enter a valid email address');
        return false;
    }

    showSuccess(emailInput);
    return true;
}

function validateMessage() {
    if (messageInput.value.trim().length < MESSAGE_MIN_LENGTH) {
        showError(messageInput, `Message must be at least ${MESSAGE_MIN_LENGTH} characters`);
        return false;
    }

    if (messageInput.value.length > MESSAGE_MAX_LENGTH) {
        showError(messageInput, `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer`);
        return false;
    }

    showSuccess(messageInput);
    return true;
}

function updateMessageCounter() {
    const length = messageInput.value.length;
    messageCounter.textContent = `${length} / ${MESSAGE_MAX_LENGTH}`;
    messageCounter.classList.toggle('error', length > MESSAGE_MAX_LENGTH);
}

// Real-time validation
nameInput.addEventListener('input', validateName);
emailInput.addEventListener('input', validateEmail);

// The input event also fires on paste and delete, so the counter always stays current
messageInput.addEventListener('input', () => {
    updateMessageCounter();
    validateMessage();
});

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Run every validator (no short-circuiting) so all errors show at once
    const results = [validateName(), validateEmail(), validateMessage()];

    if (results.includes(false)) {
        contactForm.querySelector('input.error, textarea.error').focus();
        return;
    }

    // Replace any success message left over from a quick second submit
    const oldSuccess = contactForm.querySelector('.success-message');
    if (oldSuccess) {
        oldSuccess.remove();
    }

    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.setAttribute('role', 'status');
    successMessage.textContent = 'Thank you! Your message has been sent successfully.';
    contactForm.appendChild(successMessage);

    // Clear the form after 3 seconds
    setTimeout(() => {
        contactForm.reset();
        successMessage.remove();
        updateMessageCounter();
        contactForm.querySelectorAll('.success').forEach(input => {
            input.classList.remove('success');
        });
    }, 3000);
});


// ============================================
// PROJECT DETAILS PANEL (extension task 5)
// One <dialog>, filled from whichever card was clicked.
// ============================================

const projectDialog = document.querySelector('.project-dialog');
const dialogTitle = projectDialog.querySelector('.dialog-title');
const dialogDescription = projectDialog.querySelector('.dialog-description');
const dialogTags = projectDialog.querySelector('.dialog-tags');
const dialogClose = projectDialog.querySelector('.dialog-close');

function openProjectDetails(card) {
    dialogTitle.textContent = card.querySelector('.project-title').textContent;
    dialogDescription.textContent = card.querySelector('.project-description').textContent;

    dialogTags.replaceChildren();
    card.querySelectorAll('.project-tag').forEach(tag => {
        const tagCopy = document.createElement('span');
        tagCopy.className = 'project-tag';
        tagCopy.textContent = tag.textContent;
        dialogTags.appendChild(tagCopy);
    });

    projectDialog.showModal();
}

projectCards.forEach(card => {
    card.addEventListener('click', (event) => {
        // Let the "Code" link open the repository instead
        if (event.target.closest('a')) {
            return;
        }

        openProjectDetails(event.currentTarget);
    });
});

dialogClose.addEventListener('click', () => projectDialog.close());

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectDialog.open) {
        projectDialog.close();
    }
});
