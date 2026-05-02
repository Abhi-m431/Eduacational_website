let examState = {
    questions: [],
    responses: {}, // questionId: selectedOption
    marked: new Set(),
    visited: new Set(),
    currentIndex: 0,
    timeLeft: 0,
    timerId: null
};

// Centralized DOM element cache
const ui = {
    get sidebar() { return document.querySelector('.sidebar'); },
    get sidebarOverlay() { return document.getElementById('sidebar-overlay'); },
    get mainContent() { return document.getElementById('main-content'); },
    get userName() { return document.getElementById('user-name'); },
    get questionsList() { return document.getElementById('questions-list'); },
    get breadcrumbCat() { return document.getElementById('bread-cat'); },
    get displayTitle() { return document.getElementById('display-title'); },
    get mockResult() { return document.getElementById('mock-result'); }
};

// Smooth scroll to section
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

const motivationalQuotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The secret of getting ahead is getting started.",
    "Believe you can and you're halfway there.",
    "It always seems impossible until it's done.",
    "Don't stop when you're tired. Stop when you're done."
];

// Efficient multi-page theory rendering using theory.json, with pagination for each subcategory and dynamic sidebar generation
let theoryData = null;
let currentTheory = { category: null, subcat: null };

// Performance Optimization: Cache for fetched questions
let questionsCache = {};
let activeCharts = {};

function toggleSidebar() {
    if (ui.sidebar && ui.sidebarOverlay) {
        ui.sidebar.classList.toggle('show');
        ui.sidebarOverlay.classList.toggle('show');
    }
}

function closeSidebarOnMobile() {
    if (window.innerWidth <= 900 && ui.sidebar && ui.sidebarOverlay) {
        ui.sidebar.classList.remove('show');
        ui.sidebarOverlay.classList.remove('show');
    }
}

// Helper to remove 'active' class from all nav items
function clearActiveNavItems() {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
}

if (!theoryData) {
    fetch('theory.json')
      .then(res => {
          if (!res.ok) throw new Error("Failed to load theory.json");
          return res.json();
      })
      .then(json => {
        theoryData = json;
        renderSidebar();
        handleInitialRouting();
      })
      .catch(err => console.error("Initialization error:", err));
}

// Helper to ensure Dashboard layout is restored when exiting Exam Mode
function ensureDashboardShell() {
    document.body.classList.remove('exam-mode-active');
    const main = ui.mainContent;
    if (!main) return console.error("Main content container not found.");

    const existingQuestionsList = document.getElementById('questions-list');
    if (!existingQuestionsList) {
        main.innerHTML = `
            <div class="header-meta">
                <div class="breadcrumb">Dashboard / <span id="bread-cat"></span></div>
                <h1 class="page-title" id="display-title"></h1>
            </div>
            <div id="questions-list"></div>
            <div id="mock-result"></div>
        `;
    }

    if (ui.mockResult) ui.mockResult.innerHTML = ""; 
}

// Helper to find which category a specific topic (tag) belongs to
function findCategoryByTopic(topicName) {
    if (!theoryData) return null;
    return Object.keys(theoryData).find(cat => 
        Object.keys(theoryData[cat].topics).some(t => t.toLowerCase() === topicName.toLowerCase())
    );
}

function handleInitialRouting() {
    const path = window.location.hash || '#/';
    // Normalize path by removing #/ and splitting into parts
    const routeParts = path.replace(/^#\/?/, '').split('/').filter(Boolean);
    
    if (history.state && history.state.view) {
        const state = history.state;
        switch(state.view) {
            case 'theory': return renderTheory(state.category, state.subcat, false);
            case 'practice': 
                currentTheory.category = state.category;
                return startPractice(state.tag, false);
            case 'profile': return showProfileDetails(false);
            case 'stats': return showStatistics(false);
            case 'mockInstr': return showMockInstructions(state.mockNum, null, false);
            case 'mockSelect': return chooseMockTest(false);
            case 'mockActive': return startMockTest(state.mockNum, false, state.seed);
        }
    }

    if (routeParts.length === 0 || routeParts[0] === 'index.html') {
        if (!history.state) history.replaceState({ view: 'home' }, "", "#/");
        renderHome(false);
    } else if (routeParts[0] === 'theory') {
        const catName = routeParts[1] ? routeParts[1].replace(/-/g, ' ') : null;
        const subName = routeParts[2] ? routeParts[2].replace(/-/g, ' ') : null;
        const categoryKey = Object.keys(theoryData).find(k => k.toLowerCase() === catName?.toLowerCase());
        if (categoryKey) {
            renderTheory(categoryKey, subName, false);
        } else {
            renderHome(false);
        }
    } else if (routeParts[0] === 'practice') {
        const tagName = routeParts[1] ? routeParts[1].replace(/-/g, ' ') : null;
        const categoryKey = findCategoryByTopic(tagName);
        if (categoryKey && tagName) {
            currentTheory.category = categoryKey;
            startPractice(tagName, false);
        } else { renderHome(false); }
    } else if (routeParts[0] === 'statistics') {
        showStatistics(false);
     } else if (routeParts[0] === 'profile') {
        showProfileDetails(false);
    } else if (routeParts[0] === 'mock-test') {
        chooseMockTest(false);
        if (routeParts[1]) {
            const mockNum = parseInt(routeParts[1]);
            if (routeParts[2] === 'active') {
                startMockTest(mockNum, false);
            } else {
                showMockInstructions(mockNum, null, false);
            }
        }
    } else {
        // Default to home for unknown paths
        history.replaceState({ view: 'home' }, "", "#/");
        renderHome(false);
    }
}
function renderHome(push = true) {
    ensureDashboardShell();
    closeSidebarOnMobile();
    
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    // Improvement: Fallback to "Student" only if the name is explicitly missing
    let firstName = ui.userName?.innerText;
    if (!firstName || firstName === "") {
        firstName = "Student";
    }

    if (ui.breadcrumbCat) ui.breadcrumbCat.innerText = "Home";
    if (ui.displayTitle) ui.displayTitle.innerText = "Student Dashboard";
    if (ui.mockResult) ui.mockResult.innerHTML = "";
    
    if (ui.questionsList) {
        ui.questionsList.innerHTML = `
        <div class="welcome-container focused-mode">
            <h2 class="section-heading">Welcome back, ${firstName}</h2>
            
            <div class="quote-card">
                <p class="quote-text">"${quote}" — <em>Focus on your goals.</em></p>
            </div>
            
            <div class="dashboard-grid">
                <div class="question-card" style="cursor: pointer; text-align: left;" onclick="renderTheory('Quantitative Aptitude')">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">Study Topics</h3>
                    <p style="font-size: 0.95rem; color: var(--text-muted);">Browse detailed formulas and concepts for your upcoming exams.</p>
                </div>
                <div class="question-card" style="cursor: pointer; text-align: left;" onclick="chooseMockTest()">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">Mock Tests</h3>
                    <p style="font-size: 0.95rem; color: var(--text-muted);">Jump straight into a mock test to test your current knowledge.</p>
                </div>
            </div>
        </div>
    `;
    }
    currentTheory = { category: null, subcat: null };
    if (push) history.pushState({ view: 'home' }, "", "#/");
    clearActiveNavItems(); // Remove active class from all nav items
    document.getElementById('nav-home')?.classList.add('active'); // Set home as active
}

function renderTheory(category, subcat = null, push = true) {
    ensureDashboardShell();
    if (!theoryData || !ui.questionsList) return;
    closeSidebarOnMobile();
    const cat = theoryData[category]; // Get category data
    if (!cat) return;
    let title = cat.title;
    
    // Default "At a Glance" view for the Main Category
    let content = `
        <div class="category-glance">
            <p class="theory-overview">${cat.overview || ''}</p>
            <h3 class="curriculum-title">Module Curriculum</h3>
            <div class="glance-grid">
                ${Object.keys(cat.topics).map(topic => `
                    <div class="glance-card" onclick="renderTheory('${category}', '${topic}')">
                        <span class="glance-topic-name">${topic}</span>
                        <span class="glance-arrow">➔</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    let breadcrumb = category;
    // Robust Case-Insensitive Sub-Topic Lookup
    const subcatKey = subcat ? Object.keys(cat.topics).find(k => k.toLowerCase() === subcat.toLowerCase()) : null;

    if (subcatKey) {
        const topicsList = cat.topics[subcatKey];
        if (!topicsList || !topicsList.length) return;
        
        title = subcatKey;
        breadcrumb = `${category} / ${subcatKey}`;

        content = `
            <div class="theory-header">
                <h2 class="theory-title-focused">${subcatKey}</h2>
                <button class='btn btn-primary' onclick='startPractice("${subcatKey}")'>Take Practice Test ➔</button>
            </div>`;
        topicsList.forEach(topicData => {
            content += `
                <section class="theory-section">
                    <h3>${topicData.title}</h3>
                    <div class="theory-content">${topicData.content}</div>
                </section>
            `;
        });

        content += `<div class="cta-footer">
            <button class='btn btn-primary btn-lg' onclick='startPractice("${subcatKey}")'>Start ${subcatKey} Practice Test ➔</button>
        </div>`;
    }

    if (ui.breadcrumbCat) ui.breadcrumbCat.innerText = breadcrumb;
    if (ui.displayTitle) ui.displayTitle.innerText = title;
    
    // Revert logic: Main Category glance uses full-width container, sub-topics use Focused Reader
    const wrapperClass = subcatKey ? "theory-reader-container" : "question-card";
    ui.questionsList.innerHTML = `<div class="${wrapperClass}">${content}</div>`;
    
    currentTheory = { category, subcat: subcatKey };
    if (push) { // Push state to history
        const urlPath = subcatKey
            ? `#/theory/${category.replace(/\s+/g, '-').toLowerCase()}/${subcatKey.replace(/\s+/g, '-').toLowerCase()}`
            : `#/theory/${category.replace(/\s+/g, '-').toLowerCase()}`;
        history.pushState({ view: 'theory', category, subcat }, "", urlPath);
    }
}

async function startPractice(tag, push = true) {
    ensureDashboardShell();
    if (!ui.questionsList) return;
    ui.questionsList.innerHTML = "<div class='question-card'>Loading practice questions...</div>";
    
    // Get the category from global state to fetch the consolidated category file
    const catName = currentTheory.category;
    const fileName = catName.replace(/[^a-z0-9]/gi, '_') + '.json';
    let allCatQuestions = [];
    
    // Efficiency Improvement: Use Cache if available
    if (questionsCache[catName]) {
        allCatQuestions = questionsCache[catName];
    } else {
        try {
            const res = await fetch(`data/${fileName}`);
            if (!res.ok) throw new Error();
            allCatQuestions = await res.json();
            questionsCache[catName] = allCatQuestions; // Save to cache
        } catch (err) {
            alert(`No questions found for category: ${catName}. Ensure data/${fileName} exists.`);
            renderTheory(currentTheory.category, tag);
            return;
        }
    }

  
    // Filter questions (case-insensitive)
    const questions = allCatQuestions.filter(q => q.tag?.toLowerCase() === tag?.toLowerCase());

    // Sort questions by difficulty: Easy -> Medium -> Hard
    const levelOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
    questions.sort((a, b) => {
        const levelA = levelOrder[(a.level || 'easy').toLowerCase()];
        const levelB = levelOrder[(b.level || 'easy').toLowerCase()];
        // Handle cases where level might be missing or unexpected, default to 'easy'
        return (levelA || 99) - (levelB || 99);
    });

    if (questions.length === 0) {
        alert(`No practice questions available for topic: ${tag}`);
        renderTheory(catName, tag);
        return;
    }

    if (ui.displayTitle) ui.displayTitle.innerText = `${tag} - Practice Test`;
    
    ui.questionsList.innerHTML = questions.map((item, idx) => `
        <article class="question-card">
            ${item.level ? `<span class="q-level level-${item.level.toLowerCase()}">${item.level}</span>` : ''}
            <p class="q-text">Q${idx + 1}. ${item.q}</p>
            <div class="options-grid">
                ${item.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return `<div class="option-label" onclick="checkPracticeOption(this, '${letter}', '${item.ans}')"><span>${letter}) ${opt}</span></div>`;
                }).join('')}
            </div>
            <button class="btn btn-primary solution-btn" disabled onclick="this.nextElementSibling.classList.toggle('show')">Show Answer & Explanation</button>
            <div class="answer-container">
                <div class="answer-content">
                    <span class="correct-badge">Correct Answer: ${item.ans}</span>
                    <div class="explanation"><strong>Explanation:</strong><br>${item.explain}</div>
                </div>
            </div>
        </article>
    `).join('');

    ui.questionsList.innerHTML += `<div class="cta-footer">
        <button class="btn btn-primary btn-lg" onclick="finishPractice('${tag}')">Finish Practice Test ➔</button>
    </div>`;
    if (push) history.pushState({ view: 'practice', tag, category: catName }, "", `#/practice/${tag.replace(/\s+/g, '-').toLowerCase()}`); // Update history
}

function checkPracticeOption(element, selected, correct) {
    const card = element.closest('.question-card');
    const options = card.querySelectorAll('.option-label');
    // If already answered, do nothing
    if (card.getAttribute('data-answered') === 'true') return;
    card.setAttribute('data-answered', 'true');

    // Enable solution button
    const solutionBtn = card.querySelector('.solution-btn');
    if (solutionBtn) solutionBtn.removeAttribute('disabled');

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

function finishPractice(tag) {
    const cards = document.querySelectorAll('.question-card[data-answered="true"]');
    const total = document.querySelectorAll('.question-card').length;
    let correct = 0;

    cards.forEach(card => {
        if (card.querySelector('.option-label.correct') && !card.querySelector('.option-label.wrong')) correct++;
    });

    if (cards.length === 0) return alert("Please answer at least one question before finishing.");

    const percent = Math.round((correct / total) * 100);

    if (ui.displayTitle) ui.displayTitle.innerText = "Practice Result";
    // Clear the question list and show a professional result card
    if (ui.questionsList) ui.questionsList.innerHTML = "";
    if (ui.mockResult) {
        ui.mockResult.innerHTML = `
        <div class="question-card" style="background: #f0fdf4; border-left: 8px solid var(--success); animation: fadeIn 0.5s ease-out;">
            <h2 style="color: #16a34a; margin-bottom: 1rem;">Practice Test Complete</h2>
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">Topic: <strong>${tag}</strong></p>
            <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                <div><p style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Score</p><h3 style="font-size: 1.5rem; border:none;">${correct} / ${total}</h3></div>
                <div><p style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Accuracy</p><h3 style="font-size: 1.5rem; border:none;">${percent}%</h3></div>
            </div>
            <p style="margin-bottom: 2rem; color: #374151;">${percent >= 80 ? "Excellent mastery of this concept!" : "Good effort! Review the formulas below to reach 100%."}</p>
            <div class="cta-footer" style="justify-content: flex-start; gap: 1rem;">
                <button class="btn btn-primary" onclick="renderTheory('${currentTheory.category}', '${tag}')">Return to Theory</button>
                <button class="btn" style="border-color: var(--primary); color: var(--primary);" onclick="startPractice('${tag}')">Try Again</button>
            </div>
        </div>
    `;
        ui.mockResult.scrollIntoView({ behavior: "smooth" });
    }
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
    closeSidebarOnMobile();
    
    // Scroll to top for mobile users
    if(window.innerWidth < 900) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function showStatistics(push = true) {
    clearActiveNavItems();
    ensureDashboardShell();
    if (!ui.questionsList) return;
    closeSidebarOnMobile();
    if (ui.breadcrumbCat) ui.breadcrumbCat.innerText = "Performance";
    if (ui.displayTitle) ui.displayTitle.innerText = "Your Statistics";
    if (push) history.pushState({ view: 'stats' }, "", "#/statistics");
    ui.questionsList.innerHTML = "<div class='question-card'>Loading your performance data...</div>";

    if (!window.getUserResults) return;
    const results = await window.getUserResults();
    
    if (!results || results.length === 0) {
        ui.questionsList.innerHTML = "<div class='question-card'>No performance data found. Take a Mock Test to see your BI analysis!</div>";
        return;
    }

    // BI Logic: Aggregate data for visuals
    const reversedResults = [...results].reverse(); // Oldest to newest for trend
    const dates = reversedResults.map(r => r.timestamp ? r.timestamp.toDate().toLocaleDateString() : 'Just now');
    const scores = reversedResults.map(r => r.percentage);
    
    const focusFrequencies = {};
    let totalQuestions = 0;
    let totalCorrect = 0;

    results.forEach(r => {
        totalQuestions += (r.total || 10);
        totalCorrect += (r.score || 0);
        if (r.focusArea && r.focusArea !== "None") {
            focusFrequencies[r.focusArea] = (focusFrequencies[r.focusArea] || 0) + 1;
        }
    });

    const avgAccuracy = Math.round((totalCorrect / totalQuestions) * 100);
    const sortedWeaknesses = Object.entries(focusFrequencies).sort((a, b) => b[1] - a[1]);
    const topWeakness = sortedWeaknesses.length > 0 ? sortedWeaknesses[0][0] : "None Detected";

    // Render Layout
    let html = `
        <!-- Metric Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="question-card" style="text-align: center; padding: 1.5rem; margin-bottom:0; border-bottom: 4px solid var(--primary);">
                <p style="color: var(--text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">Overall Accuracy</p>
                <h2 style="font-size: 2.5rem; color: var(--text-dark);">${avgAccuracy}%</h2>
            </div>
            <div class="question-card" style="text-align: center; padding: 1.5rem; margin-bottom:0; border-bottom: 4px solid #f59e0b;">
                <p style="color: var(--text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">Total Attempts</p>
                <h2 style="font-size: 2.5rem; color: var(--text-dark);">${results.length}</h2>
            </div>
            <div class="question-card" style="text-align: center; padding: 1.5rem; margin-bottom:0; border-bottom: 4px solid #ef4444;">
                <p style="color: var(--text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">Critical Weakness</p>
                <h2 style="font-size: 1.25rem; color: #ef4444; height: 3rem; display: flex; align-items: center; justify-content: center;">${topWeakness}</h2>
            </div>
        </div>

        <!-- Visual Analytics Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="question-card" style="margin-bottom:0;">
                <h3 style="margin-bottom: 1rem; font-size: 1rem;">Performance Trend</h3>
                <canvas id="trendChart" height="250"></canvas>
            </div>
            <div class="question-card" style="margin-bottom:0;">
                <h3 style="margin-bottom: 1rem; font-size: 1rem;">Repeated Mistakes by Topic</h3>
                <canvas id="weaknessChart" height="250"></canvas>
            </div>
        </div>

        <!-- Mock History Row -->
        <div class="question-card" style="margin-top: 2rem;">
            <h3 style="margin-bottom: 1.5rem; font-size: 1.25rem; border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem;">Recent Mock Test History</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted);">
                            <th style="padding: 1rem 0.5rem;">Date</th>
                            <th style="padding: 1rem 0.5rem;">Test</th>
                            <th style="padding: 1rem 0.5rem;">Score</th>
                            <th style="padding: 1rem 0.5rem;">Accuracy</th>
                            <th style="padding: 1rem 0.5rem;">Focus Area</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(r => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 1rem 0.5rem;">${r.timestamp && typeof r.timestamp.toDate === 'function' ? r.timestamp.toDate().toLocaleDateString() : 'Recent'}</td>
                                <td style="padding: 1rem 0.5rem; font-weight: 600;">Mock Test ${r.testId || '-'}</td>
                                <td style="padding: 1rem 0.5rem;">${r.score}/${r.total}</td>
                                <td style="padding: 1rem 0.5rem; font-weight: 700; color: ${r.percentage >= 70 ? 'var(--success)' : '#ef4444'};">${r.percentage}%</td>
                                <td style="padding: 1rem 0.5rem;"><span class="q-tag" style="margin:0; font-size: 0.7rem; padding: 0.15rem 0.5rem;">${r.focusArea || 'General'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    ui.questionsList.innerHTML = html;

    // Initialize BI Visuals
    if (window.Chart) {
        setTimeout(() => {
            // Performance Fix: Destroy existing chart instances before re-rendering
            if (activeCharts.trend) activeCharts.trend.destroy();
            if (activeCharts.weakness) activeCharts.weakness.destroy();

            // 1. Trend Chart
            const trendCtx = document.getElementById('trendChart').getContext('2d');
            activeCharts.trend = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Score %',
                        data: scores,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });

            // 2. Weakness Chart
            const weaknessCtx = document.getElementById('weaknessChart').getContext('2d');
            activeCharts.weakness = new Chart(weaknessCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(focusFrequencies),
                    datasets: [{
                        label: 'Mistake Frequency',
                        data: Object.values(focusFrequencies),
                        backgroundColor: '#ef4444',
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            });
        }, 100);
    }
}
// Add this function to handle sidebar click for Mock Tests
function showMockInstructions(mockNum, element, push = true) {
    // Update active class
    ensureDashboardShell();
    if (!ui.questionsList) return;
    closeSidebarOnMobile();
    clearActiveNavItems();
    if (element) element.classList.add('active');
    else {
        // Highlight sidebar item based on mock number during back/forward navigation
        const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
        sidebarItems.forEach(el => {
            if (el.innerText.includes(`Mock Test ${mockNum}`)) el.classList.add('active');
        });
    }
    if (ui.breadcrumbCat) ui.breadcrumbCat.innerText = "Mock Test " + mockNum;
    if (ui.displayTitle) ui.displayTitle.innerText = "Mock Test " + mockNum;
    if (ui.mockResult) ui.mockResult.innerHTML = "";
    ui.questionsList.innerHTML = `
        <div class="question-card" style="text-align:left;">
            <h2 style="color:#2563eb;">Mock Test ${mockNum} Instructions</h2>
            <ul style="margin-bottom:1.5rem;">
                <li>This mock test contains 20 questions from all topics.</li>
                <li>You have 15 minutes to complete the test.</li>
                <li>Do not refresh or leave the page during the test.</li>
                <li>Your score, percentage, answered/unanswered, and focus area will be shown after submission.</li>
            </ul>
            <div style="margin-bottom:1rem;">
                <button class="btn btn-primary" onclick="startMockTest(${mockNum})">Start Mock Test</button>
            </div>
        </div>
    `;
    if (push) history.pushState({ view: 'mockInstr', mockNum }, "", `#/mock-test/${mockNum}/instructions`);
}

function toggleExamPalette() {
    const panel = document.querySelector('.exam-side-panel');
    if (panel) {
        panel.classList.toggle('show-mobile-palette');
    }
}

// Show mock test selection (if you want 3 mock tests)
function chooseMockTest(push = true) {
    ensureDashboardShell();
    if (!ui.questionsList) return;
    if (ui.mockResult) ui.mockResult.innerHTML = "";
    ui.questionsList.innerHTML = `
        <div class="question-card" style="text-align:left;">
            <h2 style="color:#2563eb;">Select Mock Test</h2>
            <div style="margin-bottom:1rem;">
                <button class="btn btn-primary" onclick="startMockTest(1)">Mock Test 1</button>
                <button class="btn btn-primary" onclick="startMockTest(2)">Mock Test 2</button>
                <button class="btn btn-primary" onclick="startMockTest(3)">Mock Test 3</button>
            </div>
        </div>
    `;
    if (push) history.pushState({ view: 'mockSelect' }, "", "#/mock-test");
}

function showProfileDetails(push = true) {
    clearActiveNavItems();
    ensureDashboardShell();
    if (!ui.questionsList) return;
    closeSidebarOnMobile();
    if (ui.breadcrumbCat) ui.breadcrumbCat.innerText = "Profile";
    if (ui.displayTitle) ui.displayTitle.innerText = "Account Settings";
    if (push) history.pushState({ view: 'profile' }, "", "#/profile");

    const currentName = document.getElementById('full-name')?.innerText || "Student";
    const currentEmail = window.currentUserEmail || "No email available";

    ui.questionsList.innerHTML = `
        <div class="question-card" style="max-width: 600px; margin: 1rem auto; animation: fadeIn 0.4s ease-out;">
            <div style="text-align: left; padding: 1rem;">
                <h3 style="margin-top: 0; margin-bottom: 2rem; border: none; color: var(--primary);">Profile Information</h3>
                
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem;">Registered Email</label>
                    <div style="padding: 1rem; background: var(--bg); border-radius: 10px; border: 1px solid var(--border); color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>${currentEmail}</span>
                    </div>
                </div>

                <div style="margin-bottom: 2.5rem;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem;">Full Name</label>
                    <div style="position: relative;">
                        <input type="text" id="profile-name-input" value="${currentName}" 
                               style="width: 100%; padding: 1rem 1rem 1rem 3rem; border-radius: 10px; border: 1px solid var(--border); font-size: 1rem; font-weight: 500; outline: none;">
                        <svg style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                </div>

                <button class="btn btn-primary btn-lg" onclick="saveProfileChanges()" style="width: 100%; justify-content: center;">
                    Update Name
                </button>
            </div>
        </div>
    `;
}

function saveProfileChanges() {
    const nameInput = document.getElementById('profile-name-input');
    const newName = nameInput.value.trim();
    if (!newName) return alert("Name cannot be empty");

    if (window.updateUserProfileName) {
        window.updateUserProfileName(newName)
            .then(() => {
                alert("Name updated successfully!");
                renderHome();
            })
            .catch(err => alert("Error: " + err.message));
    }
}

// MOCK TEST FEATURE
async function startMockTest(mockNum, push = true, seed = null) {
    if (examState.timerId) clearInterval(examState.timerId);
    
    try {
        const res = await fetch('data/mock_pool.json');
        let pool = await res.json();
        const finalSeed = seed || (Math.floor(Math.random() * 1000000) + mockNum);
        
        examState.questions = shuffleArray(pool, finalSeed).slice(0, 20);
        examState.responses = {};
        examState.marked = new Set();
        examState.visited = new Set([0]);
        examState.currentIndex = 0;
        examState.timeLeft = 15 * 60; // 15 minutes
        
        if (push) history.pushState({ view: 'mockActive', mockNum, seed: finalSeed }, "", `#/mock-test/${mockNum}/active`);
        
        renderExamLayout(mockNum);
        startExamTimer();
        document.body.classList.add('exam-mode-active');
    } catch (err) {
        console.error(err);
        alert("Error initializing exam.");
    }
}

function renderExamLayout(mockNum) {
    ui.mainContent.innerHTML = `
        <div class="exam-header-strip" style="position: sticky; top: 0; z-index: 1000; width: 100%;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <svg style="width:24px; color:var(--primary);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                <h2 style="margin:0;">Mock Test ${mockNum}</h2>
            </div>
            <button class="mobile-only-flex btn" onclick="toggleExamPalette()" style="margin-left: 10px; padding: 5px 10px; display: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Grid
            </button>
            <div style="flex-grow: 1;"></div>
            <div class="exam-timer" id="exam-timer-display" style="margin-left: auto;">15:00</div>
        </div>
        <div class="exam-container">
            <div class="exam-main-panel" id="exam-question-area"></div>
            <div class="exam-side-panel">
                <div class="nav-group-title">Question Palette</div>
                <div class="question-palette" id="palette-grid"></div>
                <div class="palette-legend">
                    <div class="legend-item"><div class="legend-box answered"></div> Answered</div>
                    <div class="legend-item"><div class="legend-box not-answered"></div> Not Answered</div>
                    <div class="legend-item"><div class="legend-box marked"></div> Marked</div>
                    <div class="legend-item"><div class="legend-box not-visited"></div> Not Visited</div>
                </div>
            </div>
        </div>
        <!-- Custom Modal for Finish Confirmation -->
        <div id="finish-modal" class="modal-overlay">
            <div class="modal-content">
                <h3 style="margin-bottom: 1rem; border: none;">Finish Mock Test?</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Are you sure you want to submit your answers? You won't be able to change them after this.</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn" onclick="hideFinishModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="finishMockTest(false)">Submit Test</button>
                </div>
            </div>
        </div>
    `;

    // Show grid toggle button only on mobile
    if (window.innerWidth <= 900) {
        const gridBtn = document.querySelector('.mobile-only-flex');
        if (gridBtn) gridBtn.style.display = 'flex';
    }

    updateQuestionDisplay();
}

function updateQuestionDisplay() {
    const q = examState.questions[examState.currentIndex];
    const area = document.getElementById('exam-question-area');
    const selected = examState.responses[q.id];
    const isLastQuestion = examState.currentIndex === examState.questions.length - 1;

    area.innerHTML = `
        <div class="q-tag">${q.tag}</div>
        <p class="q-text">Question ${examState.currentIndex + 1}:<br>${q.q}</p>
        <div class="options-grid">
            ${q.options.map((opt, i) => {
                const val = String.fromCharCode(65 + i);
                return `
                    <div class="mock-option ${selected === val ? 'selected' : ''}" 
                         onclick="selectOption('${q.id}', '${val}')">
                        ${val}) ${opt}
                    </div>`;
            }).join('')}
        </div>
        <div class="exam-footer">
            <button class="btn" onclick="prevQuestion()" ${examState.currentIndex === 0 ? 'disabled' : ''}>Previous</button>
            <button class="btn" style="border-color: #8b5cf6; color: #8b5cf6;" onclick="toggleMark()">Mark for Review</button>
            ${isLastQuestion ? 
                `<button class="btn btn-primary" style="background-color: var(--success);" onclick="showFinishModal()">Finish Test ➔</button>` : 
                `<button class="btn btn-primary" onclick="nextQuestion()">Save & Next</button>`
            }
        </div>
    `;
    updatePalette();
}

function showFinishModal() {
    const modal = document.getElementById('finish-modal');
    if (modal) modal.style.display = 'flex';
}

function hideFinishModal() {
    const modal = document.getElementById('finish-modal');
    if (modal) modal.style.display = 'none';
}

function selectOption(qId, val) {
    examState.responses[qId] = val;
    updateQuestionDisplay();
}

function toggleMark() {
    const qId = examState.questions[examState.currentIndex].id;
    if (examState.marked.has(qId)) examState.marked.delete(qId);
    else examState.marked.add(qId);
    updatePalette();
}

function nextQuestion() {
    if (examState.currentIndex < examState.questions.length - 1) {
        examState.currentIndex++;
        examState.visited.add(examState.currentIndex);
        updateQuestionDisplay();
        // Auto-close palette on mobile when navigating
        document.querySelector('.exam-side-panel')?.classList.remove('show-mobile-palette');
    }
}

function prevQuestion() {
    if (examState.currentIndex > 0) {
        examState.currentIndex--;
        updateQuestionDisplay();
        document.querySelector('.exam-side-panel')?.classList.remove('show-mobile-palette');
    }
}

function updatePalette() {
    const grid = document.getElementById('palette-grid');
    if (!grid) return;
    grid.innerHTML = examState.questions.map((q, i) => {
        let status = 'not-visited';
        if (examState.marked.has(q.id)) status = 'marked';
        else if (examState.responses[q.id]) status = 'answered';
        else if (examState.visited.has(i)) status = 'not-answered';
        
        return `<div class="palette-btn ${status} ${examState.currentIndex === i ? 'active' : ''}" 
                     onclick="jumpToQuestion(${i})">${i + 1}</div>`;
    }).join('');
}

function jumpToQuestion(i) {
    examState.currentIndex = i;
    examState.visited.add(i);
    updateQuestionDisplay();
    document.querySelector('.exam-side-panel')?.classList.remove('show-mobile-palette');
}

function startExamTimer() {
    examState.timerId = setInterval(() => {
        examState.timeLeft--;
        const mins = Math.floor(examState.timeLeft / 60);
        const secs = examState.timeLeft % 60;
        const display = document.getElementById('exam-timer-display');
        if (display) display.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (examState.timeLeft <= 0) {
            clearInterval(examState.timerId);
            finishMockTest(true);
        }
    }, 1000);
}

async function finishMockTest(autoSubmit) {
    hideFinishModal();
    clearInterval(examState.timerId);
    const mockNum = history.state?.mockNum || 1;
    
    let correct = 0;
    let total = examState.questions.length;
    let answered = 0;
    let cumulativeMistakes = {};
    try {
        cumulativeMistakes = JSON.parse(localStorage.getItem('cumulativeMistakes') || '{}');
    } catch (e) { cumulativeMistakes = {}; }
    
    examState.questions.forEach(q => {
        const selected = examState.responses[q.id];
        if(selected) {
            answered++;
            if(selected === q.ans) {
                correct++;
            } else {
                cumulativeMistakes[q.tag] = (cumulativeMistakes[q.tag] || 0) + 1;
            }
        } else {
            cumulativeMistakes[q.tag] = (cumulativeMistakes[q.tag] || 0) + 1;
        }
    });

    localStorage.setItem('cumulativeMistakes', JSON.stringify(cumulativeMistakes));
    let percent = Math.round((correct/total)*100);
    let notAnswered = total - answered;

    // Find focus area (tag with most mistakes across all attempts)
    let focusArea = "None";
    let maxWrong = 0;
    for (let tag in cumulativeMistakes) {
        if (cumulativeMistakes[tag] > maxWrong) {
            maxWrong = cumulativeMistakes[tag];
            focusArea = tag;
        }
    }

    // Display result in the same window (Exam UI)
    const area = document.getElementById('exam-question-area');
    const timerDisplay = document.getElementById('exam-timer-display');
    if (timerDisplay) timerDisplay.innerText = "Exam Completed";

    if (area) {
        area.innerHTML = `
            <div class="question-card" style="background:#f0fdf4; border:none; box-shadow:none;">
                <h2 style="color:#16a34a; margin-bottom: 1.5rem;">Mock Test Result Analysis</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div class="question-card" style="margin:0; text-align:center; padding: 1.5rem; background: white;">
                        <p style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Final Score</p>
                        <h1 style="font-size:3rem; color:var(--primary); border:none; margin:0;">${correct}/${total}</h1>
                    </div>
                    <div class="question-card" style="margin:0; text-align:center; padding: 1.5rem; background: white;">
                        <p style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Accuracy</p>
                        <h1 style="font-size:3rem; color:var(--success); border:none; margin:0;">${percent}%</h1>
                    </div>
                </div>
                <p style="margin-bottom: 1.5rem; font-size: 1.1rem;"><b>Focus Area:</b> <span class="q-tag">${focusArea}</span></p>
                ${autoSubmit ? `<p style="color:#e11d48; margin-bottom: 1.5rem;"><strong>Note:</strong> Test was auto-submitted due to time limit.</p>` : ""}
                
                <div class="exam-footer" style="border:none; padding:0; margin-top:2rem;">
                    <button class="btn btn-primary btn-lg" style="width: 100%; justify-content: center;" onclick="chooseMockTest()">Back to Mock Section ➔</button>
                </div>
            </div>
        `;

        // Update sidebar palette area to show a summary
        const paletteGrid = document.getElementById('palette-grid');
        if (paletteGrid) {
            const sidePanel = paletteGrid.closest('.exam-side-panel');
            sidePanel.innerHTML = `
                <div class="nav-group-title">Status Summary</div>
                <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div class="legend-item" style="font-weight:600;"><div class="legend-box answered" style="width:20px; height:20px;"></div> Answered: <span style="margin-left:auto; color:var(--success);">${answered}</span></div>
                    <div class="legend-item" style="font-weight:600;"><div class="legend-box not-answered" style="width:20px; height:20px;"></div> Not Answered: <span style="margin-left:auto; color:#ef4444;">${total - answered}</span></div>
                    <div class="legend-item" style="font-weight:600;"><div class="legend-box marked" style="width:20px; height:20px;"></div> For Review: <span style="margin-left:auto; color:#8b5cf6;">${examState.marked.size}</span></div>
                </div>
            `;
        }
    }

    // Professional Tracking: Save the result to Firestore
    if (window.savePerformanceResult) {
        await window.savePerformanceResult({
            testType: "Mock Test",
            testId: mockNum,
            score: correct,
            total: total,
            percentage: percent,
            focusArea: focusArea
        });
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

// --- BROWSER NAVIGATION LOGIC ---
window.addEventListener('popstate', (event) => {
    const state = event.state;
    
    if (examState.timerId) {
        clearInterval(examState.timerId);
        examState.timerId = null;
    }

    if (!state || state.view === 'home') {
        renderHome(false);
    } else if (state.view === 'theory') {
        renderTheory(state.category, state.subcat, false);
    } else if (state.view === 'practice') {
        currentTheory.category = state.category;
        startPractice(state.tag, false);
    } else if (state.view === 'stats') {
        showStatistics(false);
    } else if (state.view === 'profile') {
        showProfileDetails(false);
    } else if (state.view === 'mockInstr') {
        showMockInstructions(state.mockNum, null, false);
    } else if (state.view === 'mockSelect') {
        chooseMockTest(false);
    } else if (state.view === 'mockActive') {
        startMockTest(state.mockNum, false, state.seed);
    }
})