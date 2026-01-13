# ProDent Sticky Notes - Quick Start Guide

## 🚀 Getting Started

### Step 1: Access the Application
The development server is running at: **http://localhost:3001**

### Step 2: Create an Account
1. Navigate to: http://localhost:3001/en/sign-in
2. Click on "Sign Up" or "Create Account"
3. Fill in:
   - **Email**: your-email@example.com (any email)
   - **Password**: your-password (minimum 8 characters)
   - **Name**: Your Name
4. Click "Sign Up"

### Step 3: Access Sticky Notes
1. After login, navigate to: http://localhost:3001/en/notes
2. You should see the workspace with:
   - Left panel: To-Do list (empty initially)
   - Center: Canvas (infinite workspace)
   - Top right: Controls (+, Zoom-, 100%, Zoom+)

### Step 4: Create Your First Note
1. Click the **[+]** button in the top right
2. In the dialog:
   - **Type**: Select "Missing Call" (blue), "Installation Record" (red), etc.
   - **Title**: Optional - e.g., "Follow up with John"
   - **Content**: Required - e.g., "Customer called about installation issue"
   - **Tags**: Optional - e.g., "urgent, follow-up"
3. Click **"Create Note"**
4. Your note appears on the canvas!

### Step 5: Test All Features

#### A. Move the Note
- **Drag the header** (colored bar at top) to move the note around the canvas
- Position persists after refresh

#### B. Bring to Front
- **Click anywhere on the note** to bring it to the front (increases zIndex)

#### C. Quick Actions (Click the ⋮ menu)
1. **Change Status**:
   - Set as New / In Progress / Waiting / Done
   - Status change moves note between To-Do groups

2. **Set Reminder**:
   - Choose quick preset: "In 2 days"
   - Or set custom date & time
   - Enter reminder message
   - Bell icon appears on note (red if overdue)

3. **Internal Notes**:
   - Add internal comments
   - View comment history with timestamps
   - Comments persist after refresh

4. **Copy Email Template** (for Missing Call & Installation Record only):
   - Copies subject + body to clipboard
   - Ready to paste into email client

5. **Collapse/Expand**:
   - Collapse shows compact 2-line preview
   - Hover over collapsed note for full preview popup

#### D. Canvas Controls
- **Pan**: Drag empty space to move viewport
- **Zoom**:
  - Ctrl/Cmd + Mouse Wheel (anchored at cursor)
  - OR click +/- buttons
  - Range: 50% to 150%
- **Zoom level and viewport position persist after refresh**

#### E. To-Do Panel (Left Sidebar)
- Shows notes grouped by status:
  - **New**: Newly created notes
  - **In Progress**: Currently working on
  - **Waiting**: Waiting for something
- **Done and Archived** notes are hidden from panel
- **Click any item** → Canvas pans/zooms to focus that note

### Step 6: Test Persistence
1. Create a note and move it
2. Set a reminder
3. Add a comment
4. Change status
5. **Refresh the page** (F5)
6. ✅ Everything should be exactly where you left it!

## 🎯 Test Checklist

Use this checklist to verify all features work:

- [ ] Create note → appears on canvas
- [ ] Create note → appears in To-Do panel under "New"
- [ ] Drag note → position updates
- [ ] Refresh page → note stays in same position
- [ ] Click note → comes to front (overlaps others)
- [ ] Change status to "In Progress" → moves to "In Progress" group in To-Do
- [ ] Change status to "Done" → disappears from To-Do panel
- [ ] Set reminder "In 2 days" → bell icon appears
- [ ] Refresh page → bell icon still there
- [ ] Add internal comment → appears in list with your name
- [ ] Refresh page → comment still there
- [ ] Copy email template (Missing Call type) → clipboard has text
- [ ] Collapse note → shows 2-line preview
- [ ] Hover collapsed note → popup shows full content
- [ ] Pan canvas (drag empty space) → viewport moves
- [ ] Zoom with Ctrl+Wheel → zoom changes, anchored at cursor
- [ ] Zoom with +/- buttons → zoom changes
- [ ] Refresh page → zoom level and viewport position preserved
- [ ] Click item in To-Do panel → note centers on screen

## 🐛 Troubleshooting

### Issue: "401 Unauthorized" when loading page
**Solution**: You're not logged in. Go to http://localhost:3001/en/sign-in

### Issue: Can't see the Notes page after login
**Solution**: Make sure you navigate to http://localhost:3001/en/notes (not just /notes)

### Issue: "+" button doesn't work
**Solution**:
1. Check browser console (F12) for errors
2. Make sure you're logged in
3. Try refreshing the page

### Issue: Notes don't persist after refresh
**Solution**:
1. Check that the database connection is working
2. Look at server logs for errors
3. Verify ATABASE_URL is set correctly in .env.development

## 📝 Notes

- All data is scoped to organization "prodent"
- Multiple users can use the system (each sees all notes)
- No real-time collaboration in MVP (refresh to see others' changes)
- Email templates are copy-only (no actual sending)
- Delete is implemented as Archive (soft delete)

## 🎉 You're All Set!

The system is fully functional and ready to use. Enjoy testing! 🚀
