from fastapi import APIRouter
from ..schemas import AssistantQueryRequest, AssistantQueryResponse
from ..services.assistant_engine import AIAssistantEngine

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.post("/query", response_model=AssistantQueryResponse)
def query_assistant(req: AssistantQueryRequest):
    """
    Submits natural language queries to the conversational AI Forex Assistant.
    Answers are grounded strictly in real-time indicators and terminal state.
    """
    return AIAssistantEngine.process_query(req)
