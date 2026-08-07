import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// --- CẤU HÌNH FIREBASE ---
// NHỚ DÁN CONFIG ĐẦY ĐỦ CỦA BẠN VÀO ĐÂY!
const firebaseConfig = {
    apiKey: "DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY",
    authDomain: "cau-truong-ruc-lua.firebaseapp.com",
    databaseURL: "https://cau-truong-ruc-lua-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cau-truong-ruc-lua",
    storageBucket: "cau-truong-ruc-lua.appspot.com",
    messagingSenderId: "DÁN_SỐ_CỦA_BẠN_VÀO_ĐÂY",
    appId: "DÁN_APP_ID_CỦA_BẠN_VÀO_ĐÂY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- TỪ ĐIỂN DỊCH CHỈ SỐ RA TIẾNG VIỆT ĐỂ BÌNH LUẬN ---
const statNamesVN = {
    tocDo: "Tốc độ", sucBat: "Sức bật", theLuc: "Thể lực",
    sut: "Sút", reBong: "Rê bóng", chuyen: "Chuyền",
    danhDau: "Đánh đầu", doatBong: "Đoạt bóng", xoac: "Xoạc",
    chuyenDai: "Chuyền dài", sutXa: "Sút xa", phatGoc: "Phạt góc",
    batBong: "Bắt bóng", phanXa: "Phản xạ"
};

// --- CLASS CẦU THỦ ---
class Player {
    constructor(name, type, stats) {
        this.name = name;
        this.type = type;
        this.stats = stats;
        this.awakeningGauge = 0;
    }

    getStat(statKey) {
        let baseStat = this.stats[statKey] || 400; // Mặc định 400 nếu chưa set
        if (this.awakeningGauge >= 100) {
            this.awakeningGauge = 0; 
            return { value: Math.round(baseStat * 1.5), isAwakened: true, key: statKey };
        }
        this.awakeningGauge += 25;
        return { value: baseStat, isAwakened: false, key: statKey };
    }
}

// --- BIẾN TOÀN CỤC TRẬN ĐẤU ---
let playersData = {};
let matchInterval;
let time = 0;
let homeScore = 0;
let awayScore = 0;

// --- HÀM 1: ĐẨY DỮ LIỆU MẪU CÓ ĐỦ 12 CHỈ SỐ LÊN FIREBASE ---
async function seedDatabaseIfEmpty() {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "players"));
    
    if (!snapshot.exists()) {
        console.log("Database rỗng, đang tạo dữ liệu 12 chỉ số...");
        const dummyPlayers = {
            "p_falcao": { 
                name: "Falcao", type: "FW", 
                stats: { 
                    tocDo: 486, sucBat: 538, theLuc: 538, sut: 602, reBong: 504, chuyen: 486, 
                    danhDau: 538, doatBong: 279, xoac: 225, chuyenDai: 522, sutXa: 504, phatGoc: 333 
                } 
            },
            "p_cr7": { 
                name: "CR7", type: "FW", 
                stats: { 
                    tocDo: 624, sucBat: 459, theLuc: 522, sut: 624, reBong: 604, chuyen: 538, 
                    danhDau: 468, doatBong: 324, xoac: 298, chuyenDai: 396, sutXa: 558, phatGoc: 302 
                } 
            },
            "p_chiellini": { 
                name: "Chiellini", type: "DF", 
                stats: { 
                    tocDo: 400, sucBat: 500, theLuc: 550, sut: 200, reBong: 300, chuyen: 450, 
                    danhDau: 580, doatBong: 620, xoac: 650, chuyenDai: 400, sutXa: 150, phatGoc: 100 
                } 
            },
            "p_buffon": { 
                name: "Buffon", type: "GK", 
                stats: { 
                    tocDo: 300, sucBat: 600, theLuc: 500, sut: 100, reBong: 150, chuyen: 400, 
                    danhDau: 200, doatBong: 100, xoac: 100, chuyenDai: 500, sutXa: 50, phatGoc: 50,
                    batBong: 680, phanXa: 700 
                } 
            }
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
        for (const key in rawData) {
            let p = rawData[key];
            playersData[key] = new Player(p.name, p.type, p.stats);
        }

        document.getElementById("commentary-box").innerText = "Đã nạp thành công bộ 12 chỉ số. Sẵn sàng!";
        const btnStart = document.getElementById("btn-start");
        btnStart.innerText = "BẮT ĐẦU TRẬN ĐẤU";
        btnStart.disabled = false;
        btnStart.addEventListener("click", startMatch);
    } catch (error) {
        console.error(error);
        document.getElementById("commentary-box").innerText = "Lỗi kết nối máy chủ!";
    }
}

// --- HÀM 3: VÒNG LẶP TRẬN ĐẤU ---
function startMatch() {
    document.getElementById("btn-start").style.display = "none";
    document.getElementById("event-title").innerText = "TRẬN ĐẤU BẮT ĐẦU!";
    document.getElementById("commentary-box").innerText = "Trọng tài nổi hồi còi khai cuộc!";
    
    matchInterval = setInterval(() => {
        time += 3; 
        
        if (time > 90) {
            endMatch();
            return;
        }
        document.getElementById("match-time").innerText = time + ":00";

        let hasEvent = Math.random() < 0.4; 

        if (hasEvent) {
            triggerRandomEvent();
        } else {
            const idleComments = [
                "Hai bên đang tranh chấp bóng quyết liệt ở giữa sân...",
                "Đội nhà đang tổ chức đập nhả chậm rãi.",
                "Một đường chuyền dài vượt tuyến nhưng không thành công.",
                "Cầu thủ hai bên đều rất thận trọng thăm dò lẫn nhau.",
                "Trận đấu đang diễn ra với tốc độ khá chậm."
            ];
            document.getElementById("commentary-box").innerText = idleComments[Math.floor(Math.random() * idleComments.length)];
        }
    }, 1500);
}

// --- HÀM 4: XỬ LÝ SỰ KIỆN ĐỤNG ĐỘ ĐA DẠNG ---
function triggerRandomEvent() {
    // 6 kịch bản đa dạng dựa trên 12 chỉ số
    const events = [
        { name: "Cơ Hội Sút Gần", atkStat: "sut", defStat: "phanXa", isVsGk: true },
        { name: "Sút Xa Bất Ngờ", atkStat: "sutXa", defStat: "batBong", isVsGk: true },
        { name: "Đánh Đầu Cận Thành", atkStat: "danhDau", defStat: "sucBat", isVsGk: true },
        { name: "Cơ Hội Rê Bóng Solo", atkStat: "reBong", defStat: "xoac", isVsGk: false },
        { name: "Đua Tốc Độ", atkStat: "tocDo", defStat: "tocDo", isVsGk: false },
        { name: "Tranh Chấp Tay Đôi", atkStat: "theLuc", defStat: "doatBong", isVsGk: false }
    ];

    const currentEvent = events[Math.floor(Math.random() * events.length)];
    document.getElementById("event-title").innerText = currentEvent.name;

    const fwKeys = Object.keys(playersData).filter(k => playersData[k].type === "FW");
    const dfKeys = Object.keys(playersData).filter(k => playersData[k].type === "DF");
    const gkKeys = Object.keys(playersData).filter(k => playersData[k].type === "GK");

    let attackerKey = fwKeys[Math.floor(Math.random() * fwKeys.length)] || Object.keys(playersData)[0];
    let attacker = playersData[attackerKey];

    let defenderKey;
    if (currentEvent.isVsGk && gkKeys.length > 0) {
        defenderKey = gkKeys[Math.floor(Math.random() * gkKeys.length)];
    } else if (dfKeys.length > 0) {
        defenderKey = dfKeys[Math.floor(Math.random() * dfKeys.length)];
    } else {
        defenderKey = Object.keys(playersData)[1];
    }
    let defender = playersData[defenderKey];

    let atkPower = attacker.getStat(currentEvent.atkStat);
    let defPower = defender.getStat(currentEvent.defStat);

    updateUI("atk", attacker.name, atkPower);
    updateUI("def", defender.name, defPower);

    let totalPower = atkPower.value + defPower.value;
    let winProb = totalPower > 0 ? Math.round((atkPower.value / totalPower) * 100) : 50;
    document.getElementById("win-prob").innerText = winProb + "%";

    let roll = Math.floor(Math.random() * 100);
    let logText = "";

    if (roll < winProb) {
        if (currentEvent.isVsGk) {
            homeScore++;
            document.getElementById("score-home").innerText = homeScore;
            logText = `VÀOOOOO! ${attacker.name} chiến thắng ${defender.name} nhờ khả năng [${statNamesVN[atkPower.key]}] xuất thần!`;
        } else {
            logText = `Tuyệt vời! ${attacker.name} vượt qua ${defender.name} dễ dàng nhờ chỉ số [${statNamesVN[atkPower.key]}] vượt trội.`;
        }
    } else {
        if (currentEvent.isVsGk) {
            logText = `KHÔNG VÀO! ${defender.name} cứu thua xuất sắc bằng kỹ năng [${statNamesVN[defPower.key]}].`;
        } else {
            logText = `${defender.name} đã dùng [${statNamesVN[defPower.key]}] chặn đứng pha tấn công của ${attacker.name}.`;
        }
    }
    document.getElementById("commentary-box").innerText = logText;
}

// --- HÀM 5: CẬP NHẬT GIAO DIỆN CHỈ SỐ ---
function updateUI(side, name, powerObj) {
    document.getElementById(`${side}-name`).innerText = name;
    // Tự động thay đổi text hiển thị thành tên chỉ số tương ứng
    const statNameVN = statNamesVN[powerObj.key] || powerObj.key;
    document.getElementById(`${side}-stat-desc`).innerHTML = `${statNameVN}: <span id="${side}-stat">${powerObj.value}</span>`;
    
    document.getElementById(`${side}-awaken`).style.display = powerObj.isAwakened ? "block" : "none";
}

// --- HÀM 6: KẾT THÚC TRẬN ---
function endMatch() {
    clearInterval(matchInterval);
    document.getElementById("match-time").innerText = "90:00";
    document.getElementById("event-title").innerText = "HẾT GIỜ!";
    document.getElementById("commentary-box").innerText = `Trận đấu kết thúc với tỷ số chung cuộc: ${homeScore} - ${awayScore}.`;
}

window.onload = () => { initGame(); };
