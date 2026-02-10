const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    action_type: {
        type: DataTypes.ENUM('LOGIN', 'UPLOAD', 'DOWNLOAD', 'SHARE', 'DELETE', 'STATUS_CHANGE', 'ROLE_CHANGE'),
        allowNull: false,
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    updatedAt: false,
});

module.exports = AuditLog;
