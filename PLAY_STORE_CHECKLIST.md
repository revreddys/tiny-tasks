# Google Play Store Publication Checklist

## 📋 Pre-Submission Requirements

### 1. Google Play Developer Account
- [ ] Create account at https://play.google.com/console
- [ ] Pay one-time $25 registration fee
- [ ] Complete identity verification
- [ ] Set up payment profile (for future paid apps/in-app purchases)

### 2. App Build ✅
- [x] AAB file built successfully via EAS Build
- [x] App signed with upload key (managed by EAS)
- [ ] Download AAB file: `eas build:download --latest --platform android`

---

## 📱 App Information (in Play Console)

### 3. Store Listing
- [ ] **App name:** "Tiny Tasks - Kids Daily Routine" (max 30 chars)
- [ ] **Short description:** Copy from PLAY_STORE_LISTING.md (max 80 chars)
- [ ] **Full description:** Copy from PLAY_STORE_LISTING.md (max 4000 chars)

### 4. Graphics Assets
| Asset | Specification | Status |
|-------|---------------|--------|
| App Icon | 512x512 PNG, 32-bit, no alpha | [ ] |
| Feature Graphic | 1024x500 PNG or JPG | [ ] |
| Phone Screenshots | Min 2, 16:9 or 9:16, PNG/JPG | [ ] |
| 7" Tablet Screenshots | Optional but recommended | [ ] |
| 10" Tablet Screenshots | Optional but recommended | [ ] |

**Screenshot suggestions:**
1. Welcome/Login screen
2. Parent dashboard with children
3. Child home screen with tasks
4. Task completion celebration
5. Rewards shop
6. Avatar customization
7. Badges screen

### 5. Categorization
- [ ] **App category:** Education
- [ ] **Tags:** kids routine, daily tasks, chore chart, habit tracker, parenting

---

## 📜 Policy & Compliance

### 6. Privacy Policy (REQUIRED)
- [ ] Host privacy policy online (options below)
- [ ] Add URL to Play Console

**Free hosting options for privacy policy:**
1. **GitHub Pages** - Create a `privacy.html` in your repo
2. **Google Sites** - Free, easy to use
3. **Notion** - Make a public page
4. **Firebase Hosting** - Already have Firebase set up

### 7. Content Rating
- [ ] Complete content rating questionnaire in Play Console
- [ ] Expected rating: **Everyone**

Questions to expect:
- Violence: No
- Sexual content: No
- Language: No
- Controlled substances: No
- User interaction: Yes (family members only)

### 8. Target Audience & Content
- [ ] Select target age group: **5-12 years** (and families)
- [ ] Confirm app is suitable for children
- [ ] Complete "Teacher Approved" questionnaire (optional, for featuring)

### 9. Data Safety Form
Answer these in Play Console:

| Question | Answer |
|----------|--------|
| Does app collect data? | Yes |
| Data types collected | Email, name (child first name only), app activity |
| Is data encrypted in transit? | Yes |
| Can users request data deletion? | Yes |
| Data shared with third parties? | No (except Firebase for storage) |

### 10. App Access
- [ ] If testers need credentials, provide test account:
  - Email: `test@tinytasks.app` (create one if needed)
  - Password: `TestAccount123!`
- [ ] Or select "All functionality available without special access"

---

## 🚀 Release

### 11. Create Release
- [ ] Go to **Production** → **Create new release**
- [ ] Upload your `.aab` file
- [ ] Add release notes (see PLAY_STORE_LISTING.md)
- [ ] Name the release (e.g., "1.0.0")

### 12. Rollout
- [ ] **Start with staged rollout** (10% recommended for first release)
- [ ] Monitor for crashes in Play Console
- [ ] Increase rollout percentage gradually
- [ ] Full rollout when stable

---

## ⏱️ Timeline Expectations

| Step | Typical Duration |
|------|------------------|
| Account verification | 1-2 days |
| First app review | 3-7 days |
| Subsequent reviews | 1-3 days |
| Full rollout | After stable staged rollout |

---

## 📞 Post-Launch

### 13. Monitor & Respond
- [ ] Check crash reports daily (first week)
- [ ] Respond to user reviews
- [ ] Monitor ratings

### 14. Updates
- [ ] Increment version in `app.json` for updates
- [ ] Run `eas build --platform android --profile production`
- [ ] Upload new AAB to Play Console

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "App rejected for privacy policy" | Ensure URL is accessible and comprehensive |
| "Target audience unclear" | Be specific about age range in description |
| "Screenshots don't match app" | Use latest version screenshots |
| "Data safety incomplete" | Answer ALL questions, even if "No" |

---

## ✅ Final Check Before Submit

- [ ] All store listing fields complete
- [ ] Privacy policy URL works
- [ ] Content rating complete
- [ ] Data safety form complete
- [ ] Target audience set
- [ ] AAB uploaded
- [ ] Release notes added
- [ ] Tested on multiple devices (via Expo Go)

**Ready to publish? Hit that "Start rollout" button!** 🎉

