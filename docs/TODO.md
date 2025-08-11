# TODO

## Internationalization (i18n) Implementation

### Phase 1: Frontend Setup & Configuration ✅
- [x] Install and setup react-i18next with TypeScript support
- [x] Create environment configuration for language settings (`VITE_DEFAULT_LANGUAGE`, `VITE_MULTI_LANGUAGE_ENABLED`)
- [x] Setup language resource files structure (Spanish/English JSON files with namespaces)
- [x] Create language switcher component for navbar (conditionally rendered)
- [x] Setup i18next configuration with proper TypeScript types
- [x] When language change save it in permanent cookie, when page reloads use that cookie, should apply to app and login

### Phase 2: Frontend Localization
- [ ] Localize Dashboard page (titles, descriptions, chart labels, activity feed)
- [ ] Localize Users page (table headers, buttons, form labels, validation messages)
- [ ] Localize Projects page (table headers, buttons, form fields)
- [ ] Localize common components (DeleteConfirmationDialog, NotificationInbox, etc.)
- [ ] Localize authentication pages (Login, Profile)
- [ ] Setup date/number formatting with Spanish LATAM formatting
- [ ] Implement proper pluralization rules for Spanish

### Phase 3: Backend Localization
- [ ] Create configuration system for default language and multi-language toggle
- [ ] Setup RESX resource files for .NET localization
- [ ] Localize email templates (InvitationEmail.html)
- [ ] Localize API validation messages and error responses
- [ ] Add admin settings to control language configuration
- [ ] Update email service to use localized templates

### Phase 4: Integration & Testing
- [ ] Test single-language mode (Spanish-only configuration)
- [ ] Test multi-language mode with language switching
- [ ] Verify email localization works correctly
- [ ] Test date/number formatting in different locales
- [ ] Performance testing (bundle size impact)
- [ ] Create documentation for customers on language configuration

### Phase 5: Documentation & Finalization
- [ ] Update CLAUDE.md with i18n usage instructions
- [ ] Create customer configuration guide
- [ ] Add environment variable documentation
- [ ] Test template deployment with different language configurations

