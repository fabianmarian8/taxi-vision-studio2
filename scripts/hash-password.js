#!/usr/bin/env node
/**
 * Generate bcrypt hash for admin password
 * Usage: node scripts/hash-password.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log('\nAdd this to your .env.local and Vercel:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('\nAfter setting the hash, you can remove ADMIN_PASSWORD from env.\n');
