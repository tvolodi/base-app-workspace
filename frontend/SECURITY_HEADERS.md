# Security Headers Configuration

This document outlines the security headers that should be configured on the web server hosting the frontend application.

## Recommended Security Headers

### 1. X-Content-Type-Options
Prevents MIME type sniffing.

```
X-Content-Type-Options: nosniff
```

### 2. X-Frame-Options
Prevents clickjacking attacks.

```
X-Frame-Options: DENY
```

Or if you need to allow framing from same origin:
```
X-Frame-Options: SAMEORIGIN
```

### 3. X-XSS-Protection
Enables browser's XSS filter (legacy browsers).

```
X-XSS-Protection: 1; mode=block
```

### 4. Referrer-Policy
Controls referrer information sent with requests.

```
Referrer-Policy: strict-origin-when-cross-origin
```

### 5. Permissions-Policy
Controls which browser features can be used.

```
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()
```

### 6. Strict-Transport-Security (HSTS)
Forces HTTPS connections (only for HTTPS sites).

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 7. Content-Security-Policy (CSP)
Already configured in index.html, but can be enhanced on server level.

```
Content-Security-Policy: default-src 'self'; script-src 'self' http://localhost:8080; style-src 'self' 'unsafe-inline'; frame-src 'self' http://localhost:8080; connect-src 'self' http://localhost:8080 http://localhost:8090 ws://localhost:8080; img-src 'self' data: https:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
```

## Server Configuration Examples

### Nginx

Add to your nginx.conf or site configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # CSP Header (can override the one in HTML)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-src 'self'; connect-src 'self' https://api.yourdomain.com; img-src 'self' data: https:; font-src 'self'; object-src 'none';" always;
    
    # Serve React app
    root /var/www/app/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache

Add to your .htaccess or virtualhost configuration:

```apache
<IfModule mod_headers.c>
    # Security Headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    
    # HSTS (only for HTTPS)
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" "expr=%{HTTPS} == 'on'"
    
    # CSP
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-src 'self'; connect-src 'self' https://api.yourdomain.com; img-src 'self' data: https:; font-src 'self'; object-src 'none';"
</IfModule>

# React Router support
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### Express.js (Node.js)

Install helmet middleware:

```bash
npm install helmet
```

Then in your server.js:

```javascript
const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ["'self'", "http://localhost:8080"],
      connectSrc: ["'self'", "http://localhost:8080", "http://localhost:8090", "ws://localhost:8080"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"]
    }
  }
}));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Docker/Kubernetes

For containerized deployments, headers can be configured in ingress controllers or reverse proxies.

**Nginx Ingress (Kubernetes):**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-Frame-Options "DENY" always;
      add_header X-XSS-Protection "1; mode=block" always;
      add_header Referrer-Policy "strict-origin-when-cross-origin" always;
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
spec:
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

## Testing Security Headers

### Online Tools
- https://securityheaders.com/
- https://observatory.mozilla.org/

### Command Line (curl)
```bash
curl -I https://yourdomain.com
```

### Browser DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on the main document request
5. Check Response Headers

## Production Checklist

- [ ] X-Content-Type-Options: nosniff configured
- [ ] X-Frame-Options: DENY or SAMEORIGIN configured
- [ ] X-XSS-Protection: 1; mode=block configured
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured
- [ ] HSTS configured (HTTPS only)
- [ ] CSP configured and tested
- [ ] Headers tested with securityheaders.com
- [ ] All scores above B+ on security testing tools
- [ ] No console warnings about CSP violations
- [ ] All application features work with CSP enabled

## Notes

- **HSTS**: Only enable on HTTPS sites. Once enabled, users cannot access the site over HTTP.
- **CSP**: Test thoroughly as it can break functionality if too restrictive.
- **unsafe-inline**: Avoid if possible, use nonces or hashes instead for inline scripts/styles.
- **Development vs Production**: Use different CSP policies for localhost vs production domains.

## Environment-Specific Headers

### Development
```
CSP: More permissive, allows localhost
HSTS: Disabled
```

### Staging
```
CSP: Similar to production
HSTS: Enabled
```

### Production
```
CSP: Strict policy, only production domains
HSTS: Enabled with preload
All security headers enforced
```
