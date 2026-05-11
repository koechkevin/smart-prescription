import app from './app.js';
import { config } from './config.js';

app.listen(config.port, () => {
  console.log(`Smart Prescription API running on port ${config.port}`);
});
