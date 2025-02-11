function calculatePayoff() {
  // Get input values and convert to floats.
  const mortgagePrincipal = parseFloat(document.getElementById("mortgagePrincipal").value);
  const mortgageRateAnnual = parseFloat(document.getElementById("mortgageRate").value);
  const mortgageTermYears = parseFloat(document.getElementById("mortgageTerm").value);
  const extraMortgage = parseFloat(document.getElementById("extraMortgage").value);
  const solarCost = parseFloat(document.getElementById("solarCost").value);
  const solarRateAnnual = parseFloat(document.getElementById("solarRate").value);
  const solarTermYears = parseFloat(document.getElementById("solarTerm").value);
  const energySavings = parseFloat(document.getElementById("energySavings").value);

  // Calculate monthly rates and total periods.
  const mortgageRateMonthly = mortgageRateAnnual / 100 / 12;
  const mortgagePeriods = mortgageTermYears * 12;
  const solarRateMonthly = solarRateAnnual / 100 / 12;
  const solarPeriods = solarTermYears * 12;

  // Monthly payment calculation using the annuity formula.
  // Payment = P * r * (1+r)^n / ((1+r)^n - 1)
  const calcMonthlyPayment = (P, r, n) => {
    return P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  };

  const baseMortgagePayment = calcMonthlyPayment(mortgagePrincipal, mortgageRateMonthly, mortgagePeriods);
  const solarMonthlyPayment = calcMonthlyPayment(solarCost, solarRateMonthly, solarPeriods);

  // Clone initial balances.
  let mortgageBalance = mortgagePrincipal;
  let solarBalance = solarCost;
  let month = 0;

  // We'll simulate month by month until the mortgage is paid off.
  // This simulation assumes:
  //  - Each month the mortgage is paid the base payment plus any extra available.
  //  - Extra available comes from user extra payment plus an amount derived from solar.
  // For the solar component:
  //  - If the solar loan is NOT paid off, then the net extra toward the mortgage is max(energySavings - solarMonthlyPayment, 0).
  //  - When the solar is paid off, the full amount (energySavings plus that monthly solar payment value) becomes available.
  const simulate = () => {
    while (mortgageBalance > 0) {
      month++;

      // Calculate extra from solar.
      let solarExtra = 0;
      if (solarBalance > 0) {
        // Simulate solar loan monthly payment.
        const interestSolar = solarBalance * solarRateMonthly;
        let principalSolar = solarMonthlyPayment - interestSolar;
        if (solarBalance - principalSolar < 0) {
          principalSolar = solarBalance; // final payment adjustment
        }
        solarBalance -= principalSolar;
        // Extra amount is what remains from energy savings after paying the solar loan.
        solarExtra = Math.max(energySavings - solarMonthlyPayment, 0);
      } else {
        // Once solar is paid off, both the energy savings and what was paid monthly for solar become extra.
        solarExtra = energySavings + solarMonthlyPayment;
      }

      const totalExtra = extraMortgage + solarExtra;
      const totalMortgagePayment = baseMortgagePayment + totalExtra;

      // Mortgage calculation.
      const interestMortgage = mortgageBalance * mortgageRateMonthly;
      let principalMortgage = totalMortgagePayment - interestMortgage;
      if (mortgageBalance - principalMortgage < 0) {
        principalMortgage = mortgageBalance; // adjust final payment
      }
      mortgageBalance -= principalMortgage;
    }
  };

  simulate();

  // Convert month count to years and months.
  const years = Math.floor(month / 12);
  const remainingMonths = month % 12;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <h2>Results:</h2>
    <p>Mortgage Base Monthly Payment: $${baseMortgagePayment.toFixed(2)}</p>
    <p>Solar Monthly Payment (if financing): $${solarMonthlyPayment.toFixed(2)}</p>
    <p><strong>Mortgage paid off in ${month} months (~${years} years and ${remainingMonths} month(s))</strong></p>
  `;
}