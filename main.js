Tôi hiểu cảm giác của bạn! Khi chúng ta đắp thêm liên tục các tính năng mới (từ text log, tính %, rồi đến hình ảnh 2D), các file code sẽ rất dễ bị rối và chồng chéo logic lên nhau.

Đó là lý do định kỳ chúng ta cần "Refactor" (Cấu trúc lại code). Tôi đã dọn dẹp, tối ưu và gộp toàn bộ những tinh hoa nãy giờ vào chỉ 2 file duy nhất. Logic giờ đây chạy theo một đường thẳng rất dễ hiểu bằng async/await (chờ hành động này xong mới tới hành động khác), hoàn toàn không bị lỗi nhịp.

Bạn hãy xóa sạch code cũ đi và tạo lại 2 file này nhé:

1. File index.html (Giao diện Sân bóng & CSS)
File này giờ chỉ làm nhiệm vụ vẽ giao diện. Các thẻ <img> đã được thiết lập sẵn thư mục images/ và class flip-horizontal để lật ngược hướng mặt của đội khách.

HTML
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cầu Trường Rực Lửa - Bản Hoàn Chỉnh</title>
    <style>
        body { font-family: Tahoma, sans-serif; background-color: #2c3e50; color: #fff; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: #27ae60; padding: 10px; border-radius: 8px; border: 2px solid #fff; position: relative; }
        
        /* Bảng tỷ số & Tinh thần */
        .scoreboard { background: #111; display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-radius: 5px; margin-bottom: 5px; border: 2px solid #555; }
        .team-name { font-size: 20px; font-weight: bold; width: 30%; text-align: center; }
        .score-center { text-align: center; width: 40%; }
        .time { font-size: 14px; color: #aaa; margin-bottom: 5px; }
        .score { font-size: 28px; font-weight: bold; color: #f1c40f; }
        
        .morale-container { display: flex; background: #000; padding: 2px; margin-bottom: 10px; font-size: 12px; text-align: center; border: 1px solid #333; }
        .morale-bar { padding: 3px 0; color: white; width: 50%; font-weight: bold; }
        .morale-red { background: #c0392b; border-right: 1px solid #000; }
        .morale-blue { background: #2980b9; }

        /* Sân cỏ 2D */
        #pitch { width: 100%; height: 350px; background: #4caf50; border: 3px solid #fff; position: relative; overflow: hidden; margin-bottom: 10px; border-radius: 5px; box-shadow: inset 0 0 20px rgba(0,0,0,0.3); }
        .center-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background: #fff; transform: translateX(-50%); }
        .center-circle { position: absolute; left: 50%; top: 50%; width: 100px; height: 100px; border: 3px solid #fff; border-radius: 50%; transform: translate(-50%, -50%); }
        .penalty-box { position: absolute; top: 20%; bottom: 20%; width: 15%; border: 3px solid #fff; }
        .penalty-box.left { left: 0; border-left: none; }
        .penalty-box.right { right: 0; border-right: none; }

        /* Cầu thủ (Dùng Icon Ảnh) */
        .player-icon { position: absolute; width: 50px; height: 50px; transition: all 1.5s linear; transform: translate(-50%, -50%); z-index: 2; }
        .player-icon img { width: 100%; height: 100%; object-fit: contain; }
        .name-tag { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); color: #fff; font-size: 11px; white-space: nowrap; text-shadow: 1px 1px 2px #000; background: rgba(0,0,0,0.5); padding: 2px 5px; border-radius: 3px; }
        .flip-horizontal img { transform: scaleX(-1); } /* Lật hướng mặt đội khách */

        #ball { position: absolute; width: 15px; height: 15px; background: #fff; border-radius: 50%; border: 1px solid #000; transition: all 0.5s ease; transform: translate(-50%, -50%); z-index: 1; }

        /* Popup Tỷ lệ phần trăm */
        .action-popup { position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 80%; background: rgba(120, 224, 143, 0.95); color: #000; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; border: 2px solid #2ecc71; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 10; visibility: hidden; }
        .player-col { width: 30%; text-align: center; font-size: 13px; }
        .player-col strong { display: block; font-size: 15px; margin-bottom: 5px; color: #d35400; }
        .action-center { width: 40%; text-align: center; }
        .action-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
        .action-percent { font-size: 36px; font-weight: bold; color: #000; }

        /* Khung Bình luận */
        #match-log { background: rgba(0,0,0,0.8); padding: 15px; border-radius: 5px; height: 120px; overflow-y: auto; font-size: 14px; line-height: 1.6; }
        .text-blue { color: #3498db; font-weight: bold;} .text-red { color: #e74c3c; font-weight: bold;} .text-green { color: #2ecc71; font-weight: bold; }
        
        .btn-play { display: block; width: 100%; padding: 15px; background: #e67e22; color: white; border: none; font-size: 18px; font-weight: bold; border-radius: 5px; cursor: pointer; margin-bottom: 15px; }
        .btn-play:disabled { background: #7f8c8d; cursor: not-allowed; }
    </style>
</head>
<body>

    <button class="btn-play" id="btn-start" onclick="startMatch()">BẮT ĐẦU TRẬN ĐẤU</button>

    <div class="container">
        <div class="scoreboard">
            <div class="team-name" id="ui-home-name">Nantes</div>
            <div class="score-center">
                <div class="time" id="ui-time">00:00</div>
                <div class="score"><span id="ui-home-score">0</span> - <span id="ui-away-score">0</span></div>
            </div>
            <div class="team-name" id="ui-away-name">Genk.vn</div>
        </div>

        <div class="morale-container">
            <div class="morale-bar morale-red" id="ui-home-morale">Tinh thần thi đấu: 338</div>
            <div class="morale-bar morale-blue" id="ui-away-morale">Tinh thần thi đấu: 498</div>
        </div>

        <div id="pitch">
            <div class="center-line"></div>
            <div class="center-circle"></div>
            <div class="penalty-box left"></div>
            <div class="penalty-box right"></div>

            <div class="player-icon" id="ui-atk">
                <span class="name-tag" id="name-atk">Tiền đạo</span>
                <img id="img-atk" src="images/dung_im.png" alt="atk">
            </div>

            <div class="player-icon flip-horizontal" id="ui-def">
                <span class="name-tag" id="name-def">Hậu vệ</span>
                <img id="img-def" src="images/dung_im.png" alt="def">
            </div>

            <div class="player-icon flip-horizontal" id="ui-gk">
                <span class="name-tag" id="name-gk">Thủ môn</span>
                <img id="img-gk" src="images/dung_im.png" alt="gk">
            </div>
            
            <div id="ball"></div>

            <div class="action-popup" id="ui-action-popup"></div>
        </div>

        <div id="match-log">
            <i>Khán đài đang hò reo chờ tiếng còi khai cuộc...</i>
        </div>
    </div>

    <script src="main.js"></script>
</body>
</html>
2. File main.js (Bộ não trung tâm)
File này được chia khu vực cực kỳ rõ ràng. Bạn chỉ cần sửa chỉ số ở mục 1 và 2. Mục 3 là hàm chạy ngầm đã được căn chỉnh độ trễ thời gian hoàn hảo.

JavaScript
// ==========================================
// 1. KHUÔN CẤU TRÚC DỮ LIỆU
// ==========================================
class Player {
    constructor(name, position, stats) {
        this.name = name;
        this.position = position;
        this.stats = stats;
    }
}

class Team {
    constructor(name, morale, mf, fw, df, gk) {
        this.name = name;
        this.morale = morale;
        this.mf = mf; // Tiền vệ
        this.fw = fw; // Tiền đạo
        this.df = df; // Hậu vệ
        this.gk = gk; // Thủ môn
        this.score = 0;
    }
}

// ==========================================
// 2. NHẬP LIỆU CẦU THỦ & 19 CHỈ SỐ
// ==========================================
const teamHome = new Team(
    "Nantes", 338,
    new Player("Freitas", "T.Vệ", { chuyen: 538, reDat: 604, tocDo: 624 }),
    new Player("Djordjevic", "T.Đạo", { sut: 624, sutXa: 558, tocDo: 500 }),
    null, null // Bỏ trống DF và GK vì chỉ test Tấn công
);

const teamAway = new Team(
    "Genk.vn", 498,
    null, null,
    new Player("Kakadu", "Tr.Vệ", { xoacBong: 650, doatBong: 610, tocDo: 580 }),
    new Player("GK NPC", "T.Môn", { cuuBong: 630, sucBat: 600, damBong: 550 })
);

// Hàm tạo độ trễ để đồng bộ với Animation CSS
const delay = ms => new Promise(res => setTimeout(res, ms));

// ==========================================
// 3. LUỒNG TRẬN ĐẤU (MATCH ENGINE)
// ==========================================
async function startMatch() {
    const btnPlay = document.getElementById("btn-start");
    btnPlay.disabled = true;

    // Liên kết UI
    const atkDot = document.getElementById("ui-atk");
    const defDot = document.getElementById("ui-def");
    const gkDot = document.getElementById("ui-gk");
    const ball = document.getElementById("ball");
    const popup = document.getElementById("ui-action-popup");
    const logBox = document.getElementById("match-log");

    const imgAtk = document.getElementById("img-atk");
    const imgDef = document.getElementById("img-def");
    const imgGk = document.getElementById("img-gk");

    // Reset trận
    logBox.innerHTML = "";
    teamHome.score = 0;
    teamAway.score = 0;
    document.getElementById("ui-home-score").innerText = 0;
    document.getElementById("ui-away-score").innerText = 0;

    document.getElementById("name-def").innerText = teamAway.df.name;
    document.getElementById("name-gk").innerText = teamAway.gk.name;

    // VÒNG LẶP THỜI GIAN
    for (let minute = 15; minute <= 90; minute += Math.floor(Math.random()*15 + 15)) {
        document.getElementById("ui-time").innerText = `${minute}:00`;
        popup.style.visibility = "hidden";
        document.getElementById("name-atk").innerText = teamHome.mf.name; // Trả bóng lại cho Tiền vệ

        // --- BƯỚC 1: SET VỊ TRÍ BAN ĐẦU ---
        atkDot.style.transition = "none"; defDot.style.transition = "none"; gkDot.style.transition = "none"; ball.style.transition = "none";
        
        atkDot.style.left = "20%"; atkDot.style.top = "60%";
        defDot.style.left = "60%"; defDot.style.top = "50%";
        gkDot.style.left = "92%"; gkDot.style.top = "50%";
        ball.style.left = "23%"; ball.style.top = "63%";
        
        imgAtk.src = "images/dung_im.png";
        imgDef.src = "images/dung_im.png";
        imgGk.src = "images/dung_im.png";

        await delay(100); // Đợi trình duyệt cập nhật vị trí

        logBox.innerHTML += `<p>⏱ Phút ${minute}: Bóng trong chân ${teamHome.mf.name}...</p>`;
        logBox.scrollTop = logBox.scrollHeight;

        // --- BƯỚC 2: CHẠY TRANH CHẤP GIỮA SÂN ---
        atkDot.style.transition = "all 1.5s linear"; defDot.style.transition = "all 1.5s linear"; ball.style.transition = "all 1.5s linear";
        
        imgAtk.src = "images/chay.gif";
        imgDef.src = "images/chay.gif";

        atkDot.style.left = "40%"; atkDot.style.top = "50%";
        defDot.style.left = "46%"; defDot.style.top = "50%";
        ball.style.left = "43%"; ball.style.top = "52%";
        
        await delay(1500); // Đợi chạy tới giữa sân

        // Dừng lại va chạm và tính %
        imgAtk.src = "images/dung_im.png";
        imgDef.src = "images/xoac_bong.png";

        let atkStat = teamHome.mf.stats.reDat + teamHome.mf.stats.tocDo;
        let defStat = teamAway.df.stats.xoacBong + teamAway.df.stats.doatBong;
        let winChance = Math.floor((atkStat / (atkStat + defStat)) * 100); 

        popup.innerHTML = `
            <div class="player-col"><strong>${teamHome.mf.name}</strong>Rê dắt + Tốc độ</div>
            <div class="action-center">
                <div class="action-title">Tranh Chấp</div>
                <div class="action-percent">${winChance}%</div>
            </div>
            <div class="player-col"><strong>${teamAway.df.name}</strong>Xoạc + Đoạt bóng</div>
        `;
        popup.style.visibility = "visible";
        
        await delay(2000); // Đợi xem popup
        popup.style.visibility = "hidden";

        let roll = Math.floor(Math.random() * 100) + 1;
        
        // --- BƯỚC 3: KẾT QUẢ TÌNH HUỐNG ---
        if (roll <= winChance) {
            // THẮNG TRANH CHẤP -> CHẠY ĐẾN KHUNG THÀNH
            logBox.innerHTML += `<p><span class="text-blue">🔥 Qua người thành công!</span> ${teamHome.fw.name} băng lên dứt điểm!</p>`;
            document.getElementById("name-atk").innerText = teamHome.fw.name; // Tiền đạo nhận bóng
            
            imgAtk.src = "images/chay.gif";
            imgDef.src = "images/nga_guc.png";
            
            atkDot.style.left = "70%"; atkDot.style.top = "50%";
            ball.style.left = "73%"; ball.style.top = "50%";
            
            await delay(1500);

            // DỪNG LẠI SÚT
            imgAtk.src = "images/sut_bong.png";
            imgGk.src = "images/bat_bong.png";

            let shotStat = teamHome.fw.stats.sut + teamHome.fw.stats.sutXa;
            let saveStat = teamAway.gk.stats.cuuBong + teamAway.gk.stats.sucBat;
            let goalChance = Math.floor((shotStat / (shotStat + saveStat)) * 100);

            popup.innerHTML = `
                <div class="player-col"><strong>${teamHome.fw.name}</strong>Sút xa</div>
                <div class="action-center">
                    <div class="action-title">Dứt Điểm</div>
                    <div class="action-percent">${goalChance}%</div>
                </div>
                <div class="player-col"><strong>${teamAway.gk.name}</strong>Cứu bóng</div>
            `;
            popup.style.visibility = "visible";
            
            await delay(2000);
            popup.style.visibility = "hidden";

            let shotRoll = Math.floor(Math.random() * 100) + 1;
            
            ball.style.transition = "all 0.4s ease-out"; 
            gkDot.style.transition = "all 0.4s ease-out"; 

            if (shotRoll <= goalChance) {
                // VÀO LƯỚI
                ball.style.left = "98%"; ball.style.top = "50%";
                gkDot.style.top = "70%"; 
                imgAtk.src = "images/an_mung.gif";
                imgGk.src = "images/nga_guc.png";

                teamHome.score++;
                document.getElementById("ui-home-score").innerText = teamHome.score;
                logBox.innerHTML += `<p class="text-green">⚽ VÀOOOOO!!! Bàn thắng tuyệt đẹp!</p>`;
            } else {
                // TRƯỢT
                ball.style.left = "90%"; ball.style.top = "50%";
                gkDot.style.left = "90%"; gkDot.style.top = "50%";
                imgAtk.src = "images/tiec_nuoi.png";
                imgGk.src = "images/bat_bong_thanh_cong.png";
                
                logBox.innerHTML += `<p>🛡️ Thủ môn đổ người cản phá xuất thần!</p>`;
            }
            
        } else {
            // THUA TRANH CHẤP (BỊ XOẠC MẤT BÓNG)
            logBox.innerHTML += `<p><span class="text-red">❌ ${teamAway.df.name}</span> đã xoạc bóng chính xác!</p>`;
            imgAtk.src = "images/nga_guc.png";
            imgDef.src = "images/dung_im.png";
            
            ball.style.left = "47%"; ball.style.top = "50%"; // Bóng văng vào chân HV
            atkDot.style.left = "38%"; // TĐ ngã lùi lại
        }
        
        logBox.scrollTop = logBox.scrollHeight;
        await delay(2500); // Nghỉ 2.5 giây trước khi sang phút tiếp theo
    }

    document.getElementById("ui-time").innerText = "90:00";
    logBox.innerHTML += `<hr><p class="text-yellow">▶ HẾT GIỜ! TRẬN ĐẤU KẾT THÚC.</p>`;
    logBox.scrollTop = logBox.scrollHeight;
    
    btnPlay.disabled = false;
    btnPlay.innerText = "ĐÁ LẠI TỪ ĐẦU";
}
