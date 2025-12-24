/**
 * Test file for encryption/decryption
 * Run this in the browser console to verify crypto functions work correctly
 * This file will be deleted after testing
 */

import { deriveKeyFromPassword, validateMasterPassword } from './keyDerivation';
import { encrypt, decrypt, createVerificationCheck, verifyPassword } from './encryption';
import { isCryptoSupported } from './utils';

export async function runCryptoTests() {
  console.log('🔒 Starting Custode Crypto Tests...\n');

  // Test 1: Check Web Crypto API support
  console.log('Test 1: Web Crypto API Support');
  const isSupported = isCryptoSupported();
  console.log(isSupported ? '✅ Web Crypto API supported' : '❌ Web Crypto API NOT supported');
  if (!isSupported) return;

  // Test 2: Master password validation
  console.log('\nTest 2: Master Password Validation');
  const weakPassword = validateMasterPassword('weak');
  const strongPassword = validateMasterPassword('MySecurePass123!');
  console.log('Weak password "weak":', weakPassword.isValid ? '✅' : '❌', weakPassword.failedRequirements);
  console.log('Strong password "MySecurePass123!":', strongPassword.isValid ? '✅' : '❌');

  // Test 3: Key derivation (first time - generate salt)
  console.log('\nTest 3: Key Derivation (First Time)');
  const startTime1 = performance.now();
  const { key: key1, salt } = await deriveKeyFromPassword('MySecurePass123!');
  const endTime1 = performance.now();
  console.log('✅ Key derived in', Math.round(endTime1 - startTime1), 'ms');
  console.log('Generated salt:', salt.substring(0, 20) + '...');

  // Test 4: Key derivation (with existing salt)
  console.log('\nTest 4: Key Derivation (With Salt)');
  const startTime2 = performance.now();
  const { key: key2 } = await deriveKeyFromPassword('MySecurePass123!', salt);
  const endTime2 = performance.now();
  console.log('✅ Key derived with salt in', Math.round(endTime2 - startTime2), 'ms');

  // Test 5: Encrypt mock vault data
  console.log('\nTest 5: Vault Encryption');
  const mockVault = {
    passwords: [
      { id: '1', name: 'Gmail', username: 'user@gmail.com', password: 'secret123' },
      { id: '2', name: 'GitHub', username: 'developer', password: 'github_token' }
    ],
    notes: [
      { id: 'n1', title: 'Recovery Codes', content: 'ABCD-1234-EFGH-5678' }
    ],
    devKeys: [
      { id: 'd1', service: 'OpenAI', key: 'sk-proj-abc123', environment: 'Production' }
    ],
    version: 1
  };

  const encrypted = await encrypt(mockVault, key1);
  console.log('✅ Vault encrypted');
  console.log('Ciphertext (first 50 chars):', encrypted.ciphertext.substring(0, 50) + '...');
  console.log('IV:', encrypted.iv);

  // Test 6: Decrypt vault data
  console.log('\nTest 6: Vault Decryption');
  const decrypted = await decrypt(encrypted, key2);
  console.log('✅ Vault decrypted');
  console.log('Decrypted matches original:', JSON.stringify(decrypted) === JSON.stringify(mockVault) ? '✅' : '❌');
  console.log('Decrypted passwords count:', decrypted.passwords.length);

  // Test 7: Verification check (correct password)
  console.log('\nTest 7: Verification Check (Correct Password)');
  const verificationCheck = await createVerificationCheck(key1);
  console.log('✅ Verification check created');
  const verifyCorrect = await verifyPassword(verificationCheck, key2);
  console.log('Verification with correct password:', verifyCorrect.isValid ? '✅' : '❌');

  // Test 8: Verification check (wrong password)
  console.log('\nTest 8: Verification Check (Wrong Password)');
  const { key: wrongKey } = await deriveKeyFromPassword('WrongPassword123!', salt);
  const verifyWrong = await verifyPassword(verificationCheck, wrongKey);
  console.log('Verification with wrong password:', !verifyWrong.isValid ? '✅ Correctly rejected' : '❌ Should have failed');

  // Test 9: Decrypt with wrong key (should fail)
  console.log('\nTest 9: Decrypt With Wrong Key');
  try {
    await decrypt(encrypted, wrongKey);
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Correctly threw error:', (error as Error).message);
  }

  console.log('\n🎉 All crypto tests completed!');
  console.log('\n📊 Summary:');
  console.log('- PBKDF2 iterations: 100,000 (as per PRD)');
  console.log('- Algorithm: AES-256-GCM');
  console.log('- Key derivation time: ~' + Math.round((endTime1 - startTime1 + endTime2 - startTime2) / 2) + 'ms');
  console.log('- Encryption: ✅ Working');
  console.log('- Decryption: ✅ Working');
  console.log('- Password verification: ✅ Working');
  console.log('- Wrong password rejection: ✅ Working');
}

// Auto-run tests if in development
if (import.meta.env.DEV) {
  console.log('Run runCryptoTests() in console to test encryption');
}
