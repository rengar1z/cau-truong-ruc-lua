// ==========================================
// 1. KHUÔN CẤU TRÚC DỮ LIỆU CẦU THỦ & ĐỘI BÓNG
// ==========================================
class Player {
    constructor(name, position, stats) {
        this.name = name;
        this.position = position;
        
        // 19 chỉ số chuẩn
        this.stats = {
            tocDo: stats.tocDo || 10, sucBat: stats.sucBat || 10, theLuc: stats.theLuc || 10,
            sucBen: stats.sucBen || 10, sut: stats.sut || 10, reDat: stats.reDat || 10,
            chuyen: stats.chuyen || 10, danhDau: stats.danhDau || 10, doatBong: stats.doatBong || 10,
            xoacBong: stats.xoacBong || 10, chuyenDai: stats.chuyenDai || 10, sutXa: stats.sutXa || 10,
            phatDen: stats.phatDen || 10, phatGoc: stats.phatGoc || 10, daPhat: stats.daPhat || 10,
            butPhat: stats.butPhat || 10, damBong: stats.damBong || 10, khongChien: stats.khongChien || 10,
            cuuBong: stats.cuuBong || 10
        };
    }
}

class Team {
    constructor(name, morale, forwards, midfielders, defenders, goalkeeper) {
        this.name = name;
        this.morale = morale; // Tinh thần
        this.fw = forwards;   // Mảng Tiền đạo
        this.mf = midfielders; // Mảng Tiền vệ
        this.df = defenders;   // Mảng Hậu vệ
        this.gk = goalkeeper;  // 1 Thủ môn
        this.score = 0;
    }

    // Hàm tự động bốc 1 cầu thủ ngẫu nhiên trong tuyến để tham gia pha bóng
    getRandomPlayer(role) {
        const list = this[role];
        return list[Math.floor(Math.random() * list.length)];
    }
}

// ==========================================
// 2. KHỞI TẠO ĐỘI HÌNH ĐẦY ĐỦ 2 BÊN
// ==========================================
// Đội Nhà: Nantes
const teamHome = new Team("Nantes", 338, 
    // Tiền đạo (FW)
    [new Player("Djordjevic", "T.Đạo", { sut: 624, sutXa: 558, tocDo: 500 }), new Player("Bangoura", "T.Đạo", { sut: 580, sutXa: 450, tocDo: 610 })],
    // Tiền vệ (MF)
    [new Player("Freitas", "T.Vệ", { chuyen: 538, reDat: 604, tocDo: 624 }), new Player("Veretout", "T.Vệ", { chuyen: 600, reDat: 550, tocDo: 480 })],
    // Hậu vệ (DF)
    [new Player("Cissokho", "H.Vệ", { xoacBong: 550, doatBong: 520, tocDo: 580 }), new Player("Djilobodji", "Tr.Vệ", { xoacBong: 610, doatBong: 630, tocDo: 450 })],
    // Thủ môn (GK)
    new Player("Riou", "T.Môn", { cuuBong: 580, sucBat: 550 })
);

// Đội Khách: Genk.vn
const teamAway = new Team("Genk.vn", 498, 
    // Tiền đạo (FW)
    [new Player("Falcao", "T.Đạo", { sut: 680, sutXa: 600, tocDo: 550 })],
    // Tiền vệ (MF)
    [new Player("Figo", "T.Vệ", { chuyen: 650, reDat: 620, tocDo: 580 })],
    // Hậu vệ (DF)
    [new Player("Kakadu", "Tr.Vệ", { xoacBong: 650, doatBong: 610, tocDo: 500 }), new Player("Ramos", "Tr.Vệ", { xoacBong: 700, doatBong: 680, tocDo: 520 })],
    // Thủ môn (GK)
    new Player("GK NPC", "T.Môn", { cuuBong: 630, sucBat: 600 })
);

const delay = ms => new Promise(res => setTimeout(res, ms));

// ==========================================
// 3. LUỒNG TRẬN ĐẤU (CÓ LUÂN CHUYỂN BÓNG)
// ==========================================
async function startMatch() {
    const btnPlay = document.getElementById("btn-start");
    btnPlay.disabled = true;

    // Cập nhật giao diện Scoreboard
    document.getElementById("ui-home-name").innerText = teamHome.name;
    document.getElementById("ui-away-name").innerText = teamAway.name;
    document.getElementById("ui-home-morale").innerText = `Tinh thần thi đấu: ${teamHome.morale}`;
    document.getElementById("ui-away-morale").innerText = `Tinh thần thi đấu: ${teamAway.morale}`;
    
    const logBox = document.getElementById("match-log");
    const popupBox = document.getElementById("ui-action-popup");
    
    teamHome.score = 0;
    teamAway.score = 0;
    document.getElementById("ui-home-score").innerText = 0;
    document.getElementById("ui-away-score").innerText = 0;

    logBox.innerHTML = `<p class="text-yellow">▶ TRỌNG TÀI THỔI CÒI BẮT ĐẦU TRẬN ĐẤU!</p>`;
    popupBox.style.visibility = "hidden";

    // Gán quyền kiểm soát bóng ban đầu
    let attackingTeam = teamHome;
    let defendingTeam = teamAway;

    // Hàm đảo ngược quyền kiểm soát bóng
    const swapPossession = () => {
        let temp = attackingTeam;
        attackingTeam = defendingTeam;
        defendingTeam = temp;
    };

    // CHẠY VÒNG LẶP 90 PHÚT
    for (let minute = 5; minute <= 90; minute += Math.floor(Math.random() * 10 + 5)) {
        document.getElementById("ui-time").innerText = `${minute < 10 ? '0'+minute : minute}:00`;
        
        // Chọn ngẫu nhiên cầu thủ của 2 đội cho pha bóng này
        let atkMF = attackingTeam.getRandomPlayer('mf');
        let defDF = defendingTeam.getRandomPlayer('df');

        logBox.innerHTML += `<p><strong>⏱ ${minute}':</strong> Bóng trong chân <span class="${attackingTeam === teamHome ? 'text-blue' : 'text-red'}">${atkMF.name} (${attackingTeam.name})</span>...</p>`;
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1000);

        // --- BƯỚC 1: TRANH CHẤP QUA NGƯỜI ---
        let atkStat = atkMF.stats.reDat + atkMF.stats.tocDo;
        let defStat = defDF.stats.xoacBong + defDF.stats.doatBong;
        let winChance = Math.floor((atkStat / (atkStat + defStat)) * 100); 

        popupBox.innerHTML = `
            <div class="player-col">
                <strong>${atkMF.name}</strong>
                Vị trí: ${atkMF.position}<br>
                Rê dắt: ${atkMF.stats.reDat}<br>Tốc độ: ${atkMF.stats.tocDo}
            </div>
            <div class="action-center">
                <div class="action-title">Lừa Bóng</div>
                <div class="action-percent">${winChance}%</div>
            </div>
            <div class="player-col">
                <strong>${defDF.name}</strong>
                Vị trí: ${defDF.position}<br>
                Xoạc bóng: ${defDF.stats.xoacBong}<br>Đoạt bóng: ${defDF.stats.doatBong}
            </div>
        `;
        popupBox.style.visibility = "visible";
        await delay(2000); 
        popupBox.style.visibility = "hidden";

        let roll = Math.floor(Math.random() * 100) + 1;
        
        if (roll <= winChance) {
            logBox.innerHTML += `<p>🔥 ${atkMF.name} lừa bóng qua ${defDF.name} thành công! Tổ chức tấn công nhanh!</p>`;
            logBox.scrollTop = logBox.scrollHeight;
            await delay(1000);

            // --- BƯỚC 2: SÚT BÓNG ĐỐI MẶT THỦ MÔN ---
            let striker = attackingTeam.getRandomPlayer('fw');
            let gk = defendingTeam.gk; // Lấy đúng Thủ môn của đội phòng ngự

            let shotStat = striker.stats.sut + striker.stats.sutXa;
            let saveStat = gk.stats.cuuBong + gk.stats.sucBat;
            let goalChance = Math.floor((shotStat / (shotStat + saveStat)) * 100);

            popupBox.innerHTML = `
                <div class="player-col">
                    <strong>${striker.name}</strong>
                    Vị trí: ${striker.position}<br>
                    Sút: ${striker.stats.sut}<br>Sút xa: ${striker.stats.sutXa}
                </div>
                <div class="action-center">
                    <div class="action-title">Cơ Hội Ghi Bàn</div>
                    <div class="action-percent">${goalChance}%</div>
                </div>
                <div class="player-col">
                    <strong>${gk.name}</strong>
                    Vị trí: ${gk.position}<br>
                    Cứu bóng: ${gk.stats.cuuBong}<br>Sức bật: ${gk.stats.sucBat}
                </div>
            `;
            popupBox.style.visibility = "visible";
            await delay(2000);
            popupBox.style.visibility = "hidden";

            let shotRoll = Math.floor(Math.random() * 100) + 1;

            if (shotRoll <= goalChance) {
                attackingTeam.score++;
                document.getElementById("ui-home-score").innerText = teamHome.score;
                document.getElementById("ui-away-score").innerText = teamAway.score;
                logBox.innerHTML += `<p class="text-green">⚽ VÀOOOOO!!! Bàn thắng quá đẹp của ${striker.name}!</p>`;
                
                // Ghi bàn xong, đội bị thủng lưới được giao bóng
                swapPossession();
            } else {
                logBox.innerHTML += `<p>🛡️ Không vào! ${gk.name} đổ người cản phá xuất sắc ôm gọn trái bóng.</p>`;
                
                // Thủ môn bắt được bóng, phát lên phản công -> Đổi quyền kiểm soát
                swapPossession();
            }
        } else {
            // THẤT BẠI TỪ PHA QUA NGƯỜI
            logBox.innerHTML += `<p>❌ ${defDF.name} xoạc bóng chính xác đoạt lại quyền kiểm soát cho ${defendingTeam.name}!</p>`;
            
            // Mất bóng -> Đổi quyền kiểm soát
            swapPossession();
        }
        
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1500); 
    }

    // KẾT THÚC TRẬN
    document.getElementById("ui-time").innerText = "90:00";
    logBox.innerHTML += `<hr><p class="text-yellow">▶ HẾT GIỜ! TRẬN ĐẤU KẾT THÚC.</p>`;
    logBox.scrollTop = logBox.scrollHeight;
    
    btnPlay.disabled = false;
    btnPlay.innerText = "ĐÁ LẠI TỪ ĐẦU";
}
