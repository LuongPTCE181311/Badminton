// Hàm validate cho từng trường
function validateField(id) {
  const field = document.getElementById(id);
  const errorSpan = document.getElementById(id + "_err");
  const value = field.value.trim();

  // Xóa error border trước
  field.classList.remove("error-border");

  // Kiểm tra rỗng
  if (value === "") {
    errorSpan.textContent = "Vui lòng nhập giá trị! ";
    field.classList.add("error-border");
    return false;
  }

  const num = parseFloat(value);

  // Kiểm tra số hợp lệ
  if (isNaN(num) || num < 0) {
    errorSpan.textContent = "Vui lòng nhập số hợp lệ!";
    field.classList.add("error-border");
    return false;
  }

  // Kiểm tra số tiền tối thiểu 1000đ cho giá tiền
  if ((id === "pricePerHour" || id === "pricePerShuttle") && num < 1000) {
    errorSpan.textContent = "Số tiền tối thiểu là 1,000đ!";
    field.classList.add("error-border");
    return false;
  }

  // Kiểm tra số lượng ít nhất 1 người chơi
  if (id === "men" || id === "women") {
    const men = parseInt(document.getElementById("men").value) || 0;
    const women = parseInt(document.getElementById("women").value) || 0;

    if (men === 0 && women === 0) {
      errorSpan.textContent = "Phải có ít nhất 1 người chơi!";
      field.classList.add("error-border");
      return false;
    }
  }

  // Nếu hợp lệ, xóa thông báo lỗi
  errorSpan.textContent = "";
  return true;
}

// Gắn sự kiện input cho tất cả các trường
const fields = [
  "men",
  "women",
  "hours",
  "pricePerHour",
  "shuttleCount",
  "pricePerShuttle",
];
fields.forEach((fieldId) => {
  const field = document.getElementById(fieldId);
  field.addEventListener("input", function () {
    validateField(fieldId);
  });
});

// Hàm đóng modal
function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
}

// Hàm mở modal
function openModal() {
  document.getElementById("resultModal").classList.remove("hidden");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

// Hàm làm tròn lên đến bội số của 1000
function roundUp1000(num) {
  return Math.ceil(num / 1000) * 1000;
}

// Hàm tìm phương án phân chia tối ưu
function findOptimalSplit(total, men, women) {
  let bestSolution = null;
  let minDifference = Infinity; // Chênh lệch giữa tổng thực tế và tổng dự kiến

  // Thử các chênh lệch từ 3000đ đến 5000đ
  for (let targetDiff = 3000; targetDiff <= 5000; targetDiff += 1000) {
    // Tính chi phí trung bình
    const avgCost = total / (men + women);

    // Tính toán ban đầu dựa trên chênh lệch mong muốn
    // Giải hệ phương trình:
    // perMan * men + perWoman * women = total (hoặc >= total)
    // perMan - perWoman = targetDiff

    let perWoman = (total - targetDiff * men) / (men + women);
    let perMan = perWoman + targetDiff;

    // Làm tròn lên 1000đ
    perWoman = roundUp1000(perWoman);
    perMan = roundUp1000(perMan);

    // Điều chỉnh để đảm bảo chênh lệch đúng trong khoảng 3000-5000
    while (perMan - perWoman < 3000) {
      perMan += 1000;
    }
    while (perMan - perWoman > 5000) {
      perWoman += 1000;
    }

    // Tính tổng thực tế
    let actualTotal = perMan * men + perWoman * women;

    // Nếu tổng thực tế < tổng dự kiến, tăng tiền nữ lên
    while (actualTotal < total) {
      perWoman += 1000;
      actualTotal = perMan * men + perWoman * women;

      // Nếu chênh lệch quá nhỏ, tăng tiền nam lên
      if (perMan - perWoman < 3000) {
        perMan += 1000;
        actualTotal = perMan * men + perWoman * women;
      }
    }

    // Kiểm tra nếu đây là phương án tốt nhất
    const difference = actualTotal - total;
    if (
      difference < minDifference &&
      perMan - perWoman >= 3000 &&
      perMan - perWoman <= 5000
    ) {
      minDifference = difference;
      bestSolution = {
        perMan: perMan,
        perWoman: perWoman,
        actualTotal: actualTotal,
        genderDiff: perMan - perWoman,
      };
    }
  }

  return bestSolution;
}

// Sự kiện tính tiền
document.getElementById("calculateBtn").addEventListener("click", function () {
  // Validate tất cả các trường
  let valid = true;
  fields.forEach((fieldId) => {
    if (!validateField(fieldId)) {
      valid = false;
    }
  });

  if (!valid) return;

  // Lấy giá trị
  const men = parseInt(document.getElementById("men").value) || 0;
  const women = parseInt(document.getElementById("women").value) || 0;
  const hours = parseFloat(document.getElementById("hours").value);
  const pHour = parseInt(document.getElementById("pricePerHour").value);
  const scount = parseInt(document.getElementById("shuttleCount").value);
  const pShut = parseInt(document.getElementById("pricePerShuttle").value);

  // Tính tổng tiền dự kiến
  const total = hours * pHour + scount * pShut;

  let perMan = 0;
  let perWoman = 0;
  let actualTotal = 0;
  let genderDiff = 0;

  // Trường hợp có cả nam và nữ
  if (men > 0 && women > 0) {
    const solution = findOptimalSplit(total, men, women);
    perMan = solution.perMan;
    perWoman = solution.perWoman;
    actualTotal = solution.actualTotal;
    genderDiff = solution.genderDiff;

    // Hiển thị kết quả chi tiết
    document.getElementById("result").innerHTML = `
<b>Tổng dự kiến:</b> ${total.toLocaleString()} VND<br>
<b>Tổng thực tế:</b> ${actualTotal.toLocaleString()} VND<br>
<b>Chênh lệch tổng:</b> +${(actualTotal - total).toLocaleString()} VND<br><br>
<b>Tiền mỗi nam:</b> ${perMan.toLocaleString()} đ (x${men})<br>
<b>Tiền mỗi nữ:</b> ${perWoman.toLocaleString()} đ (x${women})<br><br>
<b>Chênh lệch Nam/Nữ:</b> ${genderDiff.toLocaleString()} đ
`;
  }
  // Trường hợp chỉ có nam
  else if (men > 0) {
    perMan = roundUp1000(total / men);
    actualTotal = perMan * men;

    document.getElementById("result").innerHTML = `
<b>Tổng dự kiến:</b> ${total.toLocaleString()} VND<br>
<b>Tổng thực tế:</b> ${actualTotal.toLocaleString()} VND<br>
<b>Chênh lệch:</b> +${(actualTotal - total).toLocaleString()} VND<br><br>
<b>Tiền mỗi nam:</b> ${perMan.toLocaleString()} đ (x${men})
`;
  }
  // Trường hợp chỉ có nữ
  else if (women > 0) {
    perWoman = roundUp1000(total / women);
    actualTotal = perWoman * women;

    document.getElementById("result").innerHTML = `
<b>Tổng dự kiến:</b> ${total.toLocaleString()} VND<br>
<b>Tổng thực tế:</b> ${actualTotal.toLocaleString()} VND<br>
<b>Chênh lệch:</b> +${(actualTotal - total).toLocaleString()} VND<br><br>
<b>Tiền mỗi nữ:</b> ${perWoman.toLocaleString()} đ (x${women})
`;
  }

  openModal();
});
