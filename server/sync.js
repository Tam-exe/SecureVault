const { sequelize } = require('./models');

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Force: true drops encryption tables if they exist, use with caution in prod
        // Alter: true updates tables to match models
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

syncDatabase();
