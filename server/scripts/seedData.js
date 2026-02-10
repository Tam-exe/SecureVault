const { User, File, AuditLog } = require('../models');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
    try {
        console.log('🌱 Seeding test data...');

        // 1. Create a Manager
        const salt = await bcrypt.genSalt(10);
        const managerHash = await bcrypt.hash('ManagerPass123', salt);
        const manager = await User.create({
            name: 'Test Manager',
            email: 'manager@test.com',
            password_hash: managerHash,
            role: 'MANAGER',
            status: 'ACTIVE'
        });
        console.log('✅ Created Manager: manager@test.com');

        // 2. Create a User
        const userHash = await bcrypt.hash('UserPass123', salt);
        const user = await User.create({
            name: 'Test User',
            email: 'user@test.com',
            password_hash: userHash,
            role: 'USER',
            status: 'ACTIVE'
        });
        console.log('✅ Created User: user@test.com');

        // 3. Create a File for Manager
        await File.create({
            id: uuidv4(),
            original_name: 'quarterly_report.pdf',
            stored_name: 'test_file_mgr_1.pdf',
            file_size: 1024 * 500, // 500KB
            file_type: 'application/pdf',
            hash_sha256: 'dummyhash123',
            owner_id: manager.id
        });
        console.log('✅ Created File for Manager');

        // 4. Create Audit Logs
        await AuditLog.create({
            user_id: manager.id,
            action_type: 'LOGIN',
            ip_address: '127.0.0.1'
        });
        await AuditLog.create({
            user_id: user.id,
            action_type: 'LOGIN',
            ip_address: '127.0.0.1'
        });
        console.log('✅ Created Audit Logs');

        console.log('🎉 Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
