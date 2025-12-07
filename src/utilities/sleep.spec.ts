import { sleep } from './sleep';

describe('sleep', () => {
  describe('correct behavior', () => {
    it('should resolve after the specified time', async () => {
      const ms = 100;
      const start = Date.now();

      await sleep(ms);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(ms - 10);
      expect(elapsed).toBeLessThan(ms + 50)
    });
  });

  describe('edge cases', () => {
    it('should resolve immediately with 0ms', async () => {
      const start = Date.now();

      await sleep(0);

      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(50)
    });

    it('should still resolve with negative ms (setTimeout behavior)', async () => {
      const start = Date.now();

      await sleep(-100);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50)
    });
  });
});
