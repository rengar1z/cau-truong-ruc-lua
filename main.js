class Player {
    constructor(name, position, stats) {
        this.name = name;
        this.position = position;
        this.stats = stats;
    }
}

class Team {
    constructor(id, name, color, morale, fw, mf, df, gk) {
        this.id = id;
        this.name = name;
        this.color = color; // Màu áo hiển thị trên sân 2D (ví dụ: #3498db cho Xanh)
        this.morale = morale;
        this.fw = fw; this.mf = mf; this.df = df; this.gk = gk;
        this.score = 0;
    }
    getRandomPlayer(role) { return this[role][Math.floor(Math.random() * this[role].length)]; }
}

// KHỞI TẠO ĐỘI HÌNH
const teamHome = new Team("home", "Nantes", "#3498db", 338, 
    [new Player("Djordjevic", "T.Đạo", { sut: 624, sutXa: 558, tocDo: 500 })],
    [new Player("Freitas", "T.Vệ", { chuyen: 538, reDat: 604, tocDo: 624 }), new Player("Veretout", "T.Vệ", { chuyen: 600, reDat: 550, tocDo: 480 })],
    [new Player("Cissokho", "H.Vệ", { xoacBong: 550, doatBong: 520 }), new Player("Djilobodji", "Tr.Vệ", { xoacBong: 610, doatBong: 630 })],
    new Player("Riou", "T.Môn", { cuuBong: 580, sucBat: 550 })
);

const teamAway = new Team("away", "Genk.vn", "#e74c3c", 498, 
    [new Player("Falcao", "T.Đạo", { sut: 680, sutXa: 600, tocDo: 550 })],
    [new Player("Figo", "T.Vệ", { chuyen: 650, reDat: 620, tocDo: 580 })],
    [new Player("Kakadu", "Tr.Vệ", { xoacBong: 650, doatBong: 610 }), new Player("Ramos", "Tr.Vệ", { xoacBong: 700, doatBong: 680 })],
    new Player("GK NPC", "T.Môn", { cuuBong: 630, sucBat: 600 })
);

const delay = ms => new Promise(res => setTimeout(res, ms));

async function startMatch() {
    const btnPlay = document.getElementById("btn-start");
    btnPlay.disabled = true;

    const atkDot = document.getElementById("ui-atk");
    const defDot = document.getElementById("ui-def");
    const gkDot = document.getElementById("ui-gk");
    const ball = document.getElementById("ball");
    const popup = document.getElementById("ui-action-popup");
    const logBox = document.getElementById("match-log");

    logBox.innerHTML = `<p class="text-yellow">▶ TRẬN ĐẤU BẮT ĐẦU!</p>`;
    teamHome.score = 0; teamAway.score = 0;
    
    // Gán quyền kiểm soát bóng ban đầu
    let attackingTeam = teamHome;
    let defendingTeam = teamAway;

    // VÒNG LẶP THỜI GIAN THỰC
    for (let minute = 5; minute <= 90; minute += Math.floor(Math.random()*10 + 5)) {
        document.getElementById("ui-time").innerText = `${minute < 10 ? '0'+minute : minute}:00`;
        popup.style.visibility = "hidden";

        // Bốc cầu thủ ngẫu nhiên từ mảng
        let atkMF = attackingTeam.getRandomPlayer('mf');
        let defDF = defendingTeam.getRandomPlayer('df');
        let gk = defendingTeam.gk;

        // Cập nhật tên và MÀU ÁO trên sân cỏ
        document.getElementById("name-atk").innerText = atkMF.name;
        atkDot.style.backgroundColor = attackingTeam.color; // Đổi màu chấm Tấn công
        
        document.getElementById("name-def").innerText = defDF.name;
        defDot.style.backgroundColor = defendingTeam.color; // Đổi màu chấm Phòng ngự
        
        document.getElementById("name-gk").innerText = gk.name;
        gkDot.style.backgroundColor = defendingTeam.color; // Thủ môn cùng màu Hậu vệ

        // --- SETUP VỊ TRÍ XUẤT PHÁT (Highlight luôn từ Trái -> Phải) ---
        atkDot.style.transition = "none"; defDot.style.transition = "none"; gkDot.style.transition = "none"; ball.style.transition = "none";
        atkDot.style.left = "20%"; atkDot.style.top = "60%";
        defDot.style.left = "60%"; defDot.style.top = "50%";
        gkDot.style.left = "95%"; gkDot.style.top = "50%";
        ball.style.left = "23%"; ball.style.top = "60%";
        
        await delay(100);

        let teamColorClass = attackingTeam.id === 'home' ? 'text-blue' : 'text-red';
        logBox.innerHTML += `<p>⏱ Phút ${minute}: Bóng trong chân <span class="${teamColorClass}">${atkMF.name} (${attackingTeam.name})</span>...</p>`;
        logBox.scrollTop = logBox.scrollHeight;

        // --- DI CHUYỂN TRANH CHẤP ---
        atkDot.style.transition = "all 1.5s linear"; defDot.style.transition = "all 1.5s linear"; ball.style.transition = "all 1.5s linear";
        atkDot.style.left = "40%"; atkDot.style.top = "50%";
        defDot.style.left = "45%"; defDot.style.top = "50%";
        ball.style.left = "42%"; ball.style.top = "50%";
        
        await delay(1500);

        // HIỆN POPUP TÍNH %
        let atkStat = atkMF.stats.reDat + atkMF.stats.tocDo;
        let defStat = defDF.stats.xoacBong + defDF.stats.doatBong;
        let winChance = Math.floor((atkStat / (atkStat + defStat)) * 100); 

        popup.innerHTML = `
            <div class="player-col"><strong>${atkMF.name}</strong>Rê dắt + Tốc độ</div>
            <div class="action-center">
                <div class="action-title">Đối Mặt</div>
                <div class="action-percent">${winChance}%</div>
            </div>
            <div class="player-col"><strong>${defDF.name}</strong>Xoạc + Đoạt bóng</div>
        `;
        popup.style.visibility = "visible";
        await delay(2000); 
        popup.style.visibility = "hidden";

        let roll = Math.floor(Math.random() * 100) + 1;
        
        if (roll <= winChance) {
            // QUA NGƯỜI THÀNH CÔNG -> ĐỔI NGƯỜI CHẠY THÀNH TIỀN ĐẠO
            let striker = attackingTeam.getRandomPlayer('fw');
            document.getElementById("name-atk").innerText = striker.name;
            logBox.innerHTML += `<p>🔥 ${atkMF.name} chuyền vượt tuyến cho ${striker.name} băng xuống!</p>`;

            atkDot.style.left = "75%"; atkDot.style.top = "50%";
            ball.style.left = "78%"; ball.style.top = "50%";
            defDot.style.left = "45%"; // Hậu vệ bị rớt lại
            
            await delay(1500);

            // TÍNH % SÚT BÓNG
            let shotStat = striker.stats.sut + striker.stats.sutXa;
            let saveStat = gk.stats.cuuBong + gk.stats.sucBat;
            let goalChance = Math.floor((shotStat / (shotStat + saveStat)) * 100);

            popup.innerHTML = `
                <div class="player-col"><strong>${striker.name}</strong>Sút + Sút xa</div>
                <div class="action-center">
                    <div class="action-title">Dứt Điểm</div>
                    <div class="action-percent">${goalChance}%</div>
                </div>
                <div class="player-col"><strong>${gk.name}</strong>Cứu bóng + Sức bật</div>
            `;
            popup.style.visibility = "visible";
            await delay(2000);
            popup.style.visibility = "hidden";

            let shotRoll = Math.floor(Math.random() * 100) + 1;
            
            ball.style.transition = "all 0.4s ease-out"; 
            gkDot.style.transition = "all 0.4s ease-out"; 

            if (shotRoll <= goalChance) {
                // VÀO LƯỚI
                ball.style.left = "100%"; ball.style.top = "50%";
                gkDot.style.top = "70%"; // GK bay sai hướng
                
                attackingTeam.score++;
                document.getElementById("ui-home-score").innerText = teamHome.score;
                document.getElementById("ui-away-score").innerText = teamAway.score;
                logBox.innerHTML += `<p class="text-green">⚽ VÀOOOOO!!! Bàn thắng cho ${attackingTeam.name}!</p>`;
                
                // Đổi quyền cầm bóng cho đội bị thủng lưới
                let temp = attackingTeam; attackingTeam = defendingTeam; defendingTeam = temp;
            } else {
                // TRƯỢT
                ball.style.left = "92%"; ball.style.top = "50%";
                gkDot.style.left = "92%"; gkDot.style.top = "50%";
                logBox.innerHTML += `<p>🛡️ Không vào! ${gk.name} cản phá thành công ôm gọn bóng.</p>`;
                
                // GK bắt được bóng -> Đổi quyền
                let temp = attackingTeam; attackingTeam = defendingTeam; defendingTeam = temp;
            }
            
        } else {
            // THẤT BẠI TỪ PHA ĐỐI MẶT
            logBox.innerHTML += `<p>❌ ${defDF.name} xoạc bóng chính xác đoạt lại quyền kiểm soát!</p>`;
            ball.style.left = "48%"; ball.style.top = "50%"; // Bóng văng vào chân Hậu vệ
            atkDot.style.left = "38%"; // Tiền đạo dội ngược lại
            
            // Mất bóng -> Đổi quyền
            let temp = attackingTeam; attackingTeam = defendingTeam; defendingTeam = temp;
        }
        
        logBox.scrollTop = logBox.scrollHeight;
        await delay(2500); 
    }

    document.getElementById("ui-time").innerText = "90:00";
    logBox.innerHTML += `<hr><p class="text-yellow">▶ HẾT GIỜ! TRẬN ĐẤU KẾT THÚC.</p>`;
    logBox.scrollTop = logBox.scrollHeight;
    
    btnPlay.disabled = false;
    btnPlay.innerText = "ĐÁ LẠI TỪ ĐẦU";
}
