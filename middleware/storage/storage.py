from abc import ABC, abstractmethod


class BaseStorage(ABC):
    @abstractmethod
    def health_check(self):
        pass

    @abstractmethod
    def generate_upload_url(self, file_path: str, expirations_seconds: int):
        pass

    @abstractmethod
    def generate_download_url(self, file_path: str, expirations_seconds: int):
        pass

    @abstractmethod
    def upload_file(self, localpath: str, file_path: str):
        pass

    @abstractmethod
    def is_file_present(self, file_path):
        pass
