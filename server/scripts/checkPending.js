const { User } = require('../models');

const checkAndSeedPending = async () => {
    try {
        console.log('🔍 Checking User Statuses...');
        const users = await User.findAll();
        users.forEach(u => console.log(`- ${u.email}: ${u.status} (${u.role})`));

        const pendingCount = users.filter(u => u.status === 'PENDING').length;
        console.log(`\nFound ${pendingCount} PENDING users.`);

        if (pendingCount === 0) {
            console.log('⚠️ No PENDING users found. Creating one for testing...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('PendingPass123', salt);

            await User.create({
                name: 'Pending Tester',
                email: 'pending@test.com',
                password_hash: hashedPassword,
                role: 'USER',
                status: 'PENDING'
            });
            console.log('✅ Created PENDING user: pending@test.com');
        } else {
            console.log('👍 PENDING users exist. Dashboard should show them.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

checkAndSeedPending();
