# TODO

## Internationalization (i18n) Implementation

### Phase 1: Frontend Setup & Configuration ✅
- [x] Install and setup react-i18next with TypeScript support
- [x] Create environment configuration for language settings (`VITE_DEFAULT_LANGUAGE`, `VITE_MULTI_LANGUAGE_ENABLED`)
- [x] Setup language resource files structure (Spanish/English JSON files with namespaces)
- [x] Create language switcher component for navbar (conditionally rendered)
- [x] Setup i18next configuration with proper TypeScript types
- [x] When language change save it in permanent cookie, when page reloads use that cookie, should apply to app and login

### Phase 2: Frontend Localization ✅
- [x] Localize Dashboard page (titles, descriptions, chart labels, activity feed)
- [x] Localize Users page (table headers, buttons, form labels, validation messages)
- [x] Localize Projects page (table headers, buttons, form fields)
- [x] Localize common components (DeleteConfirmationDialog, NotificationInbox, etc.)
- [x] Localize authentication pages (Login, Profile)
- [x] Setup date/number formatting to use local machine date format as it's doing today
- [x] Implement proper pluralization rules for Spanish

### Phase 3: Backend Localization ✅
- [x] Create configuration system for default language and multi-language toggle
- [x] Setup RESX resource files for .NET localization
- [x] Localize email templates (InvitationEmail.html)
- [x] Localize API validation messages and error responses
- [x] Update email service to use localized templates

### Phase 4: Integration & Testing
- [ ] Test single-language mode (Spanish-only configuration)
- [ ] Test multi-language mode with language switching
- [ ] Verify email localization works correctly
- [ ] Test date/number formatting in different locales
- [ ] Performance testing (bundle size impact)
- [x] Create documentation for customers on language configuration

### Phase 5: Documentation & Finalization
- [ ] Update CLAUDE.md with i18n usage instructions
- [x] Create customer configuration guide
- [x] Add environment variable documentation
- [ ] Test template deployment with different language configurations