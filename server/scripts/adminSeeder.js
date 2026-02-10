const bcrypt = require('bcryptjs');
const { User } = require('../models');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Skipping admin seeding.');
            return;
        }

        // Check if admin exists by EMAIL
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        if (existingAdmin) {
            existingAdmin.password_hash = hashedPassword;
            existingAdmin.role = 'ADMIN';
            existingAdmin.status = 'ACTIVE';
            await existingAdmin.save();
            console.log(`✅ Admin user updated: ${adminEmail}`);
        } else {
            console.log('🌱 Seeding initial Admin user...');
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password_hash: hashedPassword,
                role: 'ADMIN',
                status: 'ACTIVE'
            });
            console.log(`✅ Admin user created: ${adminEmail}`);
        }
    } catch (error) {
        console.error('❌ Failed to seed admin user:', error);
    }
};

module.exports = seedAdmin;
