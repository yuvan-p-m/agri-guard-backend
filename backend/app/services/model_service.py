import io
import json
import logging
import os
from pathlib import Path

from PIL import Image, ImageOps
import numpy as np
import torch
from torch import nn
from torchvision import transforms
from torchvision.models import resnet50

logger = logging.getLogger(__name__)


class ModelUnavailableError(RuntimeError):
    """Raised when the local disease model is not ready for inference."""

PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = Path(os.getenv(
    "MODEL_PATH",
    str(PROJECT_ROOT / "ai" / "disease_model" / "resnet50_plant_disease.pth")
))
LABEL_MAP_PATH = MODEL_PATH.with_name("label_map.json")


class DiseaseModelService:
    _instance = None
    model = None
    transform = None
    idx2label = None
    active_model_id = None
    is_loaded = False

    @classmethod
    def load_model(cls):
        """Load the local ResNet50 plant disease model in a background thread."""
        if cls.is_loaded:
            return
        import threading
        threading.Thread(target=cls._load_model_sync, daemon=True).start()

    @classmethod
    def _load_model_sync(cls):
        if cls.is_loaded:
            return
        try:
            logger.info(f"Loading local disease model from {MODEL_PATH}")
            with open(LABEL_MAP_PATH, "r", encoding="utf-8") as label_file:
                label_map = json.load(label_file)

            labels = {int(index): label for index, label in label_map.items()}
            checkpoint = torch.load(MODEL_PATH, map_location="cpu")
            state_dict = checkpoint.get(
                "state_dict",
                checkpoint.get("model_state_dict", checkpoint)
            ) if isinstance(checkpoint, dict) else checkpoint
            state_dict = {
                key.removeprefix("module."): value
                for key, value in state_dict.items()
            }

            cls.model = resnet50(weights=None)
            cls.model.fc = nn.Linear(cls.model.fc.in_features, len(labels))
            cls.model.load_state_dict(state_dict)
            cls.model.eval()

            cls.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

            cls.idx2label = labels
            cls.active_model_id = str(MODEL_PATH)
            cls.is_loaded = True
            logger.info(f"Local disease model loaded successfully: {MODEL_PATH}")
        except Exception as e:
            logger.error(f"Failed to load local disease model: {str(e)}", exc_info=True)
            raise e

    @classmethod
    def analyze_foliage_ratio(cls, img: Image.Image) -> float:
        """Calculate plant foliage/leaf color ratio using HSV color space"""
        try:
            arr = np.array(img.convert('RGB'), dtype=np.float32) / 255.0
            r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
            maxc = np.maximum(np.maximum(r, g), b)
            minc = np.minimum(np.minimum(r, g), b)
            delt = maxc - minc + 1e-6

            h = np.zeros_like(maxc)
            mask_r = (maxc == r)
            mask_g = (maxc == g) & ~mask_r
            mask_b = (maxc == b) & ~mask_r & ~mask_g

            h[mask_r] = ((g[mask_r] - b[mask_r]) / delt[mask_r]) % 6
            h[mask_g] = ((b[mask_g] - r[mask_g]) / delt[mask_g]) + 2
            h[mask_b] = ((r[mask_b] - g[mask_b]) / delt[mask_b]) + 4
            h = h / 6.0
            s = delt / (maxc + 1e-6)
            v = maxc

            green_foliage = (h >= 0.18) & (h <= 0.45) & (s >= 0.10) & (v >= 0.10)
            yellow_foliage = (h >= 0.10) & (h < 0.18) & (s >= 0.12) & (v >= 0.12)
            brown_spots = (h >= 0.04) & (h < 0.10) & (s >= 0.12) & (v >= 0.08) & (v <= 0.80)

            leaf_pixels = green_foliage | yellow_foliage | brown_spots
            return float(np.mean(leaf_pixels))
        except Exception:
            return 1.0

    @classmethod
    def predict_image(cls, image_bytes: bytes) -> dict:
        """Run CPU inference on uploaded image bytes with robust preprocessing & leaf validation"""
        if not cls.is_loaded or cls.model is None:
            cls.load_model()

        if not cls.is_loaded or cls.model is None:
            raise ModelUnavailableError(
                "The local disease model is unavailable. Try again shortly."
            )

        try:
            raw_img = Image.open(io.BytesIO(image_bytes))
            img = ImageOps.exif_transpose(raw_img)

            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                bg = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                bg.paste(img, mask=img.split()[3] if len(img.split()) > 3 else None)
                img = bg
            else:
                img = img.convert('RGB')

            foliage_ratio = cls.analyze_foliage_ratio(img)
            logger.info(f"Analyzed leaf foliage ratio: {foliage_ratio:.4f}")

            tensor = cls.transform(img).unsqueeze(0)
            with torch.no_grad():
                outputs = cls.model(tensor)
                logits = outputs.logits if hasattr(outputs, "logits") else outputs
                probs = torch.softmax(logits, dim=-1)
                conf, idx = probs.max(1)

            confidence_pct = round(conf.item() * 100, 2)
            disease_name = cls.idx2label[idx.item()]

            if foliage_ratio < 0.03 and confidence_pct < 35.0:
                logger.warning(f"Non-leaf image detected (foliage_ratio={foliage_ratio:.4f}, conf={confidence_pct}%)")
                return {
                    "disease": "No Crop Leaf Detected",
                    "confidence": 0.0,
                    "status": "invalid_leaf",
                    "message": "The uploaded photo does not appear to contain a valid crop leaf. Please upload a clear photo of a plant leaf."
                }

            return {
                "disease": disease_name,
                "confidence": confidence_pct,
                "status": "success",
                "model_used": cls.active_model_id,
                "foliage_ratio": round(foliage_ratio * 100, 2)
            }
        except Exception as e:
            logger.error(f"Inference error: {str(e)}", exc_info=True)
            raise e