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
    render('Arithmetic');
  })
  .catch(err => {
    console.error("Failed to load questions. Ensure questions.json is in the same folder and you are using a local server.", err);
    questionsLoaded = true; // Set to true so render() can still show theory sections
    render('Arithmetic');
  });

// Theory/formula content for each category
const categoryTheory = {
    Arithmetic: `
        <h2>Arithmetic Aptitude - Key Concepts & Formulas</h2>
        <ul>
            <li><b>Percentage:</b> Percent = (Value/Total Value) × 100</li>
            <li><b>Profit & Loss:</b> Profit = SP - CP, Loss = CP - SP</li>
            <li><b>Simple Interest:</b> SI = (P × R × T)/100</li>
            <li><b>Ratio:</b> Ratio = Quantity1 / Quantity2</li>
            <li><b>Time & Distance:</b> Speed = Distance / Time</li>
            <li>...and more. Practice examples for better understanding.</li>
        </ul>
    `,
    Reasoning: `
        <h2>Logical Reasoning - Key Concepts</h2>
        <ul>
            <li><b>Number Series:</b> Identify the pattern (addition, multiplication, squares, etc.)</li>
            <li><b>Coding-Decoding:</b> Analyze letter/number shifts or patterns</li>
            <li><b>Blood Relations:</b> Draw family trees for clarity</li>
            <li>Practice visualizing and breaking down problems step by step.</li>
        </ul>
    `,
    Verbal: `
        <h2>Verbal Ability - Key Concepts</h2>
        <ul>
            <li><b>Synonyms & Antonyms:</b> Build vocabulary by reading and practicing word lists</li>
            <li><b>Fill in the Blanks:</b> Focus on grammar and context clues</li>
            <li>Practice reading comprehension and sentence correction regularly.</li>
        </ul>
    `
};

function render(category) {
    if (!questionsLoaded) return;
    
    document.getElementById('mock-result').innerHTML = "";
    const container = document.getElementById('questions-list');
    document.getElementById('bread-cat').innerText = category;
    document.getElementById('display-title').innerText = category + " Aptitude";

    let theoryHtml = categoryTheory[category] ? `<div class="theory-section">${categoryTheory[category]}</div>` : "";

    // Filter questions by tag/category from allQuestions
    let questions = [];
    if (category === 'Arithmetic') {
        questions = allQuestions.filter(q => ["Percentage", "Time & Distance", "Simple Interest", "Ratio", "Profit & Loss", "Average"].includes(q.tag));
    } else if (category === 'Reasoning') {
        questions = allQuestions.filter(q => ["Number Series", "Coding-Decoding", "Blood Relation", "Calendar", "Direction", "Odd One Out", "Analogy", "Series", "Clock", "SSC CGL 2022", "Bank PO 2021", "Railways 2020"].includes(q.tag));
    } else if (category === 'Verbal') {
        questions = allQuestions.filter(q => ["Synonyms", "Antonyms", "Fill in the Blanks"].includes(q.tag));
    } else {
        questions = [];
    }

    if (questions.length === 0 && theoryHtml === "") {
        container.innerHTML = `<div class="question-card">No questions available for this category.</div>`;
        return;
    }

    container.innerHTML = theoryHtml + questions.map((item, idx) => `
        <article class="question-card">
            <span class="q-tag">${item.tag}</span>
            <p class="q-text">Q${idx + 1}. ${item.q}</p>
            <div class="options-grid">
                ${item.options.map((opt, i) => `
                    <label class="option-label">
                        <input type="radio" name="q${item.id}">
                        <span>${String.fromCharCode(65 + i)}) ${opt}</span>
                    </label>
                `).join('')}
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="toggleAns(${item.id})">
                    Show Answer
                </button>
                <button class="btn">
                    Discussion
                </button>
            </div>
            <div class="answer-container" id="ans-box-${item.id}">
                <div class="answer-content">
                    <span class="correct-badge">Correct Answer: ${item.ans}</span>
                    <div class="explanation">
                        <strong>Explanation:</strong><br>
                        ${item.explain}
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

function toggleAns(id) {
    const box = document.getElementById(`ans-box-${id}`);
    box.classList.toggle('show');
    
    const btn = box.previousElementSibling.querySelector('.btn-primary');
    btn.innerText = box.classList.contains('show') ? 'Hide Answer' : 'Show Answer';
}

function switchTab(cat, element) {
    // Update active class
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // Render new data
    render(cat);
    
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

// MOCK TEST FEATURE
function startMockTest(mockNum) {
    if (!questionsLoaded || allQuestions.length === 0) {
        alert("Questions haven't loaded yet. Please check if questions.json exists and you are running a local web server.");
        return;
    }

    document.getElementById('bread-cat').innerText = "Mock Test " + mockNum;
    document.getElementById('display-title').innerText = "Mock Test " + mockNum + " (All Topics)";
    document.getElementById('mock-result').innerHTML = "";

    const mockQuestions = getMockQuestions(mockNum);

    // Set timer (e.g., 10 minutes for 10 questions)
    let timeLimit = 10 * 60; // seconds
    let timeLeft = timeLimit;
    let timerInterval;

    // Timer display
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
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitMockTest(true);
        }
    }, 1000);

    document.getElementById('mockForm').onsubmit = function(e) {
        e.preventDefault();
        clearInterval(timerInterval);
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