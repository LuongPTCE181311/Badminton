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

  function showError(msg) {
    resultDiv.innerHTML = `<div style="color:red; font-weight:bold;">${msg}</div>`;
    return true;
  }

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

  const courtCost = hours * pricePerHour;
  const shuttleCost = shuttleCount * pricePerShuttle;
  const totalCost = courtCost + shuttleCost;

  let costPerMan, costPerWoman;

  if (men > 0 && women === 0) {
    costPerMan = Math.round(totalCost / men);
    return (resultDiv.innerHTML = `
<b>Tổng tiền:</b> ${totalCost.toLocaleString()} VND<br>
<b>Tiền mỗi Nam:</b> ${costPerMan.toLocaleString()} VND<br>
<i>Chỉ có nam nên chia đều.</i>
`);
  }

  if (women > 0 && men === 0) {
    costPerWoman = Math.round(totalCost / women);
    return (resultDiv.innerHTML = `
<b>Tổng tiền:</b> ${totalCost.toLocaleString()} VND<br>
<b>Tiền mỗi Nữ:</b> ${costPerWoman.toLocaleString()} VND<br>
<i>Chỉ có nữ nên chia đều.</i>
`);
  }

  const totalPeople = men + women;

  const manTotal = Math.floor(totalCost * (men / totalPeople));
  const womanTotal = Math.floor(totalCost * (women / totalPeople));

  const manPerPerson = Math.round(manTotal / men);
  const womanPerPerson = Math.round(womanTotal / women);

  let diff = manPerPerson - womanPerPerson;

  // Nếu có cả nam và nữ → bắt buộc nam phải cao hơn nữ 3–5 nghìn
  if (men > 0 && women > 0) {
    const targetDiff = 3000 + Math.floor(Math.random() * 2000); // 3000–5000

    // Điều chỉnh sao cho: manPerPerson - womanPerPerson = targetDiff
    // => tăng tiền nam, giảm tiền nữ nhưng vẫn giữ tổng tiền

    const newManPer = manPerPerson + Math.ceil(targetDiff / 2);
    const newWomanPer = womanPerPerson - Math.floor(targetDiff / 2);

    manPerPerson = newManPer;
    womanPerPerson = newWomanPer;
    diff = manPerPerson - womanPerPerson;
  }

  resultDiv.innerHTML = `
<b>Tổng tiền:</b> ${totalCost.toLocaleString()} VND<br><br>
<b>Tiền mỗi Nam:</b> ${manPerPerson.toLocaleString()} VND<br>
<b>Tiền mỗi Nữ:</b> ${womanPerPerson.toLocaleString()} VND<br><br>
<i>Chênh lệch Nam - Nữ = ${difference} (đơn vị tiền)</i>
`;
});
