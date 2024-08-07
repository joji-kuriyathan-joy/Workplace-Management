# Workplace-Management
# Main Features:
# User Authentication:

User login and registration.
Admin login with special privileges.
Rota (Schedule) Management:

Admin can create and edit weekly/monthly rotas.
Users can view their rota in weekly and monthly views.
Timesheet Management:

Users can log their work hours daily.
System generates monthly work hours summary.
Admin can edit and approve timesheets.
# Notes and Notifications:

    Users can add notes to specific days on their calendar.
    Notes trigger notifications to the admin.
# Page Breakdown:
# Homepage:

    Welcome message.
    Quick links to login or register.
# Dashboard:

    Overview of upcoming shifts.
    Quick stats (e.g., total hours worked this month).
    Notifications and announcements.
# Rota Page:

    Weekly view (e.g., calendar grid with shifts).
    Monthly view (e.g., calendar with day-wise shifts).
    Option for users to switch between views.
# Timesheet Page:

    Daily log interface for users to enter hours.
    Summary view showing total hours worked.
    Export timesheet as PDF or Excel.
# Admin Panel:

    User management (add, edit, remove users).
    Rota management (create, edit, delete shifts).
    Timesheet approval interface.
    Notification management.
# Profile Page:

    User profile information.
    Option to change password and update details.


# Project Set up Frontend
    npm create vite@latest
    give a name for the project i have given wpm-ui
    Select a framework: » React
    Select a variant: » JavaScript
    Done. Now run:

    cd wpm-ui
    npm install
    npm run dev

# 1. Project Structure React(frontend)
wpm-ui/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── RotaManagement.jsx
│   │   │   ├── TimesheetApproval.jsx
│   │   ├── user/
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── RotaView.jsx
│   │   │   ├── Timesheet.jsx
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   ├── pages/
│   │   ├── AdminPage.jsx
│   │   ├── UserPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   ├── App.jsx
│   ├── main.jsx
├── package.json


# 2. Installing Dependencies
    npm install react-router-dom
    npm install @vitejs/plugin-react
    npm install react-big-calendar

# Project Set up Backend
    mkdir wpm-backend
    cd wpm-backend
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install Flask flask-cors flask-jwt-extended

# 1. Project Structure Flask (Backend)
wpm-backend/
├── app/
│   ├── __init__.py
│   ├── auth.py
│   ├── models.py
│   ├── routes.py
│   ├── config.py
├── venv/
├── run.py
├── requirements.txt

