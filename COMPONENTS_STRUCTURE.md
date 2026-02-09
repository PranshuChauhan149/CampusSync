# Components Structure Documentation

## Overview
Refactored ItemDetail and BookDetail pages to use reusable components for better code readability and maintainability.

## New Reusable Components

### 1. ImageGallery Component
**Location:** `client/src/components/ImageGallery.jsx`

**Purpose:** Display images with thumbnail navigation

**Props:**
- `images` (array): Array of image URLs
- `selectedIndex` (number): Current selected image index
- `onSelectIndex` (function): Callback to change selected image
- `isDarkMode` (boolean): Dark mode flag
- `fallbackIcon` (string): "package" or "book" for fallback icon

**Used in:**
- ItemDetail.jsx
- BookDetail.jsx

---

### 2. DetailInfoCard Component
**Location:** `client/src/components/DetailInfoCard.jsx`

**Purpose:** Display main item/book details with description, features, and tags

**Props:**
- `title` (string): Item/Book title
- `description` (string): Description text
- `details` (array): Array of detail objects with `icon`, `label`, `value`
- `tags` (array): Array of tag strings
- `additionalFeatures` (object): Key-value pairs of additional features
- `isDarkMode` (boolean): Dark mode flag
- `statusBadge` (JSX): Custom badge/status component to display at the top

**Used in:**
- ItemDetail.jsx - Shows item details, location, date, category, tags
- BookDetail.jsx - Shows book details, subject, course, ISBN, edition, publisher

---

### 3. UserInfoCard Component
**Location:** `client/src/components/UserInfoCard.jsx`

**Purpose:** Display user/seller information with contact details and action buttons

**Props:**
- `user` (object): User object with username, createdAt, etc.
- `contactInfo` (object): Contact info with name, email, phone
- `isDarkMode` (boolean): Dark mode flag
- `isAuthenticated` (boolean): User authentication status
- `currentUserId` (string): Current logged-in user ID
- `onChat` (function): Callback for chat button
- `onClaim` (function): Callback for claim/action button
- `showClaimButton` (boolean): Whether to show the claim button
- `title` (string): Card title (default: "Posted By")
- `claimButtonText` (string): Custom text for claim button (default: "Submit Claim")
- `claimButtonIcon` (JSX): Custom icon for claim button (default: Flag icon)

**Features:**
- Shows user avatar with initials
- Displays member since year
- Shows contact information (name, email, phone)
- Message button (only for authenticated users, not for own items)
- Customizable action button (claim/email seller)

**Used in:**
- ItemDetail.jsx - Shows item poster info with "Submit Claim" button
- BookDetail.jsx - Shows seller info with "Email Seller" button

---

### 4. RelatedItemsGrid Component
**Location:** `client/src/components/RelatedItemsGrid.jsx`

**Purpose:** Display related items or books in a responsive grid

**Props:**
- `items` (array): Array of related items/books
- `title` (string): Section title (default: "Related Items")
- `isDarkMode` (boolean): Dark mode flag
- `basePath` (string): Base path for navigation ("/item" or "/book")
- `type` (string): "item" or "book" to determine display logic

**Features:**
- 4-column responsive grid
- Hover animations
- Click to navigate to detail page
- Handles both items and books with different UI elements
- Shows price badge for books
- Shows type badge (Lost/Found) for items
- Displays image or fallback icon
- Shows location, views, or subject based on type

**Used in:**
- ItemDetail.jsx - Shows 4 related items from same category
- BookDetail.jsx - Shows 4 related books from same subject

---

## Refactored Pages

### ItemDetail.jsx
**Before:** ~400+ lines with inline JSX for all sections
**After:** ~200 lines using components

**Improvements:**
- Clean, readable structure
- Separated concerns (images, details, user info, related items)
- Easy to maintain and modify
- Consistent with BookDetail

### BookDetail.jsx
**Before:** ~600+ lines with duplicate JSX patterns
**After:** ~250 lines using components

**Improvements:**
- Removed duplicate code
- Uses same components as ItemDetail
- Custom props for book-specific features (price display, condition badges)
- Maintains all functionality while being more maintainable

---

## Benefits of Component Structure

1. **DRY Principle:** No code duplication between ItemDetail and BookDetail
2. **Maintainability:** Changes to UI patterns only need to be made once
3. **Readability:** Main page files are now much shorter and easier to understand
4. **Reusability:** Components can be used in future pages/features
5. **Consistency:** Ensures consistent UI/UX across different pages
6. **Testability:** Individual components can be tested separately

---

## Component File Sizes

- `ImageGallery.jsx`: 67 lines
- `DetailInfoCard.jsx`: 90 lines
- `UserInfoCard.jsx`: 122 lines
- `RelatedItemsGrid.jsx`: 130 lines

**Total component code:** ~410 lines
**Original combined code in pages:** ~1000+ lines
**Reduction:** ~60% less code in main pages

---

## Usage Examples

### ImageGallery
```jsx
<ImageGallery
  images={item.images}
  selectedIndex={selectedImageIndex}
  onSelectIndex={setSelectedImageIndex}
  isDarkMode={isDarkMode}
  fallbackIcon="package" // or "book"
/>
```

### DetailInfoCard
```jsx
<DetailInfoCard
  title={item.title}
  description={item.description}
  details={[
    { icon: <MapPin />, label: 'Location', value: item.location },
    { icon: <Calendar />, label: 'Date', value: item.date }
  ]}
  tags={item.tags}
  additionalFeatures={item.features}
  isDarkMode={isDarkMode}
  statusBadge={<CustomBadge />}
/>
```

### UserInfoCard
```jsx
<UserInfoCard
  user={item.reportedBy}
  contactInfo={item.contactInfo}
  isDarkMode={isDarkMode}
  isAuthenticated={isAuthenticated}
  currentUserId={user?._id}
  onChat={handleChat}
  onClaim={handleClaim}
  showClaimButton={true}
  title="Posted By"
/>
```

### RelatedItemsGrid
```jsx
<RelatedItemsGrid
  items={relatedItems}
  title="Related Items"
  isDarkMode={isDarkMode}
  basePath="/item"
  type="item"
/>
```

---

## Future Enhancements

Potential components that could be created:
1. **StatCard** - For displaying statistics/metrics
2. **InfoBadge** - For status badges and labels
3. **ActionButtons** - For common button patterns
4. **ContactCard** - For contact information display
5. **PriceCard** - For price display with special styling

These would further improve code organization and reusability across the application.
