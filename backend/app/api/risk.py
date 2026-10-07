from fastapi import APIRouter
from ..schemas import RiskCalculationRequest, RiskCalculationResponse
from ..services.risk_engine import RiskManagementEngine

router = APIRouter(prefix="/risk", tags=["Risk Management"])

@router.post("/calculate", response_model=RiskCalculationResponse)
def calculate_risk(req: RiskCalculationRequest):
    """
    Calculates precise position size, lot size, dollar risk, pip risk, margin,
    potential profit for TP1/TP2, and returns safety warnings if risk exceeds limits.
    """
    return RiskManagementEngine.calculate_position_risk(req)
