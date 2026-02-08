const Resource = require('../models/Resource');
const Course = require('../models/Course');

// @desc    Upload a resource
// @route   POST /resources
// @access  Teacher
const uploadResource = async (req, res) => {
    try {
        const { courseId, title, description } = req.body;

        // Simple file handling (assuming file URL is passed from frontend for now, or use multer if we were doing actual uploads here)
        // For this phase, we'll simulate file upload by accepting a URL string or assume middleware handled it.
        // Let's assume req.file is handled by multer middleware in the route.

        // If we are using the existing multer setup, we might need to adjust.
        // For simplicity in this text-based env, I'll assume we pass a 'link' or we implement multer in routes.
        // Let's stick to the pattern used in Assignment: req.file

        const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl; // Fallback for links

        if (!fileUrl) {
            return res.status(400).json({ message: 'File or URL is required' });
        }

        const resource = await Resource.create({
            courseId,
            title,
            description,
            fileUrl,
            uploadedBy: req.user._id
        });

        res.status(201).json(resource);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get resources for a class
// @route   GET /resources/course/:courseId
// @access  Teacher, Student (enrolled)
const getClassResources = async (req, res) => {
    try {
        const { courseId } = req.params;
        const resources = await Resource.find({ courseId }).sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a resource
// @route   DELETE /resources/:id
// @access  Teacher (owner), Admin
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        // Check ownership (skip for Admin, logic can be refined)
        if (req.user.role === 'TEACHER' && resource.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this resource' });
        }

        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadResource, getClassResources, deleteResource };
