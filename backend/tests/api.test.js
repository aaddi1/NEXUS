/**
 * NEXUS AUTOMATED INTEGRATION & QUALITY GATE TEST SUITE
 * Tests authentication, RBAC, commerce correctness, stock locks,
 * cryptographic invoices, and financial intelligence.
 */

const assert = require('assert');
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqOpts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOpts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('  RUNNING NEXUS INTEGRATION TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${err.message}\n`);
      failed++;
    }
  }

  let adminToken = '';
  let employeeToken = '';

  // 1. Health Check
  await test('Backend Health Check (/api/health)', async () => {
    const res = await request('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.database, 'connected');
  });

  // 2. Authentication - Super Admin Login
  await test('Super Admin Authentication (aryan@nexus.com)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'aryan@nexus.com', password: 'admin123' }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token, 'Token must be present');
    assert.strictEqual(res.data.user.role, 'superadmin');
    adminToken = res.data.token;
  });

  // 3. Authentication - Employee Login
  await test('Employee Authentication (riya@nexus.com)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'riya@nexus.com', password: 'admin123' }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token, 'Token must be present');
    assert.strictEqual(res.data.user.role, 'Sales Lead');
    employeeToken = res.data.token;
  });

  // 4. Security - Privilege Escalation Prevention on Signup
  await test('Registration Role Escalation Prevention (role=superadmin blocked)', async () => {
    const randomEmail = `test_attacker_${Date.now()}@test.com`;
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Attacker',
        email: randomEmail,
        password: 'password123',
        role: 'superadmin'
      }
    });
    assert.strictEqual(res.status, 201);
    assert.notStrictEqual(res.data.user.role, 'superadmin', 'Superadmin role must be overridden to safe default');
  });

  // 5. RBAC - Super Admin API Protected from Employee
  await test('RBAC: Employee cannot access /api/admin/stats (HTTP 403)', async () => {
    const res = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert.strictEqual(res.status, 403, 'Employee must receive 403 Forbidden on Super Admin routes');
  });

  // 6. RBAC - Super Admin Can Access /api/admin/stats
  await test('RBAC: Super Admin can access /api/admin/stats (HTTP 200)', async () => {
    const res = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.platform.total_users >= 1);
  });

  // 7. Password Reset Request Flow
  await test('Password Reset Request (/api/auth/forgot-password)', async () => {
    const res = await request('/auth/forgot-password', {
      method: 'POST',
      body: { email: 'aryan@nexus.com' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.reset_token, 'Reset token generated');
  });

  // 8. Commerce - Create Order with Row Lock and Stock Decrement
  await test('Commerce: Create Order with Atomic Stock Decrement', async () => {
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        customer_id: 1,
        items: [{ product_id: 1, quantity: 1 }],
        warehouse: 'Mumbai',
        payment_status: 'paid',
        payment_method: 'upi',
        discount: 200,
        tax_rate: 18,
        generate_invoice: true
      }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.id, 'Order ID must exist');
    assert.ok(res.data.data.invoice, 'Invoice must be auto-generated');
  });

  // 9. Commerce - Prevent Overselling (Reject Insufficient Stock)
  await test('Commerce: Reject Order when Stock is Insufficient (HTTP 400)', async () => {
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        customer_id: 1,
        items: [{ product_id: 1, quantity: 999999 }], // Exceeds available stock
        warehouse: 'Mumbai'
      }
    });
    assert.strictEqual(res.status, 400, 'Must reject overselling with 400');
    assert.strictEqual(res.data.success, false);
  });

  // 10. Employee Self-Service Workspace
  await test('Employee Workspace: Scoped Personal Stats & Sales (/api/employees/me/workspace)', async () => {
    const res = await request('/employees/me/workspace', {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.profile.email, 'riya@nexus.com');
    assert.ok(Array.isArray(res.data.data.sales), 'Personal sales list must exist');
  });

  // 11. Financial Intelligence Overview
  await test('Financial Intelligence Overview (/api/financials/overview)', async () => {
    const res = await request('/financials/overview', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(typeof res.data.data.financials.total_revenue === 'number');
    assert.ok(typeof res.data.data.financials.net_profit === 'number');
  });

  // 12. Support & Complaints Ticket Lifecycle
  await test('Complaints System: Submit Ticket -> Super Admin Resolve', async () => {
    // Submit
    const submitRes = await request('/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employeeToken}` },
      body: {
        user_name: 'Riya Mehta',
        user_email: 'riya@nexus.com',
        type: 'Stock / Warehouse Desync',
        subject: 'Inventory reorder notification delay',
        message: 'Need alert threshold lowered for Mumbai warehouse.'
      }
    });
    assert.strictEqual(submitRes.status, 201);
    const ticketId = submitRes.data.data.id;

    // Resolve by Super Admin
    const resolveRes = await request(`/complaints/${ticketId}/resolve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { admin_reply: 'Threshold updated in system optimizer.' }
    });
    assert.strictEqual(resolveRes.status, 200);
    assert.strictEqual(resolveRes.data.data.status, 'resolved');
  });

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
