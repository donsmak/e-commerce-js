const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const errorHandler = require('./api/middleware/errorHandler');

// Import routes
const productRoutes = require('./api/routes/product.routes');
const cartRoutes = require('./api/routes/cart.routes');
const healthRoutes = require('./api/routes/health.routes');

class App {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Only enable detailed errors in development
        if (config.isDevelopment) {
            this.app.use(require('morgan')('dev'));
        }

        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join(__dirname, '../public')));
        this.app.use(cookieParser());
    }

    setupRoutes() {
        // API routes
        this.app.use('/api/products', productRoutes);
        this.app.use('/api/cart', cartRoutes);
        this.app.use('/api/health', healthRoutes);

        // Serve main page
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });

        // Health check route
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                environment: config.env,
                timestamp: new Date().toISOString(),
            });
        });
    }

    setupErrorHandling() {
        this.app.use(errorHandler);
    }

    listen(PORT) {
        this.app.listen(PORT, () => {
            console.log(
                `Server is running in ${config.env} mode on http://${config.server.host}:${PORT}`
            );
            if (config.debug) {
                console.log('Debug mode enabled');
            }
        });
    }
}

module.exports = App;