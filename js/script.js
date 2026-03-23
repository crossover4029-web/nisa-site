/* ============================================================
   script.js — 新NISAを活用した資産形成の指針
   ============================================================ */

var accChart = null;
var decChart = null;

/* ── 世代ごとのコンフィグ ── */
const configs = {
    'kid': {
        advice: "<strong>【子供世代へのアドバイス】</strong><br>「複利」という魔法を最大限に味方につけられる、人生で最も贅沢な時期です。0歳から始めれば、社会に出る頃には圧倒的な差がつきます。少額でも「時間」を積み立てることで、将来の選択肢は無限に広がります。親から子へ贈る、最高の資産形成の土台を作りましょう。",
        suggest: "<strong>子供世代への提案：</strong> お子様の名義で、将来の学資や独立資金として「月0.5万円」の継続を。複利の恩恵を最大化できます。",
        initial: 0, monthly: 0.5, years: 65, rate: 7,
        decStartAge: 65, decMonthly: '', decRate: 7
    },
    '20': {
        advice: "<strong>【20代へのアドバイス】</strong><br>20代の武器は、失敗を恐れず挑戦できる「若さ」です。今の1万円は、将来の10万円以上の価値を持ちます。消費を投資に変える習慣を今身につければ、将来の不安は消え去ります。「早く始める」こと。これこそが、どんな投資手法よりも確実にあなたを豊かにする近道です。",
        suggest: "<strong>20代への提案：</strong> まずは「月1万円・45年」の設定で、老後の1,500万円以上の資産形成を目指しましょう。時間は最強の武器です。",
        initial: 0, monthly: 1, years: 45, rate: 7,
        decStartAge: 65, decMonthly: '', decRate: 7
    },
    '30': {
        advice: "<strong>【30代へのアドバイス】</strong><br>ライフイベントが重なる30代は、資産形成の「黄金期」です。教育資金、マイホーム、老後。複数の目標を同時に追うからこそ、新NISAの非課税枠をフル活用した戦略的な継続投資が鍵となります。今の積み立てが、10年後のあなたと家族に「心のゆとり」をもたらします。",
        suggest: "<strong>30代への提案：</strong> 収入増に合わせ「月2万円・35年」へのステップアップを。安定したS&P500等への継続投資が推奨されます。",
        initial: 0, monthly: 2, years: 35, rate: 7,
        decStartAge: 65, decMonthly: '', decRate: 7
    },
    '40': {
        advice: "<strong>【40代へのアドバイス】</strong><br>稼ぐ力が最大化する40代は、資産形成を「加速」させる最後のチャンスです。子供の独立を見据えつつ、自分たちの老後の土台を盤石にしましょう。複利の恩恵を十分に受けられる時間はまだ残されています。余剰資金を賢く市場に投じ、資産の「成育」を確実なものにしてください。",
        suggest: "<strong>40代への提案：</strong> 余剰資金を「月3万円・25年」投入。教育資金のピーク後はさらに積立を加速させ、3,000万円超を狙いましょう。",
        initial: 0, monthly: 3, years: 25, rate: 7,
        decStartAge: 65, decMonthly: '', decRate: 7
    },
    '50': {
        advice: "<strong>【50代へのアドバイス】</strong><br>老後を目前にした50代は、資産形成の「総仕上げ」の時期です。これまでの経験を活かし、インフレに負けない守りと攻めのバランスを整えましょう。新NISAの1,800万円枠を使い切るイメージで集中投資を行い、退職後の安心を「確信」に変えるための土台を固めてください。",
        suggest: "<strong>50代への提案：</strong> 初期投資100万円に加え「月5万円・15年」の集中積立。1,800万円の非課税枠を最大限活用し、出口戦略へのバトンタッチを。",
        initial: 100, monthly: 5, years: 15, rate: 7,
        decStartAge: 65, decMonthly: '', decRate: 7
    },
    '60': {
        advice: "<strong>【60代以上へのアドバイス】</strong><br>これからは、築いた資産を「守りながら賢く使う」フェーズです。ただ切り崩すのではなく、運用を継続することで資産寿命を飛躍的に延ばせます。人生100年時代、自分らしく豊かな日々を送り続けるために。新NISAを「第二の年金」として活用し、心豊かな毎日を実現しましょう。",
        suggest: "<strong>60代以上への提案：</strong> 初期投資300万円を「月1万円・10年」等で再投資。並行して第5項の「出口戦略」で寿命をシミュレーションしましょう。",
        initial: 300, monthly: 1, years: 10, rate: 7,
        decStartAge: 70, decMonthly: 5, decRate: 7
    }
};

/* ── 世代ごとのスライダー上限（積立期間） ── */
const yearsMax = { kid: 65, '20': 45, '30': 35, '40': 25, '50': 15, '60': 10 };

/* ── バッジ表示を更新 ── */
function updateBadge(id, value) {
    const el = document.getElementById(id + 'Display');
    if (!el) return;
    if (id === 'initial') el.textContent = value + '万円';
    else if (id === 'monthly') el.textContent = value + '万円';
    else if (id === 'years')   el.textContent = value + '年';
    else if (id === 'rate')    el.textContent = value + '%';
}

/* ── スライダー → 数字入力 を同期 ── */
function syncSlider(id) {
    const slider = document.getElementById(id + 'Slider');
    const number = document.getElementById(id + 'Input');
    if (!slider || !number) return;
    number.value = slider.value;
    updateBadge(id, slider.value);
    updateAccumulation();
}

/* ── 数字入力 → スライダー を同期 ── */
function syncNumber(id) {
    const slider = document.getElementById(id + 'Slider');
    const number = document.getElementById(id + 'Input');
    if (!slider || !number) return;
    /* スライダーのmax範囲内にクランプ */
    const clamped = Math.min(Math.max(number.value, slider.min), slider.max);
    slider.value = clamped;
    updateBadge(id, number.value);
    updateAccumulation();
}

/* ── 世代選択 ── */
function setTarget(key) {
    /* ボタンの active をリセット → 選択したボタンに付与 */
    document.querySelectorAll('.target-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById('btn-' + key);
    if (btn) btn.classList.add('active');

    /* アドバイスボックス: 内容 + data-gen でカラーを切り替え */
    const adviceEl = document.getElementById('target-advice');
    const conf = configs[key];
    adviceEl.innerHTML   = conf.advice;
    adviceEl.dataset.gen = key;

    /* 積立提案テキスト */
    const suggestEl = document.getElementById('accumulation-suggestion');
    if (suggestEl) suggestEl.innerHTML = conf.suggest;

    /* ── 積立期間スライダーの上限を世代に合わせて変更 ── */
    const yearsSlider = document.getElementById('yearsSlider');
    if (yearsSlider) {
        yearsSlider.max = yearsMax[key];
        /* 現在値が上限を超えていたらリセット */
        if (parseInt(yearsSlider.value) > yearsMax[key]) {
            yearsSlider.value = yearsMax[key];
        }
    }

    /* シミュレーション入力値・スライダーを一括反映 */
    const fields = ['initial', 'monthly', 'years', 'rate'];
    const vals   = [conf.initial, conf.monthly, conf.years, conf.rate];
    fields.forEach((id, i) => {
        const slider = document.getElementById(id + 'Slider');
        const number = document.getElementById(id + 'Input');
        if (slider) slider.value = vals[i];
        if (number) number.value = vals[i];
        updateBadge(id, vals[i]);
    });

    document.getElementById('decStartAge').value = conf.decStartAge;
    document.getElementById('decMonthly').value  = conf.decMonthly;
    document.getElementById('decRate').value     = conf.decRate;

    updateAccumulation();
    updateDecumulation();
}

/* ── ② 金額を日本語表記に変換（案C：億・千万・百万の3段階） ── */
function toJapaneseAmount(yen) {
    if (!yen || yen <= 0) return '';

    const oku = Math.floor(yen / 100000000);          /* 億 */
    const man = Math.floor((yen % 100000000) / 10000); /* 万（億未満） */

    if (oku >= 1) {
        /* 1億以上：「○億○千万円」 */
        const senman = Math.round(man / 1000);  /* 千万単位で丸め */
        if (senman > 0) {
            return '約' + oku + '億' + senman + '千万円';
        } else {
            return '約' + oku + '億円';
        }
    } else if (man >= 1000) {
        /* 1千万〜1億未満：「○千○百万円」 */
        const sen  = Math.floor(man / 1000);
        const hyaku = Math.round((man % 1000) / 100); /* 百万単位で丸め */
        if (hyaku > 0) {
            return '約' + sen + '千' + hyaku + '百万円';
        } else {
            return '約' + sen + '千万円';
        }
    } else if (man >= 100) {
        /* 100万〜1千万未満：「○百万円」 */
        const hyaku = Math.round(man / 100);
        return '約' + hyaku + '百万円';
    } else if (man > 0) {
        return '約' + man + '万円';
    }
    return '';
}

/* ── 積立シミュレーション ── */
function updateAccumulation() {
    const canvas = document.getElementById('accumulationChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const initial    = (parseFloat(document.getElementById('initialInput').value) || 0) * 10000;
    const monthly    = (parseFloat(document.getElementById('monthlyInput').value) || 0) * 10000;
    const years      = parseInt(document.getElementById('yearsInput').value) || 0;
    const annualRate = (parseFloat(document.getElementById('rateInput').value) || 0) / 100;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    let labels = [], pData = [], tData = [];
    for (let i = 0; i <= years; i++) {
        labels.push(i + '年');
        const m = i * 12;
        const principal = initial + monthly * m;
        const fvInitial = initial * Math.pow(1 + annualRate, i);
        let fvMonthly = 0;
        if (annualRate > 0) {
            fvMonthly = monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
        } else {
            fvMonthly = monthly * m;
        }
        const total = fvInitial + fvMonthly;
        pData.push(Math.round(principal / 10000));
        tData.push(Math.round(total / 10000));
    }
    const finalT = tData[tData.length - 1] * 10000;
    const finalP = initial + monthly * years * 12;

    document.getElementById('finalAmount').innerText =
        years + '年後の予想資産額: ' + Math.round(finalT).toLocaleString() + '円';

    /* 日本語金額表示 */
    const jaEl = document.getElementById('finalAmountJa');
    if (jaEl) jaEl.innerText = toJapaneseAmount(Math.round(finalT));

    document.getElementById('breakdownText').innerHTML =
        '投資元本: ' + Math.round(finalP).toLocaleString() +
        '円 / <span style="color:var(--tax-red); font-weight:bold;">収益: ' +
        Math.round(finalT - finalP).toLocaleString() + '円（※無税）</span>';

    document.getElementById('decAssets').value = Math.round(finalT / 10000);
    updateDecumulation();

    if (accChart) accChart.destroy();
    accChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: '元本', data: pData, backgroundColor: 'rgba(160,174,192,0.3)', fill: true, pointRadius: 0 },
                { label: '合計', data: tData, borderColor: '#38a169', tension: 0.4, borderWidth: 3 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

/* ── dec系バッジ表示を更新 ── */
function updateDecBadge(id, value) {
    const el = document.getElementById(id + 'Display');
    if (!el) return;
    if (id === 'decStartAge') el.textContent = value + '歳';
    else if (id === 'decMonthly') el.textContent = value > 0 ? value + '万円' : '─万円';
    else if (id === 'decRate')    el.textContent = value + '%';
}

/* ── dec系スライダー → 数値入力 を同期 ── */
function syncDecSlider(id) {
    const slider = document.getElementById(id + 'Slider');
    const number = document.getElementById(id);
    if (!slider || !number) return;
    number.value = slider.value;
    updateDecBadge(id, slider.value);
    updateDecumulation();
}

/* ── dec系数値入力 → スライダー を同期 ── */
function syncDecNumber(id) {
    const slider = document.getElementById(id + 'Slider');
    const number = document.getElementById(id);
    if (!number) return;
    if (slider) {
        const clamped = Math.min(Math.max(number.value, slider.min), slider.max);
        slider.value = clamped;
    }
    updateDecBadge(id, number.value);
    updateDecumulation();
}
function updateDecumulation() {
    const container      = document.getElementById('decChartContainer');
    const decMonthlyInput = document.getElementById('decMonthly');
    const errorMsg       = document.getElementById('decInputError');
    const increaseMsg    = document.getElementById('increaseAdvice');
    const resultMsg      = document.getElementById('impactMessage');
    const w              = (parseFloat(decMonthlyInput.value) || 0) * 10000;

    if (w <= 0) {
        container.innerHTML = '<div class="chart-placeholder">毎月の取崩額（必要額）を入力してください。</div>';
        document.getElementById('lifeWithInvest').innerText = '---';
        document.getElementById('lifeWithCash').innerText   = '---';
        if (resultMsg)   resultMsg.style.display   = 'none';
        decMonthlyInput.classList.add('input-required');
        if (errorMsg)    errorMsg.style.display    = 'block';
        if (increaseMsg) increaseMsg.style.display = 'none';
        if (decChart)    { decChart.destroy(); decChart = null; }
        return;
    }

    decMonthlyInput.classList.remove('input-required');
    if (errorMsg) errorMsg.style.display = 'none';

    if (!document.getElementById('decumulationChart')) {
        container.innerHTML = '<canvas id="decumulationChart"></canvas>';
    }
    const ctx = document.getElementById('decumulationChart').getContext('2d');

    const startAge = parseInt(document.getElementById('decStartAge').value) || 0;
    const assets   = (parseFloat(document.getElementById('decAssets').value) || 0) * 10000;
    const r        = (parseFloat(document.getElementById('decRate').value) || 0) / 100;
    const mr       = Math.pow(1 + r, 1 / 12) - 1;

    function calc(initial, w, r) {
        let m = 0, b = initial;
        while (b > 0 && m < 1800) { b = b * (1 + r) - w; if (b < 0) break; m++; }
        return { y: Math.floor(m / 12), m: m % 12, inf: m >= 1800 };
    }

    const inv = calc(assets, w, mr);
    const csh = calc(assets, w, 0);

    document.getElementById('lifeWithInvest').innerHTML = inv.inf
        ? "100年以上<span style='font-size:0.5em;color:#4a5568;margin-left:10px;display:inline-block;vertical-align:middle;line-height:1.2;'>運用益＞取崩額の為</span>"
        : `${inv.y}年${inv.m}ヵ月<span class="summary-age">${startAge + inv.y}歳${inv.m}ヵ月まで</span>`;
    document.getElementById('lifeWithCash').innerHTML = csh.inf
        ? '100年以上'
        : `${csh.y}年${csh.m}ヵ月<span class="summary-age">${startAge + csh.y}歳${csh.m}ヵ月まで</span>`;

    if (resultMsg) {
        resultMsg.style.display = 'block';
        const taxFreeText = '<small style="font-size:0.6em;vertical-align:middle;">（※無税）</small>';
        resultMsg.innerHTML = inv.inf
            ? `あなたは <span>100年以上</span> <span>${Math.round(w / 10000)}万円${taxFreeText}</span>を毎月取崩せます。`
            : `あなたは <span>${startAge + inv.y}歳${inv.m}ヵ月</span>まで <span>${Math.round(w / 10000)}万円${taxFreeText}</span>を毎月取崩せます。`;
    }

    if (inv.inf) {
        if (increaseMsg)  increaseMsg.style.display = 'block';
        decMonthlyInput.classList.add('input-required');
    } else {
        if (increaseMsg)  increaseMsg.style.display = 'none';
        decMonthlyInput.classList.remove('input-required');
    }

    let labels = [], dI = [], dC = [];
    let cI = assets, cC = assets, age = startAge;
    while (age <= 115 && (cI > 0 || cC > 0)) {
        labels.push(age + '歳');
        dI.push(Math.max(0, Math.round(cI / 10000)));
        dC.push(Math.max(0, Math.round(cC / 10000)));
        for (let i = 0; i < 12; i++) { cI = cI * (1 + mr) - w; cC -= w; }
        age++;
    }

    if (decChart) decChart.destroy();
    decChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: '運用あり', data: dI, borderColor: '#d4af37', fill: false, tension: 0.3 },
                { label: '運用なし', data: dC, borderColor: '#718096', backgroundColor: 'rgba(160,174,192,0.2)', fill: true, borderDash: [5, 5] }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

/* ── 初期化 ── */
document.addEventListener('DOMContentLoaded', () => {

    /* setTarget('30') がスライダー・バッジ・グラフをすべて初期化する */
    setTarget('30');

    /* dec系スライダーの初期同期 */
    ['decStartAge', 'decMonthly', 'decRate'].forEach(id => {
        const number = document.getElementById(id);
        const slider = document.getElementById(id + 'Slider');
        if (!number) return;
        if (slider) slider.value = number.value;
        updateDecBadge(id, number.value);
    });

    /* ── グラフ① S&P500 年間リターン（2000〜2024 実データ） ── */
    const sp500El = document.getElementById('sp500Chart');
    if (sp500El) {
        const years   = ['2000','2001','2002','2003','2004','2005','2006','2007','2008',
                         '2009','2010','2011','2012','2013','2014','2015','2016','2017',
                         '2018','2019','2020','2021','2022','2023','2024'];
        const returns = [-9.10,-11.89,-22.10,28.68,10.88,4.91,15.79,5.49,-37.00,
                          26.46,15.06,2.11,16.00,32.39,13.69,1.38,11.96,21.83,
                         -4.38,31.49,18.40,28.71,-18.11,26.29,25.02];
        const colors  = returns.map(v => v >= 0 ? 'rgba(56,161,105,0.8)' : 'rgba(229,62,62,0.85)');
        const borders = returns.map(v => v >= 0 ? '#2f9e58' : '#c53030');

        new Chart(sp500El.getContext('2d'), {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: '年間リターン(%)',
                    data: returns,
                    backgroundColor: colors,
                    borderColor: borders,
                    borderWidth: 1,
                    borderRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => (ctx.parsed.y > 0 ? '+' : '') + ctx.parsed.y.toFixed(2) + '%'
                        }
                    }
                },
                scales: {
                    x: { ticks: { font: { size: 10 }, color: '#666' }, grid: { display: false } },
                    y: {
                        ticks: {
                            callback: v => v + '%',
                            font: { size: 11 }, color: '#666'
                        },
                        grid: { color: 'rgba(0,0,0,0.06)' }
                    }
                }
            }
        });
    }

    /* ── グラフ② 積立継続 vs 中断 比較（2007〜2016年・月1万円） ── */
    const dcaEl = document.getElementById('dcaCompareChart');
    if (dcaEl) {
        /* S&P500年間リターン（月次換算係数） */
        const annualReturns = {
            2007:5.49, 2008:-37.00, 2009:26.46, 2010:15.06,
            2011:2.11, 2012:16.00, 2013:32.39, 2014:13.69,
            2015:1.38, 2016:11.96
        };
        const monthly = 10000; /* 月1万円 */
        const labels = [], contData = [], stopData = [];
        let contAsset = 0, stopAsset = 0;

        for (let year = 2007; year <= 2016; year++) {
            const mRate = Math.pow(1 + annualReturns[year] / 100, 1/12) - 1;
            const isStop = (year >= 2008 && year <= 2010); /* 暴落で3年停止 */
            for (let m = 0; m < 12; m++) {
                contAsset = (contAsset + monthly) * (1 + mRate);
                stopAsset = (stopAsset + (isStop ? 0 : monthly)) * (1 + mRate);
                if (m === 11) {
                    labels.push(year + '年末');
                    contData.push(Math.round(contAsset / 10000));
                    stopData.push(Math.round(stopAsset / 10000));
                }
            }
        }

        new Chart(dcaEl.getContext('2d'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: '積立継続',
                        data: contData,
                        borderColor: '#38a169',
                        backgroundColor: 'rgba(56,161,105,0.08)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 3,
                        pointRadius: 4
                    },
                    {
                        label: '暴落時に中断',
                        data: stopData,
                        borderColor: '#e53e3e',
                        backgroundColor: 'rgba(229,62,62,0.06)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        borderDash: [5, 4],
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() + '万円'
                        }
                    }
                },
                scales: {
                    x: { ticks: { font: { size: 10 }, color: '#666' }, grid: { display: false } },
                    y: {
                        ticks: {
                            callback: v => v + '万円',
                            font: { size: 11 }, color: '#666'
                        },
                        grid: { color: 'rgba(0,0,0,0.06)' }
                    }
                }
            }
        });
    }
});
