import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

class SlackReporter implements Reporter {
  // private failedTests: TestCase[] = [];
  private retryAttempt: number = 0;
  private readonly maxRetries = 3;

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.retry > 0) {
      this.retryAttempt += 1;
    }
  }

  async onEnd() {
    if (this.retryAttempt == this.maxRetries) {
      const text = `❌ Playwright testing report - Failed after ${this.maxRetries} retries.`;
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        console.log('📤 Sent Slack notification');
      } catch (err) {
        console.error('⚠️ Slack webhook failed:', err);
      }
    } else {
      console.log('✅ Pass tests.');
    }
  }
}

export default SlackReporter;