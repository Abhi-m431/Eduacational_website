// Smooth scroll to section
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Efficient multi-page theory rendering using theory.json, with pagination for each subcategory and dynamic sidebar generation
let theoryData = null;
let currentTheory = { category: null, subcat: null };

fetch('theory.json')
  .then(res => res.json())
  .then(json => {
    theoryData = json;
    renderSidebar();
    renderTheory('Quantitative Aptitude');
  });

function renderTheory(category, subcat = null) {
    if (!theoryData) return;
    const container = document.getElementById('questions-list');
    const cat = theoryData[category];
    if (!cat) return;
    let title = cat.title;
    let content = `<div>${cat.overview || ''}</div>`;
    let breadcrumb = category;
    if (subcat && cat.topics[subcat]) {
        const topicsList = cat.topics[subcat];
        if (!topicsList || !topicsList.length) return;
        
        title = subcat;
        breadcrumb = `${category} / ${subcat}`;
        
        content = `<h2>${subcat} Overview</h2>`;
        topicsList.forEach(topicData => {
            content += `
                <section class="theory-section">
                    <h3>${topicData.title}</h3>
                    <div class="theory-content">${topicData.content}</div>
                </section>
            `;
        });

        content += `<div class="cta-footer">
            <button class='btn btn-primary btn-lg' onclick='startPractice("${subcat}")'>Start ${subcat} Practice Test ➔</button>
        </div>`;
    }
    document.getElementById('bread-cat').innerText = breadcrumb;
    document.getElementById('display-title').innerText = title;
    container.innerHTML = `<div class=\"question-card\">${content}</div>`;
    currentTheory = { category, subcat };
}

async function startPractice(tag) {
    const container = document.getElementById('questions-list');
    container.innerHTML = "<div class='question-card'>Loading practice questions...</div>";

    // Get the category from global state to fetch the consolidated category file
    const catName = currentTheory.category;
    const fileName = catName.replace(/[^a-z0-9]/gi, '_') + '.json';
    let allCatQuestions = [];
    
    try {
        const res = await fetch(`data/${fileName}`);
        if (!res.ok) throw new Error();
        allCatQuestions = await res.json();
    } catch (err) {
        alert(`No questions found for category: ${catName}. Ensure data/${fileName} exists.`);
        renderTheory(currentTheory.category, tag); // Reset view
        return;
    }

    // Filter category questions by the specific subcategory tag
    const questions = allCatQuestions.filter(q => q.tag === tag);

    if (questions.length === 0) {
        alert(`No practice questions available for topic: ${tag}`);
        renderTheory(catName, tag);
        return;
    }

    document.getElementById('display-title').innerText = `${tag} - Practice Test`;
    
    container.innerHTML = questions.map((item, idx) => `
        <article class="question-card">
            <p class="q-text">Q${idx + 1}. ${item.q}</p>
            <div class="options-grid">
                ${item.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return `<div class="option-label" onclick="checkPracticeOption(this, '${letter}', '${item.ans}')"><span>${letter}) ${opt}</span></div>`;
                }).join('')}
            </div>
            <button class="btn btn-primary" onclick="this.nextElementSibling.classList.add('show')">Show Answer & Explanation</button>
            <div class="answer-container">
                <div class="answer-content">
                    <span class="correct-badge">Correct Answer: ${item.ans}</span>
                    <div class="explanation"><strong>Explanation:</strong><br>${item.explain}</div>
                </div>
            </div>
        </article>
    `).join('');
}

function checkPracticeOption(element, selected, correct) {
    const card = element.closest('.question-card');
    const options = card.querySelectorAll('.option-label');
    // If already answered, do nothing
    if (card.getAttribute('data-answered') === 'true') return;
    card.setAttribute('data-answered', 'true');
    if (selected === correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
        // Find and highlight the correct one
        options.forEach(opt => {
            if (opt.innerText.trim().startsWith(correct)) {
                opt.classList.add('correct');
            }
        });
    }
    // Do NOT auto-show explanation. User must click the button to reveal.
}

function renderSidebar() {
    const nav = document.getElementById('category-nav');
    if (!nav || !theoryData) return;
    nav.innerHTML = "";
    Object.keys(theoryData).forEach(catKey => {
        const cat = theoryData[catKey];
        const safeId = catKey.replace(/[^a-z0-9]/gi, '_');
        // Main Category Item
        const item = document.createElement('div');
        item.className = 'nav-item';
        item.innerHTML = `<span>${cat.title}</span><span class=\"chevron\">▸</span>`;
        item.onclick = (e) => toggleSubMenu(catKey, safeId, item);
        nav.appendChild(item);
        // Sub-navigation container
        const subNav = document.createElement('div');
        subNav.className = 'sub-nav';
        subNav.id = `sub-${safeId}`;
        Object.keys(cat.topics).forEach(topic => {
            const subItem = document.createElement('div');
            subItem.className = 'nav-item sub-item';
            subItem.innerText = topic;
            subItem.onclick = (e) => {
                e.stopPropagation();
                switchTab(catKey, subItem, topic);
            };
            subNav.appendChild(subItem);
        });
        nav.appendChild(subNav);
    });
}

function toggleSubMenu(catKey, safeId, element) {
    const subMenu = document.getElementById(`sub-${safeId}`);
    const isOpen = subMenu.classList.contains('show');
    subMenu.classList.toggle('show');
    element.classList.toggle('open');
    if (!isOpen) {
        renderTheory(catKey);
    }
}

function switchTab(cat, element, subtopic = null) {
    // Update active class
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // Render new data
    renderTheory(cat, subtopic);
    
    // Scroll to top for mobile users
    if(window.innerWidth < 900) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Add this function to handle sidebar click for Mock Tests
function showMockInstructions(mockNum, element) {
    // Update active class
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('bread-cat').innerText = "Mock Test " + mockNum;
    document.getElementById('display-title').innerText = "Mock Test " + mockNum;
    document.getElementById('mock-result').innerHTML = "";
    document.getElementById('questions-list').innerHTML = `
        <div class="question-card" style="text-align:left;">
            <h2 style="color:#2563eb;">Mock Test ${mockNum} Instructions</h2>
            <ul style="margin-bottom:1.5rem;">
                <li>This mock test contains 10 questions from all areas.</li>
                <li>You have 10 minutes to complete the test.</li>
                <li>Do not refresh or leave the page during the test.</li>
                <li>Your score, percentage, answered/unanswered, and focus area will be shown after submission.</li>
            </ul>
            <div style="margin-bottom:1rem;">
                <button class="btn btn-primary" onclick="startMockTest(${mockNum})">Start Mock Test</button>
            </div>
        </div>
    `;
}

// Show mock test selection (if you want 3 mock tests)
function chooseMockTest() {
    document.getElementById('questions-list').innerHTML = `
        <div class="question-card" style="text-align:left;">
            <h2 style="color:#2563eb;">Select Mock Test</h2>
            <div style="margin-bottom:1rem;">
                <button class="btn btn-primary" onclick="startMockTest(1)">Mock Test 1</button>
                <button class="btn btn-primary" onclick="startMockTest(2)">Mock Test 2</button>
                <button class="btn btn-primary" onclick="startMockTest(3)">Mock Test 3</button>
            </div>
        </div>
    `;
}

let activeTimerInterval = null; // Global timer reference
// MOCK TEST FEATURE
async function startMockTest(mockNum) {
    // Always clear any previous timer before starting a new one
    if (activeTimerInterval) {
        clearInterval(activeTimerInterval);
        activeTimerInterval = null;
    }

    document.getElementById('bread-cat').innerText = "Mock Test " + mockNum;
    document.getElementById('display-title').innerText = "Mock Test " + mockNum + " (All Topics)";
    document.getElementById('mock-result').innerHTML = "";

    document.getElementById('questions-list').innerHTML = "<div class='question-card'>Generating unique test...</div>";

    let mockQuestions = [];
    try {
        // For Mock Tests, we fetch from a shared pool containing a mix of all topics
        const res = await fetch('data/mock_pool.json');
        const pool = await res.json();
        const randomSeed = Math.floor(Math.random() * 1000000) + mockNum;
        mockQuestions = shuffleArray(pool, randomSeed).slice(0, 10);
    } catch (err) {
        alert("Failed to load Mock Test data. Ensure data/mock_pool.json exists.");
        return;
    }

    // Set timer (e.g., 10 minutes for 10 questions)
    let timeLimit = 10 * 60; // seconds
    let timeLeft = timeLimit;

    document.getElementById('questions-list').innerHTML = `
        <div id="timer" style="font-size:1.2rem;font-weight:600;color:#2563eb;margin-bottom:1rem;">
            Time Left: <span id="timer-mins"></span>:<span id="timer-secs"></span>
        </div>
        <form id="mockForm">
            ${mockQuestions.map((item, idx) => `
                <article class="question-card">
                    <span class="q-tag">${item.tag}</span>
                    <p class="q-text">Q${idx + 1}. ${item.q}</p>
                    <div class="options-grid">
                        ${item.options.map((opt, i) => `
                            <label class="option-label">
                                <input type="radio" name="q${item.id}" value="${String.fromCharCode(65 + i)}">
                                <span>${String.fromCharCode(65 + i)}) ${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                </article>
            `).join('')}
            <div class="cta-footer">
                <button type="submit" class="btn btn-primary btn-lg">Submit Mock Test ➔</button>
            </div>
        </form>
    `;

    function updateTimerDisplay() {
        const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const secs = String(timeLeft % 60).padStart(2, '0');
        document.getElementById('timer-mins').textContent = mins;
        document.getElementById('timer-secs').textContent = secs;
    }

    updateTimerDisplay();
    activeTimerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(activeTimerInterval);
            submitMockTest(true);
        }
    }, 1000);

    document.getElementById('mockForm').onsubmit = function(e) {
        e.preventDefault();
        clearInterval(activeTimerInterval);
        submitMockTest(false);
    };

    function submitMockTest(autoSubmit) {
        let correct = 0;
        let total = mockQuestions.length;
        let answered = 0;
        let wrongByTag = {};
        mockQuestions.forEach(q => {
            const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
            if(selected) {
                answered++;
                if(selected.value === q.ans) {
                    correct++;
                } else {
                    wrongByTag[q.tag] = (wrongByTag[q.tag] || 0) + 1;
                }
            } else {
                wrongByTag[q.tag] = (wrongByTag[q.tag] || 0) + 1;
            }
        });
        let percent = Math.round((correct/total)*100);
        let notAnswered = total - answered;

        // Find focus area (tag with most mistakes)
        let focusArea = "None";
        let maxWrong = 0;
        for (let tag in wrongByTag) {
            if (wrongByTag[tag] > maxWrong) {
                maxWrong = wrongByTag[tag];
                focusArea = tag;
            }
        }

        document.getElementById('questions-list').innerHTML = "";
        document.getElementById('mock-result').innerHTML = `
            <div class="question-card" style="background:#f0fdf4;">
                <h2 style="color:#16a34a;">Mock Test ${mockNum} Result</h2>
                <p><b>Score:</b> ${correct} / ${total}</p>
                <p><b>Percentage:</b> ${percent}%</p>
                <p><b>Answered:</b> ${answered} &nbsp; <b>Not Answered:</b> ${notAnswered}</p>
                <p><b>Focus Area:</b> ${focusArea !== "None" ? focusArea : "Great job! No weak area detected."}</p>
                <p><b>${percent >= 70 ? "Great job! Keep practicing." : "Keep practicing to improve your score."}</b></p>
                ${autoSubmit ? `<p style="color:#e11d48;"><b>Time's up! Your test was auto-submitted.</b></p>` : ""}
            </div>
        `;
        document.getElementById('mock-result').scrollIntoView({behavior: "smooth"});
    }
}

// Utility: Shuffle array (Fisher-Yates)
function shuffleArray(array, seed) {
    let arr = array.slice();
    let random = mulberry32(seed);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
// Deterministic PRNG for repeatable shuffles
function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}