// Validate field and show error message
function validate(id, message) {
  const field = document.getElementById(id);
  const errorElement = document.getElementById(id + "_err");
  
  // Allow 0 for men and women fields (but at least one must be > 0, checked separately)
  if (id === "men" || id === "women") {
    if (!field.value || field.value.trim() === "" || parseFloat(field.value) < 0) {
      errorElement.textContent = message;
      return false;
    }
    errorElement.textContent = "";
    return true;
  }
  
  // For other fields, must be > 0
  if (!field.value || field.value.trim() === "" || parseFloat(field.value) <= 0) {
    errorElement.textContent = message;
    return false;
  }
  
  // Validate minimum 1000đ for price fields
  if ((id === "pricePerHour" || id === "pricePerShuttle") && parseFloat(field.value) < 1000) {
    errorElement.textContent = "Số tiền tối thiểu 1000đ!";
    return false;
  }
  
  errorElement.textContent = "";
  return true;
}

// Open modal
function openModal() {
  document.getElementById("resultModal").classList.remove("hidden");
}

// Close modal
function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
}

// Format difference with appropriate prefix
function formatDifference(diff) {
  const prefix = diff >= 0 ? '+' : '';
  return `${prefix}${diff.toLocaleString()}`;
}

// Find optimal split between men and women
function findOptimalSplit(total, men, women) {
  let bestSolution = null;
  let minDifference = Infinity; // Chênh lệch giữa tổng thực tế và tổng dự kiến
  
  // Thử các chênh lệch từ 3000đ đến 5000đ
  for (let diff = 3000; diff <= 5000; diff += 1000) {
    // Tính toán ban đầu
    const avgCost = total / (men + women);
    let perMan = Math.ceil((avgCost + diff/2) / 1000) * 1000;
    let perWoman = Math.ceil((avgCost - diff/2) / 1000) * 1000;
    
    // Đảm bảo chênh lệch đúng (with max iterations to prevent infinite loop)
    // Note: We only increase values (never decrease) to maintain actualTotal >= total
    let iterations = 0;
    const maxIterations = 100;
    while (perMan - perWoman < diff && iterations < maxIterations) {
      perMan += 1000;
      iterations++;
    }
    iterations = 0;
    while (perMan - perWoman > diff && iterations < maxIterations) {
      perWoman += 1000; // Increase perWoman to reduce the difference
      iterations++;
    }
    
    // Tính tổng thực tế
    let actualTotal = perMan * men + perWoman * women;
    
    // Điều chỉnh nếu tổng thực tế < tổng dự kiến (with max iterations)
    // Increase perWoman to ensure actualTotal >= total
    iterations = 0;
    while (actualTotal < total && iterations < maxIterations) {
      perWoman += 1000;
      actualTotal = perMan * men + perWoman * women;
      iterations++;
    }
    
    // Verify gender difference is still within acceptable range after adjustment
    const actualDiff = perMan - perWoman;
    if (actualDiff < diff - 1000 || actualDiff > diff + 1000) {
      // Gender difference constraint violated, skip this solution
      continue;
    }
    
    // Kiểm tra nếu đây là phương án tốt nhất
    const difference = actualTotal - total;
    if (difference < minDifference) {
      minDifference = difference;
      bestSolution = { perMan, perWoman, actualTotal, diff: actualDiff };
    }
  }
  
  return bestSolution;
}

// Real-time validation on input events
document.getElementById("closeModal").addEventListener("click", closeModal);

// Add input event listeners for real-time validation
const fields = [
  ["men", "Nhập số lượng nam!"],
  ["women", "Nhập số lượng nữ!"],
  ["hours", "Nhập số giờ chơi!"],
  ["pricePerHour", "Nhập tiền / giờ!"],
  ["shuttleCount", "Nhập số lượng cầu!"],
  ["pricePerShuttle", "Nhập tiền 1 trái cầu!"],
];

fields.forEach((f) => {
  const field = document.getElementById(f[0]);
  field.addEventListener("input", function() {
    validate(f[0], f[1]);
  });
});

// Calculate button click handler
document.getElementById("calculateBtn").addEventListener("click", function () {
  // Validate all fields
  let valid = true;
  fields.forEach((f) => {
    if (!validate(f[0], f[1])) valid = false;
  });
  if (!valid) return;

  const men = parseInt(document.getElementById("men").value, 10) || 0;
  const women = parseInt(document.getElementById("women").value, 10) || 0;
  
  // Check that at least one of men or women is > 0
  if (men <= 0 && women <= 0) {
    document.getElementById("men_err").textContent = "Phải có ít nhất 1 nam hoặc nữ!";
    document.getElementById("women_err").textContent = "Phải có ít nhất 1 nam hoặc nữ!";
    return;
  }
  const hours = parseFloat(document.getElementById("hours").value);
  const pHour = parseInt(document.getElementById("pricePerHour").value, 10);
  const scount = parseInt(document.getElementById("shuttleCount").value, 10);
  const pShut = parseInt(document.getElementById("pricePerShuttle").value, 10);

  const total = hours * pHour + scount * pShut;

  let perMan = 0;
  let perWoman = 0;
  let actualTotal = 0;

  if (men > 0 && women > 0) {
    // Use optimal split algorithm for mixed gender
    const solution = findOptimalSplit(total, men, women);
    if (!solution) {
      // Fallback if no solution found (should not happen with proper constraints)
      perMan = Math.ceil(total / (men + women) / 1000) * 1000;
      perWoman = perMan;
      actualTotal = perMan * men + perWoman * women;
    } else {
      perMan = solution.perMan;
      perWoman = solution.perWoman;
      actualTotal = solution.actualTotal;
    }
    
    document.getElementById("result").innerHTML = `
<b>Tổng dự kiến:</b> ${total.toLocaleString()} VND<br>
<b>Tổng thực tế:</b> ${actualTotal.toLocaleString()} VND<br>
<b>Chênh lệch:</b> ${formatDifference(actualTotal - total)} VND<br><br>
<b>Tiền mỗi nam:</b> ${perMan.toLocaleString()} đ (x${men})<br>
<b>Tiền mỗi nữ:</b> ${perWoman.toLocaleString()} đ (x${women})<br><br>
<b>Chênh lệch Nam/Nữ:</b> ${(perMan - perWoman).toLocaleString()} đ
`;
  } else if (men > 0) {
    // Only men - divide equally and round up to 1000đ
    perMan = Math.ceil(total / men / 1000) * 1000;
    actualTotal = perMan * men;
    
    document.getElementById("result").innerHTML = `
<b>Tổng dự kiến:</b> ${total.toLocaleString()} VND<br>
<b>Tổng thực tế:</b> ${actualTotal.toLocaleString()} VND<br>
<b>Chênh lệch:</b> ${formatDifference(actualTotal - total)} VND<br><br>
<b>Tiền mỗi nam:</b> ${perMan.toLocaleString()} đ (x${men})
`;
  } else if (women > 0) {
    // Only women - divide equally and round up to 1000đ
    perWoman = Math.ceil(total / women / 1000) * 1000;
    actualTotal = perWoman * women;
    
    document.getElementById("result").innerHTML = `
<b>Tổng dự kiến:</b> ${total.toLocaleString()} VND<br>
<b>Tổng thực tế:</b> ${actualTotal.toLocaleString()} VND<br>
<b>Chênh lệch:</b> ${formatDifference(actualTotal - total)} VND<br><br>
<b>Tiền mỗi nữ:</b> ${perWoman.toLocaleString()} đ (x${women})
`;
  }

  openModal();
});
