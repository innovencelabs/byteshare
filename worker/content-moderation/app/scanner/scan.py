import imghdr

import scanner.antivirus as antivirus
import scanner.nsfw_image as nsfw_image


def scan_file(file_name, file_stream):
    if _is_image(file_name, file_stream):
        nsfw_image_passed = nsfw_image.scan_image(file_stream)
        if not nsfw_image_passed:
            return False

    antivirus_passed = antivirus.scan_virus(file_stream)
    if not antivirus_passed:
        return False

    return True


def _is_image(filename, file_stream):
    allowed_extensions = ["jpg", "jpeg", "png", "gif", "bmp", "ico"]
    file_extension = filename.split(".")[-1].lower()
    if file_extension in allowed_extensions:
        return True

    header = file_stream.read(32)
    image_type = imghdr.what(None, header)
    if image_type:
        return True
    return False
