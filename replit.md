# INFERA Finance AI GlobalCloud

## Overview

INFERA Finance AI GlobalCloud is an enterprise-grade financial management platform powered by AI. The platform serves as a unified financial cloud for managing, analyzing, forecasting, automating, and governing financial operations for individuals, businesses, and large institutions.

The application follows a full-stack TypeScript architecture with React frontend, Express backend, and PostgreSQL database.

## Current Implementation Status

### Implemented Features
1. **Landing Page** - Modern, professional design with:
   - Animated hero section with dashboard preview
   - Trust bar with partner logos
   - Animated statistics counters
   - Services section (6 services)
   - Features section (4 features)
   - Testimonials section
   - Security section
   - CTA section
   - Footer with navigation links

2. **Language Switching (Arabic/English)**
   - Toggle button in navbar with Languages icon
   - Stored in localStorage
   - Full RTL support when Arabic is selected
   - All UI text translated

3. **Theme Switching (Light/Dark)**
   - ThemeToggle component with Sun/Moon icons
   - Stored in localStorage
   - Applies dark class to document root

4. **RTL Support**
   - Sidebar appears on right side when Arabic is selected
   - Text direction changes automatically
   - All layouts adapt to RTL mode

5. **Authentication System**
   - Login page (`/login`) - Email/password login
   - Register page (`/register`) - New user registration
   - Forgot Password page (`/forgot-password`) - Password reset
   - Replit OAuth integration available
   - Session-based authentication with bcrypt password hashing

6. **Pricing Page** (`/pricing`)
   - 4 pricing tiers: Free, Starter ($29/mo), Professional ($99/mo), Enterprise ($299/mo)
   - Bilingual support (Arabic/English)
   - Stripe integration pending

7. **Dashboard** (`/dashboard`)
   - Financial overview with charts
   - Account balances
   - Recent transactions
   - AI insights
   - Organization selector

8. **Application Pages**
   - Accounts (`/accounts`) - Chart of accounts management with add/edit modal
   - Transactions (`/transactions`) - Double-entry journal entries with validation
   - Invoices (`/invoices`) - Invoice management for customers/vendors
   - Budgets (`/budgets`) - Budget planning with full CRUD operations
   - Cash Flow (`/cash-flow`) - Cash flow analysis with real data tracking
   - Reports (`/reports`) - Financial reports with:
     - Balance Sheet, Income Statement, Cash Flow Statement
     - Year navigation (arrows, dropdown, search input)
     - PDF download using jsPDF + html2canvas
     - CSV export for spreadsheet compatibility
   - AI Insights (`/ai-insights`) - Real AI-powered insights based on financial data
   - Compliance (`/compliance`) - Regulatory compliance tracking and management
   - Contacts (`/contacts`) - Contact management
   - Settings (`/settings`) - User settings

9. **AI Analytics Service**
   - Real-time financial insights generation
   - Debt ratio analysis
   - Overdue invoice detection
   - Profit margin calculations
   - Cash reserve monitoring
   - **Conversational AI Chat**:
     - Natural language queries via `/api/ai/query` endpoint
     - Powered by OpenAI GPT-4o-mini via Replit AI Integrations
     - Bilingual responses (Arabic/English)
     - Context-aware with access to organization financial data
     - Dashboard chat interface with Enter key support
   - **AI-Driven Navigation & Actions**:
     - Navigate to any page using natural language (e.g., "open invoices", "افتح الفواتير")
     - Navigate to specific reports (e.g., "show balance sheet", "اعرض قائمة الدخل")
     - Navigate to reports for a specific year (e.g., "show balance sheet 2024", "اعرض الميزانية 2024")
     - Print/download reports via AI commands (e.g., "print income statement", "اطبع الميزانية")
     - Year support in all report commands (e.g., "print balance sheet 2023", "اطبع قائمة الدخل 2024")
     - Bilingual command detection (Arabic/English) regardless of UI language
     - Supports Arabic numerals (٢٠٢٤) and English numerals (2024)
     - Supported routes: dashboard, accounts, transactions, invoices, budgets, cash-flow, reports, ai-insights, compliance, contacts, settings, payment-gateways
     - Report types: Balance Sheet, Income Statement, Cash Flow Statement
   - **Reports Year Navigation**:
     - Previous/Next year buttons with chevron icons
     - Year dropdown selector
     - Year search input field
     - URL parameter support (?year=2024)

10. **Role-Based Access Control (RBAC)**
    - 7 user roles: super_admin, global_admin, owner, cfo, finance_manager, auditor, analyst
    - Permissions matrix for all resources
    - Server-side middleware enforcement

11. **Stripe Payment Integration**
    - Checkout session creation
    - Customer portal sessions (server-side customer ID lookup for security)
    - Product/pricing listing
    - Webhook handling infrastructure

12. **Terms of Service & Privacy Policy**
    - Terms page (`/terms`) - Bilingual legal terms
    - Privacy page (`/privacy`) - Bilingual privacy policy
    - Both pages include back navigation

13. **Period Closing System**
    - Create accounting periods (month/year)
    - Close periods with retained earnings calculation
    - Audit logging for period operations

14. **Audit Trail Logging**
    - Tracks all financial operations
    - Records old/new values, user, timestamp
    - IP address and user agent tracking
    - RBAC-protected access

15. **Organization Switcher**
    - Dropdown in sidebar for multi-org support
    - Persisted selection in localStorage
    - Displays org name and type

16. **Subscription Management**
    - Plan-based feature gating (free, starter, professional, enterprise)
    - Subscription status display in Settings
    - Feature limits: organizations, transactions, AI insights, API access

17. **AI Monthly Reports**
    - Comprehensive monthly financial summary
    - Balance sheet, income statement, cash flow data
    - AI-generated insights and recommendations
    - Bilingual report generation (EN/AR)

18. **Dynamic Payment Gateway System**
    - Multi-provider support (10+ payment processors)
    - Global providers: Stripe, PayPal
    - Egyptian providers: Paymob, Fawry
    - Gulf providers: Tap, PayFort, HyperPay, Moyasar, Thawani, MyFatoorah
    - Admin management page (`/payment-gateways`)
    - Enable/disable gateways without code changes
    - Secure credential management via environment variables
    - Per-gateway currency and country configuration
    - Webhook URL configuration per provider
    - Default gateway selection
    - Full CRUD operations for gateway management

19. **20-Year Survivability System**
    - **Protected Owner Bootstrap** (3-layer protection):
      - Platform owner account (mohamed.ali.b2001@gmail.com) created on first boot
      - Credentials set via environment variables (PLATFORM_OWNER_EMAIL, PLATFORM_OWNER_PASSWORD)
      - **Layer 1 - Application**: Storage methods (updateUser/softDeleteUser) check isProtectedOwner flag
      - **Layer 2 - Bootstrap**: ensureOwnerExists() verifies owner on every startup
      - **Layer 3 - Database**: PostgreSQL triggers prevent delete/deactivate/downgrade/remove-protection
    - **Soft Delete Architecture**: Users, organizations, and accounts use isDeleted flag instead of hard delete
    - **Feature Flags**: Runtime control for demo_mode, ai_insights, auto_backup, etc.
    - **Health Check Endpoints**: 
      - `/health` - Full system health with database connection pool stats
      - `/ready` - Kubernetes-style readiness probe
      - `/live` - Liveness probe for container orchestration
    - **Real Backup System** (server/backupService.ts):
      - JSON export with SHA-256 checksums to `/tmp/backups`
      - Row count snapshots for verification
      - Restore simulation testing before marking verified
      - 30-day retention with automatic cleanup
      - `/api/admin/backup/verify` - Data integrity checks
    - **Demo Mode Guard**: Demo data seeding automatically disabled in production (NODE_ENV=production)
    - **Platform Configuration**: Protected key-value configuration stored in database
    - **Background Job Worker** (server/jobWorker.ts): 
      - PostgreSQL advisory locks for distributed leader election
      - Lock health checking every 30 seconds
      - Automatic standby promotion when primary fails
      - 60-second polling interval
      - Retry logic with exponential backoff
      - Stale job cleanup
      - **Job Idempotency**: SHA-256 deduplication keys with 24-hour expiry
      - **Dead Letter Queue**: Failed jobs preserved with `dlq:` prefix for debugging
      - Job types: backup, email, report, cleanup, integrity_check
    - **Persistent Circuit Breakers** (server/resilience.ts):
      - Circuit breakers (CLOSED/OPEN/HALF_OPEN states)
      - **Database-persisted state** survives crashes/restarts
      - Automatic state restoration on startup
      - Exponential backoff retry with jitter
      - Graceful degradation under failures
      - `/api/admin/circuits` - View all circuit breaker stats
    - **Migration Safety System** (server/migrationService.ts):
      - Destructive pattern detection (DROP, DELETE, TRUNCATE)
      - **Production safeguard**: Blocks destructive migrations in production
      - Schema integrity validation on startup
      - Checksum verification for applied migrations
      - `/api/admin/migrations/validate` - Schema integrity check
    - **Structured Logging**:
      - JSON output in production
      - Log levels: debug, info, warn, error, fatal
      - Correlation IDs and metadata support
      - All services use structured logger (no console.log)

## User Preferences

Preferred communication style: Simple, everyday language (Arabic preferred).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and loading effects
- **Internationalization**: Custom i18n context supporting English and Arabic with RTL support
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints with Zod validation schemas shared between client and server
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **Authentication**: Dual system - Replit OAuth + Email/Password with bcrypt

### Data Layer
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for database migrations (`npm run db:push`)
- **Tables**: users, organizations, accounts, transactions, invoices, budgets, subscribers, ai_insights, contacts

### Key Files
- `client/src/pages/Landing.tsx` - Landing page
- `client/src/pages/Login.tsx` - Login page
- `client/src/pages/Register.tsx` - Registration page
- `client/src/pages/Pricing.tsx` - Pricing page
- `client/src/pages/Reports.tsx` - Financial reports
- `client/src/pages/Terms.tsx` - Terms of Service page
- `client/src/pages/Privacy.tsx` - Privacy Policy page
- `client/src/pages/Settings.tsx` - Settings with subscription status
- `client/src/pages/Compliance.tsx` - Compliance management
- `client/src/components/app-sidebar.tsx` - Sidebar navigation
- `client/src/components/modals/AddAccountModal.tsx` - Add account modal
- `client/src/components/modals/AddTransactionModal.tsx` - Add transaction modal
- `client/src/components/modals/AddInvoiceModal.tsx` - Add invoice modal
- `client/src/lib/permissions.ts` - RBAC permissions matrix
- `server/routes.ts` - API endpoints
- `server/aiService.ts` - AI analytics service
- `server/rbacMiddleware.ts` - Role-based access control
- `server/stripeClient.ts` - Stripe client configuration
- `server/stripeService.ts` - Stripe service layer

### Build System
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Production**: Single Node.js process serves both API and static files

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database toolkit for type-safe queries

### GitHub Integration
- **@octokit/rest**: GitHub API client for repository synchronization
- **Replit Connectors**: OAuth token management for GitHub connection via Replit's connector system

### UI Components
- **Radix UI**: Headless component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-styled component collection built on Radix
- **Lucide React**: Icon library
- **Framer Motion**: Animations

### Payment Integration (TODO)
- Stripe integration pending
- Current pricing page at /pricing shows plans but checkout is not functional yet
