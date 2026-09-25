const express = require('express');
const router = express.Router();
const db = require('../db');
const emailService = require('../services/emailService');

// POST /api/sop/admin/create-user
// Endpoint for admins to create a new user
router.post('/admin/create-user', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Assuming a db function like createUser exists in db.js
        const newUser = await db.createUser({ name, email, password });
        
        res.status(201).json({ 
            success: true, 
            message: 'User created successfully', 
            user: newUser 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/sop/login
// Endpoint for users to login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Assuming a db function like findUserByEmail exists in db.js
        const user = await db.findUserByEmail(email);

        // In a production environment, you should compare hashed passwords
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/sop/accept
// Endpoint for users to accept SOP
router.post('/accept', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Assuming a db function like updateSopAcceptance exists in db.js
        await db.updateSopAcceptance(email, true);

        // Send acceptance email
        await emailService.sendAcceptanceEmail(email);

        res.status(200).json({ 
            success: true, 
            message: 'SOP accepted successfully and email sent'
        });
    } catch (error) {
        console.error('Error accepting SOP:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
