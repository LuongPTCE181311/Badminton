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

  return { perMan, perWoman, actualTotal, genderDiff: perMan - perWoman };
}

// ====== MEMBER UI ======
let memberIdCounter = 0;
const memberContainer = document.getElementById("memberContainer");
document
  .getElementById("addMemberBtn")
  .addEventListener("click", () => addMemberRow());
function addMemberRow(init = {}) {
  memberIdCounter++;
  const id = "member_" + memberIdCounter;
  const row = document.createElement("div");
  row.className = "member-row";
  row.id = id;
  row.innerHTML = `
    <input class="small" type="text" placeholder="Tên (tùy chọn)" data-field="name" />
    <select data-field="gender">
      <option value="man">Nam</option>
      <option value="woman">Nữ</option>
    </select>
    <input class="small" type="number" min="0" step="1" placeholder="Phút thiếu" data-field="minutes" />
    <button type="button" class="remove-btn" title="Xóa">X</button>
  `;
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
const closeBtn = document.getElementById("closeModal");
if (closeBtn) closeBtn.addEventListener("click", closeModal);
const closeBtn2 = document.getElementById("closeModalBottom");
if (closeBtn2) closeBtn2.addEventListener("click", closeModal);

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

  // Gather declared members and their requested reductions (steps*5000)
  const memberRows = Array.from(
    memberContainer.querySelectorAll(".member-row")
  );
  const members = memberRows.map((r) => {
    const name = r.querySelector('[data-field="name"]').value || "";
    const gender = r.querySelector('[data-field="gender"]').value;
    const minutes =
      parseInt(r.querySelector('[data-field="minutes"]').value) || 0;
    const steps = Math.floor(minutes / 30);
    const requestedReduction = steps * 5000;
    return { name, gender, minutes, steps, requestedReduction };
  });

  // Sum of requested reductions (initial)
  let totalRequestedReductions = members.reduce(
    (s, m) => s + m.requestedReduction,
    0
  );

  // We need to ensure bases are set so that:
  // perMan*men + perWoman*women >= totalProjected + effectiveReductions
  // We don't yet know effectiveReductions (because reductions cannot exceed base), so iterate to stabilize.
  let perMan = 0,
    perWoman = 0,
    actualTotal = 0;
  let totalNeeded = totalProjected + totalRequestedReductions;
  // If there are no declared members, totalRequestedReductions = 0 and it's simple.
  const maxIter = 8;
  for (let iter = 0; iter < maxIter; iter++) {
    if (men > 0 && women > 0) {
      const solution = findOptimalSplit(totalNeeded, men, women);
      perMan = solution.perMan;
      perWoman = solution.perWoman;
      actualTotal = solution.actualTotal; // this is perMan*men + perWoman*women
    } else if (men > 0) {
      perMan = roundUpToThousand(totalNeeded / men);
      perWoman = 0;
      actualTotal = perMan * men;
    } else {
      perWoman = roundUpToThousand(totalNeeded / women);
      perMan = 0;
      actualTotal = perWoman * women;
    }

    // Compute effective reductions (cannot exceed base for each member)
    let effectiveReductions = 0;
    members.forEach((m) => {
      const base = m.gender === "man" ? perMan : perWoman;
      const effective = Math.min(m.requestedReduction, base); // reduction cannot be more than base
      effectiveReductions += effective;
    });

    const newTotalNeeded = totalProjected + effectiveReductions;
    // If stabilized (no change) then break
    if (newTotalNeeded === totalNeeded) {
      totalRequestedReductions = effectiveReductions;
      totalNeeded = newTotalNeeded;
      break;
    }
    // Otherwise update and iterate
    totalRequestedReductions = effectiveReductions;
    totalNeeded = newTotalNeeded;
    // continue loop with updated totalNeeded
  }

  // After stabilization, actualTotal is perMan*men + perWoman*women
  // Adjusted total actually collected after member reductions:
  const adjustedTotal = actualTotal - totalRequestedReductions;

  // displayed diff (>=0)
  const displayedDiff = Math.max(0, adjustedTotal - totalProjected);

  // Build memberResults with effective reductions
  let menRemaining = men;
  let womenRemaining = women;
  const memberResults = [];
  members.forEach((m) => {
    const base = m.gender === "man" ? perMan : perWoman;
    const effective = Math.min(m.requestedReduction, base);
    const adjusted = Math.max(0, base - effective);
    memberResults.push({
      name: m.name,
      gender: m.gender,
      base,
      minutes: m.minutes,
      requestedReduction: m.requestedReduction,
      effectiveReduction: effective,
      adjusted,
    });
    if (m.gender === "man") menRemaining--;
    else womenRemaining--;
  });

  // Build modal content
  let html = `<b>Chi tiết chi phí:</b><br>`;
  html += `• Tiền sân (tổng): ${courtTotal.toLocaleString("vi-VN")} VND<br>`;
  html += `• Tiền cầu: ${scount} × ${pShut.toLocaleString(
    "vi-VN"
  )}đ = ${shuttleCost.toLocaleString("vi-VN")} VND<br><br>`;
  html += `<b>Tổng dự kiến:</b> ${totalProjected.toLocaleString(
    "vi-VN"
  )} VND<br>`;
  html += `<b>Tiền mỗi Nam:</b> ${perMan.toLocaleString(
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
      }: ${m.base.toLocaleString(
        "vi-VN"
      )}đ, -${m.effectiveReduction.toLocaleString(
        "vi-VN"
      )}đ (yêu cầu ${m.requestedReduction.toLocaleString("vi-VN")}đ cho ${
        m.minutes
      } phút) → ${m.adjusted.toLocaleString("vi-VN")}đ<br>`;
    });
    html += `<br>`;
  }

  html += `<b>Tổng thực thu sau điều chỉnh cá nhân:</b> ${adjustedTotal.toLocaleString(
    "vi-VN"
  )} VND<br>`;
  html += `<b>Chênh lệch so với dự kiến:</b> ${displayedDiff.toLocaleString(
    "vi-VN"
  )} VND<br>`;

  // Set content and open modal
  const content = document.getElementById("resultContent");
  content.innerHTML = html;
  openModal();
});
