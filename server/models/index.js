const sequelize = require('../config/database');
const User = require('./User');
const File = require('./File');
const Permission = require('./Permission');
const AuditLog = require('./AuditLog');

// User <-> File (Ownership)
User.hasMany(File, { foreignKey: 'owner_id', as: 'files' });
File.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// User <-> Permission <-> File (RBAC)
User.hasMany(Permission, { foreignKey: 'user_id' });
Permission.belongsTo(User, { foreignKey: 'user_id' });

File.hasMany(Permission, { foreignKey: 'file_id' });
Permission.belongsTo(File, { foreignKey: 'file_id' }); // Link permission to file

// User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

File.hasMany(AuditLog, { foreignKey: 'file_id' });
AuditLog.belongsTo(File, { foreignKey: 'file_id' });

module.exports = {
    sequelize,
    User,
    File,
    Permission,
    AuditLog,
};
