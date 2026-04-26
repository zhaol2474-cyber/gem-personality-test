/**
 * 宝石之名 - 结果页面逻辑
 * 计算测试结果，实现主题切换和结果页动画效果
 */

// ============================================
// 计算测试结果
// ============================================
function calculateResult() {
    const answers = GemQuiz.Storage.getAnswers();
    const scores = {};
    
    // 初始化分数
    Object.keys(personalities).forEach(gem => {
        scores[gem] = 0;
    });
    
    // 计算分数
    Object.keys(answers).forEach(questionId => {
        const answer = answers[questionId];
        const question = questions.find(q => q.id === questionId);
        if (question && answer) {
            const options = question.options;
            const selectedOption = options.find(opt => opt.id === answer);
            if (selectedOption && selectedOption.scores) {
                Object.keys(selectedOption.scores).forEach(gem => {
                    if (scores[gem] !== undefined) {
                        scores[gem] += selectedOption.scores[gem];
                    }
                });
            }
        }
    });
    
    // 处理平分情况
    return resolveTie(scores);
}

// ============================================
// 处理平分情况
// ============================================
function resolveTie(scores) {
    // 按分数降序排序
    const sortedScores = Object.entries(scores)
        .map(([gem, score]) => ({ gem, score }))
        .sort((a, b) => b.score - a.score);
    
    // 检查是否有平分
    if (sortedScores.length > 1 && sortedScores[0].score === sortedScores[1].score) {
        console.log('检测到平分，开始多轮比较');
        return breakTie(sortedScores);
    }
    
    return sortedScores[0].gem;
}

// ============================================
// 多轮比较打破平分
// ============================================
function breakTie(sortedScores) {
    // 第一轮：找出所有最高分的宝石
    const maxScore = sortedScores[0].score;
    const topGems = sortedScores.filter(item => item.score === maxScore).map(item => item.gem);
    
    if (topGems.length === 1) {
        return topGems[0];
    }
    
    // 第一轮：比较核心题得分
    const coreScores = calculateCoreScores(topGems);
    const sortedCoreScores = Object.entries(coreScores)
        .map(([gem, score]) => ({ gem, score }))
        .sort((a, b) => b.score - a.score);
    
    if (sortedCoreScores[0].score > sortedCoreScores[1].score) {
        console.log(`通过核心题得分打破平分，选择: ${sortedCoreScores[0].gem}`);
        return sortedCoreScores[0].gem;
    }
    
    // 第二轮：比较Q13-Q24得分
    const secondRoundScores = calculateSecondRoundScores(topGems);
    const sortedSecondRoundScores = Object.entries(secondRoundScores)
        .map(([gem, score]) => ({ gem, score }))
        .sort((a, b) => b.score - a.score);
    
    if (sortedSecondRoundScores[0].score > sortedSecondRoundScores[1].score) {
        console.log(`通过Q13-Q24得分打破平分，选择: ${sortedSecondRoundScores[0].gem}`);
        return sortedSecondRoundScores[0].gem;
    }
    
    // 第三轮：按固定优先级判定
    for (const gem of tieBreakConfig.priorityOrder) {
        if (topGems.includes(gem)) {
            console.log(`通过优先级顺序打破平分，选择: ${gem}`);
            return gem;
        }
    }
    
    // 第四轮：随机选择
    const randomIndex = Math.floor(Math.random() * topGems.length);
    console.log(`通过随机选择打破平分，选择: ${topGems[randomIndex]}`);
    return topGems[randomIndex];
}

// ============================================
// 计算核心题得分
// ============================================
function calculateCoreScores(gems) {
    const answers = GemQuiz.Storage.getAnswers();
    const scores = {};
    
    gems.forEach(gem => {
        scores[gem] = 0;
    });
    
    tieBreakConfig.coreQuestions.forEach(questionId => {
        const answer = answers[questionId];
        const question = questions.find(q => q.id === questionId);
        if (question && answer) {
            const options = question.options;
            const selectedOption = options.find(opt => opt.id === answer);
            if (selectedOption && selectedOption.scores) {
                gems.forEach(gem => {
                    if (selectedOption.scores[gem]) {
                        scores[gem] += selectedOption.scores[gem];
                    }
                });
            }
        }
    });
    
    return scores;
}

// ============================================
// 计算第二轮得分（Q13-Q24）
// ============================================
function calculateSecondRoundScores(gems) {
    const answers = GemQuiz.Storage.getAnswers();
    const scores = {};
    
    gems.forEach(gem => {
        scores[gem] = 0;
    });
    
    tieBreakConfig.secondRoundQuestions.forEach(questionId => {
        const answer = answers[questionId];
        const question = questions.find(q => q.id === questionId);
        if (question && answer) {
            const options = question.options;
            const selectedOption = options.find(opt => opt.id === answer);
            if (selectedOption && selectedOption.scores) {
                gems.forEach(gem => {
                    if (selectedOption.scores[gem]) {
                        scores[gem] += selectedOption.scores[gem];
                    }
                });
            }
        }
    });
    
    return scores;
}

// ============================================
// 应用结果主题
// ============================================
function applyResultTheme(gemId) {
    const gem = personalities[gemId];
    if (!gem) return;
    
    // 可以在这里添加主题定制逻辑
    // 例如根据不同宝石类型修改背景、颜色等
}

// ============================================
// 渲染结果页面
// ============================================
function renderResult() {
    const resultContainer = document.getElementById('result-container');
    if (!resultContainer) return;
    
    // 显示加载动画
    GemQuiz.showLoading();
    
    // 计算结果
    const resultGemId = calculateResult();
    const gem = personalities[resultGemId];
    
    if (!gem) {
        resultContainer.innerHTML = '<div class="error-message">无法计算结果，请重试</div>';
        GemQuiz.hideLoading();
        return;
    }
    
    // 应用主题
    applyResultTheme(resultGemId);
    
    // 构建结果HTML - 揭晓式排版
    const resultHTML = `
        <div class="result-hero">
            <div class="result-label">你的宝石人格是</div>
            <img src="${gem.image}" alt="${gem.name}" class="result-gem-image">
            <h1 class="result-name">${gem.name}</h1>
            <p class="result-tagline">"${gem.slogan}"</p>
            <div class="result-keywords">
                ${gem.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
            </div>
        </div>
        <div class="result-content">
            <div class="result-section">
                <h3 class="result-section-title">人格特质</h3>
                <p class="result-section-content">${gem.description}</p>
            </div>
            <div class="result-section">
                <h3 class="result-section-title">人际关系</h3>
                <p class="result-section-content">${gem.relationship}</p>
            </div>
            <div class="result-section">
                <h3 class="result-section-title">理想生活</h3>
                <p class="result-section-content">${gem.lifestyle}</p>
            </div>
        </div>
        <div class="btn-group">
            <a href="quiz1.html" class="btn btn-primary" onclick="GemQuiz.Storage.clearAllData()">重新测试</a>
            <a href="gallery.html" class="btn btn-secondary">查看图鉴</a>
        </div>
    `;
    
    // 模拟加载延迟
    setTimeout(() => {
        resultContainer.innerHTML = resultHTML;
        GemQuiz.hideLoading();
        
        // 添加动画效果
        const elements = resultContainer.querySelectorAll('.result-hero > *');
        elements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
            element.classList.add('fade-in-up');
        });
    }, 1000);
}

// ============================================
// 初始化结果页面
// ============================================
function initResultPage() {
    renderResult();
}

// 导出初始化函数
window.initResultPage = initResultPage;
