.PHONY: install
install:
	@poetry config virtualenvs.in-project true
	@poetry install

.PHONY: auth
auth:
	@gcloud auth application-default login
	@gcloud config set project gpt2-steer
	@gcloud auth configure-docker us-central1-docker.pkg.dev

.PHONY: run-be
run-be:
	@poetry run python -m uvicorn api.main:app --reload --reload-dir api --port=8080

.PHONY: build
build: 
	@docker build --platform linux/amd64 --build-arg HF_TOKEN=${HF_TOKEN} -t us-central1-docker.pkg.dev/gpt2-steer/gpt2-steer-backend/backend .

.PHONY: run
run: 
	@docker run -p 8080:8080 backend

.PHONY: push
push:
	@docker push us-central1-docker.pkg.dev/gpt2-steer/gpt2-steer-backend/backend

.PHONY: proxy
proxy: 
	@gcloud run services proxy backend-cloud-run --project=gpt2-steer --region=us-central1 --port=8080

