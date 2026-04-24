// Smooth scroll to section
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

let allQuestions = [];
let questionsLoaded = false;

fetch('questions.json')
  .then(res => res.json())
  .then(jsonData => {
    allQuestions = jsonData;
    questionsLoaded = true;
    renderSidebar();
    render('Arithmetic');
  })
  .catch(err => {
    console.error("Failed to load questions. Ensure questions.json is in the same folder and you are using a local server.", err);
    questionsLoaded = true; // Set to true so render() can still show theory sections
    renderSidebar();
    render('Arithmetic');
  });

// Theory/formula content for each category
const categoryTheory = {
    Arithmetic: {
        title: "Arithmetic Aptitude",
        overview: "<h2>Arithmetic Aptitude - Key Concepts & Formulas</h2><p>Arithmetic aptitude tests your ability to solve basic mathematical problems. Select a sub-topic to see detailed formulas.</p>",
        topics: {
            "Percentage": "<h2>Percentage</h2><p>Percent means 'per hundred'.</p><ul><li><b>Formula:</b> (Value/Total) × 100</li><li><b>Increase%:</b> (Increase/Original) × 100</li></ul>",
            "Profit & Loss": "<h2>Profit & Loss</h2><ul><li><b>Profit:</b> SP - CP</li><li><b>Loss:</b> CP - SP</li><li><b>Profit %:</b> (Profit/CP) × 100</li></ul>",
            "Simple Interest": "<h2>Simple Interest</h2><p><b>SI = (P × R × T) / 100</b></p><p>Where P is Principal, R is Rate, and T is Time.</p>",
            "Compound Interest": "<h2>Compound Interest</h2><p>Interest calculated on the principal and also on the accumulated interest.</p>",
            "Ratio": "<h2>Ratio & Proportion</h2><p>A ratio is a comparison of two quantities by division.</p>",
            "Time & Distance": "<h2>Time & Distance</h2><ul><li><b>Speed:</b> Distance / Time</li><li><b>km/hr to m/s:</b> Multiply by 5/18</li></ul>",
            "Time & Work": "<h2>Time & Work</h2><p>Relationship between number of persons, time taken and amount of work done.</p>",
            "Average": "<h2>Average</h2><p>Average = (Sum of observations) / (Number of observations)</p>",
            "HCF & LCM": "<h2>HCF & LCM</h2><p>Highest Common Factor and Lowest Common Multiple concepts.</p>",
            "Number System": "<h2>Number System</h2><p>Classification of numbers and divisibility rules.</p>",
            "Ages": "<h2>Problems on Ages</h2><p>Algebraic approach to solving age-related problems.</p>",
            "Probability": "<h2>Probability</h2><p>The likelihood of an event happening.</p>"
        }
    },
    Reasoning: {
        title: "Logical Reasoning",
        overview: "<h2>Logical Reasoning - Key Concepts</h2><p>Logical reasoning helps in developing analytical skills through patterns and puzzles.</p>",
        topics: {
            "Number Series": "<h2>Number Series</h2><p>Identify patterns like squares, cubes, or prime numbers in a sequence.</p>",
            "Coding-Decoding": "<h2>Coding-Decoding</h2><p>Observe shifts in alphabetical positions (e.g., A=1, B=2).</p>",
            "Blood Relation": "<h2>Blood Relation</h2><p>Use family tree diagrams to solve complex relationship problems.</p>",
            "Calendar": "<h2>Calendar</h2><p>Concepts of leap years, odd days, and day calculation.</p>",
            "Direction": "<h2>Direction Sense</h2><p>Tracking movement and final orientation using cardinal directions.</p>",
            "Clock": "<h2>Clock</h2><p>Angle between hands and reflection/water images of clocks.</p>",
            "Syllogism": "<h2>Syllogism</h2><p>Deductive reasoning using Venn diagrams.</p>",
            "Seating Arrangement": "<h2>Seating Arrangement</h2><p>Linear, circular, and square arrangement patterns.</p>",
            "Analogy": "<h2>Analogy</h2><p>Finding similar relationships between pairs of words or numbers.</p>",
            "Odd One Out": "<h2>Odd One Out</h2><p>Identifying the term that doesn't fit the pattern.</p>",
            "Statement & Conclusion": "<h2>Statement & Conclusion</h2><p>Evaluating logical conclusions based on given premises.</p>"
        }
    },
    Verbal: {
        title: "Verbal Ability",
        overview: "<h2>Verbal Ability - Key Concepts</h2><p>Verbal ability tests language proficiency and comprehension.</p>",
        topics: {
            "Synonyms": "<h2>Synonyms</h2><p>Words with similar meanings. <i>Example: Brief = Short.</i></p>",
            "Antonyms": "<h2>Antonyms</h2><p>Words with opposite meanings. <i>Example: Generous != Selfish.</i></p>",
            "Fill in the Blanks": "<h2>Fill in the Blanks</h2><p>Focus on grammar, tenses, and context clues.</p>",
            "Idioms & Phrases": "<h2>Idioms & Phrases</h2><p>Common expressions with non-literal meanings.</p>",
            "One Word Substitution": "<h2>One Word Substitution</h2><p>Replacing long sentences with a single precise word.</p>",
            "Reading Comprehension": "<h2>Reading Comprehension</h2><p>Analyzing passages and answering questions based on them.</p>",
            "Sentence Correction": "<h2>Sentence Correction</h2><p>Identifying and fixing grammatical errors in sentences.</p>",
            "Spelling Test": "<h2>Spelling Test</h2><p>Recognizing correctly spelled words.</p>"
        }
    }
};

function render(category, subtopic = null) {
    if (!questionsLoaded) return;
    
    document.getElementById('mock-result').innerHTML = "";
    const container = document.getElementById('questions-list');
    
    const data = categoryTheory[category];
    if (!data) return;

    let title = data.title;
    let content = data.overview;
    let breadcrumb = category;

    if (subtopic && data.topics[subtopic]) {
        title = subtopic;
        content = data.topics[subtopic];
        breadcrumb = `${category} / ${subtopic}`;
    }

    document.getElementById('bread-cat').innerText = breadcrumb;
    document.getElementById('display-title').innerText = title;

    container.innerHTML = `<div class="question-card">${content || '<p>Description coming soon.</p>'}</div>`;
}

// Efficient multi-page theory rendering using theory.json, with pagination for each subcategory and dynamic sidebar generation
let theoryData = null;
let currentTheory = { category: null, subcat: null, page: 0 };

fetch('theory.json')
  .then(res => res.json())
  .then(json => {
    theoryData = json;
    renderSidebar();
    renderTheory('Arithmetic');
  });

function renderTheory(category, subcat = null, page = 0) {
    if (!theoryData) return;
    const container = document.getElementById('questions-list');
    const cat = theoryData[category];
    if (!cat) return;
    let title = cat.title;
    let content = `<div>${cat.overview}</div>`;
    let breadcrumb = category;
    if (subcat && cat.topics[subcat]) {
        const pages = cat.topics[subcat];
        if (!pages || !pages.length) return;
        const pageData = pages[page];
        title = `${subcat} - ${pageData.title}`;
        content = `<h2>${subcat}</h2><h3>${pageData.title}</h3><div>${pageData.content}</div>`;
        breadcrumb = `${category} / ${subcat}`;
        // Pagination controls
        content += `<div id='theory-pagination' style='margin-top:1.5rem;display:flex;align-items:center;gap:1rem;'>
            <button id='prev-page' class='btn btn-primary' style='min-width:110px;font-size:1rem;padding:0.7rem 1.5rem;' ${page === 0 ? 'disabled' : ''}>⟵ Previous</button>
            <span style='font-weight:600;font-size:1.1rem;'>Page ${page + 1} of ${pages.length}</span>
            <button id='next-page' class='btn btn-primary' style='min-width:110px;font-size:1rem;padding:0.7rem 1.5rem;' ${page === pages.length - 1 ? 'disabled' : ''}>Next ⟶</button>
        </div>`;
    }
    document.getElementById('bread-cat').innerText = breadcrumb;
    document.getElementById('display-title').innerText = title;
    container.innerHTML = `<div class=\"question-card\">${content}</div>`;
    // Add event listeners for pagination
    if (subcat && cat.topics[subcat]) {
        document.getElementById('prev-page').onclick = () => {
            renderTheory(category, subcat, page - 1);
        };
        document.getElementById('next-page').onclick = () => {
            renderTheory(category, subcat, page + 1);
        };
    }
    currentTheory = { category, subcat, page };
}

function renderSidebar() {
    const nav = document.getElementById('category-nav');
    if (!nav || !theoryData) return;
    nav.innerHTML = "";
    Object.keys(theoryData).forEach(catKey => {
        const cat = theoryData[catKey];
        // Main Category Item
        const item = document.createElement('div');
        item.className = 'nav-item';
        item.innerHTML = `<span>${cat.title}</span><span class=\"chevron\">▸</span>`;
        item.onclick = (e) => toggleSubMenu(catKey, item);
        nav.appendChild(item);
        // Sub-navigation container
        const subNav = document.createElement('div');
        subNav.className = 'sub-nav';
        subNav.id = `sub-${catKey}`;
        Object.keys(cat.topics).forEach(topic => {
            const subItem = document.createElement('div');
            subItem.className = 'nav-item sub-item';
            subItem.innerText = topic;
            subItem.onclick = (e) => {
                e.stopPropagation();
                renderTheory(catKey, topic, 0);
            };
            subNav.appendChild(subItem);
        });
        nav.appendChild(subNav);
    });
}

function toggleSubMenu(cat, element) {
    const subMenu = document.getElementById(`sub-${cat}`);
    const isOpen = subMenu.classList.contains('show');
    subMenu.classList.toggle('show');
    element.classList.toggle('open');
    if (!isOpen) {
        renderTheory(cat);
    }
}

function toggleAns(id) {
    const box = document.getElementById(`ans-box-${id}`);
    box.classList.toggle('show');
    
    const btn = box.previousElementSibling.querySelector('.btn-primary');
    btn.innerText = box.classList.contains('show') ? 'Hide Answer' : 'Show Answer';
}

function switchTab(cat, element, subtopic = null) {
    // Update active class
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // Render new data
    render(cat, subtopic);
    
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
function startMockTest(mockNum) {
    if (!questionsLoaded || allQuestions.length === 0) {
        alert("Questions haven't loaded yet. Please check if questions.json exists and you are running a local web server.");
        return;
    }

    // Always clear any previous timer before starting a new one
    if (activeTimerInterval) {
        clearInterval(activeTimerInterval);
        activeTimerInterval = null;
    }

    document.getElementById('bread-cat').innerText = "Mock Test " + mockNum;
    document.getElementById('display-title').innerText = "Mock Test " + mockNum + " (All Topics)";
    document.getElementById('mock-result').innerHTML = "";

    const mockQuestions = getMockQuestions(mockNum);

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
            <button type="submit" class="btn btn-primary" style="margin-bottom:2rem;">Submit Mock Test</button>
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

function getMockQuestions(mockNum) {
    if (!allQuestions || allQuestions.length === 0) return [];
        // If we have fewer than 10 questions total, just return whatever we have
    if (allQuestions.length <= 10) return allQuestions;

    // Shuffle the entire pool once with a constant seed. 
    // This ensures Mock 1 is always the same questions for everyone, 
    // but different from Mock 2.
    const globalSeed = 98765;
    const shuffled = shuffleArray(allQuestions, globalSeed);
    
    // Use modulo to wrap around if the question bank is small
    const start = ((mockNum - 1) * 10) % shuffled.length;
    let selection = shuffled.slice(start, start + 10);
    
    // If we reached the end of the array and don't have 10, grab from the beginning
    if (selection.length < 10) {
        selection = selection.concat(shuffled.slice(0, 10 - selection.length));
    }
    
    return selection;
}