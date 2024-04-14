import os
import time
import requests
import logging

TRAEFIK_API_URL = os.getenv("TRAEFIK_API_URL")
DOMAIN_NAME = os.getenv("DOMAIN_NAME")
ACME_JSON_PATH = "/certificates/acme.json"

TRAEFIK_USERNAME = "admin"
TRAEFIK_PASSWORD = "gK>I06}WAH;tjpBal8:mM0>~1x9GN(0T"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_certificate():
    response = requests.get(f"{TRAEFIK_API_URL}/api/http/routers/api/entrypoints/websecure", auth=(TRAEFIK_USERNAME, TRAEFIK_PASSWORD))
    if response.status_code == 404:
        return False
    return True

def create_certificate():
    payload = {
        "certificatesResolvers.sslresolver.acme.tlsChallenge": {}
    }
    response = requests.post(f"{TRAEFIK_API_URL}/api/providers/rest", json=payload)
    if response.status_code != 200:
        logger.error("Failed to create certificate.")
        return False
    return True

def adjust_permissions():
    os.chmod(ACME_JSON_PATH, 0o600)
    logger.info("Adjusted permissions of acme.json to 600.")

def main():
    while True:
        if not check_certificate():
            logger.info("Certificate does not exist. Creating...")
            if create_certificate():
                logger.info("Certificate created successfully.")
                adjust_permissions()
            else:
                logger.error("Failed to create certificate.")
        time.sleep(3600)

if __name__ == "__main__":
    main()
