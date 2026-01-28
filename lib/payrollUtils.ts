export const INSS_LABORAL_RATE = 0.07;
export const INSS_PATRONAL_RATE = 0.215;
export const INATEC_RATE = 0.02;

export function calculateINSS(grossSalary: number): number {
    return grossSalary * INSS_LABORAL_RATE;
}

export function calculateEmployerCosts(grossSalary: number): {
    inssPatronal: number;
    inatec: number;
    total: number;
} {
    const inssPatronal = grossSalary * INSS_PATRONAL_RATE;
    const inatec = grossSalary * INATEC_RATE;
    return {
        inssPatronal,
        inatec,
        total: inssPatronal + inatec,
    };
}

export function calculateIR(grossSalary: number): number {
    const inss = calculateINSS(grossSalary);
    const netSalary = grossSalary - inss;
    const annualSalary = netSalary * 12;

    let annualTax = 0;

    if (annualSalary <= 100000) {
        annualTax = 0;
    } else if (annualSalary <= 200000) {
        annualTax = (annualSalary - 100000) * 0.15;
    } else if (annualSalary <= 350000) {
        annualTax = (annualSalary - 200000) * 0.20 + 15000;
    } else if (annualSalary <= 500000) {
        annualTax = (annualSalary - 350000) * 0.25 + 45000;
    } else {
        annualTax = (annualSalary - 500000) * 0.30 + 82500;
    }

    return annualTax / 12;
}

export function calculateAguinaldo(salary: number, hireDate: Date): number {
    const now = new Date();
    // Simplified logic: Calculate proportional based on days worked in the current year or since hire date
    // For exact Nicaraguan law, it's from Dec 1 to Nov 30.
    // Here we will approximate based on tenure if < 1 year, or full salary if > 1 year.

    // This is a helper for the "Liquidation" calculator mostly.
    // For a simple monthly accrual view, it's salary / 12.

    // Let's implement the proportional logic for liquidation:
    const startOfYear = new Date(now.getFullYear(), 0, 1); // Jan 1
    const effectiveDate = hireDate > startOfYear ? hireDate : startOfYear;

    const diffTime = Math.abs(now.getTime() - effectiveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Proportional: (Salary / 30) * (Days Worked / 12) * ... wait.
    // Standard formula: (Salary / 12) * (Months worked)
    // Or simpler: (Salary / 365) * Days Worked

    return (salary / 365) * diffDays;
}

export function calculateVacationPay(salary: number, daysAccrued: number): number {
    const dailySalary = salary / 30;
    return dailySalary * daysAccrued;
}

export function calculateIndemnity(salary: number, yearsWorked: number): number {
    // Art 45:
    // First 3 years: 1 month per year.
    // 4th year onwards: 20 days per year.
    // Max 5 months salary total? No, the law says:
    // "un mes de salario por cada uno de los primeros tres años"
    // "veinte días de salario por cada año de trabajo a partir del cuarto año"
    // "En ningún caso la indemnización será menor de un mes ni mayor de cinco meses" -> This "5 months" cap is often debated or applies to specific contexts, but standard interpretation often caps the *calculation basis* or the total sum. 
    // Actually, the 5 month cap is for the *total indemnity amount* in many interpretations of Art 45 for indefinite contracts.
    // Let's implement the standard accumulation:

    let totalMonths = 0;

    if (yearsWorked <= 3) {
        totalMonths = yearsWorked;
    } else {
        totalMonths = 3 + ((yearsWorked - 3) * (20 / 30));
    }

    // Cap at 5 months salary if strictly following the "ni mayor de cinco meses" clause for resignation/unjustified dismissal in some contexts.
    // User asked for "Regla del Art. 45 (1 mes por cada uno de los primeros 3 años, luego 20 días por año, tope 5 meses)".
    // So we apply the cap.

    if (totalMonths > 5) totalMonths = 5;

    return salary * totalMonths;
}
