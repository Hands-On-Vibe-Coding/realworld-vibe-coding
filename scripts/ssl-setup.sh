#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# This script sets up SSL certificates for the RealWorld application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DOMAIN=${DOMAIN:-""}
EMAIL=${EMAIL:-""}
STAGING=${STAGING:-"false"}
FORCE_RENEWAL=${FORCE_RENEWAL:-"false"}

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --domain DOMAIN       Domain name for SSL certificate (required)"
    echo "  --email EMAIL         Email address for Let's Encrypt (required)"
    echo "  --staging             Use Let's Encrypt staging environment"
    echo "  --force-renewal       Force certificate renewal"
    echo "  --help                Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DOMAIN               Domain name"
    echo "  EMAIL                Email address"
    echo "  STAGING              Use staging environment (true/false)"
    echo "  FORCE_RENEWAL        Force renewal (true/false)"
    echo ""
    echo "Examples:"
    echo "  $0 --domain realworld.example.com --email admin@example.com"
    echo "  $0 --domain realworld.example.com --email admin@example.com --staging"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root for SSL certificate management."
        log_info "Please run: sudo $0 $@"
        exit 1
    fi
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        log_info "Installing certbot..."
        
        # Detect OS and install certbot
        if [[ -f /etc/debian_version ]]; then
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
        elif [[ -f /etc/redhat-release ]]; then
            yum install -y certbot python3-certbot-nginx
        elif command -v brew &> /dev/null; then
            brew install certbot
        else
            log_error "Unsupported operating system. Please install certbot manually."
            exit 1
        fi
    fi
    
    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx is not installed. Please install nginx first."
        exit 1
    fi
    
    # Check if domain is accessible
    if [[ -n "$DOMAIN" ]]; then
        log_info "Checking domain accessibility..."
        if ! ping -c 1 "$DOMAIN" &> /dev/null; then
            log_warn "Domain $DOMAIN might not be accessible. Proceeding anyway..."
        fi
    fi
    
    log_info "Prerequisites check completed."
}

setup_nginx_config() {
    log_info "Setting up nginx configuration for domain: $DOMAIN"
    
    # Create nginx site configuration
    cat > "/etc/nginx/sites-available/$DOMAIN" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend (React App)
    location / {
        proxy_pass http://frontend-service:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Handle client-side routing
        try_files \$uri \$uri/ @fallback;
    }
    
    # Fallback for client-side routing
    location @fallback {
        proxy_pass http://frontend-service:80/index.html;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://backend-service:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # Static assets caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend-service:80;
        proxy_set_header Host \$host;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # Security: Deny access to hidden files
    location ~ /\\. {
        deny all;
    }
    
    # Security: Deny access to backup files
    location ~* \\.(bak|config|sql|fla|psd|ini|log|sh|inc|swp|dist)$ {
        deny all;
    }
}
EOF

    # Enable the site
    ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
    
    # Remove default site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    if nginx -t; then
        log_info "Nginx configuration is valid."
    else
        log_error "Nginx configuration test failed."
        exit 1
    fi
    
    # Create webroot directory for Let's Encrypt
    mkdir -p /var/www/html
    
    # Reload nginx
    systemctl reload nginx
    
    log_info "Nginx configuration completed."
}

obtain_ssl_certificate() {
    log_info "Obtaining SSL certificate for domain: $DOMAIN"
    
    # Prepare certbot arguments
    local certbot_args=(
        "certonly"
        "--webroot"
        "--webroot-path=/var/www/html"
        "--email=$EMAIL"
        "--agree-tos"
        "--no-eff-email"
        "--domains=$DOMAIN,www.$DOMAIN"
    )
    
    # Add staging flag if requested
    if [[ "$STAGING" == "true" ]]; then
        certbot_args+=("--staging")
        log_warn "Using Let's Encrypt staging environment"
    fi
    
    # Add force renewal flag if requested
    if [[ "$FORCE_RENEWAL" == "true" ]]; then
        certbot_args+=("--force-renewal")
        log_warn "Forcing certificate renewal"
    fi
    
    # Run certbot
    if certbot "${certbot_args[@]}"; then
        log_info "SSL certificate obtained successfully!"
    else
        log_error "Failed to obtain SSL certificate."
        exit 1
    fi
    
    # Update nginx configuration with SSL
    if nginx -t; then
        systemctl reload nginx
        log_info "Nginx reloaded with SSL configuration."
    else
        log_error "Nginx configuration test failed after SSL setup."
        exit 1
    fi
}

setup_auto_renewal() {
    log_info "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/renew-certificates.sh <<'EOF'
#!/bin/bash

# Automatic certificate renewal script
# This script is run by cron to renew certificates

LOG_FILE="/var/log/certbot-renewal.log"

echo "$(date): Starting certificate renewal check" >> "$LOG_FILE"

# Attempt renewal
if certbot renew --quiet --no-self-upgrade; then
    echo "$(date): Certificate renewal check completed successfully" >> "$LOG_FILE"
    
    # Test nginx configuration
    if nginx -t; then
        systemctl reload nginx
        echo "$(date): Nginx reloaded successfully" >> "$LOG_FILE"
    else
        echo "$(date): ERROR - Nginx configuration test failed" >> "$LOG_FILE"
    fi
else
    echo "$(date): Certificate renewal failed" >> "$LOG_FILE"
fi
EOF

    # Make script executable
    chmod +x /usr/local/bin/renew-certificates.sh
    
    # Add cron job for automatic renewal (runs twice daily)
    cron_entry="0 2,14 * * * /usr/local/bin/renew-certificates.sh"
    
    # Check if cron entry already exists
    if ! crontab -l 2>/dev/null | grep -q "renew-certificates.sh"; then
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        log_info "Cron job added for automatic certificate renewal."
    else
        log_info "Cron job for certificate renewal already exists."
    fi
    
    log_info "Automatic renewal setup completed."
}

setup_monitoring() {
    log_info "Setting up SSL certificate monitoring..."
    
    # Create monitoring script
    cat > /usr/local/bin/ssl-monitor.sh <<'EOF'
#!/bin/bash

# SSL Certificate Monitoring Script
# Checks certificate expiration and sends alerts

DOMAIN="$1"
ALERT_DAYS=7
LOG_FILE="/var/log/ssl-monitor.log"

if [[ -z "$DOMAIN" ]]; then
    echo "Usage: $0 <domain>"
    exit 1
fi

# Get certificate expiration date
expiry_date=$(openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/cert.pem" -noout -dates | grep notAfter | cut -d= -f2)
expiry_epoch=$(date -d "$expiry_date" +%s)
current_epoch=$(date +%s)
days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))

echo "$(date): Certificate for $DOMAIN expires in $days_until_expiry days" >> "$LOG_FILE"

# Send alert if certificate is expiring soon
if [[ $days_until_expiry -le $ALERT_DAYS ]]; then
    message="WARNING: SSL certificate for $DOMAIN expires in $days_until_expiry days!"
    echo "$(date): $message" >> "$LOG_FILE"
    
    # Send email alert (if mail is configured)
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "SSL Certificate Expiration Warning" root
    fi
    
    # Log to syslog
    logger "SSL Certificate Warning: $DOMAIN expires in $days_until_expiry days"
fi
EOF

    # Make script executable
    chmod +x /usr/local/bin/ssl-monitor.sh
    
    # Add cron job for daily monitoring
    monitor_cron="0 8 * * * /usr/local/bin/ssl-monitor.sh $DOMAIN"
    
    if ! crontab -l 2>/dev/null | grep -q "ssl-monitor.sh"; then
        (crontab -l 2>/dev/null; echo "$monitor_cron") | crontab -
        log_info "SSL monitoring cron job added."
    else
        log_info "SSL monitoring cron job already exists."
    fi
    
    log_info "SSL monitoring setup completed."
}

verify_ssl_setup() {
    log_info "Verifying SSL setup..."
    
    # Test SSL certificate
    if openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/cert.pem" -noout -text > /dev/null 2>&1; then
        log_info "SSL certificate is valid."
        
        # Show certificate details
        expiry_date=$(openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/cert.pem" -noout -dates | grep notAfter | cut -d= -f2)
        log_info "Certificate expires on: $expiry_date"
    else
        log_error "SSL certificate validation failed."
        exit 1
    fi
    
    # Test HTTPS connection
    if command -v curl &> /dev/null; then
        if curl -f -s "https://$DOMAIN/health" > /dev/null; then
            log_info "HTTPS connection test successful."
        else
            log_warn "HTTPS connection test failed. This might be normal if services are not running."
        fi
    fi
    
    # Test SSL grade
    log_info "SSL setup verification completed."
    log_info "You can test your SSL configuration at: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
}

cleanup_on_error() {
    log_error "Script failed. Cleaning up..."
    
    # Remove nginx site configuration if it was created
    if [[ -f "/etc/nginx/sites-enabled/$DOMAIN" ]]; then
        rm -f "/etc/nginx/sites-enabled/$DOMAIN"
        rm -f "/etc/nginx/sites-available/$DOMAIN"
        systemctl reload nginx || true
    fi
}

main() {
    # Set up error handling
    trap cleanup_on_error ERR
    
    log_info "Starting SSL certificate setup for RealWorld application..."
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --email)
                EMAIL="$2"
                shift 2
                ;;
            --staging)
                STAGING="true"
                shift
                ;;
            --force-renewal)
                FORCE_RENEWAL="true"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Validate required parameters
    if [[ -z "$DOMAIN" ]]; then
        log_error "Domain is required. Use --domain flag or set DOMAIN environment variable."
        show_help
        exit 1
    fi
    
    if [[ -z "$EMAIL" ]]; then
        log_error "Email is required. Use --email flag or set EMAIL environment variable."
        show_help
        exit 1
    fi
    
    # Run setup steps
    check_prerequisites
    setup_nginx_config
    obtain_ssl_certificate
    setup_auto_renewal
    setup_monitoring "$DOMAIN"
    verify_ssl_setup
    
    log_info "SSL certificate setup completed successfully! 🎉"
    log_info ""
    log_info "Next steps:"
    log_info "1. Update your DNS records to point to this server"
    log_info "2. Deploy your application services"
    log_info "3. Test the HTTPS endpoint: https://$DOMAIN"
    log_info "4. Monitor certificate expiration in /var/log/ssl-monitor.log"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi