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
  if (totalPeople === 0) return alert("Phải có ít nhất 1 người chơi!");

  const courtFee = hours * priceHour;
  const shuttleFee = shuttleCount * shuttlePrice;
  let totalFee = courtFee + shuttleFee;

  let baseShare = Math.ceil(totalFee / totalPeople);
  let extra = Math.floor(Math.random() * 3) + 3; // 3–5 nghìn

  let malePay = baseShare + extra;
  let femalePay = baseShare;

  const resultBox = document.getElementById("result");
  resultBox.style.display = "block";
  resultBox.innerHTML = `
<strong>Tổng tiền:</strong> ${totalFee.toLocaleString()} VND <br><br>
<strong>Tiền mỗi Nam:</strong> ${malePay.toLocaleString()} VND <br>
<strong>Tiền mỗi Nữ:</strong> ${femalePay.toLocaleString()} VND
`;
}
