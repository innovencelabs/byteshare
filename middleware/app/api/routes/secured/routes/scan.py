import api.services.secured.scan as scan_service
import utils.logger as logger
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.auth import authenticate_scan

router = APIRouter()

# Logger instance
log = logger.get_logger()


class CompleteScan(BaseModel):
    safe: bool


@router.post("/finalise/{upload_id}")
def finalise_scan_return_none(
    body: CompleteScan,
    upload_id: str,
    token_data: None = Depends(authenticate_scan),
):
    """
    Finalise scan from Moderation component.
    Will delete the upload if the file is not safe or make the scanned column to True if file is safe.
    Also sends the mail to the user stating that their upload is being deleted.

    Parameters:
    - upload_id: upload id of the upload process
    - safe: upload is safe or not

    Returns:
    - None
    """
    FUNCTION_NAME = "finalise_scan_return_none()"
    log.info("Entering {}".format(FUNCTION_NAME))

    scan_service.finalise_scan_return_none(body, upload_id)

    log.info("Exiting {}".format(FUNCTION_NAME))
