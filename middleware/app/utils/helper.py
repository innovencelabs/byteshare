import random


def get_file_extension(file_name):
    return file_name.split(".")[-1]


def format_size(byte_size):
    if byte_size < 1024:
        return f"{byte_size} B"
    elif byte_size < 1024**2:
        return f"{byte_size / 1024:.2f} KB"
    elif byte_size < 1024**3:
        return f"{byte_size / (1024 ** 2):.2f} MB"
    else:
        return f"{byte_size / (1024 ** 3):.2f} GB"


def generate_sixdigit_code():
    return f"{random.randint(100000, 999999)}"
