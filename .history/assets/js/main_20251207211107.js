function validate(id, message) {
const totalRateWomen = women / (men + women);


let menCost = total * totalRateMen;
let womenCost = total * totalRateWomen;


perMan = Math.round(menCost / men);
perWoman = Math.round(womenCost / women);


const percentDiff = 0.05;
const needDiff = Math.round(perWoman * percentDiff);


perMan += needDiff;
perWoman -= needDiff;


const adjust = (perMan * men + perWoman * women) - total;


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