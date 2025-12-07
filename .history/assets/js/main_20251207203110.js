document.getElementById("calculateBtn").addEventListener("click", function () {
  const men = parseInt(document.getElementById("men").value);
  const women = parseInt(document.getElementById("women").value);
  const hours = parseFloat(document.getElementById("hours").value);
  const pricePerHour = parseInt(document.getElementById("pricePerHour").value);
  const shuttleCount = parseInt(document.getElementById("shuttleCount").value);
  const pricePerShuttle = parseInt(
    document.getElementById("pricePerShuttle").value
  );
  const resultDiv = document.getElementById("result");

  // ----- Validate -----
  if (isNaN(men) || men < 0) return showError("Số lượng Nam không hợp lệ!");
  if (isNaN(women) || women < 0) return showError("Số lượng Nữ không hợp lệ!");
  if (men + women === 0) return showError("Phải có ít nhất 1 người chơi!");
  if (isNaN(hours) || hours <= 0)
    return showError("Số giờ chơi phải lớn hơn 0!");
  if (isNaN(pricePerHour) || pricePerHour < 1000)
    return showError("Tiền / giờ phải ≥ 1.000 VND!");
  if (isNaN(shuttleCount) || shuttleCount < 0)
    return showError("Số lượng cầu không hợp lệ!");
  if (isNaN(pricePerShuttle) || pricePerShuttle < 1000)
    return showError("Tiền 1 trái cầu phải ≥ 1.000 VND!");

  function showError(msg) {
    resultDiv.innerHTML = `<div style="color:red; font-weight:bold;">${msg}</div>`;
    return;
  }

  // ----- Tính tiền -----
  const courtCost = hours * pricePerHour;
  const shuttleCost = shuttleCount * pricePerShuttle;
  const totalCost = courtCost + shuttleCost;

  let costPerMan = 0;
  let costPerWoman = 0;
  let difference = 0;

  // ✔ Trường hợp chỉ có nam hoặc chỉ có nữ → CHIA ĐỀU
  if (men > 0 && women === 0) {
    costPerMan = Math.round(totalCost / men);
    resultDiv.innerHTML = `
            <b>Tổng tiền:</b> ${totalCost.toLocaleString()} VND<br>
            <b>Tiền mỗi Nam:</b> ${costPerMan.toLocaleString()} VND<br>
            <i>Chỉ có nam nên chia đều.</i>
        `;
    return;
  }

  if (women > 0 && men === 0) {
    costPerWoman = Math.round(totalCost / women);
    resultDiv.innerHTML = `
            <b>Tổng tiền:</b> ${totalCost.toLocaleString()} VND<br>
            <b>Tiền mỗi Nữ:</b> ${costPerWoman.toLocaleString()} VND<br>
            <i>Chỉ có nữ nên chia đều.</i>
        `;
    return;
  }

  // ✔ Trường hợp có cả nam và nữ → chia theo tỷ lệ số người
  const totalPeople = men + women;

  costPerMan = Math.floor(totalCost * (men / totalPeople));
  costPerWoman = Math.floor(totalCost * (women / totalPeople));

  // tiền 1 người nam / nữ
  const costPerManPerson = Math.round(costPerMan / men);
  const costPerWomanPerson = Math.round(costPerWoman / women);

  difference = costPerManPerson - costPerWomanPerson;

  // ----- Hiển thị kết quả -----
  resultDiv.innerHTML = `
        <b>Tổng tiền:</b> ${totalCost.toLocaleString()} VND<br><br>

        <b>Tiền mỗi Nam:</b> ${costPerManPerson.toLocaleString()} VND<br>
        <b>Tiền mỗi Nữ:</b> ${costPerWomanPerson.toLocaleString()} VND<br><br>
        <i>Chênh lệch Nam - Nữ = ${difference} (đơn vị tiền)</i>
    `;
});
