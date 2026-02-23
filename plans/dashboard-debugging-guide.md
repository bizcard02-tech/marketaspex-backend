# Dashboard Debugging Guide

## Diagnostic Logging Added

I've added console logging throughout the dashboard rendering pipeline to help identify where the issue is occurring:

### 1. Page Level Logging

**File**: `src/app/(platform)/(dashboard)/page.tsx`

- Log: `[DashboardPage] Rendering`
- **Purpose**: Confirms if the page component is being rendered at all

### 2. Component Level Logging

**File**: `src/components/dashboard/index.tsx`

- Log: `[Dashboard] Rendering`
- **Purpose**: Confirms if the Dashboard component is mounting

### 3. Data Fetching Logging

**File**: `src/components/boards/board-list.tsx`

- Log: `[BoardList] State:` - Shows isLoading, error, and boards data
- Log: `[BoardList] Showing skeleton` - When loading state is active
- Log: `[BoardList] Showing error:` - When error occurs
- Log: `[BoardList] Rendering boards:` - When rendering the boards list

## How to Diagnose

### Step 1: Open Browser Console

1. Navigate to `/dashboard` route
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for the following logs in order:

### Step 2: Interpret Logs

#### Scenario A: No logs at all

**Meaning**: The page is not being rendered
**Possible causes**:

- Route is not being matched
- ProtectedRoute is blocking access
- Authentication check is failing

**Check**:

- Verify URL is `/dashboard` (not `/` or `/board`)
- Check if user is authenticated
- Look for authentication errors in console

#### Scenario B: `[DashboardPage] Rendering` but no `[Dashboard] Rendering`

**Meaning**: Page renders but Dashboard component doesn't mount
**Possible causes**:

- Import error in Dashboard component
- Client component not rendering in server context
- Error in Dashboard component preventing render

**Check**:

- Look for import errors
- Check if there are any runtime errors
- Verify Dashboard component is properly exported

#### Scenario C: `[Dashboard] Rendering` but no `[BoardList] State:`

**Meaning**: Dashboard renders but BoardList doesn't initialize
**Possible causes**:

- Import error in BoardList component
- useBoards hook failing to initialize
- Error in component setup

**Check**:

- Look for import errors
- Check if useBoards is properly imported
- Look for React Query initialization errors

#### Scenario D: `[BoardList] State:` shows loading forever

**Meaning**: useBoards hook is stuck in loading state
**Possible causes**:

- API request never resolves
- QueryClient not properly configured
- Network issue (though using mock data)

**Check**:

- Look for `[mock-api]` logs
- Check if QueryProvider is set up correctly
- Verify no infinite loading loops

#### Scenario E: `[BoardList] State:` shows error

**Meaning**: Data fetch failed
**Possible causes**:

- Error in mockApiRequest function
- Type mismatch in Board interface
- Error in mock data structure

**Check**:

- Look at the error message
- Check if mockBoards data structure matches Board interface
- Verify Board interface properties

#### Scenario F: `[BoardList] Rendering boards:` but nothing displays

**Meaning**: Component renders but UI doesn't show
**Possible causes**:

- CSS issues hiding content
- Empty boards array
- Conditional rendering logic error

**Check**:

- Inspect DOM elements to see if they exist
- Check if boards array has data
- Verify CSS classes are correct

## Expected Log Output

### Successful Dashboard Load:

```
[DashboardPage] Rendering
[Dashboard] Rendering
[BoardList] State: { isLoading: true, error: null, boards: undefined }
[BoardList] Showing skeleton
[BoardList] State: { isLoading: false, error: null, boards: [...] }
[BoardList] Rendering boards: [...]
```

### With Error:

```
[DashboardPage] Rendering
[Dashboard] Rendering
[BoardList] State: { isLoading: false, error: Error(...), boards: undefined }
[BoardList] Showing error: Error: [error message]
```

## Common Issues and Fixes

### Issue 1: CSS Layout Problems

**Symptoms**: Logs show rendering but screen is blank
**Fix**: Check flex layout in `src/app/(platform)/(dashboard)/layout.tsx`

- Ensure `flex-1` is applied to children container
- Verify `min-h-screen` allows content to expand

### Issue 2: Empty Boards Array

**Symptoms**: `[BoardList] Rendering boards: []` with empty array
**Fix**: Check `src/lib/mock-data.ts`

- Verify mockBoards array has data
- Check Board interface matches mock data structure

### Issue 3: QueryClient Not Initialized

**Symptoms**: Loading state never resolves
**Fix**: Verify `QueryProvider` wraps the app in `src/app/layout.tsx`

- Check that QueryProvider is imported correctly
- Ensure it wraps all children

### Issue 4: Authentication Blocking

**Symptoms**: No logs at all
**Fix**: Check `ProtectedRoute` in `src/app/(platform)/layout.tsx`

- Verify user is authenticated
- Check for authentication errors

## Next Steps

1. **Run the application** and navigate to `/dashboard`
2. **Open browser console** and check for logs
3. **Identify which scenario** matches your log output
4. **Apply the corresponding fix** from the Common Issues section
5. **Share the console logs** for further diagnosis if needed

## Additional Debugging

If logs don't reveal the issue:

1. **Check Network Tab**: Look for failed requests
2. **Check React DevTools**: Inspect component tree
3. **Check Elements Tab**: Verify DOM structure
4. **Clear Browser Cache**: Sometimes stale cache causes issues
5. **Restart Dev Server**: Ensure latest code is running
