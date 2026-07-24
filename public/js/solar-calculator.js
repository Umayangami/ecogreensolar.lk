/**
 * solar-calculator.js
 * Eco Green Energy Solutions — Solar Savings Calculator
 *
 * HOW TO UPDATE FORMULAS:
 * Search for comments tagged [UPDATE_FORMULA] to find every place where
 * real CEB/LECO tariff data or actual system cost figures should replace
 * the placeholder values used here.
 */

(function () {
    'use strict';

    /* ============================================================
       1. TARIFF & COST CONFIGURATION
          [UPDATE_FORMULA] Replace all values in this block with
          real CEB/LECO tariff slabs and your actual system prices.
       ============================================================ */

    /**
     * CEB domestic tariff slabs (LKR per unit / kWh).
     * Structured as: { maxUnits: <upper bound of slab>, rate: <LKR/kWh> }
     * The last slab has maxUnits: Infinity to catch all usage above it.
     *
     * [UPDATE_FORMULA] Replace these with the current CEB/LECO tariff schedule.
     * Source: https://www.ceb.lk/front_end/electricity_tariff.html
     */
    var TARIFF_SLABS = [
        { maxUnits: 30,       rate: 4.00  },  // Slab 1 (0 – 30 units)
        { maxUnits: 60,       rate: 7.85  },  // Slab 2 (31 – 60 units)
        { maxUnits: 90,       rate: 10.00 },  // Slab 3 (61 – 90 units)
        { maxUnits: 120,      rate: 27.75 },  // Slab 4 (91 – 120 units)
        { maxUnits: 180,      rate: 32.00 },  // Slab 5 (121 – 180 units)
        { maxUnits: Infinity, rate: 45.00 }   // Slab 6 (181+ units)
    ];

    /**
     * Fixed monthly CEB/LECO charges added on top of unit-based billing.
     * [UPDATE_FORMULA] Adjust to match actual fixed/rental charges.
     */
    var FIXED_MONTHLY_CHARGE = 420; // LKR

    /**
     * Average daily peak sun hours in Sri Lanka (solar irradiance factor).
     * [UPDATE_FORMULA] You can use site-specific values from a PVGIS/NASA report
     * (typically 4.5 – 5.5 hrs/day for Sri Lanka).
     */
    var PEAK_SUN_HOURS = 4.8; // hours/day

    /**
     * System performance ratio (accounts for inverter losses, temperature, etc.)
     * [UPDATE_FORMULA] Standard range: 0.75 – 0.85. Use 0.80 as a conservative default.
     */
    var PERFORMANCE_RATIO = 0.80;

    /**
     * Net metering export credit — percentage of generated units fed back.
     * In Sri Lanka, excess solar is exported and credited at buy-back tariff.
     * [UPDATE_FORMULA] Set the actual CEB/LECO net-metering buy-back rate (LKR/unit).
     */
    var NET_METERING_BUYBACK_RATE = 22.00; // LKR per unit exported

    /**
     * Estimated percentage of generated solar energy consumed on-site.
     * Remainder is exported via net metering.
     * [UPDATE_FORMULA] Adjust based on typical household usage patterns.
     */
    var SELF_CONSUMPTION_RATIO = 0.85; // 85% self-consumed, 15% exported

    /**
     * System cost per kWp installed (LKR), including panels, inverter, mounting, wiring.
     * [UPDATE_FORMULA] Replace with your actual installed cost per kWp.
     * Typical Sri Lanka range: LKR 130,000 – 200,000 per kWp.
     */
    var SYSTEM_COST_PER_KW = 160000; // LKR per kWp

    /**
     * Standard panel wattage used to calculate panel count.
     * [UPDATE_FORMULA] Change to your standard panel spec (e.g. 415W, 440W).
     */
    var PANEL_WATTAGE_W = 415; // Watts per panel

    /**
     * Bank loan configuration — interest rates and tenure by bank.
     * [UPDATE_FORMULA] Update with current bank solar loan interest rates.
     * Source: Contact each bank directly for current green/solar loan rates.
     */
    var BANK_LOAN_CONFIG = {
        boc:        { name: 'BOC',              interestRate: 0.11, tenureYears: 7 },
        commercial: { name: 'Commercial Bank',  interestRate: 0.12, tenureYears: 7 },
        hnb:        { name: 'HNB',              interestRate: 0.115, tenureYears: 7 },
        sampath:    { name: 'Sampath Bank',     interestRate: 0.12, tenureYears: 7 }
    };

    /**
     * System size lookup table — maps bill range to recommended system size (kWp).
     * [UPDATE_FORMULA] Replace with your sizing methodology based on actual load analysis.
     */
    var SYSTEM_SIZE_TABLE = [
        { maxBill: 3000,  sizeKw: 1  },
        { maxBill: 6000,  sizeKw: 2  },
        { maxBill: 10000, sizeKw: 3  },
        { maxBill: 15000, sizeKw: 4  },
        { maxBill: 22000, sizeKw: 5  },
        { maxBill: 32000, sizeKw: 7  },
        { maxBill: 45000, sizeKw: 10 },
        { maxBill: 70000, sizeKw: 15 },
        { maxBill: Infinity, sizeKw: 20 }
    ];


    /* ============================================================
       2. CALCULATION ENGINE
       ============================================================ */

    /**
     * Estimate monthly units consumed from a bill amount.
     * Inverts the slab tariff structure through iterative calculation.
     *
     * [UPDATE_FORMULA] This inversion is based on TARIFF_SLABS above.
     * Update TARIFF_SLABS and FIXED_MONTHLY_CHARGE to reflect actual rates.
     *
     * @param {number} bill - Monthly bill in LKR
     * @returns {number} Estimated kWh consumed
     */
    function billToUnits(bill) {
        var chargeableAmount = bill - FIXED_MONTHLY_CHARGE;
        if (chargeableAmount <= 0) chargeableAmount = bill * 0.9; // fallback

        var units = 0;
        var remaining = chargeableAmount;
        var prevMax = 0;

        for (var i = 0; i < TARIFF_SLABS.length; i++) {
            var slab = TARIFF_SLABS[i];
            var slabUnits = slab.maxUnits === Infinity ? Infinity : (slab.maxUnits - prevMax);
            var slabCost  = slabUnits * slab.rate;

            if (remaining <= slabCost || slab.maxUnits === Infinity) {
                units += remaining / slab.rate;
                break;
            }

            units     += slabUnits;
            remaining -= slabCost;
            prevMax    = slab.maxUnits;
        }

        return Math.round(units);
    }

    /**
     * Recalculate a bill from units using the slab tariff.
     * Used to find what the "after solar" residual bill will be.
     *
     * [UPDATE_FORMULA] Same dependency on TARIFF_SLABS.
     *
     * @param {number} units - Monthly units consumed
     * @returns {number} Bill in LKR
     */
    function unitsToBill(units) {
        var total = FIXED_MONTHLY_CHARGE;
        var prevMax = 0;

        for (var i = 0; i < TARIFF_SLABS.length; i++) {
            var slab = TARIFF_SLABS[i];
            var slabUnits = slab.maxUnits === Infinity
                ? units - prevMax
                : Math.min(units - prevMax, slab.maxUnits - prevMax);

            if (slabUnits <= 0) break;

            total   += slabUnits * slab.rate;
            prevMax  = slab.maxUnits;

            if (units <= slab.maxUnits) break;
        }

        return Math.max(total, 0);
    }

    /**
     * Calculate recommended system size from the lookup table.
     * @param {number} bill
     * @returns {number} System size in kWp
     */
    function getSystemSize(bill) {
        for (var i = 0; i < SYSTEM_SIZE_TABLE.length; i++) {
            if (bill <= SYSTEM_SIZE_TABLE[i].maxBill) {
                return SYSTEM_SIZE_TABLE[i].sizeKw;
            }
        }
        return 20;
    }

    /**
     * Monthly EMI (Equal Monthly Instalment) using flat reducing-balance formula.
     * [UPDATE_FORMULA] This uses standard reducing balance (EMI) formula.
     *
     * @param {number} principal - Loan amount (LKR)
     * @param {number} annualRate - Annual interest rate (decimal, e.g. 0.11)
     * @param {number} tenureYears - Loan tenure in years
     * @returns {number} Monthly EMI in LKR
     */
    function calculateEMI(principal, annualRate, tenureYears) {
        var monthlyRate = annualRate / 12;
        var months      = tenureYears * 12;
        if (monthlyRate === 0) return principal / months;
        var emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
                  (Math.pow(1 + monthlyRate, months) - 1);
        return Math.round(emi);
    }

    /**
     * Master calculate function — orchestrates all sub-calculations.
     *
     * @param {number} bill       - Monthly bill (LKR)
     * @param {string} phase      - 'single' | 'three'
     * @param {string} bankKey    - Bank key from BANK_LOAN_CONFIG
     * @returns {object} Results object
     */
    function calculate(bill, phase, bankKey) {
        /* Step 1 — Estimate consumption */
        var monthlyUnits = billToUnits(bill);

        /* Step 2 — Recommended system size
           [UPDATE_FORMULA] Three-phase connections can handle larger systems.
           Adjust multiplier below if needed. */
        var systemKw = getSystemSize(bill);
        if (phase === 'three' && systemKw < 5) systemKw = 5; // minimum 5kW for 3-phase

        /* Step 3 — Estimate monthly generation (kWh)
           Formula: kWp × Peak Sun Hours × Days/Month × Performance Ratio
           [UPDATE_FORMULA] Adjust PEAK_SUN_HOURS and PERFORMANCE_RATIO above. */
        var DAYS_PER_MONTH = 30;
        var monthlyGeneration = systemKw * PEAK_SUN_HOURS * DAYS_PER_MONTH * PERFORMANCE_RATIO;

        /* Step 4 — Self-consumed vs exported units */
        var selfConsumed = Math.min(monthlyGeneration * SELF_CONSUMPTION_RATIO, monthlyUnits);
        var exported     = monthlyGeneration - selfConsumed;

        /* Step 5 — Residual units from grid after solar offset */
        var residualUnits = Math.max(monthlyUnits - selfConsumed, 0);

        /* Step 6 — New bill = bill on residual units + net metering export credit
           [UPDATE_FORMULA] Adjust NET_METERING_BUYBACK_RATE for actual CEB buy-back rate. */
        var residualBill   = unitsToBill(residualUnits);
        var exportCredit   = exported * NET_METERING_BUYBACK_RATE;
        var newBill        = Math.max(residualBill - exportCredit, FIXED_MONTHLY_CHARGE);

        /* Step 7 — Monthly and annual savings */
        var monthlySavings = bill - newBill;
        var annualSavings  = monthlySavings * 12;

        /* Step 8 — System cost and payback period
           [UPDATE_FORMULA] Replace SYSTEM_COST_PER_KW with actual installed cost per kWp. */
        var systemCost    = systemKw * SYSTEM_COST_PER_KW;
        var paybackYears  = annualSavings > 0 ? systemCost / annualSavings : 99;

        /* Step 9 — Panel count */
        var panelCount = Math.ceil((systemKw * 1000) / PANEL_WATTAGE_W);

        /* Step 10 — Bank loan EMI */
        var loanInfo = null;
        if (bankKey && BANK_LOAN_CONFIG[bankKey]) {
            var cfg = BANK_LOAN_CONFIG[bankKey];
            loanInfo = {
                bankName:    cfg.name,
                emi:         calculateEMI(systemCost, cfg.interestRate, cfg.tenureYears),
                tenureYears: cfg.tenureYears,
                rate:        Math.round(cfg.interestRate * 100 * 10) / 10
            };
        }

        return {
            systemKw:       systemKw,
            panelCount:     panelCount,
            monthlyUnits:   monthlyUnits,
            monthlySavings: Math.round(monthlySavings),
            annualSavings:  Math.round(annualSavings),
            newBill:        Math.round(newBill),
            paybackYears:   paybackYears,
            systemCost:     Math.round(systemCost),
            loanInfo:       loanInfo,
            savingsPct:     bill > 0 ? Math.min((monthlySavings / bill) * 100, 99) : 0
        };
    }


    /* ============================================================
       3. UI HELPERS
       ============================================================ */

    /** Format a number with thousands separators */
    function fmt(n) {
        return Math.round(n).toLocaleString('en-US');
    }

    function el(id) {
        return document.getElementById(id);
    }

    function setError(msg) {
        var errEl = el('calc-error');
        if (msg) {
            errEl.innerHTML = '<i class="icofont-warning-alt"></i> ' + msg;
            errEl.classList.add('visible');
        } else {
            errEl.innerHTML = '';
            errEl.classList.remove('visible');
        }
    }

    function addInputError(inputEl) {
        var wrap = inputEl.closest('.calc-input-prefix') || inputEl;
        wrap.classList.add('input-error');
        inputEl.classList.add('input-error');
    }

    function clearInputError(inputEl) {
        var wrap = inputEl.closest('.calc-input-prefix') || inputEl;
        wrap.classList.remove('input-error');
        inputEl.classList.remove('input-error');
    }

    function clearAllErrors() {
        setError('');
        ['calc-bill', 'calc-phase', 'calc-bank'].forEach(function (id) {
            var inputEl = el(id);
            if (inputEl) clearInputError(inputEl);
        });
    }


    /* ============================================================
       4. DISPLAY RESULTS
       ============================================================ */

    function displayResults(r) {
        /* System size */
        el('res-system-size').textContent = r.systemKw + ' kWp';
        el('res-system-panels').textContent = r.panelCount + ' × ' + PANEL_WATTAGE_W + 'W panels';

        /* Savings */
        el('res-monthly-savings').textContent = 'LKR ' + fmt(r.monthlySavings);
        el('res-annual-savings').textContent  = 'LKR ' + fmt(r.annualSavings);

        /* Payback */
        var pb = r.paybackYears;
        if (pb >= 99) {
            el('res-payback').textContent = 'N/A';
        } else {
            el('res-payback').textContent = pb.toFixed(1) + ' yrs';
        }

        /* Loan EMI */
        if (r.loanInfo) {
            el('res-loan').textContent = 'LKR ' + fmt(r.loanInfo.emi) + '/mo';
            el('res-loan-sub').textContent =
                r.loanInfo.bankName + ' · ' +
                r.loanInfo.rate + '% · ' +
                r.loanInfo.tenureYears + ' yrs';
        } else {
            el('res-loan').textContent = 'Select a bank';
            el('res-loan-sub').textContent = 'for EMI estimate';
        }

        /* Savings bar */
        var barPct = Math.min(Math.round(r.savingsPct), 99);
        el('res-bar-current').textContent = 'LKR ' + fmt(r.monthlySavings + r.newBill);
        el('res-bar-after').textContent   = 'LKR ' + fmt(r.newBill);

        // Trigger bar animation after a short delay
        var bar = el('res-savings-bar');
        bar.style.width = '0%';
        setTimeout(function () {
            bar.style.width = barPct + '%';
        }, 80);

        /* Show results panel */
        el('calc-empty-state').style.display  = 'none';
        var resultsEl = el('calc-results');
        resultsEl.style.display = 'block';

        // Force reflow before adding class for CSS transition to fire
        resultsEl.getBoundingClientRect();
        resultsEl.classList.add('visible');

        /* Scroll results into view on mobile */
        if (window.innerWidth < 992) {
            setTimeout(function () {
                el('results-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }

    function resetResults() {
        var resultsEl = el('calc-results');
        resultsEl.classList.remove('visible');

        setTimeout(function () {
            resultsEl.style.display = 'none';
            el('calc-empty-state').style.display = 'flex';
        }, 300);
    }


    /* ============================================================
       5. VALIDATION
       ============================================================ */

    function validate(bill, phase) {
        var ok = true;

        /* Bill */
        var billEl = el('calc-bill');
        if (!bill || isNaN(bill) || bill < 4860) {
            addInputError(billEl);
            ok = false;
        } else {
            clearInputError(billEl);
        }

        /* Phase */
        var phaseEl = el('calc-phase');
        if (!phase) {
            addInputError(phaseEl);
            ok = false;
        } else {
            clearInputError(phaseEl);
        }

        /* Bank is optional — no hard error, just no EMI shown */

        if (!ok) {
            var msgs = [];
            if (!bill || isNaN(bill))   msgs.push('Please enter your monthly electricity bill.');
            if (bill < 4860 && bill > 0) msgs.push('Minimum bill for solar consideration is LKR 4,860.');
            if (!phase)                 msgs.push('Please select your phase type.');
            setError(msgs.join(' '));
        }

        return ok;
    }


    /* ============================================================
       6. EVENT LISTENERS
       ============================================================ */

    document.addEventListener('DOMContentLoaded', function () {

        /* Clear errors on input change */
        ['calc-bill', 'calc-phase', 'calc-bank'].forEach(function (id) {
            var inputEl = el(id);
            if (!inputEl) return;
            inputEl.addEventListener('change', clearAllErrors);
            inputEl.addEventListener('input', clearAllErrors);
        });

        /* Calculate button */
        var calcBtn = el('calc-btn');
        if (calcBtn) {
            calcBtn.addEventListener('click', function () {
                clearAllErrors();

                var bill  = parseFloat(el('calc-bill').value);
                var phase = el('calc-phase').value;
                var bank  = el('calc-bank').value;

                if (!validate(bill, phase)) return;

                /* Button loading state */
                calcBtn.textContent = 'Calculating...';
                calcBtn.disabled = true;

                /* Small timeout gives a polished "calculating" feel */
                setTimeout(function () {
                    var results = calculate(bill, phase, bank);
                    displayResults(results);

                    calcBtn.innerHTML = '<i class="icofont-sun-alt me-2"></i> Calculate Savings';
                    calcBtn.disabled = false;
                }, 350);
            });
        }

        /* Recalculate / Reset button */
        var resetBtn = el('calc-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                resetResults();
                clearAllErrors();
                el('calc-bill').value  = '';
                el('calc-phase').value = '';
                el('calc-bank').value  = '';
                el('calc-bill').focus();
            });
        }

        /* Allow Enter key on the bill input to trigger calculation */
        var billInput = el('calc-bill');
        if (billInput) {
            billInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    calcBtn && calcBtn.click();
                }
            });
        }

    });

})();
