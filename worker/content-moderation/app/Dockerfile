ARG PYTHON_VERSION=3.10
FROM python:${PYTHON_VERSION} as base
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    moderator
RUN mkdir -p ./models && chmod 755 ./models
RUN chown moderator:moderator ./models
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt
USER moderator
ENV HF_HOME=./models
COPY . .
CMD python main.py
