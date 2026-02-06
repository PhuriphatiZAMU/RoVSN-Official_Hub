module.exports = {
    apps: [
        {
            name: 'rov-server',
            script: './dist/index.js',
            cwd: './server', // Important: Set CWD to server folder to find .env
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                // Using values from .env directly here as fallback/override for clarity
                MONGO_URI: 'mongodb+srv://phuriphatizamu_db_user:eJjaB6JO1YFr3y6Z@cluster.bi2ornw.mongodb.net/?appName=Cluster',
                JWT_SECRET: 'secret_key_for_dev_only_123',
                ADMIN_USERNAME: 'admin',
                CLOUDINARY_CLOUD_NAME: 'dpnrq5nso',
                CLOUDINARY_API_KEY: '783967561374638',
                CLOUDINARY_API_SECRET: '-CM9mv9-pihsxRazHP8dW-jBKks',
                GEMINI_API_KEY: 'AIzaSyBIzur8RAN0Fz8B9ho87mVY2OaokYt1ONQ'
            }
        },
        {
            name: 'rov-client',
            cwd: './client',
            // Direct next binary execution for Windows stability
            script: './node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
