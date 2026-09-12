import json
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def train_crop_model():
    csv_path = os.path.join(os.path.dirname(__file__), "Crop_recommendation.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    target = 'label'

    X = df[features]
    y = df[target]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train Random Forest
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=16,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42
    )
    rf.fit(X_train, y_train)

    # Evaluate
    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Test Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Feature importances
    feature_importances = dict(zip(features, rf.feature_importances_.round(4).tolist()))
    print("Feature Importances:", feature_importances)

    # Compute agronomic ideal ranges (mean and std) per crop
    crop_profiles = {}
    for crop_name, group in df.groupby(target):
        crop_profiles[crop_name] = {
            "ideal_N": round(float(group['N'].mean()), 1),
            "ideal_P": round(float(group['P'].mean()), 1),
            "ideal_K": round(float(group['K'].mean()), 1),
            "ideal_temp": round(float(group['temperature'].mean()), 1),
            "ideal_humidity": round(float(group['humidity'].mean()), 1),
            "ideal_ph": round(float(group['ph'].mean()), 2),
            "ideal_rainfall": round(float(group['rainfall'].mean()), 1),
        }

    metadata = {
        "model_name": "Random Forest Crop Classifier",
        "algorithm": "RandomForestClassifier",
        "accuracy": round(float(acc) * 100, 2),
        "total_samples": int(len(df)),
        "classes": sorted(list(rf.classes_)),
        "features": features,
        "feature_importances": feature_importances,
        "crop_profiles": crop_profiles
    }

    # Save destinations
    out_dirs = [
        os.path.dirname(__file__),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "app", "services"))
    ]

    for d in out_dirs:
        os.makedirs(d, exist_ok=True)
        model_file = os.path.join(d, "crop_rf_model.joblib")
        meta_file = os.path.join(d, "crop_metadata.json")
        joblib.dump(rf, model_file)
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        print(f"Saved artifacts to {d}")

if __name__ == "__main__":
    train_crop_model()
