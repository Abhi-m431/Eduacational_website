// Smooth scroll to section
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Data for questions categorized
const data = {
    "Arithmetic": [
        {
            id: 1,
            tag: "Percentage",
            q: "A man buys an item for ₹1200 and sells it at a gain of 20%. What is the selling price?",
            options: ["₹1400", "₹1440", "₹1500", "₹1340"],
            ans: "B",
            explain: "Profit = 20% of 1200 = (20/100) * 1200 = 240.<br>Selling Price = Cost Price + Profit = 1200 + 240 = 1440."
        },
        {
            id: 2,
            tag: "Time & Distance",
            q: "A person crosses a 600m long street in 5 minutes. What is his speed in km/hr?",
            options: ["3.6", "7.2", "8.4", "10"],
            ans: "B",
            explain: "Speed = Distance / Time = 600m / 300sec = 2 m/sec.<br>Convert to km/hr: 2 * (18/5) = 36/5 = 7.2 km/hr."
        },
        {
            id: 3,
            tag: "Simple Interest",
            q: "What is the simple interest on ₹1500 at 10% per annum for 2 years?",
            options: ["₹200", "₹250", "₹300", "₹350"],
            ans: "C",
            explain: "SI = (P × R × T)/100 = (1500 × 10 × 2)/100 = ₹300."
        },
        {
            id: 4,
            tag: "Ratio",
            q: "Divide ₹600 in the ratio 2:3.",
            options: ["₹200, ₹400", "₹240, ₹360", "₹250, ₹350", "₹300, ₹300"],
            ans: "B",
            explain: "Total parts = 2+3=5; 2/5×600=240, 3/5×600=360."
        }
    ],
    "Reasoning": [
        {
            id: 5,
            tag: "Number Series",
            q: "Find the missing number in the series: 4, 9, 16, 25, ?",
            options: ["30", "34", "36", "49"],
            ans: "C",
            explain: "The series consists of squares of consecutive numbers: 2², 3², 4², 5², so the next is 6² = 36."
        },
        {
            id: 6,
            tag: "Coding-Decoding",
            q: "If CAT = 24 and DOG = 26, then BAT = ?",
            options: ["22", "23", "24", "25"],
            ans: "B",
            explain: "C=3, A=1, T=20; 3+1+20=24. B=2, A=1, T=20; 2+1+20=23."
        },
        {
            id: 7,
            tag: "Blood Relation",
            q: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
            options: ["Mother", "Sister", "Aunt", "Grandmother"],
            ans: "A",
            explain: "Only daughter of my mother is herself. So, the woman is the man's mother."
        }
    ],
    "Verbal": [
        {
            id: 8,
            tag: "Synonyms",
            q: "Choose the word which is most nearly the SAME in meaning as the word: BRIEF",
            options: ["Limited", "Small", "Short", "Little"],
            ans: "C",
            explain: "Brief means 'lasting a short time' or 'concise'. Short is the most appropriate synonym."
        },
        {
            id: 9,
            tag: "Antonyms",
            q: "Choose the word which is OPPOSITE in meaning to: GENEROUS",
            options: ["Kind", "Selfish", "Polite", "Rich"],
            ans: "B",
            explain: "Generous means giving; selfish is the opposite."
        },
        {
            id: 10,
            tag: "Fill in the Blanks",
            q: "He _______ to school every day.",
            options: ["go", "goes", "gone", "going"],
            ans: "B",
            explain: "'He' is singular, so 'goes' is correct."
        }
    ],
    "PreviousPapers": [
        {
            id: 11,
            tag: "SSC CGL 2022",
            q: "Which number will replace the question mark? 2, 6, 12, 20, ?",
            options: ["30", "28", "24", "22"],
            ans: "B",
            explain: "Pattern: +4, +6, +8, +10; 20+8=28."
        },
        {
            id: 12,
            tag: "Bank PO 2021",
            q: "If the code for 'BANK' is 'CNOL', what is the code for 'LOAN'?",
            options: ["MPBO", "MPBN", "MPBO", "MPBN"],
            ans: "A",
            explain: "Each letter is shifted by 1: L→M, O→P, A→B, N→O."
        },
        {
            id: 13,
            tag: "Railways 2020",
            q: "Which is the odd one out? Apple, Orange, Banana, Carrot",
            options: ["Apple", "Orange", "Banana", "Carrot"],
            ans: "D",
            explain: "Carrot is a vegetable, others are fruits."
        }
    ]
};

let allQuestions = [];

fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    allQuestions = data;
    // Optionally, render a default view or enable mock test buttons
    render('Arithmetic'); // or any default section
  });

// getMockQuestions function for unique sets
function getMockQuestions(mockNum) {
    if (allQuestions.length < 30) {
        alert("Please add at least 30 unique questions for unique mock tests.");
        return [];
    }
    if (mockNum === 1) return allQuestions.slice(0, 10);
    if (mockNum === 2) return allQuestions.slice(10, 20);
    if (mockNum === 3) return allQuestions.slice(20, 30);
    return allQuestions.slice(0, 10);
}

function render(category) {
    document.getElementById('mock-result').innerHTML = "";
    const container = document.getElementById('questions-list');
    const questions = data[category] || [];
    
    document.getElementById('bread-cat').innerText = category;
    document.getElementById('display-title').innerText = category + " Aptitude";

    container.innerHTML = questions.map((item, idx) => `
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

// Initialize
render('Arithmetic');