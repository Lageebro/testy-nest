# Project Prompt for Antigravity: Tasty Nest Full-Stack Recipe Platform

Hey team, I need you to build a full-stack recipe sharing web application named **"Tasty Nest"** (inspired by Allrecipes layout and integrated with my Pinterest profile: `https://www.pinterest.com/tastynest917`). 

Please use the complete Business & Technical Requirements document provided below as the source of truth for building the entire system using **Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL (with Cloudinary for image/video storage)**.

---

## 📋 Copy & Paste Instructions for Antigravity

```text
Please build the "Tasty Nest" web application based on the complete requirements specification below.

### Project Overview & Objectives:
1. **Public Website:** Clean, modern, responsive recipe portal inspired by Allrecipes (e.g., [www.allrecipes.com/recipe/214500/sausage-peppers-onions-and-potato-bake](https://www.allrecipes.com/recipe/214500/sausage-peppers-onions-and-potato-bake)) featuring recipe search, categories, ingredient checkboxes, step-by-step cooking instructions, and nutritional breakdowns.
2. **Pinterest Integration:** Seamlessly embed Pinterest boards and video pins from [https://www.pinterest.com/tastynest917](https://www.pinterest.com/tastynest917) so visitors can browse pins and watch cooking videos directly on the site.
3. **Admin Dashboard (/admin):** Secure authentication portal allowing admins to upload recipes, high-resolution photos, dynamic ingredients lists, instructions, and video links.

---

### Technical Stack:
- **Frontend & Backend:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + Lucide Icons
- **Database & ORM:** PostgreSQL with Prisma ORM
- **File Uploads:** Cloudinary (for images & recipe videos)
- **Deployment:** Vercel ready

---

### Detailed Business & Technical Requirements (instructor.md)

# Business & Technical Requirements Document: Tasty Nest

## 1. Executive Summary & Project Overview
- **Project Vision:** Tasty Nest is a modern, responsive, full-stack web application designed to serve as a comprehensive recipe sharing and discovery platform. Inspired by Allrecipes and integrated with Pinterest (`[https://www.pinterest.com/tastynest917](https://www.pinterest.com/tastynest917)`).
- **Core Value Proposition:** Unified recipe hub, dynamic content sync & video integration, dedicated admin panel, immersive recipe detail pages.

## 2. Business & Functional Requirements
### A. Public-Facing Website (`Tasty Nest`)
1. **Homepage:** Hero section, category navigation, latest recipes grid, Pinterest embed feed widget.
2. **Recipe Search & Filtering:** Real-time search bar and filters by category/prep time.
3. **Recipe Detail Page:** Allrecipes-inspired layout with title, cover photo, metadata badges (Prep/Cook time, servings), embedded video player, interactive ingredients checklist, numbered instructions, and nutritional info card.
4. **Pinterest Integration:** Header/footer badges and embedded Pinterest board/pin widgets using official Pinterest SDK.

### B. Admin Panel (`/admin`)
1. **Secure Authentication:** Admin login portal protected via JWT / session cookies.
2. **Recipe Management Dashboard:** 
   - Create/Edit/Delete recipe forms.
   - Image & video upload handlers.
   - Dynamic ingredient rows (`+ Add Ingredient`) and step rows (`+ Add Step`).
   - Nutritional info inputs.

---

## 3. Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   
  createdAt DateTime @default(now())
}

model Recipe {
  id           String       @id @default(cuid())
  title        String
  slug         String       @unique
  description  String       @db.Text
  category     String
  prepTime     Int          
  cookTime     Int          
  servings     Int
  imageUrl     String
  videoUrl     String?      
  ingredients  Ingredient[]
  instructions Instruction[]
  nutrition    Nutrition?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Ingredient {
  id       String @id @default(cuid())
  name     String
  amount   String 
  recipeId String
  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

model Instruction {
  id          String @id @default(cuid())
  stepNumber  Int
  description String @db.Text
  recipeId    String
  recipe      Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

model Nutrition {
  id       String @id @default(cuid())
  calories Int
  protein  String
  carbs    String
  fat      String
  recipeId String @unique
  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}