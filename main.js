/*
 * CampusConnect Frontend Interaction Engine
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // =============================================
    // 1. Theme Switcher System
    // =============================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    let currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    applyTheme(currentTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
                themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap');
            }
        }
    }

    // =============================================
    // 2. Auto-dismiss Flash Banners
    // =============================================
    const dismissFlashBanners = () => {
        document.querySelectorAll('.flash-banner').forEach(banner => {
            banner.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(-10px)';
            setTimeout(() => banner.remove(), 500);
        });
    };
    setTimeout(dismissFlashBanners, 5000);

    // =============================================
    // 3. Form Client-side Validation
    // =============================================
    document.querySelectorAll('.validate-form').forEach(form => {
        form.addEventListener('submit', function(event) {
            let isValid = true;
            form.querySelectorAll('.error-feedback').forEach(e => e.remove());

            // Check Email
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput) {
                const emailVal = emailInput.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailVal)) {
                    showInputError(emailInput, 'Format email tidak valid.');
                    isValid = false;
                }
            }

            // Check Password (Register only)
            const passwordInput = form.querySelector('input[name="password"]');
            if (passwordInput && form.classList.contains('register-form')) {
                if (passwordInput.value.length < 8) {
                    showInputError(passwordInput, 'Password minimal harus 8 karakter.');
                    isValid = false;
                }
            }

            if (!isValid) {
                event.preventDefault();
            }
        });
    });

    function showInputError(inputElement, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-feedback';
        errorDiv.style.color = 'var(--color-red)';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '4px';
        errorDiv.innerText = message;
        inputElement.parentNode.appendChild(errorDiv);
        inputElement.style.borderColor = 'var(--color-red)';
    }

    // =============================================
    // 4. Tab System (Scoped to container)
    // =============================================
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const parentTabs = tab.closest('.profile-tabs');
            const targetId   = tab.dataset.tab;
            if (!targetId) return;

            parentTabs.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const container = parentTabs.nextElementSibling;
            if (container && container.classList.contains('profile-tab-panels')) {
                container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const target = document.getElementById(targetId);
                if (target) target.classList.add('active');
            } else {
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const target = document.getElementById(targetId);
                if (target) target.classList.add('active');
            }
        });
    });

    // Auto-activate tab from URL parameter ?tab=...
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab');
    if (activeTab) {
        let targetTabId = activeTab;
        if (activeTab === 'bookmarks' || activeTab === 'bookmark') {
            targetTabId = 'bookmarked-projects-tab';
        } else if (activeTab === 'joined') {
            targetTabId = 'joined-projects';
        } else if (activeTab === 'owned') {
            targetTabId = 'owned-projects';
        }
        const tabEl = document.querySelector(`.profile-tab[data-tab="${targetTabId}"]`);
        if (tabEl) {
            tabEl.click();
        }
    }

    // =============================================
    // 5. Profile Image Upload Preview
    // =============================================
    const imageUpload = document.getElementById('profile_image_upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', function() {
            const file = this.files[0];
            const feedback = document.getElementById('upload_feedback');
            const preview = document.getElementById('profile_preview');
            const placeholder = document.getElementById('avatar_init');
            
            if (feedback) {
                feedback.innerText = 'Maksimal 2MB, format JPG atau PNG.';
                feedback.style.color = 'var(--color-text-secondary)';
            }
            
            if (file) {
                const maxSize = 2 * 1024 * 1024;
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                
                if (!allowedTypes.includes(file.type)) {
                    if (feedback) {
                        feedback.innerText = 'Format berkas harus JPG atau PNG.';
                        feedback.style.color = 'var(--color-red)';
                    }
                    this.value = '';
                    return;
                }
                
                if (file.size > maxSize) {
                    if (feedback) {
                        feedback.innerText = 'Ukuran foto maksimal 2MB.';
                        feedback.style.color = 'var(--color-red)';
                    }
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    if (preview) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                        if (placeholder) placeholder.style.display = 'none';
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // =============================================
    // 6. Dynamic Interactive Tags System
    // =============================================
    document.querySelectorAll('.tags-input-container').forEach(container => {
        const input = container.querySelector('input');
        const hiddenInput = container.parentNode.querySelector('input[type="hidden"]');
        const predefinedBox = container.parentNode.querySelector('.predefined-tags-list');
        let tagsList = [];
        
        if (hiddenInput && hiddenInput.value) {
            tagsList = hiddenInput.value.split(',').map(t => t.trim()).filter(t => t !== '');
            renderTags();
        }

        if (input) {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const tagVal = input.value.trim().replace(/,/g, '');
                    if (tagVal && !tagsList.includes(tagVal)) {
                        tagsList.push(tagVal);
                        updateHidden();
                        renderTags();
                    }
                    input.value = '';
                }
            });
        }

        if (predefinedBox) {
            predefinedBox.querySelectorAll('.predefined-tag-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const tagVal = this.getAttribute('data-tag');
                    if (tagVal && !tagsList.includes(tagVal)) {
                        tagsList.push(tagVal);
                        updateHidden();
                        renderTags();
                    }
                });
            });
        }

        function renderTags() {
            container.querySelectorAll('.tag-badge').forEach(b => b.remove());
            tagsList.forEach((tag, idx) => {
                const badge = document.createElement('span');
                badge.className = 'tag-badge';
                badge.innerHTML = `${escapeHtml(tag)} <span class="remove-tag" data-index="${idx}">&times;</span>`;
                container.insertBefore(badge, input);
            });

            container.querySelectorAll('.remove-tag').forEach(rem => {
                rem.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const idx = parseInt(this.getAttribute('data-index'));
                    tagsList.splice(idx, 1);
                    updateHidden();
                    renderTags();
                });
            });
        }

        function updateHidden() {
            if (hiddenInput) hiddenInput.value = tagsList.join(',');
        }
        
        function escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    });

    // =============================================
    // 7. Mobile Navigation Drawer
    // =============================================
    const hamburger = document.getElementById('nav-hamburger-btn');
    const drawer    = document.getElementById('mobile-nav-drawer');
    const overlay   = document.getElementById('mobile-nav-overlay');
    const closeBtn  = document.getElementById('mobile-nav-close-btn');

    if (hamburger && drawer) {
        const openDrawer = () => {
            drawer.classList.add('open');
            hamburger.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeDrawer = () => {
            drawer.classList.remove('open');
            hamburger.classList.remove('open');
            document.body.style.overflow = '';
        };

        hamburger.addEventListener('click', openDrawer);
        if (overlay)  overlay.addEventListener('click', closeDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeDrawer();
        });
    }
});
