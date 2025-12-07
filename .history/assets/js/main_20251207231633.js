// ===================== VALIDATION =========================

function setError(id, message) {
  const input = document.getElementById(id);
  const err = document.getElementById(id + "_err");
  err.textContent = message;
  input.classList.add("error-border");
}

function clearError(id) {
  const input = document.getElementById(id);
  const err = document.getElementById(id + "_err");
  err.textContent = "";
  input.classList.remove("error-border");
}

function validateField(id) {
  const value = document.getElementById(id).value.trim();

  switch (id) {
    case "men":
    case "women":
      if (value === "" || isNaN(value) || parseInt(value) < 0) {
        setError(id, "Giá trị phải ≥ 0");
        return false;
      }
      // Kiểm tra cả nam và nữ đều là 0
      const men = parseInt(document.getElementById("men").value) || 0;
      const women = parseInt(document.getElementById("women").value) || 0;
      if (men === 0 && women === 0) {
        setError(id, "Nam + Nữ phải ≥ 1");
        return false;
      }
      break;

    case "courts":
      if (value === "" || isNaN(value) || parseInt(value) <= 0) {
        setError(id, "Số sân phải > 0");
        return false;
      }
      break;

    case "hours":
      if (value === "" || isNaN(value) || parseFloat(value) <= 0) {
        setError(id, "Số giờ phải > 0 (cho phép thập phân)");
        return false;
      }
      break;

    case "pricePerHour":
      if (value === "" || isNaN(value) || parseInt(value) < 1000) {
        setError(id, "Tiền / giờ phải ≥ 1000đ");
        return false;
      }
      break;

    case "shuttleCount":
      if (value === "" || isNaN(value) || parseInt(value) <= 0) {
        setError(id, "Số lượng cầu phải > 0");
        return false;
      }
      break;

    case "pricePerShuttle":
      if (value === "" || isNaN(value) || parseInt(value) < 1000) {
        setError(id, "Tiền 1 trái cầu phải ≥ 1000đ");
        return false;
      }
      break;
  }

  clearError(id);
  return true;
}

// Gắn validate realtime
[
  "men",
  "women",
  "courts",
  "hours",
  "pricePerHour",
  "shuttleCount",
  "pricePerShuttle",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    validateField(id);
    // Khi thay đổi nam hoặc nữ, validate cả 2 trường
    if (id === "men" || id === "women") {
      const otherId = id === "men" ? "women" : "men";
      validateField(otherId);
    }
  });
});

// ===================== MODAL =========================

function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
}

function openModal() {
  document.getElementById("resultModal").classList.remove("hidden");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

function roundUpToThousand(num) {
  return Math.ceil(num / 1000) * 1000;
}

// ===================== THUẬT TOÁN TỐI ƯU =========================

function findOptimalSplit(total, men, women) {
  let bestSolution = null;
  let minDifference = Infinity; 
  for (let targetDiff = 3000; targetDiff <= 5000; targetDiff += 1000) {
    let perWoman = (total - targetDiff * men) / (men + women);
    let perMan = perWoman + targetDiff;
    perWoman = roundUpToThousand(perWoman);
    perMan = roundUpToThousand(perMan);
    while (perMan - perWoman < 3000) {
      perMan += 1000;
    }
    while (perMan - perWoman > 5000) {
      perWoman += 1000;
    }
    let actualTotal = perMan * men + perWoman * women;
    while (actualTotal < total) {
      const option1Woman = perWoman + 1000;
      const option1Total = perMan * men + option1Woman * women;
      if (perMan - option1Woman < 3000) {
        perMan += 1000;
      }
      perWoman = option1Woman;
      actualTotal = perMan * men + perWoman * women;
    }
    const genderDiff = perMan - perWoman;
    if (genderDiff < 3000 || genderDiff > 5000) {
      continue;
    }
    const difference = actualTotal - total;
    if (difference < minDifference) {
      minDifference = difference;
      bestSolution = {
        perMan: perMan,
        perWoman: perWoman,
        actualTotal: actualTotal,
        genderDiff: genderDiff,
      };
    }
  }

  return bestSolution;
}

// ===================== CALCULATE =========================

document.getElementById("calculateBtn").addEventListener("click", function () {
  let ok = true;
  const ids = [
    "men",
    "women",
    "courts",
    "hours",
    "pricePerHour",
    "shuttleCount",
    "pricePerShuttle",
  ];

  ids.forEach((id) => {
    if (!validateField(id)) ok = false;
  });

  if (!ok) return;

  const men = parseInt(document.getElementById("men").value) || 0;
  const women = parseInt(document.getElementById("women").value) || 0;
  const courts = parseInt(document.getElementById("courts").value);
  const hours = parseFloat(document.getElementById("hours").value);
  const pHour = parseInt(document.getElementById("pricePerHour").value);
  const scount = parseInt(document.getElementById("shuttleCount").value);
  const pShut = parseInt(document.getElementById("pricePerShuttle").value);

  const courtCost = courts * hours * pHour;
  const shuttleCost = scount * pShut;
  const total = courtCost + shuttleCost;

  let perMan = 0,
    perWoman = 0,
    actualTotal = 0;

  if (men > 0 && women > 0) {
    const solution = findOptimalSplit(total, men, women);
    perMan = solution.perMan;
    perWoman = solution.perWoman;
    actualTotal = solution.actualTotal;

    document.getElementById("result").innerHTML = `
        <b>Chi tiết chi phí:</b><br>
        • Tiền sân: ${courts} sân × ${hours}h × ${pHour.toLocaleString(
      "vi-VN"
    )}đ = ${courtCost.toLocaleString("vi-VN")} VND<br>
        • Tiền cầu: ${scount} cầu × ${pShut.toLocaleString(
      "vi-VN"
    )}đ = ${shuttleCost.toLocaleString("vi-VN")} VND<br><br>

        <b>Tổng dự kiến:</b> ${total.toLocaleString("vi-VN")} VND<br>
        <b>Tổng thực tế:</b> ${actualTotal.toLocaleString("vi-VN")} VND<br>
        <b>Chênh lệch tổng:</b> +${(actualTotal - total).toLocaleString(
          "vi-VN"
        )} VND<br><br>

        <b>Tiền mỗi nam:</b> <b>${perMan.toLocaleString(
          "vi-VN"
        )} đ </b>(x${men})<br>
        <b>Tiền mỗi nữ:</b> <b>${perWoman.toLocaleString(
          "vi-VN"
        )} đ </b>(x${women})<br><br>

        <b>Chênh lệch Nam/Nữ:</b> ${(perMan - perWoman).toLocaleString(
          "vi-VN"
        )} đ
    `;
  } else if (men > 0) {
    perMan = roundUpToThousand(total / men);
    actualTotal = perMan * men;

    document.getElementById("result").innerHTML = `
        <b>Chi tiết chi phí:</b><br>
        • Tiền sân: ${courts} sân × ${hours}h × ${pHour.toLocaleString(
      "vi-VN"
    )}đ = ${courtCost.toLocaleString("vi-VN")} VND<br>
        • Tiền cầu: ${scount} cầu × ${pShut.toLocaleString(
      "vi-VN"
    )}đ = ${shuttleCost.toLocaleString("vi-VN")} VND<br><br>

        <b>Tổng dự kiến:</b> ${total.toLocaleString("vi-VN")} VND<br>
        <b>Tổng thực tế:</b> ${actualTotal.toLocaleString("vi-VN")} VND<br>
        <b>Chênh lệch:</b> +${(actualTotal - total).toLocaleString(
          "vi-VN"
        )} VND<br><br>

        <b>Tiền mỗi nam:</b> <b> ${perMan.toLocaleString(
          "vi-VN"
        )} đ </b>(x${men})
    `;
  } else {
    perWoman = roundUpToThousand(total / women);
    actualTotal = perWoman * women;

    document.getElementById("result").innerHTML = `
        <b>Chi tiết chi phí:</b><br>
        • Tiền sân: ${courts} sân × ${hours}h × ${pHour.toLocaleString(
      "vi-VN"
    )}đ = ${courtCost.toLocaleString("vi-VN")} VND<br>
        • Tiền cầu: ${scount} cầu × ${pShut.toLocaleString(
      "vi-VN"
    )}đ = ${shuttleCost.toLocaleString("vi-VN")} VND<br><br>

        <b>Tổng dự kiến:</b> ${total.toLocaleString("vi-VN")} VND<br>
        <b>Tổng thực tế:</b> ${actualTotal.toLocaleString("vi-VN")} VND<br>
        <b>Chênh lệch:</b> +${(actualTotal - total).toLocaleString(
          "vi-VN"
        )} VND<br><br>

        <b>Tiền mỗi nữ:</b> <b>${perWoman.toLocaleString(
          "vi-VN"
        )} đ</b> (x${women})
    `;
  }

  openModal();
});
