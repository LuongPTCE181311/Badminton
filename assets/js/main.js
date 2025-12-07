function validate(id, message) {
  document.getElementById("resultModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

document.getElementById("calculateBtn").addEventListener("click", function () {
  const fields = [
    ["men", "Nhập số lượng nam!"],
    ["women", "Nhập số lượng nữ!"],
    ["hours", "Nhập số giờ chơi!"],
    ["pricePerHour", "Nhập tiền / giờ!"],
    ["shuttleCount", "Nhập số lượng cầu!"],
    ["pricePerShuttle", "Nhập tiền 1 trái cầu!"],
  ];

  let valid = true;
  fields.forEach((f) => {
    if (!validate(f[0], f[1])) valid = false;
  });
  if (!valid) return;

  const men = parseInt(men.value);
  const women = parseInt(women.value);
  const hours = parseFloat(hours.value);
  const pHour = parseInt(pricePerHour.value);
  const scount = parseInt(shuttleCount.value);
  const pShut = parseInt(pricePerShuttle.value);

  const total = hours * pHour + scount * pShut;

  let perMan = 0,
    perWoman = 0;

  if (men > 0 && women > 0) {
    const totalRateMen = men / (men + women);
    const totalRateWomen = women / (men + women);

    let menCost = total * totalRateMen;
    let womenCost = total * totalRateWomen;

    perMan = Math.round(menCost / men);
    perWoman = Math.round(womenCost / women);

    const percentDiff = 0.05;
    const needDiff = Math.round(perWoman * percentDiff);

    perMan += needDiff;
    perWoman -= needDiff;

    const adjust = perMan * men + perWoman * women - total;

    if (adjust !== 0) {
      perWoman -= Math.round(adjust / women);
    }
  } else if (men > 0) {
    perMan = Math.round(total / men);
  } else {
    perWoman = Math.round(total / women);
  }

  document.getElementById("result").innerHTML = `
<b>Tổng tiền:</b> ${total.toLocaleString()} VND<br><br>
<b>Tiền mỗi Nam:</b> ${perMan.toLocaleString()} VND<br>
<b>Tiền mỗi Nữ:</b> ${perWoman.toLocaleString()} VND
`;

  openModal();
});
