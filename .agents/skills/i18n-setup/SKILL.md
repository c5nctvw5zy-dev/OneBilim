---
name: i18n setup
description: Interface language switching (kk/ru/en) using i18next, stored per-user in profiles.preferred_language and localStorage
type: feature
---
i18next configured in src/i18n/index.ts with three languages. ProfilePage has a language picker section that calls setLanguage() (changes i18n + writes localStorage) and on Save persists to profiles.preferred_language. Translations currently cover the profile page — extend resources object to add more pages. useTranslation() hook used in components: const { t } = useTranslation(); t("profile.title").
