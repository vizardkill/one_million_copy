import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('should return status ok', () => {
    const controller = new HealthController();
    const response = controller.getHealth();

    expect(response.status).toBe('ok');
    expect(typeof response.timestamp).toBe('string');
  });
});
