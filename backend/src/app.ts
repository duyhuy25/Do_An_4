import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import lostReportRoutes from './routes/lostReportRoutes';
import itemRoutes from './routes/itemRoutes';
import claimRoutes from './routes/claimRoutes';
import adminRoutes from './routes/adminRoutes';
import dbRoutes from './routes/dbRoutes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api', dbRoutes);
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', lostReportRoutes);
app.use('/api', itemRoutes);
app.use('/api', claimRoutes);
app.use('/api', adminRoutes);

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Do_An_4 API is running',
    database: 'SQL Server connection ready'
  });
});

export default app;
