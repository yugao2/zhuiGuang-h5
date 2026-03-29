// 追光 - 主应用逻辑

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initDemoData();
    loadUserData();
    renderCheckinList();
    updateDate();
});

// 加载用户数据
function loadUserData() {
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const streak = Utils.loadData('zhuiGuang_streak', 15);
    
    document.getElementById('userName').textContent = user.nickname;
    document.getElementById('userLocation').textContent = '📍 ' + user.location;
    document.getElementById('annualGoalText').textContent = user.annualGoal;
    document.getElementById('donationNum').textContent = Utils.formatNumber(user.totalDonation);
    document.getElementById('streakNum').textContent = streak;
    
    const completedCount = goals.filter(g => g.completed).length;
    const totalCount = goals.length;
    const progress = Math.round((completedCount / totalCount) * 100);
    
    document.getElementById('monthlyProgressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `本月 ${completedCount}/${totalCount} 达标`;
    document.getElementById('progressPercent').textContent = progress + '%';
}

// 更新日期
function updateDate() {
    document.getElementById('checkinDate').textContent = Utils.getTodayDate();
    document.getElementById('checkinWeekday').textContent = Utils.getWeekday();
}

// 渲染打卡列表
function renderCheckinList() {
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const container = document.getElementById('checkinList');
    
    if (!goals || goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-text">暂无打卡项目</div>
                <button class="btn-action" onclick="addDemoGoals()" style="padding: var(--space-3) var(--space-5); font-size: 14px;">添加示例项目</button>
            </div>
        `;
        return;
    }
    
    let html = '';
    goals.forEach((goal, index) => {
        const progress = Utils.calculateProgress(goal.currentMonth, goal.monthlyTarget);
        const remaining = goal.monthlyTarget - goal.currentMonth;
        const completedClass = goal.completed ? 'completed' : '';
        const urgentClass = remaining <= 2 ? 'urgent' : 'normal';
        const remainingText = remaining <= 2 ? `差${remaining}次达标` : `还差${remaining}次`;
        const actionHtml = goal.completed 
            ? `<div class="checkmark">✓</div>`
            : `<button class="btn-plus" onclick="plusOne(${index})">+</button>`;
        
        html += `
            <div class="checkin-item ${completedClass}" id="goal-${index}">
                <div class="item-header">
                    <div class="item-name">${goal.name}</div>
                    <div class="item-progress">本月 ${goal.currentMonth}/${goal.monthlyTarget} ${goal.unit}</div>
                </div>
                <div class="item-actions">
                    <div class="item-remaining ${urgentClass}">${remainingText}</div>
                    ${actionHtml}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 单独 +1
function plusOne(index) {
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    goals[index].todayCount += 1;
    goals[index].currentMonth += 1;
    goals[index].currentYear += 1;
    goals[index].completed = true;
    
    Utils.saveData('zhuiGuang_goals', goals);
    renderCheckinList();
    updateHomePage();
    
    if (navigator.vibrate) navigator.vibrate(50);
}

// 全部完成
function completeAll() {
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    goals.forEach(goal => {
        if (!goal.completed) {
            goal.todayCount += 1;
            goal.currentMonth += 1;
            goal.currentYear += 1;
            goal.completed = true;
        }
    });
    
    Utils.saveData('zhuiGuang_goals', goals);
    renderCheckinList();
    updateHomePage();
    
    if (navigator.vibrate) navigator.vibrate(50);
}

// 更新首页数据
function updateHomePage() {
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const completedCount = goals.filter(g => g.completed).length;
    const totalCount = goals.length;
    const progress = Math.round((completedCount / totalCount) * 100);
    
    document.getElementById('monthlyProgressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `本月 ${completedCount}/${totalCount} 达标`;
    document.getElementById('progressPercent').textContent = progress + '%';
}

// 提交打卡
function submitCheckin() {
    const location = document.getElementById('locationInput').value;
    const feeling = document.getElementById('feelingInput').value;
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    const streak = Utils.loadData('zhuiGuang_streak', 15);
    
    const completedGoals = goals.filter(g => g.completed);
    const completedCount = completedGoals.length;
    const totalCount = goals.length;
    const progress = Math.round((completedCount / totalCount) * 100);
    
    const cardData = {
        date: Utils.getTodayDate(),
        weekday: Utils.getWeekday(),
        location: location,
        goals: completedGoals,
        feeling: feeling,
        progress: progress,
        rank: 3,
        streak: streak,
        userName: user.nickname
    };
    
    renderCard(cardData);
    goToCard();
}

// 渲染打卡卡片
function renderCard(data) {
    const container = document.getElementById('cardPreview');
    
    let goalsHtml = '';
    data.goals.forEach(goal => {
        const progress = Utils.calculateProgress(goal.currentMonth, goal.monthlyTarget);
        const barWidth = Math.floor(progress / 10);
        goalsHtml += `
            <div class="card-item">
                <div class="card-item-name">✅ ${goal.name} +1</div>
                <div class="card-item-progress">
                    ${'█'.repeat(barWidth)}${'░'.repeat(10 - barWidth)} ${progress}%
                    <br>本月 ${goal.currentMonth}/${goal.monthlyTarget} ${goal.unit}
                </div>
            </div>
        `;
    });
    
    const cardText = Utils.generateCardText(data.progress, data.rank, data.streak, data.goals.length);
    
    container.innerHTML = `
        <div class="card-title">🔥 今日打卡</div>
        <div class="card-subtitle">
            ${data.userName} | ${data.date} ${data.weekday}<br>
            📍 ${data.location}
        </div>
        
        ${goalsHtml}
        
        <div class="card-stats">
            <div class="card-stat">
                <span class="card-stat-num">🏆 ${data.rank}</span>
                <span class="card-stat-label">群排名</span>
            </div>
            <div class="card-stat">
                <span class="card-stat-num">🔥 ${data.streak}天</span>
                <span class="card-stat-label">连续打卡</span>
            </div>
            <div class="card-stat">
                <span class="card-stat-num">${data.progress}%</span>
                <span class="card-stat-label">月度进度</span>
            </div>
        </div>
        
        ${data.feeling ? `
            <div class="card-feeling">
                💬 ${data.feeling}
            </div>
        ` : ''}
        
        <div class="card-footer">
            ${cardText}
        </div>
    `;
}

// 分享卡片
function shareCard() {
    alert('📸 截图保存，然后分享到微信群！\n\n（小程序版将支持一键分享）');
}

// 页面导航
function goToCheckin() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('checkinPage').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
    renderCheckinList();
}

function goToCard() {
    document.getElementById('checkinPage').classList.add('hidden');
    document.getElementById('cardPage').classList.remove('hidden');
}

function goHome() {
    document.getElementById('checkinPage').classList.add('hidden');
    document.getElementById('cardPage').classList.add('hidden');
    document.getElementById('goalsPage').classList.add('hidden');
    document.getElementById('homePage').classList.remove('hidden');
    document.getElementById('bottomNav').classList.remove('hidden');
    loadUserData();
}

function showGoals() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('goalsPage').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
}

function showRanking() {
    alert('🏆 群排行榜功能开发中...\n\n将显示：\n• 本月完成率排名\n• 连续打卡天数\n• 乐捐金额统计');
}

function showSettlement() {
    alert('💰 月度结算功能开发中...\n\n将显示：\n• 未达标项目\n• 乐捐金额\n• 群内公示');
}

function showProfile() {
    alert('👤 个人中心功能开发中...');
}

// 添加示例目标
function addDemoGoals() {
    Utils.saveData('zhuiGuang_goals', demoGoals);
    alert('✅ 已添加 6 个示例打卡项目！\n\n包括：金刚功、慢跑、过午不食、早睡、丰盛日记、读书');
    renderCheckinList();
    goHome();
}
