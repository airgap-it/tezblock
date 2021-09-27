import { DecimalsFormatterPipe } from './decimals-formatter.pipe';

describe('DecimalsFormatterPipe', () => {
  const pipe = new DecimalsFormatterPipe();

  describe('transform', () => {
    it('removes trailing zeros', () => {
      expect(pipe.transform('1.0001000')).toBe('1.0001');
    });

    it('rounds not zero decimals to 2 chars', () => {
      expect(pipe.transform('1.00993')).toBe('1.0099');
    });
  });
});
