import { clientBundle } from '../../client/tsdown.client.ts'

// Build both halves from TS source directly (no separate tsc lib/types emit
// needed for this small package): the node half compiles src/index.ts to
// lib/index.js, and the browser half bundle src/client/index.ts to lib/client.js.
export default clientBundle('@dsh-marketplace/dsh-market', ['src/index.ts'])
