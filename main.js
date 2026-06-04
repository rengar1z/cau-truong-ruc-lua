// 1. Dữ liệu cầu thủ
let player = {
    name: "Ibrahimovic",
    stars: 4,
    trainingPoints: 500, // Điểm để cộng vào chỉ số (Giống Đặc huấn)
    
    // Khai báo các chỉ số: giá trị hiện tại và giới hạn tối đa (max)
    stats: {
        speed: { label: "Tốc độ", value: 35.8, max: 94.6 },
        jumping: { label: "Sức bật", value: 35.0, max: 81.2 },
        stamina: { label: "Thể lực", value: 42.4, max: 106.5 },
        shooting: { label: "Sút xa", value: 50.1, max: 101.5 },
        dribbling: { label: "Rê dắt", value: 51.4, max: 104.6 },
        passing: { label: "Chuyền", value: 40.4, max: 89.2 }
    }
};

// 2. Hàm tính tổng Thực lực
function calculateTotalPower() {
    let total = 0;
    for (let key in player.stats) {
        total += player.stats[key].value;
    }
    return (total).toFixed(1);
}

// 3. Hàm Render giao diện
function renderUI() {
    // Cập nhật thông tin cơ bản
    document.getElementById("ui-train-points").innerText = player.trainingPoints;
    document.getElementById("ui-total-power").innerText = calculateTotalPower();

    const statsContainer = document.getElementById("ui-stats-container");
    statsContainer.innerHTML = ""; // Xóa dữ liệu cũ

    // Lặp qua từng chỉ số để tạo HTML
    for (let key in player.stats) {
        let stat = player.stats[key];
        
        // Tính % để vẽ thanh bar màu xanh lá
        let percent = (stat.value / stat.max) * 100;

        // HTML cho 1 hàng chỉ số
        let row = document.createElement("div");
        row.className = "stat-row";
        
        // Nút cộng điểm bị vô hiệu hóa nếu hết điểm huấn luyện hoặc đã max chỉ số
        let disableBtn = (player.trainingPoints <= 0 || stat.value >= stat.max) ? "disabled" : "";

        row.innerHTML = `
            <div class="stat-name">${stat.label}</div>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" style="width: ${percent}%"></div>
            </div>
            <div class="stat-value">${stat.value.toFixed(1)}</div>
            <button class="btn-train" ${disableBtn} onclick="trainStat('${key}')">+</button>
        `;

        statsContainer.appendChild(row);
    }
}

// 4. Hàm xử lý khi bấm nút "Cộng điểm" (+)
function trainStat(statKey) {
    let stat = player.stats[statKey];
    const cost = 10; // Mỗi lần bấm tốn 10 điểm huấn luyện
    const gain = 1.5; // Mỗi lần bấm tăng 1.5 chỉ số

    if (player.trainingPoints >= cost && stat.value < stat.max) {
        // Trừ điểm và tăng chỉ số
        player.trainingPoints -= cost;
        stat.value += gain;

        // Đảm bảo không vượt quá Max
        if (stat.value > stat.max) {
            stat.value = stat.max;
        }

        // Gọi lại hàm render để cập nhật màn hình lập tức
        renderUI();
    } else {
        alert("Không đủ điểm huấn luyện hoặc chỉ số đã đạt giới hạn Max!");
    }
}

// Khởi chạy lần đầu khi vừa mở trang
renderUI();