from fastapi import APIRouter
from ..schemas import ModelMonitoringMetrics
from ..services.model_monitoring import ModelMonitoringService

router = APIRouter(prefix="/monitoring", tags=["Model Monitoring"])

@router.get("/metrics", response_model=ModelMonitoringMetrics)
def get_metrics():
    """
    Returns production model accuracy, ROC-AUC, Brier score calibration,
    Population Stability Index drift metrics, and feature importances.
    """
    return ModelMonitoringService.get_current_metrics()

@router.post("/retrain")
def retrain_model():
    """
    Triggers an asynchronous model retraining and out-of-sample validation pipeline.
    """
    return ModelMonitoringService.trigger_retraining()
