# backend/fastapi_app/main.py
from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI(title="EduAnalytics Backend")

# Load models
xgb_model = joblib.load("xgb.joblib")
lr_model = joblib.load("lr.joblib")

@app.get("/")
def home():
    return {"message": "Backend running ✅"}

@app.get("/predict")
def predict(attendance: float, avg_score: float):
    data = pd.DataFrame([[attendance, avg_score]], columns=["attendance_pct", "avg_score"])
    risk_xgb = float(xgb_model.predict_proba(data)[0][1])
    risk_lr = float(lr_model.predict_proba(data)[0][1])
    return {
        "xgb_risk": risk_xgb,
        "lr_risk": risk_lr
    }
