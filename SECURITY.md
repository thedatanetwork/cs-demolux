# Security Guidelines for Demolux

## 🔒 Environment Variables & API Keys

### ✅ SAFE TO COMMIT
- `.env.example` - Template with placeholder values
- `scripts/env.example` - Template for script configuration

### ❌ NEVER COMMIT THESE FILES
- `.env.local` - Your actual Contentstack credentials
- `scripts/.env` - Script configuration with real API keys
- Any file containing real API keys or tokens

## 🛡️ API Key Security

### Contentstack Credentials
- **API Key**: Can be public (used in frontend)
- **Delivery Token**: Can be public (read-only access)
- **Management Token**: ⚠️ **KEEP SECRET** (full CMS access)

### Current Setup
```bash
# Frontend (.env.local) - Safe to be public
CONTENTSTACK_API_KEY=blt...
CONTENTSTACK_DELIVERY_TOKEN=cs...

# Scripts (scripts/.env) - KEEP SECRET
CONTENTSTACK_MANAGEMENT_TOKEN=cs...  # ⚠️ SENSITIVE
```

## 🔍 Pre-Commit Checklist

Before pushing to Git, verify:
- [ ] No `.env.local` files committed
- [ ] No `scripts/.env` files committed  
- [ ] No hardcoded API keys in source code
- [ ] All sensitive data in environment variables
- [ ] `.gitignore` files are properly configured

## 🚨 If You Accidentally Commit Secrets

1. **Immediately rotate your Management Token**:
   - Go to Contentstack Dashboard → Settings → Tokens
   - Delete the compromised Management Token
   - Create a new one
   - Update your local `scripts/.env` file

2. **Remove from Git history** (if recent):
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch scripts/.env" \
   --prune-empty --tag-name-filter cat -- --all
   ```

## 📋 Deployment Security

### Environment Variables for Production
```bash
# Production environment should set:
CONTENTSTACK_API_KEY=your_production_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_production_delivery_token
CONTENTSTACK_ENVIRONMENT=production
```

### Never Deploy These
- Management tokens should only be used locally or in secure CI/CD
- Don't include `scripts/` folder in production builds
