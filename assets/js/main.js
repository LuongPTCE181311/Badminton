// Helper function to round up to nearest 1000
function roundUpTo1000(value) {
  return Math.ceil(value / 1000) * 1000;
}

// Validate a single field
function validate(id, message) {
  const element = document.getElementById(id);
  const errorElement = document.getElementById(id + "_err");
  const value = element.value.trim();

  // Check if empty
  if (!value) {
    errorElement.textContent = message;
    return false;
  }

  // Check if negative
  if (parseFloat(value) < 0) {
    errorElement.textContent = "Giá trị không được âm!";
    return false;
  }

  // Check minimum 1000 for pricePerHour and pricePerShuttle
  if ((id === "pricePerHour" || id === "pricePerShuttle") && parseFloat(value) < 1000) {
    errorElement.textContent = "Số tiền tối thiểu là 1,000đ!";
    return false;
  }

  // Clear error if valid
  errorElement.textContent = "";
  return true;
}

// Add real-time validation on input events
const fields = [
  ["men", "Nhập số lượng nam!"],
  ["women", "Nhập số lượng nữ!"],
  ["hours", "Nhập số giờ chơi!"],
  ["pricePerHour", "Nhập tiền / giờ!"],
  ["shuttleCount", "Nhập số lượng cầu!"],
  ["pricePerShuttle", "Nhập tiền 1 trái cầu!"],
];

fields.forEach((f) => {
  document.getElementById(f[0]).addEventListener("input", function () {
    validate(f[0], f[1]);
  });
});

// Find optimal split with minimal difference between men and women
function findOptimalSplit(total, men, women) {
  // Validate parameters to prevent division by zero
  if (men <= 0 || women <= 0 || (men + women) === 0) {
    return null;
  }
  
  let bestSolution = null;
  let minActualTotal = Infinity;
  
  // Maximum range to search beyond the calculated minimum
  const MAX_SEARCH_RANGE = 10000;

  // Try differences from 1000đ to 5000đ
  for (let diff = 1000; diff <= 5000; diff += 1000) {
    // For a given difference, we need: perMan * men + perWoman * women >= total
    // Where perMan = perWoman + diff
    // So: (perWoman + diff) * men + perWoman * women >= total
    // Solving for perWoman: perWoman >= (total - diff * men) / (men + women)
    
    const minPerWomanExact = (total - diff * men) / (men + women);
    const minPerWoman = Math.max(1000, roundUpTo1000(minPerWomanExact));
    
    // Try a small range around the calculated minimum
    const maxPerWoman = minPerWoman + MAX_SEARCH_RANGE;
    
    for (let perWoman = minPerWoman; perWoman <= maxPerWoman; perWoman += 1000) {
      const perMan = perWoman + diff;
      const actualTotal = perMan * men + perWoman * women;
      
      // Check if this solution meets requirements
      if (actualTotal >= total) {
        // This is a valid solution, check if it's better
        if (actualTotal < minActualTotal) {
          minActualTotal = actualTotal;
          bestSolution = {
            perMan: perMan,
            perWoman: perWoman,
            actualTotal: actualTotal,
            difference: diff
          };
        }
        // Once we find a valid solution for this diff, no need to go higher
        break;
      }
    }
  }

  return bestSolution;
}

// Modal functions
function openModal() {
  document.getElementById("resultModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
}

document.getElementById("closeModal").addEventListener("click", closeModal);

// Calculate button click handler
document.getElementById("calculateBtn").addEventListener("click", function () {
  // Validate all fields
  let valid = true;
  fields.forEach((f) => {
    if (!validate(f[0], f[1])) valid = false;
  });
  if (!valid) return;

  // Get input values
  const men = parseInt(document.getElementById("men").value) || 0;
  const women = parseInt(document.getElementById("women").value) || 0;
  const hours = parseFloat(document.getElementById("hours").value) || 0;
  const pHour = parseInt(document.getElementById("pricePerHour").value) || 0;
  const scount = parseInt(document.getElementById("shuttleCount").value) || 0;
  const pShut = parseInt(document.getElementById("pricePerShuttle").value) || 0;

  // Validate that at least one of men or women is > 0
  if (men === 0 && women === 0) {
    document.getElementById("result").innerHTML = `
      <b style="color: red;">Lỗi:</b> Phải có ít nhất 1 người chơi (nam hoặc nữ)!
    `;
    openModal();
    return;
  }

  // Calculate expected total
  const expectedTotal = hours * pHour + scount * pShut;

  let perMan = 0;
  let perWoman = 0;
  let actualTotal = 0;
  let difference = 0;

  // Case 1: Only men OR only women - split evenly and round up to 1000
  if (men > 0 && women === 0) {
    perMan = roundUpTo1000(expectedTotal / men);
    actualTotal = perMan * men;
  } else if (women > 0 && men === 0) {
    perWoman = roundUpTo1000(expectedTotal / women);
    actualTotal = perWoman * women;
  } 
  // Case 2: Both men and women - find optimal split
  else if (men > 0 && women > 0) {
    const solution = findOptimalSplit(expectedTotal, men, women);
    
    if (solution) {
      perMan = solution.perMan;
      perWoman = solution.perWoman;
      actualTotal = solution.actualTotal;
      difference = solution.difference;
    } else {
      // Fallback: if no solution found, split evenly
      console.warn('Optimal solution not found, using fallback equal split');
      const avgPerPerson = roundUpTo1000(expectedTotal / (men + women));
      perMan = avgPerPerson;
      perWoman = avgPerPerson;
      actualTotal = avgPerPerson * (men + women);
    }
  }

  // Display results
  let resultHTML = `
    <b>Tổng tiền dự kiến:</b> ${expectedTotal.toLocaleString()} VND<br>
    <b>Tổng tiền thực tế:</b> ${actualTotal.toLocaleString()} VND<br><br>
  `;

  if (men > 0) {
    resultHTML += `<b>Tiền mỗi Nam:</b> ${perMan.toLocaleString()} VND<br>`;
  }
  if (women > 0) {
    resultHTML += `<b>Tiền mỗi Nữ:</b> ${perWoman.toLocaleString()} VND<br>`;
  }
  
  if (men > 0 && women > 0) {
    resultHTML += `<br><b>Chênh lệch:</b> ${difference.toLocaleString()} VND`;
  }

  document.getElementById("result").innerHTML = resultHTML;

  openModal();
});
