import { expect } from 'chai';
import * as sns from '../src/index';

describe('SNS', () => {
  describe('getArn(...)', () => {
    it('should throw error when not initialized', () => {
      expect(sns.getArn).to.throw(/sns\.init/);
    });
  });

  describe('createTopic(...)', () => {
    it('should throw error when not initialized', () => {
      expect(sns.createTopic).to.throw(/sns\.init/);
    });
  });
});
