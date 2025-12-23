
export enum Grade {
  AA = 'AA',
  AB = 'AB',
  BB = 'BB',
  BC = 'BC',
  CC = 'CC',
  CD = 'CD',
  DD = 'DD',
  FF = 'FF',
  NA = 'NA'
}

export const GradePoints: Record<Grade, number> = {
  [Grade.AA]: 10,
  [Grade.AB]: 9,
  [Grade.BB]: 8,
  [Grade.BC]: 7,
  [Grade.CC]: 6,
  [Grade.CD]: 5,
  [Grade.DD]: 4,
  [Grade.FF]: 0,
  [Grade.NA]: 0
};

export interface Subject {
  code: string;
  name: string;
  credits: number;
  type: 'Theory' | 'Practical';
}

export interface CalculationResult {
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  gradePointsMap: Record<string, Grade>;
}
