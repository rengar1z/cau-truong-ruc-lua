class Player {
    constructor(name, position, stats) {
        this.name = name;
        this.position = position;
        this.stats = {
            tocDo: stats.tocDo || 10, sucBat: stats.sucBat || 10, theLuc: stats.theLuc || 10,
            sucBen: stats.sucBen || 10, sut: stats.sut || 10, reDat: stats.reDat || 10,
            chuyen: stats.chuyen || 10, danhDau: stats.danhDau || 10, doatBong: stats.doatBong || 10,
            xoacBong: stats.xoacBong || 10, chuyenDai: stats.chuyenDai || 10, sutXa: stats.sutXa || 10,
            phatDen: stats.phatDen || 600, // Đã thêm Phạt đền
            phatGoc: stats.phatGoc || 10, daPhat: stats.daPhat || 10, butPhat: stats.butPhat || 10, 
            damBong: stats.damBong || 10, khongChien: stats.khongChien || 10, cuuBong: stats.cuuBong || 10
        };
    }
}

class Team {
    constructor(id, name, color, morale, fw, mf, df, gk) {
        this.id = id;
        this.name = name;
        this.color = color; 
        this.morale = morale;
        this.fw = fw; this.mf = mf; this.df = df; this.gk = gk;
        this.score = 0;
    }
    getRandomPlayer(role) { return this[role][Math.floor(Math.random() * this[role].length)]; }
}

const teamHome = new Team("home", "Nantes", "#3498db", 338, 
    [new Player("Djordjevic", "T.Đạo", { sut: 624, sutXa: 558, phatDen: 650, tocDo: 500 })],
    [new Player("Freitas", "T.Vệ", { chuyen: 538, reDat: 604, tocDo: 624 }), new Player("Veretout", "T.Vệ", { chuyen: 600, reDat: 550, tocDo: 480 })],
    [new Player("Cissokho", "H.Vệ", { xoacBong: 550, doatBong: 520 }), new Player("Djilobodji", "Tr.Vệ", { xoacBong: 610, doatBong: 630 })],
    new Player("Riou", "T.Môn", { cuuBong: 580, sucBat: 550 })
);

const teamAway = new Team("away", "Genk.vn", "#e74c3c", 498, 
    [new Player("Falcao", "T.Đạo", { sut: 680, sutXa: 600, phatDen: 700, tocDo: 550 })],
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
    
    let attackingTeam = teamHome;
    let defendingTeam = teamAway;

    // VÒNG LẶP 90 PHÚT
    for (let minute = 5; minute <= 90; minute += Math.floor(Math.random()*10 + 5)) {
        document.getElementById("ui-time").innerText = `${minute < 10 ? '0'+minute : minute}:00`;
        popup.style.visibility = "hidden";
        defDot.style.display = "block"; // Khôi phục chấm hậu vệ phòng trường hợp bị thẻ đỏ pha trước

        let atkMF = attackingTeam.getRandomPlayer('mf');
        let defDF = defendingTeam.getRandomPlayer('df');
        let gk = defendingTeam.gk;

        // Đổi màu áo
        document.getElementById("name-atk").innerText = atkMF.name;
        atkDot.style.backgroundColor = attackingTeam.color; 
        document.getElementById("name-def").innerText = defDF.name;
        defDot.style.backgroundColor = defendingTeam.color; 
        document.getElementById("name-gk").innerText = gk.name;
        gkDot.style.backgroundColor = defendingTeam.color; 

        // Set tọa độ xuất phát
        atkDot.style.transition = "none"; defDot.style.transition = "none"; gkDot.style.transition = "none"; ball.style.transition = "none";
        atkDot.style.left = "20%"; atkDot.style.top = "60%";
        defDot.style.left = "60%"; defDot.style.top = "50%";
        gkDot.style.left = "95%"; gkDot.style.top = "50%";
        ball.style.left = "23%"; ball.style.top = "60%";
        
        await delay(100);

        let teamColorClass = attackingTeam.id === 'home' ? 'text-blue' : 'text-red';
        logBox.innerHTML += `<p>⏱ Phút ${minute}: Bóng trong chân <span class="${teamColorClass}">${atkMF.name} (${attackingTeam.name})</span>...</p>`;
        logBox.scrollTop = logBox.scrollHeight;

        // Chạy ra giữa sân
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
        
        // KIỂM TRA QUA NGƯỜI
        if (roll <= winChance) {
            
            // TUNG XÚC XẮC KIỂM TRA PHẠM LỖI (10% tỷ lệ dính)
            let foulRoll = Math.floor(Math.random() * 100) + 1;
            
            if (foulRoll <= 10) {
                // ============================================
                // KỊCH BẢN 1: PHẠM LỖI VÀ ĐÁ PENALTY
                // ============================================
                logBox.innerHTML += `<p><span class="text-red">🚨 CÒI CẤT LÊN!</span> ${defDF.name} xoạc trượt và phạm lỗi ác ý trong vòng cấm!</p>`;
                logBox.scrollTop = logBox.scrollHeight;
                
                // Hiệu ứng ngã
                atkDot.style.left = "42%"; 
                ball.style.left = "42%";
                await delay(1500);

                // Rút thẻ
                let cardRoll = Math.floor(Math.random() * 100) + 1;
                if (cardRoll <= 30) { // 30% Đỏ, 70% Vàng
                    logBox.innerHTML += `<p>🟥 <strong>THẺ ĐỎ TRỰC TIẾP!</strong> Trọng tài đuổi ${defDF.name} khỏi sân!</p>`;
                    // Lọc hậu vệ đó ra khỏi mảng
                    defendingTeam.df = defendingTeam.df.filter(p => p.name !== defDF.name);
                    // Backup chống sập game nếu đuổi hết sạch hậu vệ
                    if (defendingTeam.df.length === 0) {
                        defendingTeam.df.push(new Player("HV Dự bị", "H.Vệ", { xoacBong: 100, doatBong: 100 }));
                    }
                    defDot.style.display = "none"; // Ẩn cái chấm màu đỏ trên sân
                } else {
                    logBox.innerHTML += `<p>🟨 <strong>THẺ VÀNG!</strong> Một chiếc thẻ cảnh cáo cho ${defDF.name}.</p>`;
                }
                
                await delay(1500);
                logBox.innerHTML += `<p class="text-yellow">▶ TRỌNG TÀI CHỈ TAY VÀO CHẤM 11M!</p>`;
                logBox.scrollTop = logBox.scrollHeight;
                
                // Cầu thủ bước lên chấm Pen
                atkDot.style.left = "75%"; atkDot.style.top = "50%";
                ball.style.left = "78%"; ball.style.top = "50%";
                await delay(1500);

                let striker = attackingTeam.getRandomPlayer('fw');
                document.getElementById("name-atk").innerText = striker.name;

                let penStat = striker.stats.phatDen; 
                let saveStat = gk.stats.cuuBong + (gk.stats.sucBat * 0.5);
                let penChance = Math.floor((penStat / (penStat + saveStat)) * 100);

                // Popup Pen màu Đỏ
                popup.style.background = "rgba(231, 76, 60, 0.95)"; 
                popup.innerHTML = `
                    <div class="player-col"><strong style="color:#fff">${striker.name}</strong>Đá Phạt Đền</div>
                    <div class="action-center">
                        <div class="action-title" style="color:#fff">PENALTY</div>
                        <div class="action-percent" style="color:#fff">${penChance}%</div>
                    </div>
                    <div class="player-col"><strong style="color:#fff">${gk.name}</strong>Cứu bóng</div>
                `;
                popup.style.visibility = "visible";
                await delay(2500);
                popup.style.visibility = "hidden";
                popup.style.background = "rgba(120, 224, 143, 0.95)"; // Trả lại màu nền cũ

                let penRoll = Math.floor(Math.random() * 100) + 1;
                ball.style.transition = "all 0.3s ease-out"; // Sút cực mạnh
                
                if (penRoll <= penChance) {
                    ball.style.left = "100%"; ball.style.top = "50%";
                    gkDot.style.top = "70%"; 
                    attackingTeam.score++;
                    document.getElementById("ui-home-score").innerText = teamHome.score;
                    document.getElementById("ui-away-score").innerText = teamAway.score;
                    logBox.innerHTML += `<p class="text-green">⚽ VÀOOOOO!!! ${striker.name} sút Penalty thành công!</p>`;
                } else {
                    ball.style.left = "92%"; ball.style.top = "50%";
                    gkDot.style.left = "92%"; gkDot.style.top = "50%";
                    logBox.innerHTML += `<p>🛡️ KHÔNG VÀO! ${gk.name} đổ người cản phá quả 11m!</p>`;
                }
                
                // Đá xong luân chuyển bóng
                let temp = attackingTeam; attackingTeam = defendingTeam; defendingTeam = temp;

            } else {
                // ============================================
                // KỊCH BẢN 2: QUA NGƯỜI VÀ SÚT BÌNH THƯỜNG
                // ============================================
                let striker = attackingTeam.getRandomPlayer('fw');
                document.getElementById("name-atk").innerText = striker.name;
                logBox.innerHTML += `<p>🔥 ${atkMF.name} chuyền vượt tuyến cho ${striker.name} băng xuống!</p>`;

                atkDot.style.left = "75%"; atkDot.style.top = "50%";
                ball.style.left = "78%"; ball.style.top = "50%";
                defDot.style.left = "45%"; 
                
                await delay(1500);

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
                    ball.style.left = "100%"; ball.style.top = "50%";
                    gkDot.style.top = "70%"; 
                    
                    attackingTeam.score++;
                    document.getElementById("ui-home-score").innerText = teamHome.score;
                    document.getElementById("ui-away-score").innerText = teamAway.score;
                    logBox.innerHTML += `<p class="text-green">⚽ VÀOOOOO!!! Bàn thắng cho ${attackingTeam.name}!</p>`;
                    
                    let temp = attackingTeam; attackingTeam = defendingTeam; defendingTeam = temp;
                } else {
                    ball.style.left = "92%"; ball.style.top = "50%";
                    gkDot.style.left = "92%"; gkDot.style.top = "50%";
                    logBox.innerHTML += `<p>🛡️ Không vào! ${gk.name} cản phá thành công ôm gọn bóng.</p>`;
                    
                    let temp = attackingTeam; attackingTeam = defendingTeam; defendingTeam = temp;
                }
            }
            
        } else {
            // ============================================
            // KỊCH BẢN 3: BỊ XOẠC MẤT BÓNG NGAY TỪ ĐẦU
            // ============================================
            logBox.innerHTML += `<p>❌ ${defDF.name} xoạc bóng chính xác đoạt lại quyền kiểm soát!</p>`;
            ball.style.left = "48%"; ball.style.top = "50%"; 
            atkDot.style.left = "38%"; 
            
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
