// Validation function
function validate(id, message) {
  const input = document.getElementById(id);
  const errorSpan = document.getElementById(id + "_err");
  const value = input.value.trim();

  if (value === "" || isNaN(value) || parseFloat(value) < 0) {
    errorSpan.textContent = message;
    input.classList.add("error-border");
    return false;
  } else {
    errorSpan.textContent = "";
    input.classList.remove("error-border");
    return true;
  }
}

// Add onchange validation for all inputs
const inputFields = [
  "men",
  "women",
  "hours",
  "pricePerHour",
  "shuttleCount",
  "pricePerShuttle",
];
const messages = {
  men: "Nhập số lượng nam!",
  women: "Nhập số lượng nữ!",
  hours: "Nhập số giờ chơi!",
  pricePerHour: "Nhập tiền / giờ (tối thiểu 1000đ)!",
  shuttleCount: "Nhập số lượng cầu!",
  pricePerShuttle: "Nhập tiền 1 trái cầu (tối thiểu 1000đ)!",
};

inputFields.forEach((fieldId) => {
  const input = document.getElementById(fieldId);
  input.addEventListener("input", function () {
    validate(fieldId, messages[fieldId]);
  });
});

function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
}

function openModal() {
  document.getElementById("resultModal").classList.remove("hidden");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

// Round up to nearest 1000 VND
function roundUpToThousand(amount) {
  return Math.ceil(amount / 1000) * 1000;
}

document.getElementById("calculateBtn").addEventListener("click", function () {
  const fields = [
    ["men", "Nhập số lượng nam!"],
    ["women", "Nhập số lượng nữ!"],
    ["hours", "Nhập số giờ chơi!"],
    ["pricePerHour", "Nhập tiền / giờ (tối thiểu 1000đ)!"],
    ["shuttleCount", "Nhập số lượng cầu!"],
    ["pricePerShuttle", "Nhập tiền 1 trái cầu (tối thiểu 1000đ)!"],
  ];

  let valid = true;
  fields.forEach((f) => {
    if (!validate(f[0], f[1])) valid = false;
  });

  if (!valid) return;

  const men = parseInt(document.getElementById("men").value) || 0;
  const women = parseInt(document.getElementById("women").value) || 0;
  const hours = parseFloat(document.getElementById("hours").value);
  const pHour = parseInt(document.getElementById("pricePerHour").value);
  const scount = parseInt(document.getElementById("shuttleCount").value);
  const pShut = parseInt(document.getElementById("pricePerShuttle").value);

  // Validate minimum 1000 VND for prices
  if (pHour < 1000) {
    document.getElementById("pricePerHour_err").textContent =
      "Tiền / giờ phải từ 1000đ trở lên!";
    document.getElementById("pricePerHour").classList.add("error-border");
    return;
  }

  if (pShut < 1000) {
    document.getElementById("pricePerShuttle_err").textContent =
      "Tiền / trái cầu phải từ 1000đ trở lên!";
    document.getElementById("pricePerShuttle").classList.add("error-border");
    return;
  }

  if (men === 0 && women === 0) {
    alert("Phải có ít nhất 1 người chơi!");
    return;
  }

  const total = hours * pHour + scount * pShut;

  let perMan = 0,
    perWoman = 0;

  if (men > 0 && women > 0) {
    // Có cả nam và nữ - nam cao hơn nữ 3-5k
    let diff;
    if (total < 300000) {
      diff = 3000;
    } else if (total < 500000) {
      diff = 4000;
    } else {
      diff = 5000;
    }

    // Tính số tiền trung bình
    const avgPerPerson = total / (men + women);

    // Tính tiền ban đầu
    let menBase = roundUpToThousand(avgPerPerson + diff / 2);
    let womenBase = roundUpToThousand(avgPerPerson - diff / 2);

    // Đảm bảo chênh lệch đúng
    const actualDiff = menBase - womenBase;
    if (actualDiff < diff) {
      menBase = womenBase + diff;
      if (menBase % 1000 !== 0) {
        menBase = roundUpToThousand(menBase);
      }
    }

    perMan = menBase;
    perWoman = womenBase;

    // Tính tổng thực tế
    let actualTotal = perMan * men + perWoman * women;

    // Nếu thực tế < total, tăng dần cho đến khi >= total
    while (actualTotal < total) {
      // Ưu tiên tăng cho người nữ trước (vì ít hơn)
      if (actualTotal + women * 1000 <= total + (men + women) * 1000) {
        perWoman += 1000;
        actualTotal = perMan * men + perWoman * women;
      } else if (actualTotal + men * 1000 <= total + (men + women) * 1000) {
        perMan += 1000;
        actualTotal = perMan * men + perWoman * women;
      } else {
        // Tăng cả hai
        perWoman += 1000;
        actualTotal = perMan * men + perWoman * women;
      }
    }
  } else if (men > 0) {
    // Chỉ có nam
    perMan = roundUpToThousand(total / men);
  } else {
    // Chỉ có nữ
    perWoman = roundUpToThousand(total / women);
  }

  const actualTotal = perMan * men + perWoman * women;

  document.getElementById("result").innerHTML = `
<b>Tổng tiền dự kiến:</b> ${total.toLocaleString("vi-VN")} VND<br>
<b>Tổng tiền thực tế:</b> ${actualTotal.toLocaleString("vi-VN")} VND<br><br>
${
  men > 0
    ? `<b>Tiền mỗi Nam:</b> ${perMan.toLocaleString("vi-VN")} VND (x${men} = ${(
        perMan * men
      ).toLocaleString("vi-VN")} VND)<br>`
    : ""
}
${
  women > 0
    ? `<b>Tiền mỗi Nữ:</b> ${perWoman.toLocaleString(
        "vi-VN"
      )} VND (x${women} = ${(perWoman * women).toLocaleString(
        "vi-VN"
      )} VND)<br>`
    : ""
}
${
  men > 0 && women > 0
    ? `<br><b>Chênh lệch:</b> ${(perMan - perWoman).toLocaleString(
        "vi-VN"
      )} VND`
    : ""
}
`;

  openModal();
});
