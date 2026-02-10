const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    permission_type: {
        type: DataTypes.ENUM('READ', 'DOWNLOAD'),
        allowNull: false,
    },
}, {
    timestamps: true,
    updatedAt: false,
});

module.exports = Permission;
