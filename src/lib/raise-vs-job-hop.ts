export interface RaiseVsJobHopInputs {
  currentSalary: number;
  stayRaise: number;
  hopSalary: number;
  hopRaise: number;
  yearsToModel: number;
}

export interface RaiseVsJobHopYear {
  year: number;
  salaryStay: number;
  salaryHop: number;
  cumulativeStay: number;
  cumulativeHop: number;
  delta: number;
}

export interface RaiseVsJobHopResult {
  years: RaiseVsJobHopYear[];
  breakEvenYear: number | null;
  lifetimeDelta: number;
  hopWins: boolean;
}

export const DEFAULT_RAISE_VS_JOB_HOP_INPUTS: RaiseVsJobHopInputs = {
  currentSalary: 75_000,
  stayRaise: 0.03,
  hopSalary: 90_000,
  hopRaise: 0.04,
  yearsToModel: 10,
};

export function calcRaiseVsJobHop(inputs: RaiseVsJobHopInputs): RaiseVsJobHopResult {
  const { currentSalary, stayRaise, hopSalary, hopRaise, yearsToModel } = inputs;
  const years: RaiseVsJobHopYear[] = [];
  let cumulativeStay = 0;
  let cumulativeHop = 0;
  let breakEvenYear: number | null = null;

  for (let n = 1; n <= yearsToModel; n++) {
    const salaryStay = currentSalary * Math.pow(1 + stayRaise, n);
    const salaryHop = hopSalary * Math.pow(1 + hopRaise, n);
    cumulativeStay += salaryStay;
    cumulativeHop += salaryHop;
    const delta = cumulativeHop - cumulativeStay;

    if (breakEvenYear === null && cumulativeHop > cumulativeStay) {
      breakEvenYear = n;
    }

    years.push({ year: n, salaryStay, salaryHop, cumulativeStay, cumulativeHop, delta });
  }

  const last = years[years.length - 1];
  const lifetimeDelta = last ? last.cumulativeHop - last.cumulativeStay : 0;

  return { years, breakEvenYear, lifetimeDelta, hopWins: lifetimeDelta > 0 };
}
