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

fetch('theory.json')
  .then(res => res.json())
  .then(json => {
    theoryData = json;
    renderSidebar();
    renderHome();
  });

function renderHome() {
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    const container = document.getElementById('questions-list');
    document.getElementById('bread-cat').innerText = "Home";
    document.getElementById('display-title').innerText = "Student Dashboard";
    
    container.innerHTML = `
        <div class="welcome-container" style="animation: fadeIn 0.5s ease-out;">
            <div class="welcome-hero" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000'); background-size: cover; background-position: center; height: 200px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 2rem; box-shadow: var(--shadow);">
                <h2 style="font-size: 2rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Fuel Your Ambition</h2>
            </div>

            <div class="quote-card" style="background: white; padding: 2.5rem; border-radius: 24px; box-shadow: var(--shadow); margin-bottom: 2.5rem; border-left: 10px solid var(--primary); text-align: left;">
                <p style="font-size: 0.85rem; text-transform: uppercase; font-weight: 800; color: var(--primary); letter-spacing: 0.1em; margin-bottom: 1rem;">Daily Motivation</p>
                <p style="font-size: 1.4rem; font-style: italic; color: #1e293b; line-height: 1.6; font-weight: 500;">"${quote}"</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div class="question-card" style="cursor: pointer; text-align: left;" onclick="renderTheory('Quantitative Aptitude')">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">Study Topics</h3>
                    <p style="font-size: 0.95rem; color: var(--text-muted);">Browse detailed formulas and concepts for your upcoming exams.</p>
                </div>
                <div class="question-card" style="cursor: pointer; text-align: left;" onclick="chooseMockTest()">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">Practice Test</h3>
                    <p style="font-size: 0.95rem, color: var(--text-muted);">Jump straight into a 10-question drill to test your current knowledge.</p>
                </div>
            </div>
        </div>
    `;
    currentTheory = { category: null, subcat: null };
}

function renderTheory(category, subcat = null) {
    if (!theoryData) return;
    const container = document.getElementById('questions-list');
    const cat = theoryData[category];
    if (!cat) return;
    let title = cat.title;
    
    // Default "At a Glance" view for the Main Category
    let content = `
        <div class="category-glance">
            <p class="theory-content" style="margin-bottom: 2.5rem; font-size: 1.125rem; color: #475569;">${cat.overview || ''}</p>
            <h3 style="margin-bottom: 1.5rem; color: var(--text-dark); border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem; display: inline-block;">Module Curriculum</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 0.5rem;">
                ${Object.keys(cat.topics).map(topic => `
                    <div class="glance-card" onclick="renderTheory('${category}', '${topic}')" style="background: white; border: 1px solid var(--border); padding: 1.25rem; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <span style="font-weight: 600; color: var(--text-dark);">${topic}</span>
                        <span style="color: var(--primary); font-weight: 800;">➔</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

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
    container.innerHTML += `<div class="cta-footer">
        <button class="btn btn-primary btn-lg" onclick="finishPractice('${tag}')">Finish Practice Test ➔</button>
    </div>`;
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

function finishPractice(tag) {
    const cards = document.querySelectorAll('.question-card[data-answered="true"]');
    const total = document.querySelectorAll('.question-card').length;
    let correct = 0;

    cards.forEach(card => {
        if (card.querySelector('.option-label.correct')) correct++;
    });

    if (cards.length === 0) return alert("Please answer at least one question before finishing.");

    // Display score for feedback only, without tracking to database
    alert(`Practice Finished! You scored ${correct}/${total}. Keep practicing to improve!`);
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

async function showStatistics() {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const container = document.getElementById('questions-list');
    document.getElementById('bread-cat').innerText = "Performance";
    document.getElementById('display-title').innerText = "Your Statistics";
    container.innerHTML = "<div class='question-card'>Loading your performance data...</div>";

    if (!window.getUserResults) return;
    const results = await window.getUserResults();
    
    if (!results || results.length === 0) {
        container.innerHTML = "<div class='question-card'>No performance data found. Take a Mock Test to see your BI analysis!</div>";
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

        <!-- History Table -->
        <div class="question-card">
            <h3 style="margin-bottom: 1.5rem;">Recent Attempt History</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                            <th style="padding: 1rem;">Date</th>
                            <th style="padding: 1rem;">Session</th>
                            <th style="padding: 1rem;">Accuracy</th>
                            <th style="padding: 1rem;">Primary Weakness</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(r => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 1rem; color: var(--text-muted);">${r.timestamp ? r.timestamp.toDate().toLocaleDateString() : 'Just now'}</td>
                                <td style="padding: 1rem; font-weight: 600;">${r.testType} ${r.testId}</td>
                                <td style="padding: 1rem; font-weight: 700; color: ${r.percentage >= 70 ? 'var(--success)' : 'var(--primary)'}">${r.percentage}%</td>
                                <td style="padding: 1rem;"><span class="q-tag">${r.focusArea}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Initialize BI Visuals
    if (window.Chart) {
        setTimeout(() => {
            // 1. Trend Chart
            new Chart(document.getElementById('trendChart').getContext('2d'), {
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
            new Chart(document.getElementById('weaknessChart').getContext('2d'), {
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
        mockQuestions = shuffleArray(pool, randomSeed).slice(0, 20);
    } catch (err) {
        alert("Failed to load Mock Test data. Ensure data/mock_pool.json exists.");
        return;
    }
    
    // Set timer (15 minutes for 20 questions)
    let timeLimit = 15 * 60; 
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
        // Load cumulative mistakes from localStorage
        let cumulativeMistakes = JSON.parse(localStorage.getItem('cumulativeMistakes') || '{}');
        mockQuestions.forEach(q => {
            const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
            if(selected) {
                answered++;
                if(selected.value === q.ans) {
                    correct++;
                } else {
                    wrongByTag[q.tag] = (wrongByTag[q.tag] || 0) + 1;
                    cumulativeMistakes[q.tag] = (cumulativeMistakes[q.tag] || 0) + 1;
                }
            } else {
                wrongByTag[q.tag] = (wrongByTag[q.tag] || 0) + 1;
                cumulativeMistakes[q.tag] = (cumulativeMistakes[q.tag] || 0) + 1;
            }
        });
        // Save cumulative mistakes
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

        document.getElementById('questions-list').innerHTML = "";
        document.getElementById('mock-result').innerHTML = `
            <div class="question-card" style="background:#f0fdf4;">
                <h2 style="color:#16a34a;">Mock Test ${mockNum} Result</h2>
                <p><b>Score:</b> ${correct} / ${total}</p>
                <p><b>Percentage:</b> ${percent}%</p>
                <p><b>Answered:</b> ${answered} &nbsp; <b>Not Answered:</b> ${notAnswered}</p>
                <p><b>Focus Area (all attempts):</b> ${focusArea !== "None" ? focusArea : "Great job! No weak area detected."}</p>
                <p style="margin-top:1rem;"><b>${percent >= 70 ? "Great job! Keep practicing." : "Keep practicing to improve your score."}</b></p>
                ${autoSubmit ? `<p style=\"color:#e11d48;\"><b>Time's up! Your test was auto-submitted.</b></p>` : ""}
            </div>
        `;
        document.getElementById('mock-result').scrollIntoView({behavior: "smooth"});

        // Professional Tracking: Save the result to Firestore
        if (window.savePerformanceResult) {
            window.savePerformanceResult({
                testType: "Mock Test",
                testId: mockNum,
                score: correct,
                total: total,
                percentage: percent,
                focusArea: focusArea
            });
        }
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