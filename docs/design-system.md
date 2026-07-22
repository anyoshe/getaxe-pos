# GetAxe POS Design System

**Version:** 1.0
**Status:** Active
**Product:** GetAxe POS
**Owner:** GetAxe Technologies

---

# 1. Vision

GetAxe POS is not just another Point of Sale application.

It is a modern business operating platform designed for pharmacies, hospitals, supermarkets, wholesalers, hardware stores, retail shops, restaurants and growing enterprises.

The software should immediately communicate:

* Professional
* Premium
* Fast
* Intelligent
* Beautiful
* Trustworthy

Every screen must feel like it belongs to the same product.

---

# 2. Design Principles

Every design decision must follow these principles.

## Beautiful

Every page should look polished enough to present to a CEO without apology.

## Simple

Users should never wonder where to click.

## Fast

The interface should feel responsive and lightweight.

## Consistent

Buttons, cards, spacing and colors should never change between modules.

## Accessible

The interface should be usable on desktop, tablet and mobile.

---

# 3. Brand Identity

### Product Name

GetAxe POS

### Tagline

Smart Retail Management Platform

### Personality

Modern

Premium

Friendly

Reliable

Professional

---

# 4. Color System

## Primary

Indigo

`#4F46E5`

Used for:

* Primary buttons
* Active navigation
* Links
* Focus rings

---

## Secondary

Violet

`#7C3AED`

Used for:

* Gradients
* Highlights

---

## Accent

Cyan

`#06B6D4`

Used for:

* Secondary highlights
* Interactive accents

---

## Success

Emerald

`#10B981`

Used for:

* Success alerts
* Paid invoices
* Active status

---

## Warning

Amber

`#F59E0B`

Used for:

* Low stock
* Pending items

---

## Danger

Rose

`#F43F5E`

Used for:

* Errors
* Delete actions
* Critical alerts

---

## Information

Sky

`#0EA5E9`

Used for:

* Notifications
* Informational messages

---

# 5. Backgrounds

Application Background

`#F8FAFC`

Cards

White

Sidebar

White

Top Navigation

White with subtle transparency

Backdrop Blur enabled

---

# 6. Typography

Primary Font

Geist Sans

Fallback

Inter

Headings

Bold

Body

Medium

Captions

Regular

Never use more than three font weights on one page.

---

# 7. Spacing System

Only use multiples of 8.

Approved spacing:

4

8

16

24

32

40

48

64

96

Avoid arbitrary spacing values.

---

# 8. Border Radius

Inputs

Rounded XL

Buttons

Rounded XL

Cards

Rounded 2XL

Dialogs

Rounded 3XL

Images

Rounded XL

---

# 9. Shadows

Use only soft shadows.

Never use harsh borders.

Preferred:

shadow-md

shadow-lg

shadow-xl

shadow-2xl

Cards should elevate slightly on hover.

---

# 10. Buttons

## Primary

Gradient

Indigo → Violet → Cyan

White text

Rounded XL

Height 48px

Hover

Slight lift

Glow

Scale 102%

---

## Secondary

White

Slate text

Soft border

---

## Danger

Rose

---

## Success

Emerald

---

## Ghost

Transparent

---

# 11. Inputs

Height

48px minimum

Rounded XL

Subtle border

Focus

Indigo ring

Animated transition

Error

Rose border

Message below input

Password fields must support show/hide.

---

# 12. Cards

Every major card follows:

White

Rounded 2XL

Soft Shadow

Padding 24px

Hover Elevation

Transition 300ms

---

# 13. Dashboard Standards

Every dashboard begins with:

Welcome Message

Business Overview

Metric Cards

Quick Actions

Recent Activity

Never begin with a table.

---

# 14. Metric Cards

Every metric contains:

Icon

Title

Value

Trend

Optional mini chart

Color coding:

Sales

Indigo

Inventory

Emerald

Customers

Cyan

Finance

Amber

Clinical

Rose

Reports

Purple

Insurance

Sky

---

# 15. Feature Page Layout

Every feature page follows:

Feature Header

↓

Metric Cards (optional)

↓

Toolbar

↓

Main Content

↓

Pagination

This structure must never change.

---

# 16. Tables

Tables should:

Avoid heavy borders

Use soft row dividers

Highlight rows on hover

Support:

Search

Sorting

Filtering

Pagination

Export

Bulk actions

---

# 17. Empty States

Never display:

"No data"

Instead display:

Illustration

Clear explanation

Primary action button

Example:

"No products yet. Add your first product to begin managing inventory."

---

# 18. Forms

Every form contains:

Title

Description

Grouped fields

Primary action

Secondary action

Validation

Loading state

Success feedback

---

# 19. Sidebar

White background

Active item:

Gradient highlight

Rounded XL

Icon + Label

Collapsible (future)

Responsive

---

# 20. Top Navigation

Glass effect

Backdrop blur

Notification area

Business selector (future)

Profile menu

Quick search (future)

---

# 21. Dialogs

Rounded 3XL

Soft animation

Backdrop blur

Escape closes dialog

Focus trapped

---

# 22. Notifications

Success

Emerald

Warning

Amber

Error

Rose

Info

Sky

Notifications should appear unobtrusively and dismiss automatically where appropriate.

---

# 23. Animations

Duration

200–300ms

Buttons

Scale

Cards

Lift

Dialogs

Fade + Scale

Sidebar

Slide

Page transitions

Fade

Animations must enhance usability, not distract.

---

# 24. Mobile First

Design for mobile first.

Desktop is an enhancement.

Metric cards:

Desktop

4 columns

Tablet

2 columns

Phone

1 column

Buttons become full width where appropriate.

---

# 25. Icons

Use Lucide Icons exclusively.

Do not mix icon libraries.

Icons should visually reinforce actions, not decorate them.

---

# 26. Accessibility

Keyboard navigation required.

Visible focus states required.

Touch targets at least 44px.

Good color contrast.

Screen reader labels on interactive controls.

---

# 27. Login Screen Standard

The login page is the first impression of GetAxe POS.

It should feature:

* Animated premium gradient background
* Glassmorphism login card
* Real GetAxe logo
* Welcome message
* Floating labels
* Smooth focus animations
* Password visibility toggle
* Loading button with spinner
* Trust indicators
* Beautiful side marketing panel
* Fully responsive layout

The login screen serves as the reference implementation of the entire design system.

---

# 28. Future Enhancements

Dark Mode

Theme customization

Workspace branding

Animated charts

AI assistant

Voice commands

Offline mode

PWA enhancements

---

# 29. Design Rule

Before implementing any new screen, ask:

"Does this look like software that could compete with Stripe, Linear, Shopify POS or Zoho?"

If the answer is no, improve the design before implementing additional functionality.

---

**End of Version 1.0**
