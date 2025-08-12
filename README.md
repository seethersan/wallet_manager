# Wallet Manager

This project consists of a FastAPI backend and a React frontend.

## Backend (FastAPI)

### Setup

1. **Navigate to the backend folder:**
    ```bash
    cd backend
    ```

2. **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Create your `.env` file:**
    ```bash
    cp .env.example .env
    ```
    Edit `.env` as needed.

5. **Run the FastAPI app:**
    ```bash
    fastapi run --reload main.py 
    ```

## Frontend (React)

### Setup

1. **Navigate to the frontend folder:**
    ```bash
    cd frontend
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Create your `.env` file:**
    ```bash
    cp .env.example .env
    ```
    Edit `.env` as needed.

4. **Run the React app:**
    ```bash
    npm start
    ```

---

Make sure both backend and frontend `.env` files are properly configured before running the apps.