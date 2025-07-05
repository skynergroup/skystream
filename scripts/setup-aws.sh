#!/bin/bash

# SkyStream AWS Setup Script
# This script helps set up AWS Cognito User Pool for authentication

set -e

echo "🚀 SkyStream AWS Setup"
echo "======================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   sudo snap install aws-cli --classic"
    exit 1
fi

echo "✅ AWS CLI is installed"

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured."
    echo "Please run: aws configure"
    echo "You'll need:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Default region (e.g., us-east-1)"
    echo "  - Default output format (json)"
    exit 1
fi

echo "✅ AWS credentials are configured"

# Get AWS account info
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)

echo "📋 AWS Account: $AWS_ACCOUNT_ID"
echo "📍 Region: $AWS_REGION"

# Create Cognito User Pool
echo ""
echo "🔐 Creating Cognito User Pool..."

USER_POOL_NAME="skystream-users"
CLIENT_NAME="skystream-web-client"

# Check if user pool already exists
EXISTING_POOL=$(aws cognito-idp list-user-pools --max-results 60 --query "UserPools[?Name=='$USER_POOL_NAME'].Id" --output text)

if [ ! -z "$EXISTING_POOL" ]; then
    echo "⚠️  User Pool '$USER_POOL_NAME' already exists with ID: $EXISTING_POOL"
    USER_POOL_ID=$EXISTING_POOL
else
    # Create new user pool
    echo "Creating new User Pool..."
    
    USER_POOL_RESPONSE=$(aws cognito-idp create-user-pool \
        --pool-name "$USER_POOL_NAME" \
        --policies '{
            "PasswordPolicy": {
                "MinimumLength": 8,
                "RequireUppercase": true,
                "RequireLowercase": true,
                "RequireNumbers": true,
                "RequireSymbols": false
            }
        }' \
        --auto-verified-attributes email \
        --username-attributes email \
        --verification-message-template '{
            "DefaultEmailOption": "CONFIRM_WITH_CODE",
            "EmailSubject": "Welcome to SkyStream - Verify your email",
            "EmailMessage": "Welcome to SkyStream! Your verification code is {####}"
        }' \
        --user-pool-tags '{
            "Project": "SkyStream",
            "Environment": "Production"
        }' \
        --account-recovery-setting '{
            "RecoveryMechanisms": [
                {
                    "Priority": 1,
                    "Name": "verified_email"
                }
            ]
        }')
    
    USER_POOL_ID=$(echo $USER_POOL_RESPONSE | jq -r '.UserPool.Id')
    echo "✅ Created User Pool: $USER_POOL_ID"
fi

# Create User Pool Client
echo ""
echo "📱 Creating User Pool Client..."

# Check if client already exists
EXISTING_CLIENT=$(aws cognito-idp list-user-pool-clients --user-pool-id "$USER_POOL_ID" --query "UserPoolClients[?ClientName=='$CLIENT_NAME'].ClientId" --output text)

if [ ! -z "$EXISTING_CLIENT" ]; then
    echo "⚠️  User Pool Client '$CLIENT_NAME' already exists with ID: $EXISTING_CLIENT"
    CLIENT_ID=$EXISTING_CLIENT
else
    # Create new client
    CLIENT_RESPONSE=$(aws cognito-idp create-user-pool-client \
        --user-pool-id "$USER_POOL_ID" \
        --client-name "$CLIENT_NAME" \
        --no-generate-secret \
        --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH \
        --supported-identity-providers COGNITO \
        --callback-urls "http://localhost:3000" "https://your-domain.com" \
        --logout-urls "http://localhost:3000" "https://your-domain.com" \
        --prevent-user-existence-errors ENABLED \
        --enable-token-revocation)
    
    CLIENT_ID=$(echo $CLIENT_RESPONSE | jq -r '.UserPoolClient.ClientId')
    echo "✅ Created User Pool Client: $CLIENT_ID"
fi

# Output configuration
echo ""
echo "🎉 AWS Cognito Setup Complete!"
echo "================================"
echo ""
echo "Add these environment variables to your .env.local file:"
echo ""
echo "VITE_AWS_REGION=$AWS_REGION"
echo "VITE_AWS_USER_POOL_ID=$USER_POOL_ID"
echo "VITE_AWS_USER_POOL_CLIENT_ID=$CLIENT_ID"
echo ""
echo "📝 Next Steps:"
echo "1. Copy the environment variables above to your .env.local file"
echo "2. Set up Google OAuth (optional):"
echo "   - Go to https://console.developers.google.com/"
echo "   - Create a new project or select existing"
echo "   - Enable Google+ API"
echo "   - Create OAuth 2.0 credentials"
echo "   - Add your domain to authorized origins"
echo "   - Add VITE_GOOGLE_CLIENT_ID to .env.local"
echo "3. Test the authentication in your application"
echo ""
echo "💡 Tip: Keep your AWS credentials secure and never commit them to version control!"
echo ""
echo "🔗 Useful Links:"
echo "   - AWS Cognito Console: https://console.aws.amazon.com/cognito/"
echo "   - Google Cloud Console: https://console.cloud.google.com/"
echo ""

# Create .env.local template if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local template..."
    cat > .env.local << EOF
# SkyStream Environment Configuration
# AWS Cognito Configuration
VITE_AWS_REGION=$AWS_REGION
VITE_AWS_USER_POOL_ID=$USER_POOL_ID
VITE_AWS_USER_POOL_CLIENT_ID=$CLIENT_ID

# Google OAuth Configuration (Optional)
# VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Copy other variables from .env.example as needed
EOF
    echo "✅ Created .env.local with AWS configuration"
else
    echo "⚠️  .env.local already exists. Please manually add the AWS configuration above."
fi

echo ""
echo "✨ Setup complete! You can now use AWS Cognito authentication in SkyStream."
