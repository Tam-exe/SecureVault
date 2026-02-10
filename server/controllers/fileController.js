const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { File, AuditLog, Permission, User } = require('../models');

const calculateHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
};

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { originalname, filename, path: filePath, size, mimetype } = req.file;
        const owner_id = req.user.id;

        // Calculate hash
        const hash_sha256 = await calculateHash(filePath);

        // Save to DB
        const newFile = await File.create({
            original_name: originalname,
            stored_name: filename,
            file_size: size,
            file_type: mimetype,
            hash_sha256: hash_sha256,
            owner_id: owner_id
        });

        // Log action
        await AuditLog.create({
            user_id: owner_id,
            action_type: 'UPLOAD',
            file_id: newFile.id,
            ip_address: req.ip
        });

        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    } catch (error) {
        console.error(error);
        // Clean up file if DB save fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete orphaned file:', err);
            });
        }
        res.status(500).json({ message: 'Server error during upload' });
    }
};

const { Op } = require('sequelize');

const getMyFiles = async (req, res) => {
    try {
        const userId = req.user.id; // Get logged-in user ID

        // 1. Get IDs of files shared with this user
        const permissions = await Permission.findAll({
            where: { user_id: userId },
            attributes: ['file_id']
        });
        const sharedFileIds = permissions.map(p => p.file_id);

        // 2. Fetch Owner's Files OR Shared Files
        const files = await File.findAll({
            where: {
                [Op.or]: [
                    { owner_id: userId },
                    { id: { [Op.in]: sharedFileIds } } // Use Op.in for array of IDs
                ]
            },
            include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }], // Optional: See who owns it
            order: [['createdAt', 'DESC']]
        });

        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin can see all files
const getAllFiles = async (req, res) => {
    try {
        const files = await File.findAll({
            include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Authorization Check
        // 1. Owner can always download
        // 2. Admin can always download
        // 3. User with 'DOWNLOAD' permission can download
        let isAuthorized = file.owner_id === userId || userRole === 'ADMIN';

        if (!isAuthorized) {
            const permission = await Permission.findOne({
                where: {
                    file_id: id,
                    user_id: userId,
                    permission_type: 'DOWNLOAD'
                }
            });
            if (permission) isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Log Download
        await AuditLog.create({
            user_id: userId,
            action_type: 'DOWNLOAD',
            file_id: file.id,
            ip_address: req.ip
        });

        const filePath = path.join(__dirname, '../uploads', file.stored_name);

        // Check if file exists on disk
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, file.original_name);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const shareFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, permission_type } = req.body; // permission_type: 'READ' or 'DOWNLOAD'
        const ownerId = req.user.id;

        if (!['READ', 'DOWNLOAD'].includes(permission_type)) {
            return res.status(400).json({ message: 'Invalid permission type' });
        }

        const file = await File.findOne({ where: { id, owner_id: ownerId } });
        if (!file) {
            return res.status(404).json({ message: 'File not found or access denied' });
        }

        const recipient = await User.findOne({ where: { email } });
        if (!recipient) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (recipient.id === ownerId) {
            return res.status(400).json({ message: 'Cannot share file with yourself' });
        }

        // Create or update permission
        const [permission, created] = await Permission.findOrCreate({
            where: { file_id: id, user_id: recipient.id },
            defaults: { permission_type }
        });

        if (!created) {
            permission.permission_type = permission_type;
            await permission.save();
        }

        // Log Share
        await AuditLog.create({
            user_id: ownerId,
            action_type: 'SHARE',
            file_id: id,
            ip_address: req.ip
        });

        res.json({ message: `File shared with ${email} for ${permission_type}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Only Owner or Admin can delete
        if (file.owner_id !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const filePath = path.join(__dirname, '../uploads', file.stored_name);

        // Delete from DB
        await file.destroy();

        // Delete from Disk
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Log Delete
        await AuditLog.create({
            user_id: userId,
            action_type: 'DELETE',
            file_id: id,
            ip_address: req.ip
        });

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadFile, getMyFiles, getAllFiles, downloadFile, shareFile, deleteFile };
