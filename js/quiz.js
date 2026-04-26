/**
 * 宝石之名 - 测试页面逻辑
 * 处理题目渲染、答案保存、进度更新等功能
 */

// ============================================
// 测试页面初始化
// ============================================
function initQuizPage(pageNumber) {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;
    
    // 确定当前页面的题目范围
    const startIndex = (pageNumber - 1) * 12;
    const endIndex = startIndex + 12;
    const pageQuestions = questions.slice(startIndex, endIndex);
    
    // 渲染题目
    renderQuestions(pageQuestions, startIndex + 1);
    
    // 加载已保存的答案
    loadSavedAnswers();
    
    // 更新进度条
    updateProgressBar(pageNumber);
    
    // 绑定导航按钮事件
    bindNavigationEvents(pageNumber);
}

// ============================================
// 渲染题目
// ============================================
function renderQuestions(pageQuestions, startNumber) {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;
    
    let html = '';
    
    pageQuestions.forEach((question, index) => {
        const questionNumber = startNumber + index;
        html += `
            <div class="quiz-question" data-question-id="${question.id}">
                <div class="quiz-question-number">问题 ${questionNumber}/24</div>
                <h3 class="quiz-question-text">${question.text}</h3>
                <div class="quiz-options">
                    ${question.options.map(option => `
                        <div class="quiz-option" data-option-id="${option.id}">
                            <input type="radio" name="${question.id}" id="${question.id}-${option.id}" value="${option.id}">
                            <label for="${question.id}-${option.id}">${option.text}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    quizContainer.innerHTML = html;
    
    // 绑定选项点击事件
    bindOptionClickEvents();
}

// ============================================
// 绑定选项点击事件
// ============================================
function bindOptionClickEvents() {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const input = this.querySelector('input');
            if (input) {
                input.checked = true;
                
                // 移除同组其他选项的选中状态
                const questionId = input.name;
                const otherOptions = document.querySelectorAll(`.quiz-question[data-question-id="${questionId}"] .quiz-option`);
                otherOptions.forEach(opt => opt.classList.remove('selected'));
                
                // 添加当前选项的选中状态
                this.classList.add('selected');
                
                // 保存答案
                saveAnswer(questionId, input.value);
            }
        });
    });
}

// ============================================
// 保存答案
// ============================================
function saveAnswer(questionId, answer) {
    const answers = GemQuiz.Storage.getAnswers();
    answers[questionId] = answer;
    GemQuiz.Storage.saveAnswers(answers);
}

// ============================================
// 加载已保存的答案
// ============================================
function loadSavedAnswers() {
    const answers = GemQuiz.Storage.getAnswers();
    
    Object.keys(answers).forEach(questionId => {
        const answer = answers[questionId];
        const input = document.querySelector(`input[name="${questionId}"][value="${answer}"]`);
        if (input) {
            input.checked = true;
            const option = input.closest('.quiz-option');
            if (option) {
                option.classList.add('selected');
            }
        }
    });
}

// ============================================
// 更新进度条
// ============================================
function updateProgressBar(pageNumber) {
    const progressContainer = document.getElementById('quiz-progress');
    if (!progressContainer) return;
    
    // 清空进度条
    progressContainer.innerHTML = '';
    
    // 创建24个进度条项目
    for (let i = 0; i < 24; i++) {
        const progressItem = document.createElement('div');
        progressItem.className = 'quiz-progress-item';
        
        // 计算当前进度
        const currentQuestion = (pageNumber - 1) * 12 + 1;
        if (i < currentQuestion - 1) {
            progressItem.classList.add('completed');
        } else if (i === currentQuestion - 1) {
            progressItem.classList.add('active');
        }
        
        progressContainer.appendChild(progressItem);
    }
}

// ============================================
// 绑定导航按钮事件
// ============================================
function bindNavigationEvents(pageNumber) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (pageNumber > 1) {
                window.location.href = `quiz${pageNumber - 1}.html`;
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (validateAnswers(pageNumber)) {
                if (pageNumber === 1) {
                    window.location.href = 'quiz2.html';
                } else if (pageNumber === 2) {
                    window.location.href = 'result.html';
                }
            }
        });
    }
}

// ============================================
// 验证答案完整性
// ============================================
function validateAnswers(pageNumber) {
    const startIndex = (pageNumber - 1) * 12;
    const endIndex = startIndex + 12;
    const pageQuestions = questions.slice(startIndex, endIndex);
    
    const answers = GemQuiz.Storage.getAnswers();
    const missingQuestions = [];
    
    pageQuestions.forEach(question => {
        if (!answers[question.id]) {
            missingQuestions.push(question.id);
        }
    });
    
    if (missingQuestions.length > 0) {
        GemQuiz.showToast(`请回答所有问题后再继续`, 'warning');
        return false;
    }
    
    return true;
}

// ============================================
// 导出初始化函数
// ============================================
window.initQuizPage = initQuizPage;
