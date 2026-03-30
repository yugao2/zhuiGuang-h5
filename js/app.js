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

// ==================== 我的目标页功能 ====================

// 显示目标列表
function renderGoalsList() {
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const container = document.getElementById('goalsListContainer');
    
    if (!goals || goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">暂无打卡项目</div>
                <button class="btn-action" onclick="addDemoGoals()" style="padding: var(--space-3) var(--space-5); font-size: 14px;">添加示例项目</button>
            </div>
        `;
        return;
    }
    
    let html = '';
    goals.forEach((goal, index) => {
        const progress = Utils.calculateProgress(goal.currentMonth, goal.monthlyTarget);
        html += `
            <div class="checkin-item" style="margin-bottom: var(--space-3);">
                <div class="item-header">
                    <div class="item-name">${goal.name}</div>
                    <div class="item-progress">${goal.currentMonth}/${goal.monthlyTarget} ${goal.unit}</div>
                </div>
                <div class="item-actions">
                    <div class="item-remaining normal">${progress}%</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-action btn-secondary" onclick="editGoal(${index})" style="padding: 4px 8px; font-size: 12px;">✏️</button>
                        <button class="btn-action btn-secondary" onclick="deleteGoal(${index})" style="padding: 4px 8px; font-size: 12px; color: #ef4444; border-color: #ef4444;">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 显示添加目标弹窗
function showAddGoalModal() {
    const name = prompt('请输入打卡项目名称（如：金刚功、慢跑）：');
    if (!name) return;
    
    const monthlyTarget = prompt('请输入月度目标（次数/天数）：', '21');
    if (!monthlyTarget) return;
    
    const unit = prompt('请输入单位（次/天/篇/本）：', '次');
    if (!unit) return;
    
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    goals.push({
        id: Date.now(),
        name: name,
        cycle: 'month',
        monthlyTarget: parseInt(monthlyTarget),
        yearlyTarget: parseInt(monthlyTarget) * 12,
        currentMonth: 0,
        currentYear: 0,
        donation: 1000,
        unit: unit,
        completed: false,
        todayCount: 0
    });
    
    Utils.saveData('zhuiGuang_goals', goals);
    renderGoalsList();
    alert('✅ 已添加打卡项目：' + name);
}

// 编辑目标
function editGoal(index) {
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const goal = goals[index];
    
    const name = prompt('修改项目名称：', goal.name);
    if (!name) return;
    
    const monthlyTarget = prompt('修改月度目标：', goal.monthlyTarget);
    if (!monthlyTarget) return;
    
    goal.name = name;
    goal.monthlyTarget = parseInt(monthlyTarget);
    
    Utils.saveData('zhuiGuang_goals', goals);
    renderGoalsList();
    alert('✅ 已更新：' + name);
}

// 删除目标
function deleteGoal(index) {
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const goalName = goals[index].name;
    
    if (confirm('确定要删除 "' + goalName + '" 吗？')) {
        goals.splice(index, 1);
        Utils.saveData('zhuiGuang_goals', goals);
        renderGoalsList();
        alert('✅ 已删除：' + goalName);
    }
}

// 保存年度目标
function saveAnnualGoal() {
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    const annualGoal = document.getElementById('annualGoalInput').value;
    const currentWeight = document.getElementById('currentWeightInput').value;
    const targetWeight = document.getElementById('targetWeightInput').value;
    
    if (annualGoal) user.annualGoal = annualGoal;
    if (currentWeight) user.currentWeight = parseFloat(currentWeight);
    if (targetWeight) user.targetWeight = parseFloat(targetWeight);
    
    Utils.saveData('zhuiGuang_user', user);
    alert('✅ 年度目标已保存！');
    loadUserData();
}

// ==================== 群排行榜页功能 ====================

// 显示排行榜
function showRanking() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('rankingPage').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
    renderRankingList();
}

// 渲染排行榜
function renderRankingList() {
    const members = Utils.loadData('zhuiGuang_members', demoMembers);
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    
    // 计算当前用户进度
    const completedCount = goals.filter(g => g.completed).length;
    const progress = Math.round((completedCount / goals.length) * 100);
    
    // 添加当前用户到排行榜
    const allMembers = [
        ...members.map(m => ({ ...m, isCurrentUser: false })),
        { name: user.nickname, progress: progress, rank: 0, isCurrentUser: true }
    ].sort((a, b) => b.progress - a.progress);
    
    // 更新排名
    allMembers.forEach((m, i) => m.rank = i + 1);
    
    const container = document.getElementById('rankingListContainer');
    let html = '';
    
    allMembers.forEach((member, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        const isCurrentUser = member.isCurrentUser;
        
        html += `
            <div class="checkin-item" style="${isCurrentUser ? 'background: var(--primary-50); border: 2px solid var(--primary);' : 'margin-bottom: var(--space-3);'}">
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                    <div style="font-size: 24px; font-weight: 800; width: 40px; text-align: center;">${medal}</div>
                    <div style="flex: 1;">
                        <div class="item-name" style="${isCurrentUser ? 'color: var(--primary);' : ''}">
                            ${member.name} ${isCurrentUser ? '(我)' : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-3); margin-top: 4px;">
                            <div class="progress-bar" style="flex: 1; height: 8px;">
                                <div class="progress-fill" style="width: ${member.progress}%;"></div>
                            </div>
                            <span style="font-size: 13px; font-weight: 600; color: var(--primary);">${member.progress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==================== 月度结算页功能 ====================

// 显示结算页
function showSettlement() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('settlementPage').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
    renderSettlement();
}

// 渲染结算数据
function renderSettlement() {
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    
    // 计算未达标项目
    const uncompletedGoals = goals.filter(g => !g.completed);
    const totalDonation = uncompletedGoals.reduce((sum, g) => sum + g.donation, 0);
    
    document.getElementById('totalDonationDisplay').textContent = '¥' + Utils.formatNumber(totalDonation);
    
    const container = document.getElementById('uncompletedListContainer');
    
    if (uncompletedGoals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎉</div>
                <div class="empty-text">太棒了！本月全部达标！</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    uncompletedGoals.forEach(goal => {
        const remaining = goal.monthlyTarget - goal.currentMonth;
        html += `
            <div class="checkin-item" style="margin-bottom: var(--space-3);">
                <div class="item-header">
                    <div class="item-name" style="color: #f59e0b;">❌ ${goal.name}</div>
                    <div class="item-progress">${goal.currentMonth}/${goal.monthlyTarget} ${goal.unit}</div>
                </div>
                <div class="item-actions">
                    <div class="item-remaining urgent">差${remaining}次</div>
                    <div style="font-weight: 700; color: #f59e0b;">¥${goal.donation}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==================== 个人中心页功能 ====================

// 显示个人中心
function showProfile() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('profilePage').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
    loadProfileData();
}

// 加载个人中心数据
function loadProfileData() {
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const streak = Utils.loadData('zhuiGuang_streak', 15);
    
    document.getElementById('profileNameInput').value = user.nickname;
    document.getElementById('profileLocationInput').value = user.location;
    document.getElementById('profileAvatar').textContent = user.avatar || '👤';
    
    const completedCount = goals.filter(g => g.completed).length;
    const totalDonation = goals.filter(g => !g.completed).reduce((sum, g) => sum + g.donation, 0);
    
    document.getElementById('profileStreakNum').textContent = streak;
    document.getElementById('profileCompletedNum').textContent = completedCount;
    document.getElementById('profileDonationNum').textContent = Utils.formatNumber(totalDonation);
}

// 保存个人资料
function saveProfile() {
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    const name = document.getElementById('profileNameInput').value;
    const location = document.getElementById('profileLocationInput').value;
    
    if (name) user.nickname = name;
    if (location) user.location = location;
    
    Utils.saveData('zhuiGuang_user', user);
    alert('✅ 个人资料已保存！');
    loadUserData();
}

// 重置所有数据
function resetAllData() {
    if (confirm('⚠️ 确定要重置所有数据吗？\n\n此操作不可恢复！')) {
        localStorage.removeItem('zhuiGuang_user');
        localStorage.removeItem('zhuiGuang_goals');
        localStorage.removeItem('zhuiGuang_streak');
        alert('✅ 数据已重置，将恢复为示例数据');
        location.reload();
    }
}

// 导出数据
function exportData() {
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    const goals = Utils.loadData('zhuiGuang_goals', demoGoals);
    const streak = Utils.loadData('zhuiGuang_streak', 15);
    
    const exportData = {
        exportTime: new Date().toISOString(),
        user: user,
        goals: goals,
        streak: streak
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `追光数据_${Utils.getTodayDate()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    alert('✅ 数据已导出！');
}

// ==================== 更新页面导航函数 ====================

// 更新 showGoals 函数
const originalShowGoals = showGoals;
showGoals = function() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('goalsPage').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
    renderGoalsList();
    
    // 加载年度目标输入框
    const user = Utils.loadData('zhuiGuang_user', demoUser);
    document.getElementById('annualGoalInput').value = user.annualGoal || '';
    document.getElementById('currentWeightInput').value = user.currentWeight || '';
    document.getElementById('targetWeightInput').value = user.targetWeight || '';
};
