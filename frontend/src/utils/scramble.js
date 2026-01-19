import { Scrambow } from 'scrambow';

const scrambow = new Scrambow();

export const generateScramble = (scramblerType = '333') => {
  try {
    return scrambow.setType(scramblerType).get()[0].scramble_string;
  } catch (e) {
    console.warn(`Scrambler type '${scramblerType}' not found, falling back to 333`);
    return scrambow.setType('333').get()[0].scramble_string;
  }
};