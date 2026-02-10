const { User } = require('../models');
const jwt = require('jsonwebtoken');

const testAdminApi = async () => {
    try {
        console.log('🔑 Authenticating as Admin...');
        const adminUser = await User.findOne({ where: { role: 'ADMIN' } });
        if (!adminUser) {
            console.error('❌ No Admin found!');
            return;
        }

        const token = jwt.sign(
            { id: adminUser.id, role: adminUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('📡 Fetching Users from API...');
        const response = await fetch('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ API Response Status:', response.status);
        if (!response.ok) {
            console.error('❌ Request failed:', await response.text());
            return;
        }

        const data = await response.json();
        console.log(`📊 Received ${data.length} users.`);

        console.log('--- RAW DATA SAMPLE ---');
        data.forEach(u => {
            console.log(`Email: ${u.email} | Status: '${u.status}' | Role: '${u.role}'`);
        });
        console.log('-----------------------');

        const pending = data.filter(u => u.status === 'PENDING');
        console.log(`🔍 Script found ${pending.length} PENDING users using strict equality (=== 'PENDING').`);

    } catch (error) {
        console.error('❌ API Test Failed:', error);
    }
};

testAdminApi();
