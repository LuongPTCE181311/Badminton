// assets/js/main.js
function calculateFee() {
  const male = parseInt(document.getElementById("maleCount").value) || 0;
  const female = parseInt(document.getElementById("femaleCount").value) || 0;
  const hours = parseFloat(document.getElementById("hours").value) || 0;
  const priceHour =
    parseFloat(document.getElementById("pricePerHour").value) || 0;
  const shuttleCount =
    parseInt(document.getElementById("shuttleCount").value) || 0;
  const shuttlePrice =
    parseFloat(document.getElementById("shuttlePrice").value) || 0;

  const totalPeople = male + female;
  if (totalPeople === 0) {
    alert("Phải có ít nhất 1 người chơi!");
    return;
  }

  const courtFee = hours * priceHour;
  const shuttleFee = shuttleCount * shuttlePrice;
  let totalFee = Math.round(courtFee + shuttleFee); // dùng số nguyên

  // Helper: format tiền
  function fmt(n) {
    return n.toLocaleString() + " VND";
  }

  let resultBox = document.getElementById("result");
  resultBox.style.display = "block";

  // Trường hợp chỉ 1 nhóm
  if (female === 0) {
    let perMale = Math.ceil(totalFee / male);
    resultBox.innerHTML = `<strong>Tổng tiền:</strong> ${fmt(totalFee)}<br><br>
                               <strong>Tiền mỗi Nam:</strong> ${fmt(
                                 perMale
                               )}<br>
                               <strong>Tiền mỗi Nữ:</strong> -`;
    return;
  }
  if (male === 0) {
    let perFemale = Math.ceil(totalFee / female);
    resultBox.innerHTML = `<strong>Tổng tiền:</strong> ${fmt(totalFee)}<br><br>
                               <strong>Tiền mỗi Nam:</strong> -<br>
                               <strong>Tiền mỗi Nữ:</strong> ${fmt(perFemale)}`;
    return;
  }

  // Có cả Nam và Nữ
  // Chọn diff trong khoảng 3..5 (đơn vị giống input)
  const diff = Math.floor(Math.random() * 3) + 3; // 3,4 hoặc 5

  // Tính femaleShare tối thiểu sao cho tổng thu >= totalFee
  // femaleShare * (male+female) + male * diff >= totalFee
  // => femaleShare >= (totalFee - male*diff) / (male+female)
  const denom = male + female;
  let femaleShare = Math.ceil((totalFee - male * diff) / denom);

  if (femaleShare < 0) femaleShare = 0; // tránh âm

  let maleShare = femaleShare + diff;

  // Nếu tổng thu vẫn < totalFee, tăng femaleShare cho đến khi đủ
  let collected = male * maleShare + female * femaleShare;
  while (collected < totalFee) {
    femaleShare += 1;
    maleShare = femaleShare + diff;
    collected = male * maleShare + female * femaleShare;
    // Break-safety: nếu vòng lặp quá lâu, cho phép tăng diff nhỏ (không cần ở hầu hết trường hợp)
    if (femaleShare > totalFee) break;
  }

  resultBox.innerHTML = `<strong>Tổng tiền:</strong> ${fmt(totalFee)}<br><br>
                           <strong>Tiền mỗi Nam:</strong> ${fmt(maleShare)}<br>
                           <strong>Tiền mỗi Nữ:</strong> ${fmt(
                             femaleShare
                           )}<br><br>
                           <small>Chênh lệch Nam - Nữ = ${diff} (đơn vị tiền)</small>`;
}
