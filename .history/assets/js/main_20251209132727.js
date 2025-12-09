// ====== VALIDATE ======
function setError(id, msg) {
  const el = document.getElementById(id + "_err");
  if (el) el.innerText = msg;
}
function clearError(id) {
  const el = document.getElementById(id + "_err");
  if (el) el.innerText = "";
}
function validateField(id) {
  const el = document.getElementById(id);
  if (!el) return true;
  const value = el.value.trim();
  switch (id) {
    case "men":
    case "women":
      if (value === "" || isNaN(value) || parseInt(value) < 0) {
        setError(id, "Giá trị phải ≥ 0");
        return false;
      }
      const men = parseInt(document.getElementById("men").value) || 0;
      const women = parseInt(document.getElementById("women").value) || 0;
      if (men === 0 && women === 0) {
        setError(id, "Nam + Nữ phải ≥ 1");
        return false;
      }
      break;

    case "courtTotal":
      if (value === "" || isNaN(value) || parseInt(value) < 0) {
        setError(id, "Tiền sân phải ≥ 0");
        return false;
      }
      break;

    case "shuttleCount":
      if (value === "" || isNaN(value) || parseInt(value) < 0) {
        setError(id, "Số lượng cầu phải ≥ 0");
        return false;
      }
      break;

    case "pricePerShuttle":
      if (value === "" || isNaN(value) || parseInt(value) < 0) {
        setError(id, "Tiền 1 trái cầu phải ≥ 0");
        return false;
      }
      break;

    default:
      break;
  }
  clearError(id);
  return true;
}

["men", "women", "courtTotal", "shuttleCount", "pricePerShuttle"].forEach(
  (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      validateField(id);
      if (id === "men" || id === "women") {
        const otherId = id === "men" ? "women" : "men";
        validateField(otherId);
      }
    });
  }
);

// ====== UTILS ======
function roundUpToThousand(num) {
  return Math.ceil(num / 1000) * 1000;
}

// ====== TỐI ƯU CHIA (CHÊNH LỆCH MẶC ĐỊNH 5k) ======
function findOptimalSplit(total, men, women) {
  const targetDiff = 5000; // 5k
  let perWomanRaw = (total - targetDiff * men) / (men + women);
  let perWoman = roundUpToThousand(perWomanRaw);
  let perMan = roundUpToThousand(perWoman + targetDiff);
  if (perMan - perWoman < targetDiff) {
    perMan = perWoman + targetDiff;
    perMan = roundUpToThousand(perMan);
  }
  let actualTotal = perMan * men + perWoman * women;
  while (actualTotal < total) {
    perWoman += 1000;
    perMan = perWoman + targetDiff;
    perWoman = roundUpToThousand(perWoman);
    perMan = roundUpToThousand(perMan);
    actualTotal = perMan * men + perWoman * women;
    if (perWoman > total + 1000000) break;
  }
  return {
    perMan: perMan,
    perWoman: perWoman,
    actualTotal: actualTotal,
    genderDiff: perMan - perWoman,
  };
}

// ====== MEMBER UI ======
let memberIdCounter = 0;
const memberContainer = document.getElementById("memberContainer");
document.getElementById("addMemberBtn").addEventListener("click", addMemberRow);
function addMemberRow(init = {}) {
  memberIdCounter++;
  const id = "member_" + memberIdCounter;
  const row = document.createElement("div");
  row.className = "member-row";
  row.id = id;
  row.innerHTML = `\n    <input class="small" type="text" placeholder="Tên (tùy chọn)" data-field="name" />\n    <select data-field="gender">\n      <option value="man">Nam</option>\n      <option value="woman">Nữ</option>\n    </select>\n    <input class="small" type="number" min="0" step="1" placeholder="Phút thiếu" data-field="minutes" />\n    <button type="button" class="remove-btn" title="Xóa">X</button>\n  `;
  memberContainer.appendChild(row);
  const btn = row.querySelector(".remove-btn");
  btn.addEventListener("click", () => row.remove());
  if (init.name) row.querySelector('[data-field="name"]').value = init.name;
  if (init.gender)
    row.querySelector('[data-field="gender"]').value = init.gender;
  if (init.minutes !== undefined)
    row.querySelector('[data-field="minutes"]').value = init.minutes;
}

// ====== MODAL HELPERS ======
function openModal() {
  document.getElementById("resultModal").classList.remove("hidden");
}
function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
}
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("closeModalBtn").addEventListener("click", closeModal);

// ====== CALCULATE ======
document.getElementById("calculateBtn").addEventListener("click", function () {
  let ok = true;
  const ids = ["men", "women", "courtTotal", "shuttleCount", "pricePerShuttle"];
  ids.forEach((id) => {
    if (!validateField(id)) ok = false;
  });
  if (!ok) return;

  const men = parseInt(document.getElementById("men").value) || 0;
  const women = parseInt(document.getElementById("women").value) || 0;
  const courtTotal = parseInt(document.getElementById("courtTotal").value) || 0;
  const scount = parseInt(document.getElementById("shuttleCount").value) || 0;
  const pShut = parseInt(document.getElementById("pricePerShuttle").value) || 0;
  const shuttleCost = scount * pShut;
  const totalProjected = courtTotal + shuttleCost;

  let perMan = 0,
    perWoman = 0,
    actualTotal = 0;
  if (men > 0 && women > 0) {
    const solution = findOptimalSplit(totalProjected, men, women);
    perMan = solution.perMan;
    perWoman = solution.perWoman;
    actualTotal = solution.actualTotal;
  } else if (men > 0) {
    perMan = roundUpToThousand(totalProjected / men);
    actualTotal = perMan * men;
  } else {
    perWoman = roundUpToThousand(totalProjected / women);
    actualTotal = perWoman * women;
  }

  const memberRows = Array.from(
    memberContainer.querySelectorAll(".member-row")
  );
  const members = memberRows.map((r) => ({
    name: r.querySelector('[data-field="name"]').value || "",
    gender: r.querySelector('[data-field="gender"]').value,
    minutes: parseInt(r.querySelector('[data-field="minutes"]').value) || 0,
  }));

  let menRemaining = men;
  let womenRemaining = women;
  let adjustedTotal = 0;
  const memberResults = [];
  members.forEach((m) => {
    let base = m.gender === "man" ? perMan : perWoman;
    const steps = Math.floor(m.minutes / 30);
    const reduction = steps * 5000;
    const adjusted = Math.max(0, base - reduction);
    memberResults.push({
      name: m.name,
      gender: m.gender,
      base,
      minutes: m.minutes,
      reduction,
      adjusted,
    });
    adjustedTotal += adjusted;
    if (m.gender === "man") menRemaining--;
    else womenRemaining--;
  });

  adjustedTotal += menRemaining > 0 ? menRemaining * perMan : 0;
  adjustedTotal += womenRemaining > 0 ? womenRemaining * perWoman : 0;

  // Build modal content (remove "Tổng chia theo Nam/Nữ (sau làm tròn)" và "Danh sách thanh toán")
  let html = `<b>Chi tiết chi phí:</b><br>`;
  html += `• Tiền sân (tổng): ${courtTotal.toLocaleString("vi-VN")} VND<br>`;
  html += `• Tiền cầu: ${scount} × ${pShut.toLocaleString(
    "vi-VN"
  )}đ = ${shuttleCost.toLocaleString("vi-VN")} VND<br><br>`;
  html += `<b>Tổng dự kiến:</b> ${totalProjected.toLocaleString(
    "vi-VN"
  )} VND<br>`;
  html += `<b>Tiền mỗi Nam (base):</b> ${perMan.toLocaleString(
    "vi-VN"
  )} đ (x${men})<br>`;
  html += `<b>Tiền mỗi Nữ (base):</b> ${perWoman.toLocaleString(
    "vi-VN"
  )} đ (x${women})<br>`;
  html += `<b>Chênh lệch Nam/Nữ (base):</b> ${(
    perMan - perWoman
  ).toLocaleString("vi-VN")} đ<br><br>`;

  if (memberResults.length > 0) {
    html += `<b>Điều chỉnh cá nhân (giảm 5k/30 phút):</b><br>`;
    memberResults.forEach((m) => {
      html += `• ${
        m.name || (m.gender === "man" ? "Nam" : "Nữ")
      }: base ${m.base.toLocaleString("vi-VN")}đ, -${m.reduction.toLocaleString(
        "vi-VN"
      )}đ (tương đương ${m.minutes} phút) → ${m.adjusted.toLocaleString(
        "vi-VN"
      )}đ<br>`;
    });
    html += `<br>`;
  }

  html += `<b>Tổng thực thu sau điều chỉnh cá nhân:</b> ${adjustedTotal.toLocaleString(
    "vi-VN"
  )} VND<br>`;
  const diff = adjustedTotal - totalProjected;
  const diffLabel =
    diff >= 0
      ? `+${diff.toLocaleString("vi-VN")}`
      : `${diff.toLocaleString("vi-VN")}`;
  html += `<b>Chênh lệch so với dự kiến:</b> ${diffLabel} VND<br>`;

  document.getElementById("result").innerHTML = html;
  openModal();
});
