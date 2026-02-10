const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const File = sequelize.define('File', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    original_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stored_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    file_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hash_sha256: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    updatedAt: false,
});

module.exports = File;
