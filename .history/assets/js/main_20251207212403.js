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
  "hours",
  "pricePerHour",
  "shuttleCount",
  "pricePerShuttle",
].forEach((id) => {
  document
    .getElementById(id)
    .addEventListener("input", () => validateField(id));
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

// ===================== CALCULATE =========================

document.getElementById("calculateBtn").addEventListener("click", function () {
  let ok = true;
  const ids = [
    "men",
    "women",
    "hours",
    "pricePerHour",
    "shuttleCount",
    "pricePerShuttle",
  ];

  ids.forEach((id) => {
    if (!validateField(id)) ok = false;
  });

  // Trường hợp đặc biệt: nam và nữ không được cả 2 bằng 0
  const men = parseInt(document.getElementById("men").value) || 0;
  const women = parseInt(document.getElementById("women").value) || 0;

  if (men === 0 && women === 0) {
    setError("men", "Nam + Nữ phải ≥ 1");
    setError("women", "Nam + Nữ phải ≥ 1");
    ok = false;
  }

  if (!ok) return;

  const hours = parseFloat(document.getElementById("hours").value);
  const pHour = parseInt(document.getElementById("pricePerHour").value);
  const scount = parseInt(document.getElementById("shuttleCount").value);
  const pShut = parseInt(document.getElementById("pricePerShuttle").value);

  const total = hours * pHour + scount * pShut;

  let perMan = 0,
    perWoman = 0;

  if (men > 0 && women > 0) {
    // Tính mức chênh lệch 3–5k theo tổng
    let diff = total < 300000 ? 3000 : total < 500000 ? 4000 : 5000;

    const avg = total / (men + women);

    perMan = roundUpToThousand(avg + diff / 2);
    perWoman = roundUpToThousand(avg - diff / 2);

    let actual = perMan * men + perWoman * women;

    // Điều chỉnh sao cho tổng tiền khớp nhất có thể
    while (actual < total) {
      perWoman += 1000;
      actual = perMan * men + perWoman * women;
    }
  } else if (men > 0) {
    perMan = roundUpToThousand(total / men);
  } else {
    perWoman = roundUpToThousand(total / women);
  }

  const actualTotal = perMan * men + perWoman * women;

  document.getElementById("result").innerHTML = `
        <b>Tổng dự kiến:</b> ${total.toLocaleString("vi-VN")} VND<br>
        <b>Tổng thực tế:</b> ${actualTotal.toLocaleString("vi-VN")} VND<br><br>

        ${
          men > 0
            ? `<b>Tiền mỗi nam:</b> ${perMan.toLocaleString(
                "vi-VN"
              )} đ (x${men})<br>`
            : ""
        }
        ${
          women > 0
            ? `<b>Tiền mỗi nữ:</b> ${perWoman.toLocaleString(
                "vi-VN"
              )} đ (x${women})<br>`
            : ""
        }

        ${
          men && women
            ? `<br><b>Chênh lệch:</b> ${(perMan - perWoman).toLocaleString(
                "vi-VN"
              )} đ`
            : ""
        }
    `;

  openModal();
});
