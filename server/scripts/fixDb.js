const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: console.log,
    }
);

const fixDb = async () => {
    try {
        console.log('🔧 Starting Database Fix...');

        // 1. Temporarily change role column to VARCHAR to accept any value
        console.log('Step 1: Relaxing role column constraint...');
        await sequelize.query("ALTER TABLE Users MODIFY COLUMN role VARCHAR(50) DEFAULT 'USER';");

        // 2. Update legacy values to new generic values
        console.log('Step 2: Migrating legacy roles...');
        await sequelize.query("UPDATE Users SET role='USER' WHERE role='Viewer';");
        await sequelize.query("UPDATE Users SET role='MANAGER' WHERE role='Uploader';");
        await sequelize.query("UPDATE Users SET role='ADMIN' WHERE role='Admin';");

        // 3. Ensure all roles are uppercase (fallback)
        await sequelize.query("UPDATE Users SET role=UPPER(role);");

        console.log('✅ Database Fix Complete. You can now start the server.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database Fix Failed:', error);
        process.exit(1);
    }
};

fixDb();
