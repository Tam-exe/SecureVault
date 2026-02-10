const { User, AuditLog, File } = require('../models');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['ADMIN', 'MANAGER', 'USER'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.id === req.user.id) {
            return res.status(403).json({ message: 'Cannot change your own role' });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log Role Change
        try {
            await AuditLog.create({
                user_id: req.user.id,
                action_type: 'ROLE_CHANGE',
                ip_address: req.ip,
                file_id: null
            });
        } catch (logError) {
            console.error('Failed to create audit log for role update:', logError.message);
        }

        res.json({ message: 'User role updated successfully', user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (id === req.user.id) {
            return res.status(400).json({ message: 'Cannot change your own status' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = status;
        await user.save();

        // Log Status Change
        try {
            await AuditLog.create({
                user_id: req.user.id,
                action_type: 'STATUS_CHANGE',
                ip_address: req.ip,
                file_id: null
            });
        } catch (logError) {
            console.error('Failed to create audit log for status update:', logError.message);
        }

        res.json({ message: 'User status updated successfully', status: user.status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            include: [
                { model: User, attributes: ['name', 'email', 'role'] },
                { model: File, attributes: ['original_name', 'stored_name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInAdminId = req.user.id;

        if (id === loggedInAdminId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const userToDelete = await User.findByPk(id);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: Depending on DB constraints, deleting a user might cascade delete files/logs
        // or fail if constraints prevent it. Typically we'd handle orphaned files first.
        // For simplicity and assuming cascading deletes are handled by Sequelize or DB:
        await userToDelete.destroy();

        // Log Deletion
        try {
            await AuditLog.create({
                user_id: loggedInAdminId,
                action_type: 'DELETE',
                ip_address: req.ip,
                file_id: null
            });
        } catch (logError) {
            console.error('Failed to create audit log for user deletion:', logError.message);
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, updateUserRole, getAuditLogs, deleteUser, updateUserStatus };
