const { auth } = require('express-oauth2-jwt-bearer');

// Validate required environment variables
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
  console.warn('WARNING: Auth0 environment variables are not properly configured.');
  console.warn('Please set AUTH0_DOMAIN and AUTH0_AUDIENCE in your .env file.');
  console.warn('Running in development mode with mock authentication.');
}

// Auth0 configuration for JWT validation
const checkJwt = (req, res, next) => {
  console.log('🔐 Checking JWT authentication...');
  
  // Force mock authentication in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️ Running in development mode with mock authentication');
    // Mock user for development
    req.auth = {
      payload: {
        sub: 'dev-user-id',
        roles: ['admin', 'reviewer', 'analyst']
      }
    };
    console.log('✅ Using mock user:', req.auth);
    return next();
  }
  
  // Use real JWT validation in production
  const jwtMiddleware = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
    tokenSigningAlg: 'RS256'
  });
  
  return jwtMiddleware(req, res, next);
};

// Simple role-based access control middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    // In a real app, you would get the user's roles from the JWT token
    // This is a simplified example - in production, you should validate the token and extract roles
    const userRoles = req.auth?.payload?.roles || [];
    
    // Check if user has any of the required roles
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        requiredRoles: roles
      });
    }
    
    next();
  };
};

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  // In a real app, you would verify the JWT token here
  // This is a simplified example
  if (req.headers.authorization) {
    return next();
  }
  
  res.status(401).json({
    error: 'Unauthorized',
    message: 'Authentication required'
  });
};

module.exports = {
  checkJwt,
  checkRole,
  isAuthenticated
};
