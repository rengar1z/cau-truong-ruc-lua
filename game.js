import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// --- CẤU HÌNH FIREBASE ---
const firebaseConfig = {
    // URL Realtime Database của bạn
    databaseURL: "https://cau-truong-ruc-lua-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- CLASS CẦU THỦ ---
class Player {
    constructor(name, type, stats) {
        this.name = name;
        this.type = type;
        this.stats = stats;
        this.awakeningGauge = 0;
    }

    getStat(statName) {
        let baseStat = this.stats[statName] || 500;
        if (this.awakeningGauge >= 100) {
            this.awakeningGauge = 0; 
            return { value: Math.round(baseStat * 1.5), isAwakened: true };
        }
        this.awakeningGauge += 25;
        return { value: baseStat, isAwakened: false };
    }
}

// --- BIẾN TOÀN CỤC TRẬN ĐẤU ---
let playersData = {};
let matchInterval;
let time = 0;
let homeScore = 0;
let awayScore = 0;

// --- HÀM 1: ĐẨY DỮ LIỆU MẪU LÊN FIREBASE (Nếu DB đang rỗng) ---
async function seedDatabaseIfEmpty() {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "players"));
    
    if (!snapshot.exists()) {
        console.log("Database rỗng, đang tạo dữ liệu mẫu...");
        const dummyPlayers = {
            "p_falcao": { name: "Falcao", type: "FW", stats: { sut: 602, reDat: 504, tocDo: 486 } },
            "p_cr7": { name: "CR7", type: "FW", stats: { sut: 624, reDat: 604, tocDo: 624 } },
            "p_chiellini": { name: "Chiellini", type: "DF", stats: { xoac: 550, doatBong: 520, theLuc: 500 } },
            "p_buffon": { name: "Buffon", type: "GK", stats: { batBong: 600, phanXa: 650 } }
        };
        await set(ref(db, "players"), dummyPlayers);
        return dummyPlayers;
    }
    return snapshot.val();
}

// --- HÀM 2: KHỞI TẠO GAME TỪ FIREBASE ---
async function initGame() {
    try {
        const rawData = await seedDatabaseIfEmpty();
        
        // Chuyển data JSON thành object Player
        for (const key in rawData) {
            let p = rawData[key];
            playersData[key] = new Player(p.name, p.type, p.stats);
        }

        document.getElementById("commentary-box").innerText = "Đã tải xong dữ liệu cầu thủ. Sẵn sàng!";
        const btnStart = document.getElementById("btn-start");
        btnStart.innerText = "BẮT ĐẦU TRẬN ĐẤU";
        btnStart.disabled = false;
        btnStart.addEventListener("click", startMatch);

    } catch (error) {
        console.error("Lỗi khởi tạo Firebase: ", error);
        document.getElementById("commentary-box").innerText = "Lỗi kết nối máy chủ!";
    }
}

// --- HÀM 3: VÒNG LẶP TRẬN ĐẤU ---
function startMatch() {
    document.getElementById("btn-start").style.display = "none";
    document.getElementById("event-title").innerText = "TRẬN ĐẤU BẮT ĐẦU!";
    document.getElementById("commentary-box").innerText = "Trọng tài nổi hồi còi khai cuộc!";
    
    matchInterval = setInterval(() => {
        time += 3; // Mỗi 1.5 giây ngoài đời = 3 phút trong game
        
        if (time > 90) {
            endMatch();
            return;
        }
        document.getElementById("match-time").innerText = time + ":00";

        // Tỷ lệ 40% có pha bóng nguy hiểm
        let hasEvent = Math.random() < 0.4; 

        if (hasEvent) {
            triggerRandomEvent();
        } else {
            const idleComments = [
                "Hai bên đang tranh chấp bóng quyết liệt ở giữa sân...",
                "Đội nhà đang tổ chức đập nhả chậm rãi.",
                "Một đường chuyền hỏng! Bóng lại thuộc về quyền kiểm soát của đối phương.",
                "Cầu thủ hai bên đều rất thận trọng thăm dò lẫn nhau."
            ];
            document.getElementById("commentary-box").innerText = idleComments[Math.floor(Math.random() * idleComments.length)];
        }
    }, 1500);
}

// --- HÀM 4: XỬ LÝ SỰ KIỆN ĐỤNG ĐỘ ---
function triggerRandomEvent() {
    const eventTypes = ["Cơ Hội Sút Gần", "Cơ Hội Rê Bóng Solo"];
    const currentEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    document.getElementById("event-title").innerText = currentEvent;

    let attacker, defender, atkStatName, defStatName;

    if (currentEvent === "Cơ Hội Sút Gần") {
        attacker = playersData["p_cr7"]; defStatName = "batBong";
        defender = playersData["p_buffon"]; atkStatName = "sut";
    } else {
        attacker = playersData["p_falcao"]; defStatName = "xoac";
        defender = playersData["p_chiellini"]; atkStatName = "reDat";
    }

    let atkPower = attacker.getStat(atkStatName);
    let defPower = defender.getStat(defStatName);

    updateUI("atk", attacker.name, atkPower);
    updateUI("def", defender.name, defPower);

    let totalPower = atkPower.value + defPower.value;
    let winProb = Math.round((atkPower.value / totalPower) * 100);
    document.getElementById("win-prob").innerText = winProb + "%";

    let roll = Math.floor(Math.random() * 100);
    let logText = "";

    if (roll < winProb) {
        if (currentEvent === "Cơ Hội Sút Gần") {
            homeScore++;
            document.getElementById("score-home").innerText = homeScore;
            logText = `VÀOOOOO! ${attacker.name} tung cú sút tuyệt đẹp hạ gục ${defender.name}!`;
        } else {
            logText = `${attacker.name} dùng kỹ thuật loại bỏ ${defender.name} dễ dàng, mở ra khoảng trống!`;
        }
    } else {
        if (currentEvent === "Cơ Hội Sút Gần") {
            logText = `KHÔNG VÀO! ${defender.name} bay người cản phá xuất thần cú sút của ${attacker.name}.`;
        } else {
            logText = `${defender.name} đã chuồi bóng chính xác, chặn đứng pha đi bóng của ${attacker.name}.`;
        }
    }
    document.getElementById("commentary-box").innerText = logText;
}

// --- HÀM 5: CẬP NHẬT UI ---
function updateUI(side, name, powerObj) {
    document.getElementById(`${side}-name`).innerText = name;
    document.getElementById(`${side}-stat`).innerText = powerObj.value;
    document.getElementById(`${side}-awaken`).style.display = powerObj.isAwakened ? "block" : "none";
}

// --- HÀM 6: KẾT THÚC TRẬN ---
function endMatch() {
    clearInterval(matchInterval);
    document.getElementById("match-time").innerText = "90:00";
    document.getElementById("event-title").innerText = "HẾT GIỜ!";
    document.getElementById("commentary-box").innerText = `Trận đấu kết thúc với tỷ số chung cuộc: ${homeScore} - ${awayScore}.`;
}

// --- CHẠY INIT KHI LOAD TRANG ---
window.onload = () => {
    initGame();
};
