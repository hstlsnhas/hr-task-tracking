# 📊 Automated Task Consolidation & Tracking System (Google Apps Script)

## 🚀 Overview

This project is an automated system built using **Google Apps Script** designed to integrate, clean, and normalize task data from multiple divisions into a single centralized dataset.

It addresses common challenges such as:

* Data scattered across multiple sheets/divisions
* Inconsistent data formats
* Duplicate tasks and status entries
* Multiple user names combined in a single cell
* Difficulty tracking the latest task progress

With this approach, all data will:

* Be consolidated into a single main sheet (`Data`)
* Be assigned **unique IDs for both users and tasks**
* Be cleaned and standardized
* Display only the **latest status (latest state)**

---

## 🎯 Key Features

* 🔄 **Multi-sheet aggregation** from various divisions (IoT, AI & Data, Prodev, etc.)
* 🧹 **Automatic data cleaning** (handles merged cells & missing values)
* 🆔 **Unique ID generator**

  * User ID → `U001`, `U002`, ...
  * Task ID → `T001`, `T002`, ...
* 👥 **Multi-assignee handling** (splitting multiple names in one cell)
* 📌 **Latest status tracking** (no duplicate task entries)
* 🏷️ **Status normalization** (Done, On Progress, To Do, etc.)
* 📅 **Safe deadline formatting** (stored as text to avoid errors)
* 🗺️ **Persistent ID mapping** via the `ID_Map` sheet

---

## 🧩 Project Structure

### Sheets Used:

* **Data** → Final output (clean & consolidated data)
* **ID_Map** → Stores ID mappings (User & Task)
* **Source Sheets**:

  * IoT
  * Project_Manager
  * AI_Data
  * Prodev
  * Creative
  * Bisdev
  * Admin

---

## ⚙️ Workflow

### 1. Load Configuration

The script reads:

* Column mappings for each sheet (`sources`)
* Master division mapping (`masterDivisi`)

---

### 2. Read & Normalize ID Map

* Reads the `ID_Map` sheet
* Determines the last used IDs:

  * Task (`Txxx`)
  * User (`Uxxx`)
* Continues the counters to prevent ID collisions

---

### 3. Data Extraction per Sheet

For each sheet:

* Retrieve all data
* Skip the header row
* Iterate through each row

---

### 4. Handle Merged Cells (Forward Fill)

Since merged cells are common in Google Sheets:

* Empty cells are filled using the last known value
* Applies to:

  * Month
  * Week
  * Name
  * etc.

---

### 5. Data Cleaning & Parsing

Each row is processed by:

* Extracting fields:

  * Month, Week, Name, Task, Detail, etc.
* Normalizing status via `normalizeStatus()`
* Formatting deadlines as text

---

### 6. Generate Task ID

A task is considered unique based on:

```
Division + Task + Detail + Name
```

If not found:

* Generate a new ID (`Txxx`)
* Store it in `ID_Map`

---

### 7. Split Multi-User Assignment

Names like:

```
"John, Jane & Alex"
```

are transformed into:

```
John  
Jane  
Alex  
```

Each user:

* Receives a unique User ID (`Uxxx`)
* Is stored in the mapping system

---

### 8. Assign Original Division

* Uses `masterDivisi` mapping
* Falls back to the sheet’s division if not found

---

### 9. Track Latest Assignment (Core Logic)

Using the key:

```
UserID + TaskID
```

The system stores only:

👉 **The latest status**
👉 **Without duplication**

---

### 10. Update ID_Map

* Clears the sheet
* Writes the updated mapping data

---

### 11. Full Sync to Data Sheet

* Clears the `Data` sheet
* Writes the header
* Inserts all processed data
* Sets the deadline column as **Plain Text**

---

## 📊 Output Format

| Column      | Description        |
| ----------- | ------------------ |
| User ID     | Unique user ID     |
| Task ID     | Unique task ID     |
| Month       | Task month         |
| Week        | Week number        |
| Name        | User name          |
| Division    | Original division  |
| Task        | Task title         |
| Detail      | Task details       |
| Type        | Work type          |
| Institution | Client/institution |
| Status      | Latest status      |
| Deadline    | Deadline (text)    |
| Output      | Task output        |

---

## 🧠 Status Normalization Logic

Example mappings:

* `done` → **Done**
* `on progress` → **On Progress**
* `not started` → **To Do**
* `pending` → **On Hold**
* `revision` → **On Progress**

---

## 💡 Why This Project Matters

This project is valuable for:

* 📈 Cross-division team performance monitoring
* 📊 Data analytics & dashboarding (BI tools)
* 🧾 Weekly/monthly reporting
* 🔍 Accurate task lifecycle tracking

---

## 🔮 Future Improvements

* Integration with dashboards (Streamlit / Looker Studio)
* Automated notifications (email / Slack)
* Historical status tracking
* Workload visualization per user

---

## 🏁 Conclusion

This script transforms data that is:

❌ messy, scattered, and duplicated
into
✅ clean, structured, and analysis-ready

Making monitoring and decision-making significantly more efficient and scalable.

---
