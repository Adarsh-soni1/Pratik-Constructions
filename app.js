// ==========================================
// Initial Data & State Management
// ==========================================

const defaultFallbackProjects = [
    {
        id: '1',
        title: 'Luxury Villa Construction',
        type: 'Residential',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        description: 'Premium modern villa featuring sustainable materials, an infinity pool, and state-of-the-art home automation systems integrated seamlessly.'
    },
    {
        id: '2',
        title: 'TechHub Office Complex',
        type: 'Commercial',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        description: 'A 15-story commercial office complex designed to foster productivity with open floor plans, green spaces, and high-energy efficiency.'
    },
    {
        id: '3',
        title: 'Metropolitan Bridge Expansion',
        type: 'Infrastructure',
        imageUrl: 'https://images.unsplash.com/photo-1545672239-014c2f4cc145?w=800&q=80',
        description: 'Critical urban infrastructure project expanding highway capacity over the central river, ensuring smooth daily commutes for thousands.'
    }
];

async function fetchProjects() {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (e) {
        console.warn('Backend unavailable, falling back to local storage.');
        if (!localStorage.getItem('pratik_projects')) {
            localStorage.setItem('pratik_projects', JSON.stringify(defaultFallbackProjects));
        }
        return JSON.parse(localStorage.getItem('pratik_projects')) || [];
    }
}

async function saveProjectsOnServer(projects) {
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projects)
        });
        if (!response.ok) throw new Error('API Error');
    } catch (e) {
        console.warn('Backend unavailable, saving to local storage instead.');
        localStorage.setItem('pratik_projects', JSON.stringify(projects));
    }
}

// ==========================================
// UI Rendering
// ==========================================

// Render Projects on Home Page
async function renderPortfolio() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    const projectCount = document.getElementById('project-count');
    
    if (!portfolioGrid) return;
    
    const projects = await fetchProjects();
    
    // Update simple project counter
    if (projectCount) {
        projectCount.textContent = projects.length;
    }
    
    portfolioGrid.innerHTML = '';
    
    if (projects.length === 0) {
        portfolioGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">More projects coming soon...</p>';
        return;
    }
    
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card fade-in visible';
        const bgImage = project.imageUrl || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80';
        card.innerHTML = `
            <div class="project-image" style="background-image: url('${bgImage}')"></div>
            <div class="project-content">
                <span class="project-type">${project.type}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.description}</p>
            </div>
        `;
        portfolioGrid.appendChild(card);
    });
}

// Render Projects in Admin Dashboard
async function renderAdminProjects() {
    const adminList = document.getElementById('admin-project-list');
    const adminCount = document.getElementById('admin-project-count');
    
    if (!adminList) return;
    
    const projects = await fetchProjects();
    
    if (adminCount) {
        adminCount.textContent = projects.length;
    }
    
    adminList.innerHTML = '';
    
    if (projects.length === 0) {
        adminList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No projects found.</p>';
        return;
    }
    
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'admin-project-card';
        card.innerHTML = `
            <div class="project-info">
                <h4>${project.title}</h4>
                <p>${project.type}</p>
            </div>
            <button class="btn btn-danger" onclick="deleteProject('${project.id}')">Delete</button>
        `;
        adminList.appendChild(card);
    });
}

// ==========================================
// Admin Functionality
// ==========================================

// Delete Project
window.deleteProject = async function(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        let projects = await fetchProjects();
        projects = projects.filter(p => p.id !== id);
        await saveProjectsOnServer(projects);
        await renderAdminProjects();
        showToast('Project deleted successfully!');
    }
};

// Add Project Setup
const addProjectForm = document.getElementById('add-project-form');
if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('proj-title').value;
        const type = document.getElementById('proj-type').value;
        const description = document.getElementById('proj-desc').value;
        const imageUrlInput = document.getElementById('proj-image');
        const imageUrl = imageUrlInput ? imageUrlInput.value : '';
        
        const projects = await fetchProjects();
        const newProject = {
            id: Date.now().toString(),
            title,
            type,
            imageUrl,
            description
        };
        
        projects.unshift(newProject);
        await saveProjectsOnServer(projects);
        
        await renderAdminProjects();
        addProjectForm.reset();
        showToast('Project added successfully!');
    });
}

// Auth Flow
const authSection = document.getElementById('auth-section');
const dashSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');

function checkAuthStatus() {
    const isAdmin = sessionStorage.getItem('pratik_admin_auth') === 'true';
    if (isAdmin && authSection && dashSection) {
        authSection.style.display = 'none';
        dashSection.style.display = 'block';
        renderAdminProjects();
    } else if (authSection && dashSection) {
        authSection.style.display = 'block';
        dashSection.style.display = 'none';
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        
        // Simple hardcoded auth for prototype
        if (user === 'pratikconstructions11' && pass === 'jagirdar') {
            sessionStorage.setItem('pratik_admin_auth', 'true');
            loginError.style.display = 'none';
            checkAuthStatus();
            showToast('Welcome, Admin!');
        } else {
            loginError.style.display = 'block';
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('pratik_admin_auth');
        checkAuthStatus();
        showToast('Logged out securely.');
    });
}

// ==========================================
// Utilities & Animations
// ==========================================

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Scroll animations for elements
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
    
    // Header styling on scroll
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Initial renders
    renderPortfolio();
    checkAuthStatus();
});

// Silent Background Submission via FormSubmit
const contactForm = document.getElementById('contact-form');
const submitContact = document.getElementById('submit-contact');
if (submitContact && contactForm) {
    submitContact.addEventListener('click', () => {
        if (contactForm.checkValidity()) {
            submitContact.textContent = 'Sending...';
            submitContact.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const msg = document.getElementById('message').value;
            
            fetch("https://formsubmit.co/ajax/addys1111a@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: msg,
                    _captcha: "false"
                })
            })
            .then(response => response.json())
            .then(data => {
                showToast('Message sent! Pratik will contact you shortly.');
                contactForm.reset();
            })
            .catch(error => {
                console.error(error);
                showToast('Error sending message. Please try again.');
            })
            .finally(() => {
                submitContact.textContent = 'Send Message';
                submitContact.disabled = false;
            });
        } else {
            contactForm.reportValidity();
        }
    });
}

// Mobile Menu Toggle Logic
const mobileBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('open');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn.classList.remove('open');
            navLinks.classList.remove('active');
        });
    });
}
