/* Full Front-End Logic and Interactive Capabilities for Kai Vance Portfolio */

document.addEventListener('DOMContentLoaded', () => {
    initAccentSwitcher();
    initProjectFilter();
    initSkillsTerminal();
    initContactForm();
    initScrollReveal();
    initMobileNav();
    initFloatingParticles();
});

/* 1. Dynamic Theme Accent Switcher with Persistence */
function initAccentSwitcher() {
    const dots = document.querySelectorAll('.accent-dot');
    const savedAccent = localStorage.getItem('vance-accent') || 'amber';
    
    // Apply saved accent on load
    applyAccent(savedAccent);

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const accent = dot.getAttribute('data-accent');
            applyAccent(accent);
            localStorage.setItem('vance-accent', accent);
        });
    });

    function applyAccent(accent) {
        document.documentElement.setAttribute('data-accent', accent);
        
        // Update active class on switcher dots
        dots.forEach(dot => {
            if (dot.getAttribute('data-accent') === accent) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

/* 2. Interactive Projects Filter with Fluid Transitions */
function initProjectFilter() {
    const pills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.project-card');
    const container = document.querySelector('.projects-grid');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const category = pill.getAttribute('data-category');
            
            // Toggle active pill styling
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            // Apply card transitions
            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.classList.remove('filtered-out');
                    // Trigger GPU visual reflow state
                    setTimeout(() => {
                        card.style.position = 'relative';
                        card.style.visibility = 'visible';
                    }, 50);
                } else {
                    card.classList.add('filtered-out');
                    setTimeout(() => {
                        card.style.position = 'absolute';
                        card.style.visibility = 'hidden';
                    }, 400); // match CSS duration
                }
            });
        });
    });
}

/* 3. Skill Diagnostics Terminal Simulator */
function initSkillsTerminal() {
    const skillCards = document.querySelectorAll('.skill-card');
    const terminalBody = document.getElementById('terminal-body');
    
    // Command library mapping keys to logs
    const skillData = {
        'react': {
            name: 'React.js Engine',
            desc: 'Component architecture, Virtual DOM optimization, and state management.',
            status: 'STABLE',
            commands: [
                'npx run-diagnostics --skill=react',
                'Checking component lifecycle methods...',
                'Hook hierarchy structural analysis... OK',
                'Reconciler state: synched successfully.',
                'Virtual DOM diffing calculation: 0.14ms'
            ]
        },
        'three': {
            name: 'Three.js 3D WebGL Context',
            desc: 'Creative shader composition, raycasting physics, camera paths, 3D math.',
            status: 'HYPER_PERFORMANCE',
            commands: [
                'npx run-diagnostics --skill=three.js',
                'Initializing WebGL2RenderingContext...',
                'Loading customized Vertex/Fragment Shaders... Compiled.',
                'Calculating matrices... Camera vector normalized.',
                'Rendering frame buffers... 60.00 FPS [STABLE]'
            ]
        },
        'typescript': {
            name: 'TypeScript Compiler',
            desc: 'Strong typing interfaces, advanced generics, strict compilers, compile architecture.',
            status: 'COMPILED_ZERO_ERRORS',
            commands: [
                'tsc --watch --strict true',
                'Loading tsconfig.json configuration parameters...',
                'Scanning modules... 142 structural references parsed.',
                'Running type checks... Strictly enforced types verified.',
                'Build output: zero compiler errors. Type check success.'
            ]
        },
        'tailwind': {
            name: 'Tailwind CSS Utility Engine',
            desc: 'Atomic glassmorphic style design tokens, dynamic responsiveness, custom layouts.',
            status: 'OPTIMIZED',
            commands: [
                'npx tailwindcss -o styles.css --minify',
                'Parsing HTML utility declarations...',
                'Purging unused utility styles... 98.4% saved.',
                'Injecting backdrop-filter and glassmorphism gradients...',
                'Build successful. Style asset optimized to 14.8KB.'
            ]
        },
        'node': {
            name: 'Node.js Event Server',
            desc: 'High-performance microservice API architecture, WebSockets, thread-less concurrency.',
            status: 'ONLINE',
            commands: [
                'node index.js',
                'Spawning runtime cluster environment... Process ID: 9482',
                'Connecting to secure PostgreSQL database... Linked.',
                'Configuring socket servers on port 3000...',
                'Server cluster health verified. Active connections: 247'
            ]
        }
    };

    let isTyping = false;

    skillCards.forEach(card => {
        card.addEventListener('click', () => {
            if (isTyping) return; // Prevent concurrent overlaps
            
            const skillKey = card.getAttribute('data-skill');
            const data = skillData[skillKey];
            if (!data) return;

            // Highlight chosen skill card
            skillCards.forEach(c => c.querySelector('.w-20').classList.remove('border-primary', 'shadow-[0_0_20px_rgba(76,215,246,0.3)]'));
            card.querySelector('.w-20').classList.add('border-primary', 'shadow-[0_0_20px_rgba(76,215,246,0.3)]');

            isTyping = true;
            terminalBody.innerHTML = ''; // Reset terminal contents
            
            let commandIdx = 0;
            
            function printNextLine() {
                if (commandIdx >= data.commands.length) {
                    // Print diagnostic summary block
                    const summaryLine = document.createElement('div');
                    summaryLine.className = 'terminal-line mt-4 pt-2 border-t border-white/5';
                    summaryLine.innerHTML = `
                        <span class="terminal-success">[SUCCESS]</span> ${data.name} fully verified.<br>
                        <span class="text-white/60">Module Scope:</span> ${data.desc}<br>
                        <span class="text-white/60">Execution State:</span> <span class="terminal-accent font-bold">${data.status}</span>
                    `;
                    terminalBody.appendChild(summaryLine);
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                    isTyping = false;
                    return;
                }

                const lineText = data.commands[commandIdx];
                const line = document.createElement('div');
                line.className = 'terminal-line';

                if (commandIdx === 0) {
                    // Visual terminal prompt line
                    line.innerHTML = `<span class="terminal-input">kai@vance ~ % </span><span class="typing-command"></span>`;
                    terminalBody.appendChild(line);
                    
                    // Simulate typing character by character
                    let charIdx = 0;
                    const typingSpan = line.querySelector('.typing-command');
                    
                    const typingInterval = setInterval(() => {
                        if (charIdx >= lineText.length) {
                            clearInterval(typingInterval);
                            commandIdx++;
                            // Add cursor to simulate visual typing latency
                            setTimeout(printNextLine, 300);
                        } else {
                            typingSpan.textContent += lineText.charAt(charIdx);
                            charIdx++;
                            terminalBody.scrollTop = terminalBody.scrollHeight;
                        }
                    }, 40);
                } else {
                    // System responses output immediately
                    line.innerHTML = `<span class="text-white/40">&gt;&gt;</span> ${lineText}`;
                    terminalBody.appendChild(line);
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                    commandIdx++;
                    setTimeout(printNextLine, 400); // realistic latency
                }
            }

            printNextLine();
        });
    });
}

/* 4. Real-Time Form Validation and Toast notification */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');
    const toast = document.getElementById('success-toast');

    // Add immediate input-linked dynamic validations
    nameInput.addEventListener('input', () => validateField(nameInput, nameInput.value.trim().length >= 3));
    emailInput.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validateField(emailInput, emailRegex.test(emailInput.value.trim()));
    });
    messageInput.addEventListener('input', () => validateField(messageInput, messageInput.value.trim().length >= 10));

    function validateField(input, isValid) {
        if (input.value.trim() === '') {
            input.classList.remove('input-valid', 'input-invalid');
            return;
        }
        if (isValid) {
            input.classList.add('input-valid');
            input.classList.remove('input-invalid');
        } else {
            input.classList.add('input-invalid');
            input.classList.remove('input-valid');
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Perform strict evaluations
        const isNameValid = nameInput.value.trim().length >= 3;
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
        const isMessageValid = messageInput.value.trim().length >= 10;

        validateField(nameInput, isNameValid);
        validateField(emailInput, isEmailValid);
        validateField(messageInput, isMessageValid);

        if (isNameValid && isEmailValid && isMessageValid) {
            // Trigger toast modal
            showToast();
            
            // Clear contents
            form.reset();
            nameInput.classList.remove('input-valid', 'input-invalid');
            emailInput.classList.remove('input-valid', 'input-invalid');
            messageInput.classList.remove('input-valid', 'input-invalid');
        } else {
            // Focus first invalid element
            if (!isNameValid) nameInput.focus();
            else if (!isEmailValid) emailInput.focus();
            else if (!isMessageValid) messageInput.focus();
        }
    });

    function showToast() {
        toast.classList.add('show', 'toast-glow');
        
        setTimeout(() => {
            toast.classList.remove('show', 'toast-glow');
        }, 5000);
    }
}

/* 5. Smooth Scroll triggered Fade and Slide reveal animations */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // trigger animation once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });
}

/* 6. Mobile Menu Slide-Out Hamburger Toggle */
function initMobileNav() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const icon = btn.querySelector('.material-symbols-outlined');
    const links = menu.querySelectorAll('a');

    btn.addEventListener('click', () => {
        const isOpen = menu.classList.contains('open');
        if (isOpen) {
            menu.classList.remove('open');
            icon.textContent = 'menu';
        } else {
            menu.classList.add('open');
            icon.textContent = 'close';
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            icon.textContent = 'menu';
        });
    });
}

/* 7. Atmosphere Floating Ambient Bubble Generator */
function initFloatingParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const particleCount = 14;

    for (let i = 0; i < particleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random dimensions and layout positions
        const size = Math.random() * 80 + 30; // 30px to 110px diameter
        const left = Math.random() * 100; // horizontal coordinate in percentage
        const delay = Math.random() * 12; // visual spawn lag
        const duration = Math.random() * 20 + 20; // travel duration

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.bottom = `-${size}px`;
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.animationDuration = `${duration}s`;

        container.appendChild(bubble);
    }
}
