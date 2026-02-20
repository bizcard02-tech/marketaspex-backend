import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send({ message: 'Welcome back to realtime-chat! created by: CHOUDHARY ASIF ' });
});

export default router;
